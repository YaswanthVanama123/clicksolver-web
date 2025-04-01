import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MdArrowBack, MdEmail } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const AccountDelete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Form state (read-only values)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Get profile details passed via route state
  useEffect(() => {
    const details = location.state?.details;
    if (details) {
      setEmail(details.email);
      setPhone(details.phoneNumber);
      setFullName(details.name);
    }
  }, [location.state]);

  // Delete account (simulate updateProfile)
  const updateProfile = async () => {
    try {
      setUpdateLoading(true);
      const jwtToken = localStorage.getItem('cs_token');
      if (!jwtToken) {
        console.error('No JWT token found');
        return;
      }
      const response = await axios.post(
        'https://backend.clicksolver.com/api/user/details/delete',
        { name: fullName, email, phone },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      if (response.status === 200) {
        // On successful deletion, perform logout
        handleLogout();
      } else {
        console.error('Failed to delete account. Status: ', response.status);
      }
    } catch (error) {
      console.error('Error response: ', error.response?.data || error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Logout: clear tokens and navigate to Login
  const handleLogout = async () => {
    try {
      const fcm_token = localStorage.getItem('fcm_token');
      if (fcm_token) {
        await axios.post('https://backend.clicksolver.com/api/userLogout', { fcm_token });
      }
      localStorage.removeItem('cs_token');
      localStorage.removeItem('fcm_token');
      localStorage.removeItem('notifications');
      localStorage.removeItem('messageBox');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Open confirmation modal
  const openConfirmationModal = () => {
    setModalVisible(true);
  };

  // Close modal and delete account
  const handleUpdate = () => {
    setModalVisible(false);
    updateProfile();
  };

  return (
    <div className="min-h-screen p-5 bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* Scrollable content */}
      <div className="overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-2 focus:outline-none">
            <MdArrowBack size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="ml-4 flex-1 text-2xl font-bold text-center">
            {t('account_delete') || 'Account Delete'}
          </h1>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-base font-medium text-gray-600 dark:text-gray-300">
              {t('full_name') || 'Full Name'}
            </label>
            <input
              type="text"
              value={fullName}
              readOnly
              className="w-full h-12 px-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-base font-medium text-gray-600 dark:text-gray-300">
              {t('email_address') || 'Email Address'}
            </label>
            <div className="flex items-center w-full h-12 px-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800">
              <MdEmail size={20} className="text-gray-500" />
              <input
                type="email"
                value={email}
                readOnly
                className="flex-1 ml-3 bg-transparent focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-base font-medium text-gray-600 dark:text-gray-300">
              {t('phone_number') || 'Phone Number'}
            </label>
            <div className="flex items-center w-full h-12 px-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png"
                alt="Flag"
                className="w-6 h-4 mr-2"
              />
              <span className="mr-2 text-base font-medium text-gray-900 dark:text-white">+ 91</span>
              <input
                type="text"
                value={phone}
                readOnly
                className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Delete Account Button */}
          <button
            onClick={openConfirmationModal}
            disabled={updateLoading}
            className="w-full h-12 rounded-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center"
          >
            {updateLoading ? (
              <span className="text-white">Loading...</span>
            ) : (
              <span className="text-white font-medium text-base">
                {t('delete_account') || 'Delete Account'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalVisible && (
        <div
          className="fixed inset-0 flex justify-center items-end bg-black bg-opacity-50"
          onClick={() => setModalVisible(false)}
        >
          <div
            className="w-full bg-white dark:bg-gray-800 p-6 rounded-t-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
              {t('confirm_delete') || 'Confirm Delete'}
            </h2>
            <p className="text-base text-center text-gray-700 dark:text-gray-300 mb-6">
              {t('confirm_delete_message') ||
                'Are you sure you want to delete your profile?'}
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
                {t('delete') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDelete;
