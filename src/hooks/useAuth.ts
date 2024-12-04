import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { supabase } from '../utils/supabaseClient';
import { RootState } from '../store';
import { setUser, clearUser } from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          dispatch(setUser(session.user));
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch(clearUser());
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        dispatch(setUser(session.user));
      } else {
        dispatch(clearUser());
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  const isAuthenticated = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!(user && session);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
  };
};
