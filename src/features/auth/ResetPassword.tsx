import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import InputForm from './../../ui/InputForm';

const ResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .nonempty('New password is required'),
    confirmPassword: z.string().nonempty('Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordInputs = z.infer<typeof ResetPasswordSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  useEffect(() => {
    // Check if we have access to the recovery session
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        toast.error(
          'Invalid or expired recovery link. Please request a new one.'
        );
        navigate('/forgot-password');
      }
    };

    checkSession();
  }, [navigate]);

  const onSubmit = async (data: ResetPasswordInputs) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast.success(
        'Password updated successfully! Please log in with your new password.'
      );

      // Sign out after password update
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to reset password.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className='min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-dark-950 dark:to-dark-900 flex flex-col items-center justify-center p-4 transition-colors duration-300'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <motion.div className='w-full max-w-md' variants={itemVariants}>
        <div className='mb-8 text-center'>
          <motion.div
            className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShieldCheck className='w-8 h-8 text-blue-600 dark:text-blue-400' />
          </motion.div>
          <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
            Create New Password
          </h1>
          <p className='text-slate-600 dark:text-slate-300'>
            Please enter your new password below
          </p>
        </div>

        <motion.div
          className='bg-white dark:bg-dark-800 shadow-xl rounded-2xl p-8 border border-slate-200 dark:border-dark-700'
          variants={itemVariants}
        >
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-slate-700 dark:text-slate-200'>
                New Password
              </label>
              <InputForm
                type='password'
                placeholder='Enter your new password'
                error={errors.newPassword?.message}
                aria-label='New Password'
                aria-describedby={
                  errors.newPassword ? 'new-password-error' : undefined
                }
                className='w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200'
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <span
                  id='new-password-error'
                  className='text-sm text-red-500 dark:text-red-400'
                >
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-slate-700 dark:text-slate-200'>
                Confirm Password
              </label>
              <InputForm
                type='password'
                placeholder='Confirm your new password'
                error={errors.confirmPassword?.message}
                aria-label='Confirm Password'
                aria-describedby={
                  errors.confirmPassword ? 'confirm-password-error' : undefined
                }
                className='w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200'
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <span
                  id='confirm-password-error'
                  className='text-sm text-red-500 dark:text-red-400'
                >
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <motion.button
              type='submit'
              className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-lg ${
                isSubmitting
                  ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
              }`}
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <div className='flex items-center justify-center'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </motion.button>

            <div className='mt-4 text-center'>
              <p className='text-sm text-slate-600 dark:text-slate-300'>
                Remember your password?{' '}
                <a
                  href='/login'
                  className='font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200'
                >
                  Back to Sign In
                </a>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
