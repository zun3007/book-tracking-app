import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { motion } from 'framer-motion';
import InputForm from './../../ui/InputForm';

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
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormInputs = z.infer<typeof RegisterSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsSubmitting(true);
    try {
      const { email, password } = data;
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = authData.user;
      if (user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: user.id,
          email: user.email,
        });

        if (profileError) throw profileError;
      }

      toast.success(
        'Account created successfully! Check your email to confirm.'
      );
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register. Please try again.');
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
          Register
        </motion.h1>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <InputForm
            type='email'
            placeholder='Email'
            error={errors.email?.message}
            {...register('email')}
          />

          <InputForm
            type='password'
            placeholder='Password'
            error={errors.password?.message}
            {...register('password')}
          />

          <InputForm
            type='password'
            placeholder='Confirm Password'
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

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
        </form>

        <motion.div
          className='mt-6 text-center'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <p className='text-sm text-slate-600'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='text-blue-500 font-bold hover:underline'
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
