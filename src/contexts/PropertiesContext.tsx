import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Property } from '../types';
import { MOCK_PROPERTIES } from '../data';

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
    setLoading(true);
    let supabaseSuccess = false;
    try {
      // 1. Try Supabase first
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setProperties(data);
        supabaseSuccess = true;
        // Keep local storage in sync as backup
        localStorage.setItem('puyoko_properties', JSON.stringify(data));
        return;
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local storage.", err);
    } finally {
      setLoading(false);
    }
    
    // If Supabase fetch succeeded, do not fall back to mock data (respect empty database)
    if (supabaseSuccess) return;
    
    // 2. Fallback to LocalStorage or MOCK_PROPERTIES
    const saved = localStorage.getItem('puyoko_properties');
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        if (parsedSaved) {
          setProperties(parsedSaved);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved properties");
      }
    }

    // Default fallback on very first local load
    setProperties(MOCK_PROPERTIES);
    localStorage.setItem('puyoko_properties', JSON.stringify(MOCK_PROPERTIES));
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
      await supabase.from('properties').insert([propertyToInsert]);
    } catch (err) {
      console.warn("Supabase add failed, stored locally.");
    }
  };

  const updateProperty = async (updatedProp: Property) => {
    const updated = properties.map(p => p.id === updatedProp.id ? updatedProp : p);
    persistState(updated);

    try {
      await supabase.from('properties').update(updatedProp).eq('id', updatedProp.id);
    } catch (err) {
      console.warn("Supabase update failed, stored locally.");
    }
  };

  const deleteProperty = async (id: string) => {
    const filtered = properties.filter(p => p.id !== id);
    persistState(filtered);

    try {
      await supabase.from('properties').delete().eq('id', id);
    } catch (err) {
      console.warn("Supabase delete failed, stored locally.");
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
