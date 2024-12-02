import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import InputForm from '../ui/InputForm';
import { supabase } from '../utils/supabaseClient';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';

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

export default function SignInPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInputs>({
    resolver: zodResolver(SignInSchema),
  });

  // React Query mutation for signing in
  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormInputs) => {
      const { email, password } = data;
      const { error, user } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      return user;
    },
    onSuccess: (user) => {
      toast.success(`Welcome back, ${user?.email}!`);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while signing in.');
    },
  });

  const onSubmit = (data: SignInFormInputs) => {
    signInMutation.mutate(data);
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-6'
          style={{ paddingBottom: '16px' }}
        >
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.4 }}
          >
            <InputForm
              type='password'
              placeholder='Password'
              error={errors.password?.message}
              {...register('password')}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              type='submit'
              className={`w-full py-3 px-4 rounded-lg text-white ${
                signInMutation.isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 transition'
              }`}
              disabled={signInMutation.isLoading}
            >
              {signInMutation.isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </motion.div>
        </form>

        {/* Forgot Password */}
        <motion.p
          className='mt-4 text-center text-sm text-blue-500 hover:underline cursor-pointer'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Forgot Password?
        </motion.p>

        {/* Register Navigation */}
        <motion.div
          className='mt-6 text-center'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
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
