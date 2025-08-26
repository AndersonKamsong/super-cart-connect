// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Adjust path
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner'; // Adjust path
// import { toast } from 'react-toastify';

// --- Import Sub-Components for Profile Sections ---
import ProfileInfoForm from '@/components/profile/ProfileInfoForm'; // Adjust path
import ChangePasswordForm from '@/components/profile/ChangePasswordForm'; // Adjust path
import AddressList from '@/components/profile/AddressList'; // Adjust path
import PreferencesForm from '@/components/profile/PreferencesForm'; // Adjust path
import VendorProfileSection from '@/components/profile/VendorProfileSection'; // Adjust path
import DeliveryProfileSection from '@/components/profile/DeliveryProfileSection'; // Adjust path

const ProfilePage: React.FC = () => {
  const { user, loading, isAuthenticated, updateUser, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info'); // Default tab

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please log in to view your profile.');
      navigate('/login'); // Redirect to login if not authenticated
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // This case should ideally be handled by the redirect above, but as a fallback
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p>User data not available. Please ensure you are logged in.</p>
      </div>
    );
  }

  // Helper for tab buttons
  const ProfileTabButton: React.FC<{ tabName: string; children: React.ReactNode }> = ({ tabName, children }) => {
    const isActive = tabName === activeTab;
    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`py-2 px-4 text-sm font-medium focus:outline-none transition-colors duration-200 ${
          isActive
            ? 'border-b-2 border-indigo-600 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">My Profile</h1>

      <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
        <ProfileTabButton tabName="info">Personal Info</ProfileTabButton>
        <ProfileTabButton tabName="security">Security</ProfileTabButton>
        <ProfileTabButton tabName="addresses">Addresses</ProfileTabButton>
        <ProfileTabButton tabName="preferences">Preferences</ProfileTabButton>
        {user.role === 'vendor' && (
          <ProfileTabButton tabName="vendor">My Shop</ProfileTabButton>
        )}
        {(user.role === 'delivery' || user.role === 'global_delivery') && (
          <ProfileTabButton tabName="delivery">Delivery Details</ProfileTabButton>
        )}
        {/* Add more role-specific tabs here if needed for 'admin' or 'staff' */}
      </div>

      <div className="profile-content">
        {activeTab === 'info' && (
          <ProfileInfoForm user={user} updateUserInContext={updateUser} refreshUserProfile={refreshUserProfile} />
        )}
        {activeTab === 'security' && (
          <ChangePasswordForm />
        )}
        {activeTab === 'addresses' && (
          <AddressList userAddresses={user.addresses} refreshUserProfile={refreshUserProfile} />
        )}
        {activeTab === 'preferences' && user.preferences && (
          <PreferencesForm userPreferences={user.preferences} updateUserInContext={updateUser} />
        )}
        {activeTab === 'vendor' && user.role === 'vendor' && (
          <VendorProfileSection shops={user.shops} />
        )}
        {activeTab === 'delivery' && (user.role === 'delivery' || user.role === 'global_delivery') && user.deliveryPersonnelDetails && (
          <DeliveryProfileSection deliveryDetails={user.deliveryPersonnelDetails} updateUserInContext={updateUser} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;