import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

function SettingsPage() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('johndoe@example.com');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('Light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navbarAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordError('');
    alert('Password changed successfully!');
    setIsModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className='bg-slate-50 min-h-screen text-slate-800 font-sans'>
      {/* Navbar */}
      <animated.nav
        style={navbarAnimation}
        className='bg-white shadow-md py-4 px-8 fixed top-0 w-full z-10'
      >
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <h1 className='text-3xl font-extrabold text-blue-600'>StoryTrack</h1>
          <div className='flex gap-6'>
            <a
              href='/'
              className='text-slate-600 hover:text-blue-600 font-medium transition'
            >
              Home
            </a>
            <a
              href='/books'
              className='text-slate-600 hover:text-blue-600 font-medium transition'
            >
              All Books
            </a>
            <a
              href='/favorites'
              className='text-slate-600 hover:text-blue-600 font-medium transition'
            >
              Favorites
            </a>
            <a
              href='/settings'
              className='text-blue-600 font-medium transition'
            >
              Settings
            </a>
            <a
              href='/logout'
              className='text-red-500 hover:text-red-400 font-medium transition'
            >
              Logout
            </a>
          </div>
        </div>
      </animated.nav>

      {/* Header */}
      <header className='bg-gradient-to-r from-blue-50 to-slate-100 py-16 px-8 text-center shadow-sm mt-20'>
        <h1 className='text-4xl font-bold text-slate-800'>Settings</h1>
        <p className='text-lg text-slate-600 mt-4'>
          Customize your preferences and profile settings.
        </p>
      </header>

      {/* Settings Form */}
      <main className='py-10 px-8'>
        <div className='max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8'>
          <h2 className='text-2xl font-bold text-slate-800 mb-6'>
            Profile Settings
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Settings saved successfully!');
            }}
          >
            {/* Name */}
            <div className='mb-6'>
              <label
                htmlFor='name'
                className='block text-slate-600 font-medium mb-2'
              >
                Name
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Email */}
            <div className='mb-6'>
              <label
                htmlFor='email'
                className='block text-slate-600 font-medium mb-2'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                    value='true'
                    checked={notifications === true}
                    onChange={() => setNotifications(true)}
                    className='form-radio text-blue-500'
                  />
                  <span>Enable</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='radio'
                    value='false'
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

            {/* Save Button */}
            <div className='text-right'>
              <button
                type='submit'
                className='px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition'
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Change Password */}
          <h2 className='text-2xl font-bold text-slate-800 mt-10 mb-6'>
            Change Password
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className='px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition'
          >
            Change Password
          </button>
        </div>
      </main>

      {/* Password Change Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white w-full max-w-md p-6 rounded-lg shadow-lg'>
            <h3 className='text-xl font-bold text-slate-800 mb-4'>
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange}>
              {/* Current Password */}
              <div className='mb-4'>
                <label
                  htmlFor='currentPassword'
                  className='block text-slate-600 font-medium mb-2'
                >
                  Current Password
                </label>
                <input
                  id='currentPassword'
                  type='password'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* New Password */}
              <div className='mb-4'>
                <label
                  htmlFor='newPassword'
                  className='block text-slate-600 font-medium mb-2'
                >
                  New Password
                </label>
                <input
                  id='newPassword'
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* Confirm Password */}
              <div className='mb-4'>
                <label
                  htmlFor='confirmPassword'
                  className='block text-slate-600 font-medium mb-2'
                >
                  Confirm Password
                </label>
                <input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* Error Message */}
              {passwordError && (
                <p className='text-red-500 text-sm mb-4'>{passwordError}</p>
              )}

              {/* Save Button */}
              <div className='text-right'>
                <button
                  type='submit'
                  className='px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition'
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  type='button'
                  className='px-6 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-400 transition ml-2'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
