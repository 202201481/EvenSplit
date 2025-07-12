import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const Profile = () => {
  const { user } = useAuth();
  const { showSuccess, showInfo } = useNotification();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // This would normally save to backend
    showSuccess('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleExportData = () => {
    showInfo('Data export feature coming soon!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      showInfo('Account deletion feature coming soon!');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Profile & Settings</h1>

        {/* Profile Information */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Username</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || 'user@example.com'}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              />
            </div>
            
            <div className="flex space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h3 className="text-lg font-medium text-white mb-4">App Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-dark-400 text-sm">Receive email notifications for new bills and settlements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto-settle Small Amounts</p>
                <p className="text-dark-400 text-sm">Automatically settle amounts less than ₹1.00</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h3 className="text-lg font-medium text-white mb-4">Data & Privacy</h3>
          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-left"
            >
              📥 Export My Data
            </button>
            
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-left"
            >
              🗑️ Delete Account
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h3 className="text-lg font-medium text-white mb-4">About EvenSplit</h3>
          <div className="space-y-2 text-dark-300">
            <p><strong className="text-white">Version:</strong> 1.0.0</p>
            <p><strong className="text-white">Built with:</strong> React, Tailwind CSS, Django REST Framework</p>
            <p><strong className="text-white">Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
