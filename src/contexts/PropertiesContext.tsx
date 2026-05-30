import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Property } from '../types';
import { MOCK_PROPERTIES } from '../data';

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

interface PropertiesContextType {
  properties: Property[];
  loading: boolean;
  fetchProperties: () => Promise<void>;
  addProperty: (prop: Omit<Property, 'id'>) => Promise<void>;
  updateProperty: (prop: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

export const PropertiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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
    }
  };

  useEffect(() => {
    fetchProperties();

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'puyoko_properties' && e.newValue) {
        setProperties(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper to persist state
  const persistState = (newProperties: Property[]) => {
    setProperties(newProperties);
    localStorage.setItem('puyoko_properties', JSON.stringify(newProperties));
  };

  const addProperty = async (newProp: Omit<Property, 'id'>) => {
    const propertyId = `PK-${Math.floor(Math.random() * 9000) + 1000}`;
    const propertyToInsert = { ...newProp, id: propertyId } as Property;
    
    persistState([propertyToInsert, ...properties]);

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
    const updated = properties.map(p => p.id === updatedProp.id ? updatedProp : p);
    persistState(updated);

    try {
      const { error } = await supabase.from('properties').update(updatedProp).eq('id', updatedProp.id);
      if (error) throw error;
      removeUnsyncedId(updatedProp.id);
    } catch (err: any) {
      console.error("Supabase update failed! The update is kept in your browser local storage but was not saved to the cloud database:", err);
      addUnsyncedId(updatedProp.id);
      alert(`Warning: Could not save updates to cloud database.\n\nError: ${err.message || "Connection error"}\n\nYour changes are saved locally for now so you won't lose them.`);
    }
  };

  const deleteProperty = async (id: string) => {
    const filtered = properties.filter(p => p.id !== id);
    persistState(filtered);
    removeUnsyncedId(id);

    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase delete failed! The deletion is kept in your browser local storage but was not saved to the cloud database:", err);
      alert("Warning: Could not save deletion to cloud database. Your changes are saved locally for now but will be lost if you reload.");
    }
  };

  return (
    <PropertiesContext.Provider value={{ properties, loading, fetchProperties, addProperty, updateProperty, deleteProperty }}>
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
