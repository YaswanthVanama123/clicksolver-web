import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { MdArrowBack, MdEmail } from 'react-icons/md';

const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  // Get profile details from route state (if provided)
  const details = location.state?.details || {};
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Set initial form values
  useEffect(() => {
    if (details) {
      setFullName(details.name || '');
      setEmail(details.email || '');
      setPhone(details.phoneNumber || '');
    }
  }, [details]);

  // Function to update the profile
  const updateProfile = async () => {
    try {
      setUpdateLoading(true);
      const jwtToken = localStorage.getItem('cs_token');
      if (!jwtToken) {
        console.error('No JWT token found');
        return;
      }
      const response = await axios.post(
        'https://backend.clicksolver.com/api/user/details/update',
        { name: fullName, email, phone },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      if (response.status === 200) {
        // Navigate to the account screen after a successful update.
        navigate('/account', { replace: true });
      } else {
        console.error('Failed to update profile. Status: ', response.status);
      }
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Open confirmation modal before updating
  const openConfirmationModal = () => setModalVisible(true);
  const handleUpdate = () => {
    setModalVisible(false);
    updateProfile();
  };

  return (
    <div className="min-h-screen relative p-4 bg-white dark:bg-gray-900">
      <div className="overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-4">
          <MdArrowBack
            size={24}
            className="cursor-pointer text-black dark:text-white"
            onClick={() => navigate(-1)}
          />
          <h2 className="flex-1 text-center font-semibold text-xl text-blue-900 dark:text-white">
            {t('edit_profile') || 'Edit Profile'}
          </h2>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              {t('full_name') || 'Full Name'}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              data-testid="fullName-input"
              className="w-full h-12 px-3 border border-gray-300 dark:border-gray-600 rounded focus:outline-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              {t('email_address') || 'Email Address'}
            </label>
            <div className="flex items-center px-3 h-12 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800">
              <MdEmail size={20} className="text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 ml-3 focus:outline-none bg-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              {t('phone_number') || 'Phone Number'}
            </label>
            <div className="flex items-center px-3 h-12 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png"
                alt="flag"
                className="w-6 h-4 mr-2"
              />
              <span className="mr-2 text-base font-medium text-gray-900 dark:text-white">
                + 91
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                readOnly
                className="flex-1 focus:outline-none bg-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Update Button */}
      <div className="absolute inset-x-4 bottom-4">
        <button
          onClick={openConfirmationModal}
          disabled={updateLoading}
          className="w-full h-12 rounded-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center"
        >
          {updateLoading ? (
            <span className="text-white">Loading...</span>
          ) : (
            <span className="text-white font-semibold">
              {t('update_profile') || 'Update Profile'}
            </span>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {modalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center"
          onClick={() => setModalVisible(false)}
        >
          <div
            className="w-full bg-white dark:bg-gray-800 p-6 rounded-t-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-center text-blue-900 dark:text-white mb-4">
              {t('confirm_update') || 'Confirm Update'}
            </h3>
            <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
              {t('confirm_update_message') ||
                'Are you sure you want to update your profile?'}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setModalVisible(false)}
                className="flex-1 py-2 rounded bg-gray-300 text-gray-800 font-medium"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 py-2 rounded bg-orange-600 text-white font-medium"
              >
                {t('update') || 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
