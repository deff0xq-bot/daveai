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

      console.log('[AuthContext] Starting authentication...');
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log('[AuthContext] Found existing session');
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

      console.log('[AuthContext] No session found, calling auto-login...');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[AuthContext] Auto-login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[AuthContext] Auto-login error response:', errorData);
        throw new Error(errorData.error || 'Auto-login failed');
      }

      const responseData = await response.json();
      console.log('[AuthContext] Auto-login response:', {
        success: responseData.success,
        email: responseData.email,
        hasAccessToken: !!responseData.access_token,
        hasRefreshToken: !!responseData.refresh_token
      });

      if (!responseData.access_token || !responseData.refresh_token) {
        throw new Error('No tokens received from auto-login');
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: responseData.access_token,
        refresh_token: responseData.refresh_token,
      });

      if (sessionError) {
        console.error('[AuthContext] Session error:', sessionError);
        throw sessionError;
      }

      console.log('[AuthContext] Session set successfully');

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser({
        email: currentUser.email,
        id: currentUser.id,
        ...currentUser.user_metadata
      });
      setIsAuthenticated(true);
      console.log('[AuthContext] Authentication completed');
    } catch (error) {
      console.error('[AuthContext] Auth initialization failed:', error);
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
