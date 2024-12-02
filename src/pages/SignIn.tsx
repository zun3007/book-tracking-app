import { useForm, SubmitHandler } from 'react-hook-form';
import { GoogleIcon } from '../ui/CustomIcons';

interface IFormInput {
  email: string;
  password: string;
}

export default function SignIn() {
  const { register, handleSubmit } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = function (data) {
    console.log(data);
  };

  return (
    <section className='container text-center mx-auto flex align-middle flex-col justify-center max-w-md gap-8 text-neutral-900 shadow-xl rounded-xl px-12 py-16 mt-28 shadow-neutral-300'>
      <h1 className='text-3xl sm:text-4xl antialiased hover:subpixel-antialiased font-semibold tracking-normal mb-6'>
        Welcome back
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <input
          className='shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-double focus:shadow-outline'
          type='email'
          placeholder='Email'
          {...(register('email'), { required: true })}
        />
        <input
          className='shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-double focus:shadow-outline'
          type='password'
          placeholder='Password'
          {...(register('password'), { required: true, minLength: 8 })}
        />
        <a className='text-sm text-blue-500' href='#'>
          Forgot Password
        </a>
        <button
          type='submit'
          className='w-full py-2 text-lg rounded-lg bg-neutral-800 text-neutral-100 my-4'
        >
          Login
        </button>
        <p className='text-sm'>
          Don't have an account?{' '}
          <a className='text-blue-500' href='#'>
            Register
          </a>
        </p>
      </form>
      <p>OR</p>
      <button
        type='button'
        className='flex items-center justify-center w-full py-2 text-lg rounded-lg bg-neutral-800 text-neutral-100'
      >
        <GoogleIcon className='h-6 w-6 mr-2' />
        Continue with Google
      </button>
    </section>
  );
}
