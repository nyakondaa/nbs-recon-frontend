'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UserCog, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { updateUser } from '@/app/services/api';

const EditMyAccount = ({ user }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  useEffect(() => {
    if (user) {
      setUsername(user.sub || '');
      setEmail(user.email || '');
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setMessage(null);
    }
  }, [user]);

  const checkPasswordStrength = useCallback((pwd) => {
    const feedback = [];
    let score = 0;

    if (pwd.length >= 8) score++;
    else feedback.push('At least 8 characters');

    if (/[A-Z]/.test(pwd)) score++;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(pwd)) score++;
    else feedback.push('One lowercase letter');

    if (/[0-9]/.test(pwd)) score++;
    else feedback.push('One number');

    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    else feedback.push('One special character');

    return { score, feedback: feedback.slice(0, 3) };
  }, []);

  useEffect(() => {
     
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [password, checkPasswordStrength]);

  const getPasswordStrengthColor = (score) => {
    if (score === 0) return 'bg-gray-200';
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score) => {
    if (score === 0) return '';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage(null);

   

      if (!username.trim() || !email.trim()) {
        setMessage({ type: 'error', text: 'Please fill in all required fields.' });
        return;
      }

      if (password) {
        if (!currentPassword) {
          setMessage({ type: 'error', text: 'Please enter your current password to change your password.' });
          return;
        }

        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match.' });
          return;
        }

        if (passwordStrength.score < 3) {
          setMessage({ type: 'error', text: 'Please choose a stronger password.' });
          return;
        }

        if (password === currentPassword) {
          setMessage({ type: 'error', text: 'New password must be different from current password.' });
          return;
        }
      }

      const userData = {
        username: username.trim(),
        email: email.trim(),
        ...(password.trim() && { 
          password: password.trim(),
          currentPassword: currentPassword.trim()
        }),
        roleName: user.role //user cannot update their own role

      };

      setIsLoading(true);
      try {
        await updateUser(user.id, userData);
        setMessage({ type: 'success', text: 'Account updated successfully!' });
        
        setPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
      } catch (err) {
        console.error(err);
        const errorMessage = err.response?.data?.message || 'Failed to update account.';
        setMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsLoading(false);
      }
    },
    [username, email, password, confirmPassword, currentPassword, passwordStrength.score, user.id]
  );

  const isSaveDisabled = useMemo(
    () =>
      isLoading ||
      !username.trim() ||
      !email.trim() ||
      (password && !currentPassword) ||
      (password && password !== confirmPassword) ||
      (password && passwordStrength.score < 3),
    [isLoading, username, email, password, confirmPassword, currentPassword, passwordStrength.score]
  );

  return (
    <div className="p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-100 max-w-4xl w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3 text-2xl font-extrabold text-gray-800">
          <UserCog className="h-6 w-6 text-green-700" />
          <h1>Edit My Account</h1>
        </div>
        <button
          aria-label="More options"
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition duration-150"
          disabled={isLoading}
        >
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isLoading}>
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800"
          />
        </div>

        {/* Password Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
          
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800"
                placeholder="Enter current password to make changes"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="mt-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.score <= 2 ? 'text-red-600' :
                    passwordStrength.score <= 3 ? 'text-yellow-600' :
                    passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index} className="flex items-center">
                        • {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords must match.</p>
            )}
          </div>
        </div>

     
        <div className="pt-6 flex justify-end space-x-4 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-2.5 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-150"
            disabled={isLoading}
            onClick={() => {
              setPassword('');
              setConfirmPassword('');
              setCurrentPassword('');
              setMessage(null);
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaveDisabled}
            className={`px-6 py-2.5 text-white font-semibold rounded-lg transition duration-150 ${
              isSaveDisabled 
                ? 'bg-green-300 cursor-not-allowed' 
                : 'bg-green-700 hover:bg-green-800'
            }`}
          >
            {isLoading ? 'Updating...' : 'Update Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMyAccount;