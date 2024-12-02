import { motion } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Particles } from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import InputForm from '../ui/InputForm';
import { GoogleIcon } from '../ui/CustomIcons';
import { useLayoutEffect } from 'react';

interface IFormInput {
  email: string;
  password: string;
}

export default function SignIn() {
  useLayoutEffect(() => {
    document.title =
      'StoryTrack | The only service you need to manage your Story';

    return () => {
      document.title = 'StoryTrack';
    };
  }, []);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log(data);
  };

  return (
    <div className='relative h-screen flex items-center justify-center'>
      <Particles
        init={loadFull}
        options={{
          particles: {
            number: { value: 50 },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.3 },
            size: { value: 3 },
            move: { enable: true, speed: 1 },
          },
          background: { color: { value: '#ffffff' } },
        }}
        className='absolute inset-0'
      />
      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className='relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full'
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='text-4xl font-bold text-slate-800 mb-6 text-center'
        >
          Welcome Back
        </motion.h1>
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col gap-4'
        >
          <InputForm
            type='email'
            placeholder='Email'
            error={errors.email}
            {...register('email', { required: 'Email is required' })}
          />
          <InputForm
            type='password'
            placeholder='Password'
            error={errors.password}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
          />
          <a
            className='text-sm text-blue-500 hover:underline mt-2 self-start'
            href='#'
          >
            Forgot Password?
          </a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='submit'
            className='w-full py-3 text-lg rounded-lg bg-blue-600 text-white mt-4 shadow-lg hover:bg-blue-500 transition-all'
          >
            Login
          </motion.button>
          <p className='text-sm text-center'>
            Don’t have an account?{' '}
            <a className='text-blue-500 hover:underline' href='#'>
              Register
            </a>
          </p>
        </motion.form>
        <div className='text-center mt-4'>OR</div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type='button'
          className='flex items-center justify-center w-full py-3 text-lg rounded-lg bg-slate-800 text-white mt-4 shadow-lg hover:bg-slate-700 transition-all'
        >
          <GoogleIcon className='h-6 w-6 mr-2' />
          Continue with Google
        </motion.button>
      </motion.section>
    </div>
  );
}
