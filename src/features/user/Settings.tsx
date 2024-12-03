import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { toast } from 'react-hot-toast';
import { supabase } from '../../utils/supabaseClient';

function SettingsPage() {
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('Light');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          throw new Error('User not found. Please log in.');
        }

        setEmail(user.email || '');
      } catch (error) {
        toast.error(error.message || 'Failed to fetch user info.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword) {
      toast.error('Please enter your current password.');
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
    } catch (error) {
      toast.error(error.message || 'Failed to change password.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-slate-600'>Loading user info...</p>
      </div>
    );
  }

  return (
    <animated.div
      style={pageAnimation}
      className='bg-slate-50 min-h-screen text-slate-800 font-sans mt-10'
    >
      {/* Header */}
      <header className='bg-gradient-to-r from-slate-100 to-slate-200 py-16 px-8 text-center shadow-sm'>
        <h1 className='text-4xl font-bold text-slate-800'>Settings</h1>
        <p className='text-lg text-slate-600 mt-4'>
          Manage your account and preferences.
        </p>
      </header>

      {/* Settings Form */}
      <main className='py-10 px-8'>
        <div className='max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8'>
          <h2 className='text-2xl font-bold text-slate-800 mb-6'>
            Account Settings
          </h2>

          {/* Email */}
          <div className='mb-6'>
            <label className='block text-slate-600 font-medium mb-2'>
              Email
            </label>
            <input
              type='email'
              value={email}
              disabled
              className='w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none cursor-not-allowed text-slate-500'
            />
          </div>

          {/* Notifications */}
          <div className='mb-6'>
            <label className='block text-slate-600 font-medium mb-2'>
              Notifications
            </label>
            <div className='flex items-center gap-4'>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  checked={notifications === true}
                  onChange={() => setNotifications(true)}
                  className='form-radio text-blue-500'
                />
                <span>Enable</span>
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  checked={notifications === false}
                  onChange={() => setNotifications(false)}
                  className='form-radio text-blue-500'
                />
                <span>Disable</span>
              </label>
            </div>
          </div>

          {/* Theme */}
          <div className='mb-6'>
            <label className='block text-slate-600 font-medium mb-2'>
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className='w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='Light'>Light</option>
              <option value='Dark'>Dark</option>
            </select>
          </div>

          {/* Password Change */}
          <h2 className='text-2xl font-bold text-slate-800 mt-10 mb-6'>
            Change Password
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className='px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400'
          >
            Change Password
          </button>
        </div>
      </main>

      {/* Password Change Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <animated.div
            style={modalAnimation}
            className='bg-white w-full max-w-md p-6 rounded-lg shadow-lg'
          >
            <h3 className='text-xl font-bold text-slate-800 mb-4'>
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange}>
              {/* Current Password */}
              <div className='mb-4'>
                <label className='block text-slate-600 font-medium mb-2'>
                  Current Password
                </label>
                <input
                  name='currentPassword'
                  type='password'
                  value={passwords.currentPassword}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              {/* New Password */}
              <div className='mb-4'>
                <label className='block text-slate-600 font-medium mb-2'>
                  New Password
                </label>
                <input
                  name='newPassword'
                  type='password'
                  value={passwords.newPassword}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              {/* Confirm Password */}
              <div className='mb-4'>
                <label className='block text-slate-600 font-medium mb-2'>
                  Confirm Password
                </label>
                <input
                  name='confirmPassword'
                  type='password'
                  value={passwords.confirmPassword}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div className='text-right'>
                <button
                  type='submit'
                  className='px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400'
                >
                  Save Password
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  type='button'
                  className='px-6 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-400 ml-2'
                >
                  Cancel
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
