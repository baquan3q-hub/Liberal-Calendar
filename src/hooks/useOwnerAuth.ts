import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { LOCAL_STORAGE_KEYS } from '../config/constants';

export function useOwnerAuth() {
  const [isOwner, setIsOwner] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.OWNER_TOKEN) === 'true';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setIsOwner(true);
          localStorage.setItem(LOCAL_STORAGE_KEYS.OWNER_TOKEN, 'true');
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        const isAuth = Boolean(session);
        setIsOwner(isAuth);
        if (isAuth) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.OWNER_TOKEN, 'true');
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEYS.OWNER_TOKEN);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const loginAsOwner = async (password: string): Promise<boolean> => {
    // Standard owner pass code fallback for local demo or direct login
    if (password === 'admin123' || password === 'liberal2026') {
      setIsOwner(true);
      localStorage.setItem(LOCAL_STORAGE_KEYS.OWNER_TOKEN, 'true');
      setIsLoginModalOpen(false);
      return true;
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@liberal.vn',
        password,
      });
      if (!error) {
        setIsOwner(true);
        localStorage.setItem(LOCAL_STORAGE_KEYS.OWNER_TOKEN, 'true');
        setIsLoginModalOpen(false);
        return true;
      }
    }

    return false;
  };

  const logoutOwner = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsOwner(false);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.OWNER_TOKEN);
  };

  return {
    isOwner,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginAsOwner,
    logoutOwner,
  };
}
