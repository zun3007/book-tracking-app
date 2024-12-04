import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { motion } from 'framer-motion';
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  useEffect(() => {
    // Extract reset token from URL hash
    const token = new URLSearchParams(window.location.hash.substring(1)).get(
      'access_token'
    );
    if (!token) {
      toast.error('Missing or invalid reset token.');
      navigate('/forgot-password');
    } else {
      setResetToken(token);
    }
  }, [navigate]);

  const onSubmit = async (data: ResetPasswordInputs) => {
    if (!resetToken) {
      toast.error('Invalid reset token. Please request a new reset link.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      className='container mx-auto flex flex-col justify-center items-center min-h-screen px-4 py-8 bg-slate-50'
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className='w-full max-w-md bg-white shadow-lg rounded-lg p-8'>
        <motion.h1
          className='text-3xl font-extrabold text-center mb-8 text-slate-700'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Reset Password
        </motion.h1>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* New Password Input */}
          <InputForm
            type='password'
            placeholder='New Password'
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          {/* Confirm Password Input */}
          <InputForm
            type='password'
            placeholder='Confirm Password'
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {/* Submit Button */}
          <button
            type='submit'
            className={`w-full py-3 px-4 rounded-lg text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 transition'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </motion.section>
  );
}
