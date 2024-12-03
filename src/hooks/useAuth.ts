import { useEffect, useState } from 'react';
import { supabase } from './../utils/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setIsLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const { subscription } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, isLoading };
};
