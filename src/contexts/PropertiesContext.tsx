import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Property, PropertyRequest } from '../types';
import { MOCK_PROPERTIES } from '../data';
import { normalizeAgentName } from '../lib/utils';
import { useAuth } from './AuthContext';

const getUnsyncedIds = (): string[] => {
  try {
    const ids = localStorage.getItem('puyoko_unsynced_ids');
    return ids ? JSON.parse(ids) : [];
  } catch (e) {
    return [];
  }
};

const addUnsyncedId = (id: string) => {
  try {
    const ids = getUnsyncedIds();
    if (!ids.includes(id)) {
      localStorage.setItem('puyoko_unsynced_ids', JSON.stringify([...ids, id]));
    }
  } catch (e) {}
};

const removeUnsyncedId = (id: string) => {
  try {
    const ids = getUnsyncedIds();
    localStorage.setItem('puyoko_unsynced_ids', JSON.stringify(ids.filter(i => i !== id)));
  } catch (e) {}
};

const getUnsyncedRequestIds = (): string[] => {
  try {
    const ids = localStorage.getItem('puyoko_unsynced_request_ids');
    return ids ? JSON.parse(ids) : [];
  } catch (e) {
    return [];
  }
};

const addUnsyncedRequestId = (id: string) => {
  try {
    const ids = getUnsyncedRequestIds();
    if (!ids.includes(id)) {
      localStorage.setItem('puyoko_unsynced_request_ids', JSON.stringify([...ids, id]));
    }
  } catch (e) {}
};

const removeUnsyncedRequestId = (id: string) => {
  try {
    const ids = getUnsyncedRequestIds();
    localStorage.setItem('puyoko_unsynced_request_ids', JSON.stringify(ids.filter(i => i !== id)));
  } catch (e) {}
};

interface PropertiesContextType {
  properties: Property[];
  loading: boolean;
  fetchProperties: () => Promise<void>;
  addProperty: (prop: Omit<Property, 'id'> & { id?: string }) => Promise<void>;
  updateProperty: (prop: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  syncAllPropertiesToSheets: () => Promise<void>;
  requests: PropertyRequest[];
  submitPropertyRequest: (req: Omit<PropertyRequest, 'id' | 'requestedAt' | 'status'>) => Promise<boolean>;
  approvePropertyRequest: (requestId: string) => Promise<void>;
  rejectPropertyRequest: (requestId: string) => Promise<void>;
  unsyncedRequestsCount: number;
  unsyncedPropertiesCount: number;
  syncUnsyncedRequests: () => Promise<void>;
  syncUnsyncedProperties: () => Promise<void>;
  lastSyncError: string | null;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

export const PropertiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { userEmail } = useAuth();

  const [unsyncedRequestsCount, setUnsyncedRequestsCount] = useState(0);
  const [unsyncedPropertiesCount, setUnsyncedPropertiesCount] = useState(0);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  const updateUnsyncedCounts = () => {
    setUnsyncedRequestsCount(getUnsyncedRequestIds().length);
    setUnsyncedPropertiesCount(getUnsyncedIds().length);
  };

  // Helper to sync property change with Google Sheets via script URL
  const syncWithGoogleSheets = async (action: 'CREATE' | 'UPDATE' | 'DELETE', property: Property) => {
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
      console.warn("VITE_GOOGLE_SCRIPT_URL is not defined in the environment!");
      return;
    }

    try {
      console.log(`Attempting to sync property (${action}) to Google Sheets...`);
      const res = await fetch(googleScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          formType: 'Property Sync',
          action,
          property
        }),
      });
      console.log("Google Sheets property sync response status:", res.status);
    } catch (err) {
      console.error('Failed to sync property to Google Sheets:', err);
    }
  };

  // Function to sync all properties to Google Sheets
  const syncAllPropertiesToSheets = async () => {
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
      console.warn("VITE_GOOGLE_SCRIPT_URL is not defined in the environment!");
      throw new Error("VITE_GOOGLE_SCRIPT_URL is not configured in your environment!");
    }

    try {
      console.log("Attempting to sync all properties to Google Sheets...");
      const res = await fetch(googleScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          formType: 'Property Sync',
          action: 'SYNC_ALL',
          properties: properties
        }),
      });
      console.log("Google Sheets sync all response status:", res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to sync all properties to Google Sheets:', err);
      throw err;
    }
  };

  const fetchProperties = async () => {
    // 1. Instant Load from Cache or MOCK_PROPERTIES (Stale-While-Revalidate pattern)
    const saved = localStorage.getItem('puyoko_properties');
    let loadedFromCache = false;

    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        if (parsedSaved && parsedSaved.length > 0) {
          setProperties(parsedSaved);
          setLoading(false);
          loadedFromCache = true;
        }
      } catch (e) {
        console.error("Failed to parse saved properties");
      }
    }

    if (!loadedFromCache) {
      setProperties(MOCK_PROPERTIES);
      localStorage.setItem('puyoko_properties', JSON.stringify(MOCK_PROPERTIES));
      setLoading(false);
    }

    // 2. Background Revalidation from Supabase
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Read directly from localStorage to get the most up-to-date local cache
        const savedCache = localStorage.getItem('puyoko_properties');
        let localProperties: Property[] = [];
        if (savedCache) {
          try { localProperties = JSON.parse(savedCache) || []; } catch(e){}
        }
        
        // Smart Merge: Keep any locally created listings that failed to sync to the cloud database
        const unsyncedIds = getUnsyncedIds();
        const localUnsynced = localProperties.filter(p => unsyncedIds.includes(p.id) && !data.some(d => d.id === p.id));
        const merged = [...localUnsynced, ...data];

        setProperties(merged);
        localStorage.setItem('puyoko_properties', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn("Supabase background revalidation failed, using cached listings.", err);
    } finally {
      setLoading(false);
      updateUnsyncedCounts();
    }
  };

  const fetchRequests = async () => {
    const saved = localStorage.getItem('puyoko_property_requests');
    if (saved) {
      try { setRequests(JSON.parse(saved) || []); } catch (e) {}
    }
    try {
      const { data, error } = await supabase
        .from('property_requests')
        .select('*')
        .order('requestedAt', { ascending: false });
      if (error) throw error;
      if (data) {
        const savedCache = localStorage.getItem('puyoko_property_requests');
        let localRequests: PropertyRequest[] = [];
        if (savedCache) {
          try { localRequests = JSON.parse(savedCache) || []; } catch(e){}
        }

        // Smart Merge: Keep any locally created requests that failed to sync to the cloud database
        const unsyncedRequestIds = getUnsyncedRequestIds();
        const localUnsynced = localRequests.filter(r => unsyncedRequestIds.includes(r.id) && !data.some(d => d.id === r.id));
        const merged = [...localUnsynced, ...data];

        setRequests(merged);
        localStorage.setItem('puyoko_property_requests', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn("Supabase load requests failed, using cached requests.", err);
    } finally {
      updateUnsyncedCounts();
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchRequests();

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'puyoko_properties' && e.newValue) {
        setProperties(JSON.parse(e.newValue));
      }
      if (e.key === 'puyoko_property_requests' && e.newValue) {
        setRequests(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userEmail]);

  // Helper to persist state
  const persistState = (newProperties: Property[]) => {
    setProperties(newProperties);
    localStorage.setItem('puyoko_properties', JSON.stringify(newProperties));
  };

  const addProperty = async (newProp: Omit<Property, 'id'> & { id?: string }) => {
    const propertyId = newProp.id || `PK-${Math.floor(Math.random() * 9000) + 1000}`;
    const normalizedProp = {
      ...newProp,
      accommodatedBy: newProp.accommodatedBy ? normalizeAgentName(newProp.accommodatedBy) : ''
    };
    const { id, ...restProp } = normalizedProp;
    const propertyToInsert = { ...restProp, id: propertyId } as Property;
    
    persistState([propertyToInsert, ...properties]);
    syncWithGoogleSheets('CREATE', propertyToInsert);

    try {
      const { error } = await supabase.from('properties').insert([propertyToInsert]);
      if (error) throw error;
      removeUnsyncedId(propertyId);
    } catch (err: any) {
      console.error("Supabase add failed! The listing is kept in your browser local storage but was not saved to the cloud database:", err);
      addUnsyncedId(propertyId);
      alert(`Warning: Could not save to cloud database.\n\nError: ${err.message || "Column mismatch or connection error"}\n\nYour changes are saved locally for now so you won't lose them, but please run the SQL command in Supabase to add the missing columns.`);
    }
  };

  const updateProperty = async (updatedProp: Property) => {
    const normalizedProp = {
      ...updatedProp,
      accommodatedBy: updatedProp.accommodatedBy ? normalizeAgentName(updatedProp.accommodatedBy) : ''
    };
    const updated = properties.map(p => p.id === updatedProp.id ? normalizedProp : p);
    persistState(updated);
    syncWithGoogleSheets('UPDATE', normalizedProp);

    try {
      const { error } = await supabase.from('properties').update(normalizedProp).eq('id', updatedProp.id);
      if (error) throw error;
      removeUnsyncedId(updatedProp.id);
    } catch (err: any) {
      console.error("Supabase update failed! The update is kept in your browser local storage but was not saved to the cloud database:", err);
      addUnsyncedId(updatedProp.id);
      alert(`Warning: Could not save updates to cloud database.\n\nError: ${err.message || "Connection error"}\n\nYour changes are saved locally for now so you won't lose them.`);
    }
  };

  const deleteProperty = async (id: string) => {
    const propertyToDelete = properties.find(p => p.id === id);
    const filtered = properties.filter(p => p.id !== id);
    persistState(filtered);
    removeUnsyncedId(id);

    if (propertyToDelete) {
      syncWithGoogleSheets('DELETE', propertyToDelete);
    }

    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase delete failed! The deletion is kept in your browser local storage but was not saved to the cloud database:", err);
      alert("Warning: Could not save deletion to cloud database. Your changes are saved locally for now but will be lost if you reload.");
    }
  };

  const submitPropertyRequest = async (req: Omit<PropertyRequest, 'id' | 'requestedAt' | 'status'>): Promise<boolean> => {
    const requestId = `REQ-${Math.floor(Math.random() * 9000) + 1000}`;
    const newRequest: PropertyRequest = {
      ...req,
      id: requestId,
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };
    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem('puyoko_property_requests', JSON.stringify(updatedRequests));

    try {
      const { error } = await supabase.from('property_requests').insert([newRequest]);
      if (error) throw error;
      removeUnsyncedRequestId(requestId);
      return true;
    } catch (err: any) {
      console.error("Supabase insert request failed! Saved locally:", err);
      addUnsyncedRequestId(requestId);
      alert(`Warning: Request saved locally in your browser but could not be uploaded to the cloud database.\n\nError: ${err.message || "Connection error"}`);
      return false;
    }
  };

  const approvePropertyRequest = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (request.type === 'ARCHIVE') {
      const prop = properties.find(p => p.id === request.propertyId);
      if (prop) {
        await updateProperty({ ...prop, status: 'Archived' });
      }
    } else if (request.type === 'DELETE') {
      await deleteProperty(request.propertyId);
    } else if (request.type === 'EDIT' && request.proposedData) {
      const prop = properties.find(p => p.id === request.propertyId);
      if (prop) {
        await updateProperty({ ...prop, ...request.proposedData } as Property);
      }
    } else if (request.type === 'CREATE' && request.proposedData) {
      await addProperty({ ...request.proposedData, id: request.propertyId } as any);
    }

    const filteredRequests = requests.filter(r => r.id !== requestId);
    setRequests(filteredRequests);
    localStorage.setItem('puyoko_property_requests', JSON.stringify(filteredRequests));

    try {
      const { error } = await supabase.from('property_requests').delete().eq('id', requestId);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase delete request failed:", err);
    }
  };

  const rejectPropertyRequest = async (requestId: string) => {
    const filteredRequests = requests.filter(r => r.id !== requestId);
    setRequests(filteredRequests);
    localStorage.setItem('puyoko_property_requests', JSON.stringify(filteredRequests));

    try {
      const { error } = await supabase.from('property_requests').delete().eq('id', requestId);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase reject/delete request failed:", err);
    }
  };

  const syncUnsyncedRequests = async () => {
    const unsyncedIds = getUnsyncedRequestIds();
    if (unsyncedIds.length === 0) return;

    const saved = localStorage.getItem('puyoko_property_requests');
    if (!saved) return;

    let localRequests: PropertyRequest[] = [];
    try { localRequests = JSON.parse(saved) || []; } catch(e){}

    let successCount = 0;
    let finalError = null;

    for (const req of localRequests) {
      if (unsyncedIds.includes(req.id)) {
        try {
          const { error } = await supabase.from('property_requests').insert([req]);
          if (error) throw error;
          removeUnsyncedRequestId(req.id);
          successCount++;
        } catch (err: any) {
          console.error(`Failed to sync request ${req.id}:`, err);
          finalError = err.message || String(err);
        }
      }
    }

    updateUnsyncedCounts();
    if (finalError) {
      setLastSyncError(finalError);
    } else {
      setLastSyncError(null);
    }

    if (successCount > 0) {
      await fetchRequests();
    }
  };

  const syncUnsyncedProperties = async () => {
    const unsyncedIds = getUnsyncedIds();
    if (unsyncedIds.length === 0) return;

    const saved = localStorage.getItem('puyoko_properties');
    if (!saved) return;

    let localProperties: Property[] = [];
    try { localProperties = JSON.parse(saved) || []; } catch(e){}

    let successCount = 0;
    let finalError = null;

    for (const prop of localProperties) {
      if (unsyncedIds.includes(prop.id)) {
        try {
          const { error } = await supabase.from('properties').insert([prop]);
          if (error) throw error;
          removeUnsyncedId(prop.id);
          successCount++;
        } catch (err: any) {
          console.error(`Failed to sync property ${prop.id}:`, err);
          finalError = err.message || String(err);
        }
      }
    }

    updateUnsyncedCounts();
    if (finalError) {
      setLastSyncError(finalError);
    } else {
      setLastSyncError(null);
    }

    if (successCount > 0) {
      await fetchProperties();
    }
  };

  return (
    <PropertiesContext.Provider value={{ 
      properties, 
      loading, 
      fetchProperties, 
      addProperty, 
      updateProperty, 
      deleteProperty, 
      syncAllPropertiesToSheets,
      requests,
      submitPropertyRequest,
      approvePropertyRequest,
      rejectPropertyRequest,
      unsyncedRequestsCount,
      unsyncedPropertiesCount,
      syncUnsyncedRequests,
      syncUnsyncedProperties,
      lastSyncError
    }}>
      {children}
    </PropertiesContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
};
