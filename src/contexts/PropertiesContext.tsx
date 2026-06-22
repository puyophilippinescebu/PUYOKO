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
      safeSetItem('puyoko_unsynced_ids', JSON.stringify([...ids, id]));
    }
  } catch (e) {}
};

const removeUnsyncedId = (id: string) => {
  try {
    const ids = getUnsyncedIds();
    safeSetItem('puyoko_unsynced_ids', JSON.stringify(ids.filter(i => i !== id)));
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
      safeSetItem('puyoko_unsynced_request_ids', JSON.stringify([...ids, id]));
    }
  } catch (e) {}
};

const removeUnsyncedRequestId = (id: string) => {
  try {
    const ids = getUnsyncedRequestIds();
    safeSetItem('puyoko_unsynced_request_ids', JSON.stringify(ids.filter(i => i !== id)));
  } catch (e) {}
};

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage.setItem failed for key "${key}":`, e);
  }
};

const prunePropertiesForCache = (props: Property[]): Property[] => {
  return props.map(p => ({
    ...p,
    // Keep only the first image to fit within localStorage's 5MB quota
    images: p.images && p.images.length > 0 ? [p.images[0]] : []
  }));
};


interface PropertiesContextType {
  properties: Property[];
  loading: boolean;
  fetchProperties: () => Promise<void>;
  addProperty: (prop: Omit<Property, 'id'> & { id?: string }) => Promise<void>;
  updateProperty: (prop: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  requests: PropertyRequest[];
  submitPropertyRequest: (req: Omit<PropertyRequest, 'id' | 'requestedAt' | 'status'>) => Promise<boolean>;
  approvePropertyRequest: (requestId: string) => Promise<void>;
  rejectPropertyRequest: (requestId: string) => Promise<void>;
  updatePropertyRequestProposedData: (propertyId: string, proposedData: Partial<Property>) => Promise<boolean>;
  archivePropertyRequest: (propertyId: string) => Promise<boolean>;
  unarchivePropertyRequest: (propertyId: string) => Promise<boolean>;
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



  const fetchPropertiesFromServer = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, created_at, title, price, status, city, address, mapsLink, landmarks, tags, bedrooms, bathrooms, area, description, type, currency, videoUrl, pricePeriod, originalPrice, accommodatedBy, accommodatedByPhone, createdBy, amenities, amenitiesImages, amenitiesVideoUrl')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Read directly from localStorage to get the most up-to-date local cache
        const savedCache = localStorage.getItem('puyoko_properties');
        let localProperties: Property[] = [];
        if (savedCache) {
          try { localProperties = JSON.parse(savedCache) || []; } catch(e){}
        }
        
        const formattedData = data.map(p => ({
          ...p,
          images: []
        })) as Property[];

        // Smart Merge: Keep any locally created listings that failed to sync to the cloud database
        const unsyncedIds = getUnsyncedIds();
        const localUnsynced = localProperties.filter(p => unsyncedIds.includes(p.id) && !data.some(d => d.id === p.id));
        const merged = [...localUnsynced, ...formattedData];

        setProperties(merged);
        safeSetItem('puyoko_properties', JSON.stringify(prunePropertiesForCache(merged)));
      }
    } catch (err: any) {
      console.error("Failed to fetch properties from server:", err);
      throw new Error(`Failed to load updated properties: ${err.message || String(err)}`);
    }
  };

  const fetchRequestsFromServer = async () => {
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
        safeSetItem('puyoko_property_requests', JSON.stringify(merged));
      }
    } catch (err: any) {
      console.error("Failed to fetch requests from server:", err);
      throw new Error(`Failed to load updated requests: ${err.message || String(err)}`);
    }
  };

  const fetchProperties = async () => {
    // 1. Instant Load from Cache
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
      setLoading(true);
    }

    // 2. Background Revalidation from Supabase
    try {
      await fetchPropertiesFromServer();
    } catch (err) {
      console.warn("Supabase background revalidation failed, using cached listings.", err);
      if (!loadedFromCache) {
        setProperties([]);
        safeSetItem('puyoko_properties', JSON.stringify([]));
      }
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
      await fetchRequestsFromServer();
    } catch (err) {
      console.warn("Supabase load requests failed:", err);
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
    safeSetItem('puyoko_properties', JSON.stringify(prunePropertiesForCache(newProperties)));
  };

  const addProperty = async (newProp: Omit<Property, 'id'> & { id?: string }) => {
    const propertyId = newProp.id || `PK-${Math.floor(Math.random() * 9000) + 1000}`;
    const normalizedProp = {
      ...newProp,
      accommodatedBy: newProp.accommodatedBy ? normalizeAgentName(newProp.accommodatedBy) : ''
    };
    const { id, ...restProp } = normalizedProp;
    const propertyToInsert = { ...restProp, id: propertyId } as Property;

    // 1. Write to database first
    const { error } = await supabase.from('properties').insert([propertyToInsert]);
    if (error) {
      console.error("Supabase add failed:", error);
      throw new Error(`Database error: ${error.message || "Failed to save listing to cloud database."}`);
    }

    // 2. Poll verify until visible
    let verified = false;
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase.from('properties').select('id').eq('id', propertyId);
      if (data && data.length > 0) {
        verified = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!verified) {
      throw new Error("Verification failed: The listing was saved but is not queryable from the database yet.");
    }

    // 3. Force re-fetch from server
    await fetchPropertiesFromServer();

    removeUnsyncedId(propertyId);
  };

  const updateProperty = async (updatedProp: Property) => {
    const normalizedProp = {
      ...updatedProp,
      accommodatedBy: updatedProp.accommodatedBy ? normalizeAgentName(updatedProp.accommodatedBy) : ''
    };

    // 1. Write to database first
    const { error } = await supabase.from('properties').update(normalizedProp).eq('id', updatedProp.id);
    if (error) {
      console.error("Supabase update failed:", error);
      throw new Error(`Database error: ${error.message || "Failed to update listing in cloud database."}`);
    }

    // 2. Poll verify until visible
    let verified = false;
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase.from('properties').select('title').eq('id', updatedProp.id);
      if (data && data.length > 0 && data[0].title === updatedProp.title) {
        verified = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!verified) {
      throw new Error("Verification failed: The updates were saved but are not queryable from the database yet.");
    }

    // 3. Force re-fetch from server
    await fetchPropertiesFromServer();

    removeUnsyncedId(updatedProp.id);
  };

  const deleteProperty = async (id: string) => {
    const propertyToDelete = properties.find(p => p.id === id);

    // 1. Write to database first
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      console.error("Supabase delete failed:", error);
      throw new Error(`Database error: ${error.message || "Failed to delete listing from cloud database."}`);
    }

    // 2. Poll verify until deleted
    let verified = false;
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase.from('properties').select('id').eq('id', id);
      if (!data || data.length === 0) {
        verified = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!verified) {
      throw new Error("Verification failed: The listing was deleted in cloud but is still queryable.");
    }

    // 3. Force re-fetch from server
    await fetchPropertiesFromServer();

    removeUnsyncedId(id);
  };

  const submitPropertyRequest = async (req: Omit<PropertyRequest, 'id' | 'requestedAt' | 'status'>): Promise<boolean> => {
    const requestId = `REQ-${Math.floor(Math.random() * 9000) + 1000}`;
    const newRequest: PropertyRequest = {
      ...req,
      id: requestId,
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    // 1. Write to database first
    const { error } = await supabase.from('property_requests').insert([newRequest]);
    if (error) {
      console.error("Supabase insert request failed:", error);
      throw new Error(`Database error: ${error.message || "Failed to submit request to cloud database."}`);
    }

    // 2. Poll verify until visible
    let verified = false;
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase.from('property_requests').select('id').eq('id', requestId);
      if (data && data.length > 0) {
        verified = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!verified) {
      throw new Error("Verification failed: The request was sent but is not queryable from the database yet.");
    }

    // 3. Force re-fetch requests from server
    await fetchRequestsFromServer();
    removeUnsyncedRequestId(requestId);
    return true;
  };

  const approvePropertyRequest = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // 1. Apply changes in database first and wait
    try {
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
    } catch (err: any) {
      console.error("Failed to apply property change on approval:", err);
      throw new Error(`Failed to apply changes: ${err.message || "Database write failed."}`);
    }

    // 2. Delete request from Supabase
    const { error: deleteError } = await supabase.from('property_requests').delete().eq('id', requestId);
    if (deleteError) {
      console.error("Supabase delete request failed:", deleteError);
      throw new Error(`Database error: Failed to clear request from queue: ${deleteError.message}`);
    }

    // 3. Poll verify until request is deleted
    let verified = false;
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase.from('property_requests').select('id').eq('id', requestId);
      if (!data || data.length === 0) {
        verified = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!verified) {
      throw new Error("Verification failed: The changes were applied but the pending request is still in the queue.");
    }

    // 4. Force re-fetch requests from server
    await fetchRequestsFromServer();
  };

  const rejectPropertyRequest = async (requestId: string) => {
    // 1. Delete request from Supabase
    const { error } = await supabase.from('property_requests').delete().eq('id', requestId);
    if (error) {
      console.error("Supabase reject/delete request failed:", error);
      throw new Error(`Database error: Failed to reject request in cloud database: ${error.message}`);
    }

    // 2. Poll verify until request is deleted
    let verified = false;
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase.from('property_requests').select('id').eq('id', requestId);
      if (!data || data.length === 0) {
        verified = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!verified) {
      throw new Error("Verification failed: The request was rejected in cloud but is still in queue.");
    }

    // 3. Force re-fetch requests from server
    await fetchRequestsFromServer();
  };

  const updatePropertyRequestProposedData = async (propertyId: string, proposedData: Partial<Property>): Promise<boolean> => {
    const existingRequest = requests.find(r => r.propertyId === propertyId && r.type === 'CREATE');
    if (!existingRequest) return false;

    const newRequestStatus = proposedData.status === 'Archived' ? 'ARCHIVED' : 'PENDING';

    const updatedRequest: PropertyRequest = {
      ...existingRequest,
      propertyName: proposedData.title || existingRequest.propertyName,
      status: newRequestStatus,
      proposedData: {
        ...existingRequest.proposedData,
        ...proposedData
      }
    };

    // 1. Write to database first
    const { error } = await supabase
      .from('property_requests')
      .upsert(updatedRequest);

    if (error) {
      console.error("Supabase update request failed:", error);
      throw new Error(`Database error: ${error.message || "Failed to update request details in cloud database."}`);
    }

    // 2. Update state and cache on success
    const updatedRequests = requests.map(r => r.id === updatedRequest.id ? updatedRequest : r);
    setRequests(updatedRequests);
    safeSetItem('puyoko_property_requests', JSON.stringify(updatedRequests));
    removeUnsyncedRequestId(updatedRequest.id);
    return true;
  };

  const archivePropertyRequest = async (propertyId: string): Promise<boolean> => {
    const existingRequest = requests.find(r => r.propertyId === propertyId && r.type === 'CREATE');
    if (!existingRequest) return false;

    const updatedRequest: PropertyRequest = {
      ...existingRequest,
      status: 'ARCHIVED',
      proposedData: {
        ...existingRequest.proposedData,
        status: 'Archived'
      }
    };

    // 1. Write to database first
    const { error } = await supabase
      .from('property_requests')
      .upsert(updatedRequest);

    if (error) {
      console.error("Supabase archive request failed:", error);
      throw new Error(`Database error: ${error.message || "Failed to archive request."}`);
    }

    // 2. Update state and cache on success
    const updatedRequests = requests.map(r => r.id === updatedRequest.id ? updatedRequest : r);
    setRequests(updatedRequests);
    safeSetItem('puyoko_property_requests', JSON.stringify(updatedRequests));
    removeUnsyncedRequestId(updatedRequest.id);
    return true;
  };

  const unarchivePropertyRequest = async (propertyId: string): Promise<boolean> => {
    const existingRequest = requests.find(r => r.propertyId === propertyId && r.type === 'CREATE');
    if (!existingRequest) return false;

    const updatedRequest: PropertyRequest = {
      ...existingRequest,
      status: 'PENDING',
      proposedData: {
        ...existingRequest.proposedData,
        status: 'Active'
      }
    };

    // 1. Write to database first
    const { error } = await supabase
      .from('property_requests')
      .upsert(updatedRequest);

    if (error) {
      console.error("Supabase unarchive request failed:", error);
      throw new Error(`Database error: ${error.message || "Failed to restore pending creation."}`);
    }

    // 2. Update state and cache on success
    const updatedRequests = requests.map(r => r.id === updatedRequest.id ? updatedRequest : r);
    setRequests(updatedRequests);
    safeSetItem('puyoko_property_requests', JSON.stringify(updatedRequests));
    removeUnsyncedRequestId(updatedRequest.id);
    return true;
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
          const { error } = await supabase.from('property_requests').upsert(req);
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
      requests,
      submitPropertyRequest,
      approvePropertyRequest,
      rejectPropertyRequest,
      updatePropertyRequestProposedData,
      archivePropertyRequest,
      unarchivePropertyRequest,
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
