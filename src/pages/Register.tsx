import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import InputForm from '../ui/InputForm';
import { motion } from 'framer-motion';

// Validation schema using Zod
const RegisterSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email address')
      .nonempty('Email is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .nonempty('Password is required'),
    confirmPassword: z.string().nonempty('Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type RegisterFormInputs = z.infer<typeof RegisterSchema>;

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    const { email, password } = data;

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      toast.success(
        'Account created successfully! Please check your email to confirm.'
      );
      navigate('/login');
    } catch (error: any) {
      toast.error(
        error.message || 'An error occurred while creating your account.'
      );
    }
  };

  return (
    <motion.section
      className='container mx-auto flex flex-col justify-center items-center min-h-screen px-4 py-8 bg-gradient-to-r from-slate-100 to-blue-50'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className='w-full max-w-md bg-white shadow-lg rounded-lg p-8'
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className='text-3xl font-extrabold text-center mb-6 text-slate-800'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Create Your Account
        </motion.h1>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <InputForm
              type='email'
              placeholder='Email'
              error={errors.email?.message}
              {...register('email')}
            />
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <InputForm
              type='password'
              placeholder='Password'
              error={errors.password?.message}
              {...register('password')}
            />
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <InputForm
              type='password'
              placeholder='Confirm Password'
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <button
              type='submit'
              className='w-full py-3 px-4 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition'
            >
              Register
            </button>
          </motion.div>
        </form>

        {/* Login Navigation */}
        <motion.p
          className='mt-6 text-center text-sm text-slate-600'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Already have an account?{' '}
          <a href='/login' className='text-blue-500 font-bold hover:underline'>
            Sign In
          </a>
        </motion.p>
      </motion.div>
    </motion.section>
  );
}
