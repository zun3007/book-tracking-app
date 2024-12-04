import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        toast.success('Successfully logged out.');
        navigate('/login');
      } catch (error: any) {
        toast.error(error.message || 'Failed to log out. Please try again.');
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <motion.div
      className='flex justify-center items-center min-h-screen bg-slate-50 text-slate-700'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Logging you out...</h1>
        <p className='text-slate-500 mt-4'>Please wait a moment.</p>
      </div>
    </motion.div>
  );
}
