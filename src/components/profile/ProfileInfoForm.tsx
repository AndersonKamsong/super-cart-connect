// src/components/profile/ProfileInfoForm.tsx
import React, { useState, useEffect } from 'react';
import { User } from '@/types'; // Adjust path
import { authService } from '@/services/authService'; // Adjust path
import { toast } from 'react-toastify';

interface ProfileInfoFormProps {
  user: User;
  updateUserInContext: (updatedUserData: Partial<User>) => void;
  refreshUserProfile: () => Promise<void>;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({ user, updateUserInContext, refreshUserProfile }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update form fields if user object changes (e.g., after refresh)
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setAvatar(user.avatar || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData: Partial<User> = {
        name,
        email,
        phone: phone || undefined, // Send undefined if empty to clear it in DB
        avatar: avatar || undefined, // Send undefined if empty to clear it in DB
      };
      const response = await authService.updateProfile(updatedData);
      updateUserInContext(response); // Update context with the full updated user from API
      toast.success('Profile updated successfully!');

      if (email !== user.email) {
        toast.info('Your email has been changed. Please check your new email for verification.');
        // Optionally, trigger resend verification if your backend doesn't do it automatically on email change
        // await authService.resendVerification();
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      await authService.resendVerification();
      toast.info('Verification email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Failed to resend verification:', error);
      toast.error(error.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          {!user.isVerified && (
            <p className="mt-2 text-sm text-yellow-600">
              Email not verified. <button type="button" onClick={handleResendVerification} className="text-indigo-600 hover:underline disabled:opacity-50" disabled={loading}>Resend verification?</button>
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Avatar URL</label>
          <input
            type="text"
            id="avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {avatar && <img src={avatar} alt="Avatar" className="mt-2 h-16 w-16 rounded-full object-cover border border-gray-200" />}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileInfoForm;