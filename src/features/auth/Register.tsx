import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import InputForm from './../../ui/InputForm';

// Generate a custom CAPTCHA
const generateCaptcha = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 6 }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
};

// Form validation schema using Zod
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
    captcha: z.string().nonempty('CAPTCHA is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type RegisterFormInputs = z.infer<typeof RegisterSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    if (data.captcha !== captcha) {
      toast.error('CAPTCHA does not match.');
      return;
    }

    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
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

          {/* Confirm Password Input */}
          <InputForm
            type='password'
            placeholder='Confirm Password'
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {/* Custom CAPTCHA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className='flex items-center justify-between'>
              <div className='bg-slate-200 px-6 py-3 rounded-md font-mono text-lg text-slate-800 tracking-wider shadow-md hover:shadow-lg transition-all duration-200'>
                {captcha}
              </div>
              <button
                type='button'
                onClick={() => setCaptcha(generateCaptcha())}
                className='text-blue-500 hover:text-blue-600 underline'
              >
                Refresh
              </button>
            </div>
            <InputForm
              type='text'
              placeholder='Enter CAPTCHA'
              error={errors.captcha?.message}
              {...register('captcha')}
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
              className={`w-full py-3 px-4 rounded-lg text-white ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 transition'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
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
          <Link to='/login' className='text-blue-500 font-bold hover:underline'>
            Sign In
          </Link>
        </motion.p>
      </motion.div>
    </motion.section>
  );
}
