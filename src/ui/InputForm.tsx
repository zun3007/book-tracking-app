import React from 'react';
import { FieldError } from 'react-hook-form';

interface InputFormProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
}

const InputForm = React.forwardRef<HTMLInputElement, InputFormProps>(
  ({ error, ...props }, ref) => (
    <div className='flex flex-col items-start w-full'>
      <input
        ref={ref}
        {...props}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-4 ${
          error
            ? 'border-red-500 focus:ring-red-300'
            : 'border-gray-300 focus:ring-blue-300'
        }`}
      />
      {error && (
        <span className='text-red-500 text-sm mt-1 self-start'>
          {error.message}
        </span>
      )}
    </div>
  )
);

export default InputForm;
