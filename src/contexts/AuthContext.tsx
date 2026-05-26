import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  displayName: string;
  updateDisplayName: (name: string) => void;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userEmail: null,
  displayName: 'Admin',
  updateDisplayName: () => {},
  login: () => {},
  logout: () => {},
});

// Helper: get per-user stored name, fallback to email username
const getStoredName = (email: string | null): string => {
  if (!email) return 'Admin';
  const key = `puyoko_display_name_${email}`;
  return localStorage.getItem(key) || email.split('@')[0];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('Admin');

  // When userEmail changes, load that user's saved name
  useEffect(() => {
    setDisplayName(getStoredName(userEmail));
  }, [userEmail]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email ?? null;
      setIsAuthenticated(!!session);
      setUserEmail(email);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? null;
      setIsAuthenticated(!!session);
      setUserEmail(email);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateDisplayName = (name: string) => {
    setDisplayName(name);
    if (userEmail) {
      localStorage.setItem(`puyoko_display_name_${userEmail}`, name);
    }
  };

  // login() is handled directly via supabase.auth.signInWithPassword in LoginPage
  const login = () => {};

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    setDisplayName('Admin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userEmail, displayName, updateDisplayName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
