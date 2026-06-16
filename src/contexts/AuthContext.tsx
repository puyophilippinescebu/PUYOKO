import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { InactivityTimeoutModal } from '../components/InactivityTimeoutModal';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  displayName: string;
  role: 'director' | 'agent' | null;
  updateDisplayName: (name: string) => void;
  login: () => void;
  logout: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userEmail: null,
  displayName: 'Admin',
  role: null,
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
  const [role, setRole] = useState<'director' | 'agent' | null>(null);

  // Inactivity session timeout configuration (Secure Defaults)
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  const WARNING_DURATION = 60 * 1000; // 60 seconds warning countdown
  const maxSeconds = WARNING_DURATION / 1000;

  // Inactivity timeout states
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(maxSeconds);

  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<any>(null);

  // When userEmail changes, load that user's saved name
  useEffect(() => {
    setDisplayName(getStoredName(userEmail));
  }, [userEmail]);

  const determineAndSetRole = useCallback(async (email: string | null) => {
    if (!email) {
      setRole(null);
      return;
    }
    if (email === 'puyophilippinescebu@gmail.com') {
      setRole('director');
      return;
    }
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', email)
        .maybeSingle();

      if (data && data.role) {
        setRole(data.role as 'director' | 'agent');
      } else {
        setRole('agent');
      }
    } catch (err) {
      console.warn("Failed to fetch user role, defaulting to agent:", err);
      setRole('agent');
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email ?? null;
      setIsAuthenticated(!!session);
      setUserEmail(email);
      determineAndSetRole(email).then(() => {
        setIsLoading(false);
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? null;
      setIsAuthenticated(!!session);
      setUserEmail(email);
      determineAndSetRole(email).then(() => {
        setIsLoading(false);
      });
    });

    return () => subscription.unsubscribe();
  }, [determineAndSetRole]);

  const updateDisplayName = (name: string) => {
    setDisplayName(name);
    if (userEmail) {
      localStorage.setItem(`puyoko_display_name_${userEmail}`, name);
    }
  };

  // login() is handled directly via supabase.auth.signInWithPassword in LoginPage
  const login = () => {
    lastActivityRef.current = Date.now();
    setShowTimeoutWarning(false);
  };

  const logout = async (reason?: string) => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    setRole(null);
    setDisplayName('Admin');
    setShowTimeoutWarning(false);
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (reason === 'inactivity') {
      window.location.href = '/login?reason=inactivity';
    }
  };

  // Reset inactivity timer
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(maxSeconds);
    setShowTimeoutWarning(false);
  }, [maxSeconds]);

  // Monitor inactivity when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowTimeoutWarning(false);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    lastActivityRef.current = Date.now();

    // broad activity triggers to cover all forms of user presence
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetActivity();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    checkIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= INACTIVITY_TIMEOUT) {
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        logout('inactivity');
      } else if (elapsed >= INACTIVITY_TIMEOUT - WARNING_DURATION) {
        setShowTimeoutWarning(true);
        const remaining = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT - elapsed) / 1000));
        setSecondsRemaining(remaining);
      } else {
        setShowTimeoutWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, resetActivity]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userEmail, displayName, role, updateDisplayName, login, logout }}>
      {children}
      <InactivityTimeoutModal
        isOpen={showTimeoutWarning}
        secondsRemaining={secondsRemaining}
        maxSeconds={maxSeconds}
        onStayLoggedIn={resetActivity}
        onLogOutNow={() => logout()}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
