import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-hot-toast';

export const useProfileUpdate = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const updateProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          navigate('/login');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (!profileData && !profileError) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email,
            });

          if (insertError) throw insertError;
        }
      } catch (error: any) {
        console.error('Profile update error:', error);
        toast.error('Failed to update profile');
      }
    };

    updateProfile();
  }, [navigate]);
};
