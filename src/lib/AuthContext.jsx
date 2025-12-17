import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser({
          email: currentUser.email,
          id: currentUser.id,
          ...currentUser.user_metadata
        });
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Auto-login failed');
      }

      const { access_token, refresh_token, email } = await response.json();

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        throw sessionError;
      }

      setUser({ email, id: email });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setAuthError({
        type: 'auth_failed',
        message: error.message || 'Failed to authenticate'
      });
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      logout,
      initializeAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
