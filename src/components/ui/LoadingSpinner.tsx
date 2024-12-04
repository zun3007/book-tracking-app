import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div className='flex flex-col items-center justify-center p-4 space-y-2'>
      <div className='w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin'></div>
      <p className='text-sm text-gray-600 dark:text-gray-300'>{message}</p>
    </div>
  );
}
