import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';

// React-icons imports
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { MdLogout, MdPerson, MdEdit, MdEmail } from 'react-icons/md';
import { MdDeleteOutline, MdAccountCircle } from 'react-icons/md';
import { FiGlobe } from 'react-icons/fi';
import { AiOutlineInfoCircle } from 'react-icons/ai';

import { useTheme } from '../context/ThemeContext';
import profileAnimation from '../assets/profileAnimation.json';

// Reusable MenuItem component
const MenuItem = ({ icon, text, onClick }) => (
  <button
    className="flex items-center w-full py-3 justify-center sm:justify-start"
    onClick={onClick}
  >
    {icon}
    <span className="ml-3 text-base text-gray-800 dark:text-white">{text}</span>
  </button>
);

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();

  // State variables
  const [account, setAccount] = useState({});
  const [image, setImage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Retrieve token from localStorage
  const csToken = localStorage.getItem('cs_token');

  // Fetch profile details
  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      setError(false);
      if (!csToken) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);
      const response = await axios.post(
        'https://backend.clicksolver.com/api/user/profile',
        {},
        { headers: { Authorization: `Bearer ${csToken}` } }
      );
      const { name, email, phone_number, profile } = response.data;
      setImage(profile);
      setAccount({ name, email, phoneNumber: phone_number, profile });
    } catch (err) {
      console.error('Error fetching profile details:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('cs_token');
        setIsLoggedIn(false);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  // Handle image editing via a file input
  const handleEditImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('key', '287b4ba48139a6a59e75b5a8266bbea2');
        formData.append('image', file);
        try {
          const res = await axios.post('https://api.imgbb.com/1/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (res.status === 200) {
            const uploadedUrl = res.data.data.url;
            setImage(uploadedUrl);
            if (csToken) {
              await axios.post(
                'https://backend.clicksolver.com/api/user/updateProfileImage',
                { profileImage: uploadedUrl },
                { headers: { Authorization: `Bearer ${csToken}` } }
              );
              setAccount((prev) => ({ ...prev, profileImage: uploadedUrl }));
            }
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };
    input.click();
  };

  // Handle logout
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
      setIsLoggedIn(false);
      setLogoutModalVisible(false);
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const confirmLogout = () => setLogoutModalVisible(true);
  const closeModal = () => setLogoutModalVisible(false);

  // Render if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center pt-10">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-8">{t('profile')}</h1>
        <button
          onClick={() => navigate('/login')}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg"
        >
          {t('login_or_signup')}
        </button>
        <div className="mt-6 w-full max-w-md space-y-3 text-center">
          <MenuItem
            icon={isDarkMode ? <IoMoonOutline size={22} color="#fff" /> : <IoSunnyOutline size={22} color="#4a4a4a" />}
            text={isDarkMode ? t('dark_theme') : t('light_theme')}
            onClick={toggleTheme}
          />
          <MenuItem
            icon={<MdPerson size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('my_services')}
            onClick={() => navigate('/recent-services')}
          />
          <MenuItem
            icon={<MdEmail size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('help_and_support')}
            onClick={() => navigate('/help')}
          />
          {/* Only show delete and edit options if csToken exists */}
          {csToken && (
            <>
              <MenuItem
                icon={<MdDeleteOutline size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
                text={t('account_delete')}
                onClick={() => navigate('/delete-account', { state: { details: account } })}
              />
              <MenuItem
                icon={<MdAccountCircle size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
                text={t('edit_profile')}
                onClick={() => navigate('/edit-profile', { state: { details: account } })}
              />
            </>
          )}
          <MenuItem
            icon={<AiOutlineInfoCircle size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('refer_and_earn')}
            onClick={() => navigate('/referral')}
          />
          <MenuItem
            icon={<FiGlobe size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('change_language')}
            onClick={() => navigate('/language-selector')}
          />
          <MenuItem
            icon={<AiOutlineInfoCircle size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('about_cs')}
            onClick={() => navigate('/about-cs')}
          />
          <MenuItem
            icon={<MdLogout size={22} color="#FF0000" />}
            text={t('logout')}
            onClick={confirmLogout}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Lottie
          animationData={profileAnimation}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p className="text-lg text-gray-800">{t('something_went_wrong')}</p>
        <button onClick={fetchProfileDetails} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded">
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-3xl mx-auto p-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-20 h-20 mb-3">
            {image ? (
              <img src={image} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center">
                <MdPerson size={40} color="#FFF" />
              </div>
            )}
            <button onClick={handleEditImage} className="absolute bottom-0 right-0 bg-orange-500 rounded p-1">
              <MdEdit size={18} color="#FFF" />
            </button>
          </div>
          <p className="text-2xl font-medium text-gray-800 dark:text-white">{account.name}</p>
        </div>

        {/* Email Field */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4">
          <MdEmail size={24} color="#4a4a4a" />
          <input
            type="text"
            value={account.email}
            readOnly
            className="flex-1 ml-3 bg-transparent text-base text-gray-800 dark:text-white"
          />
        </div>

        {/* Phone Field */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <img src="https://flagcdn.com/w40/in.png" alt="Flag" className="w-6 h-4" />
            <span className="ml-2 text-base font-medium text-gray-800 dark:text-white">+91</span>
          </div>
          <input
            type="text"
            value={account.phoneNumber}
            readOnly
            className="flex-1 ml-3 bg-transparent text-base text-gray-800 dark:text-white"
          />
        </div>

        <div className="border-t border-gray-300 dark:border-gray-600 my-4"></div>

        {/* Options Menu */}
        <div className="space-y-4">
          <MenuItem
            icon={isDarkMode ? <IoMoonOutline size={22} color="#fff" /> : <IoSunnyOutline size={22} color="#4a4a4a" />}
            text={isDarkMode ? t('dark_theme') : t('light_theme')}
            onClick={toggleTheme}
          />
          <MenuItem
            icon={<MdPerson size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('my_services')}
            onClick={() => navigate('/recent-services')}
          />
          <MenuItem
            icon={<MdEmail size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('help_and_support')}
            onClick={() => navigate('/help')}
          />
          {csToken && (
            <>
              <MenuItem
                icon={<MdDeleteOutline size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
                text={t('account_delete')}
                onClick={() => navigate('/delete-account', { state: { details: account } })}
              />
              <MenuItem
                icon={<MdAccountCircle size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
                text={t('edit_profile')}
                onClick={() => navigate('/edit-profile', { state: { details: account } })}
              />
            </>
          )}
          <MenuItem
            icon={<AiOutlineInfoCircle size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('refer_and_earn')}
            onClick={() => navigate('/referral')}
          />
          <MenuItem
            icon={<FiGlobe size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('change_language')}
            onClick={() => navigate('/language-selector')}
          />
          <MenuItem
            icon={<AiOutlineInfoCircle size={22} color={isDarkMode ? '#fff' : '#4a4a4a'} />}
            text={t('about_cs')}
            onClick={() => navigate('/about-cs')}
          />
          <MenuItem
            icon={<MdLogout size={22} color="#FF0000" />}
            text={t('logout')}
            onClick={confirmLogout}
          />
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutModalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-red-500 mb-4">
              {t('logout_confirmation')}
            </p>
            <p className="text-base text-gray-700 dark:text-gray-300 text-center mb-6">
              {t('logout_confirmation_message')}
            </p>
            <button className="w-full bg-orange-500 text-white py-3 rounded mb-3" onClick={handleLogout}>
              {t('yes_logout')}
            </button>
            <button className="w-full bg-gray-300 text-gray-800 py-3 rounded" onClick={closeModal}>
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
