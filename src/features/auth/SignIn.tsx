import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import InputForm from '../../ui/InputForm';

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

interface InputFormProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | undefined;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

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

      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in. Please try again.');
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
            <LogIn className='w-8 h-8 text-blue-600 dark:text-blue-400' />
          </motion.div>
          <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
            Welcome Back
          </h1>
          <p className='text-slate-600 dark:text-slate-300'>
            Sign in to continue your reading journey
          </p>
        </div>

        <motion.div
          className='bg-white dark:bg-dark-800 shadow-xl rounded-2xl p-8 border border-slate-200 dark:border-dark-700'
          variants={itemVariants}
        >
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-slate-700 dark:text-slate-200'>
                Email
              </label>
              <InputForm
                type='email'
                placeholder='Enter your email'
                error={errors.email?.message}
                aria-label='Email'
                aria-describedby={errors.email ? 'email-error' : undefined}
                className='w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200'
                {...register('email')}
              />
              {errors.email && (
                <span
                  id='email-error'
                  className='text-sm text-red-500 dark:text-red-400'
                >
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-slate-700 dark:text-slate-200'>
                Password
              </label>
              <InputForm
                type='password'
                placeholder='Enter your password'
                error={errors.password?.message}
                aria-label='Password'
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                className='w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200'
                {...register('password')}
              />
              {errors.password && (
                <span
                  id='password-error'
                  className='text-sm text-red-500 dark:text-red-400'
                >
                  {errors.password.message}
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
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>

            <div className='flex items-center justify-center'>
              <motion.button
                type='button'
                className='text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200'
                onClick={() => navigate('/forgot-password')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Forgot your password?
              </motion.button>
            </div>
          </form>

          <div className='mt-8 pt-6 text-center border-t border-slate-200 dark:border-dark-700'>
            <p className='text-slate-600 dark:text-slate-300'>
              Don't have an account?{' '}
              <Link
                to='/register'
                className='font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200'
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
