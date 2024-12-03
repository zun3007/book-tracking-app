import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        toast.success('Logged out successfully!');
        navigate('/login'); // Redirect to the login page
      } catch (error: any) {
        toast.error(error.message || 'Failed to log out. Please try again.');
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50'>
      {/* Animated Logout Message */}
      <motion.div
        className='text-center'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className='text-3xl font-bold text-blue-600 mb-4'>
          Logging Out...
        </h1>
        <p className='text-slate-600'>
          Please wait while we safely log you out of your account.
        </p>
      </motion.div>
    </div>
  );
}

export default LogoutPage;
