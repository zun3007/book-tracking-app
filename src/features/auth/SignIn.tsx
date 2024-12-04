import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { motion } from 'framer-motion';

import InputForm from '../../ui/InputForm';

// Form validation schema using Zod
const SignInSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .nonempty('Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .nonempty('Password is required'),
});

type SignInFormInputs = z.infer<typeof SignInSchema>;

// First, define the correct error type
interface InputFormProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | undefined; // Changed from FieldError
  // ... other props
}

export default function SignInPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInputs>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data: SignInFormInputs) => {
    setIsSubmitting(true);

    try {
      const { email, password } = data;
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = authData.user;
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          // Insert profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email,
            });

          if (insertError) throw insertError;
        } else {
          // Update profile if it exists
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        }
      }

      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in. Please try again.');
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
          Sign In
        </motion.h1>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Email Input */}
          <InputForm
            type='email'
            placeholder='Email'
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password Input */}
          <InputForm
            type='password'
            placeholder='Password'
            error={errors.password?.message}
            {...register('password')}
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
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Forgot Password Link */}
        <motion.p
          className='mt-4 text-center text-sm text-blue-500 hover:underline cursor-pointer'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => navigate('/forgot-password')}
        >
          Forgot Password?
        </motion.p>

        {/* Navigation */}
        <motion.div
          className='mt-6 text-center'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <p className='text-sm text-slate-600'>
            Don't have an account?{' '}
            <Link
              to='/register'
              className='text-blue-500 font-bold hover:underline'
            >
              Register Now
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
