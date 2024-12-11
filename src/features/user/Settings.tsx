import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { toast } from 'react-hot-toast';
import { supabase } from '../../utils/supabaseClient';
import { useAppSelector } from '../../app/hooks';
import { X } from 'lucide-react';

interface SupabaseError extends Error {
  message: string;
  status?: number;
}

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

function SettingsPage() {
  const theme = useAppSelector((state) => state.theme.mode);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const pageAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
  });

  const modalAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { duration: 300 },
  });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isModalOpen]);

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;
        if (!user) throw new Error('User not found. Please log in.');

        setEmail(user.email || '');
      } catch (error: unknown) {
        const supabaseError = error as SupabaseError;
        toast.error(supabaseError.message || 'Failed to fetch user info.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const validatePassword = useCallback((password: string): string[] => {
    const errors: string[] = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(
        `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
      );
    }
    if (!PASSWORD_REQUIREMENTS.hasUpperCase.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!PASSWORD_REQUIREMENTS.hasLowerCase.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!PASSWORD_REQUIREMENTS.hasSpecialChar.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    // Validate current password
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }

    // Validate new password
    const errors = validatePassword(newPassword);
    setPasswordErrors(errors);

    if (errors.length > 0) {
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      // Reauthenticate the user with the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) throw new Error('Current password is incorrect.');

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success('Password changed successfully!');
      setIsModalOpen(false);
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors([]);
    } catch (error: unknown) {
      const supabaseError = error as SupabaseError;
      toast.error(supabaseError.message || 'Failed to change password.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));

    // Validate new password as user types
    if (name === 'newPassword') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordErrors([]);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent' />
      </div>
    );
  }

  return (
    <animated.div
      style={pageAnimation}
      className='bg-slate-50 dark:bg-gray-900 min-h-screen text-slate-800 dark:text-slate-100 font-sans mt-10'
    >
      {/* Header */}
      <header className='bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-700 py-16 px-8 text-center shadow-lg'>
        <h1 className='text-4xl font-bold text-slate-800 dark:text-white mb-2'>
          Settings
        </h1>
        <p className='text-lg text-slate-600 dark:text-slate-300 mt-4 max-w-2xl mx-auto'>
          Manage your account and preferences. Keep your account secure by
          regularly updating your password.
        </p>
      </header>

      {/* Settings Form */}
      <main className='py-10 px-8'>
        <div className='max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 border border-gray-100 dark:border-gray-700'>
          <h2 className='text-2xl font-bold text-slate-800 dark:text-white mb-6'>
            Account Settings
          </h2>

          {/* Email */}
          <div className='mb-6'>
            <label className='block text-slate-600 dark:text-slate-300 font-medium mb-2'>
              Email Address
            </label>
            <div className='relative'>
              <input
                type='email'
                value={email}
                disabled
                aria-label='Email address'
                className='w-full px-4 py-3 bg-slate-100 dark:bg-gray-700 
                  border border-slate-300 dark:border-gray-600 rounded-lg 
                  focus:outline-none cursor-not-allowed text-slate-500 
                  dark:text-slate-400'
              />
              <span
                className='absolute right-3 top-1/2 transform -translate-y-1/2 
                text-xs text-slate-500 dark:text-slate-400 bg-slate-200 
                dark:bg-gray-600 px-2 py-1 rounded'
              >
                Verified
              </span>
            </div>
          </div>

          {/* Password Change */}
          <div className='mt-10'>
            <h2 className='text-2xl font-bold text-slate-800 dark:text-white mb-6'>
              Security
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className='px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md 
                hover:bg-blue-600 transition-colors duration-200 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              Change Password
            </button>
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {isModalOpen && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
          onClick={handleModalClose}
        >
          <animated.div
            style={modalAnimation}
            onClick={(e) => e.stopPropagation()}
            className='bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-2xl 
              border border-gray-100 dark:border-gray-700 relative'
          >
            <button
              onClick={handleModalClose}
              className='absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 
                dark:text-gray-500 dark:hover:text-gray-300 transition-colors'
              aria-label='Close modal'
            >
              <X size={20} />
            </button>

            <h3 className='text-xl font-bold text-slate-800 dark:text-white mb-4'>
              Change Password
            </h3>

            <form onSubmit={handlePasswordChange} className='space-y-4'>
              {/* Current Password */}
              <div>
                <label className='block text-slate-600 dark:text-slate-300 font-medium mb-2'>
                  Current Password
                </label>
                <input
                  name='currentPassword'
                  type='password'
                  value={passwords.currentPassword}
                  onChange={handleInputChange}
                  aria-label='Current Password'
                  placeholder='Enter current password'
                  className='w-full px-4 py-2 border border-slate-300 dark:border-gray-600 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                    bg-white dark:bg-gray-700 text-slate-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500'
                />
              </div>

              {/* New Password */}
              <div>
                <label className='block text-slate-600 dark:text-slate-300 font-medium mb-2'>
                  New Password
                </label>
                <input
                  name='newPassword'
                  type='password'
                  value={passwords.newPassword}
                  onChange={handleInputChange}
                  aria-label='New Password'
                  placeholder='Enter new password'
                  className='w-full px-4 py-2 border border-slate-300 dark:border-gray-600 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                    bg-white dark:bg-gray-700 text-slate-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500'
                />
              </div>

              {/* Password Requirements */}
              {passwords.newPassword && (
                <div className='space-y-2 text-sm'>
                  {passwordErrors.length > 0 ? (
                    passwordErrors.map((error, index) => (
                      <p key={index} className='text-red-500 dark:text-red-400'>
                        ✗ {error}
                      </p>
                    ))
                  ) : (
                    <p className='text-green-500 dark:text-green-400'>
                      ✓ Password meets all requirements
                    </p>
                  )}
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label className='block text-slate-600 dark:text-slate-300 font-medium mb-2'>
                  Confirm Password
                </label>
                <input
                  name='confirmPassword'
                  type='password'
                  value={passwords.confirmPassword}
                  onChange={handleInputChange}
                  aria-label='Confirm Password'
                  placeholder='Confirm new password'
                  className='w-full px-4 py-2 border border-slate-300 dark:border-gray-600 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                    bg-white dark:bg-gray-700 text-slate-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500'
                />
              </div>

              {/* Password Match Indicator */}
              {passwords.confirmPassword && (
                <p
                  className={`text-sm ${
                    passwords.newPassword === passwords.confirmPassword
                      ? 'text-green-500 dark:text-green-400'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {passwords.newPassword === passwords.confirmPassword
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}

              <div className='flex justify-end gap-3 mt-6'>
                <button
                  onClick={handleModalClose}
                  type='button'
                  className='px-6 py-2 bg-gray-500 text-white rounded-lg shadow-md 
                    hover:bg-gray-600 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md 
                    hover:bg-blue-600 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                >
                  Save Password
                </button>
              </div>
            </form>
          </animated.div>
        </div>
      )}
    </animated.div>
  );
}

export default SettingsPage;
