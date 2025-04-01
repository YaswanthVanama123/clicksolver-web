import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoArrowBack, IoMailOutline, IoCall } from 'react-icons/io5';
import { useTheme } from '../context/ThemeContext';

const HelpScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [loadingCall, setLoadingCall] = useState(false);

  // Define the steps with translated texts.
  const steps = [
    {
      number: '1',
      title: t('choose_category') || 'Choose Category',
      description: t('browse_service_categories') || 'Browse service categories',
    },
    {
      number: '2',
      title: t('select_service') || 'Select Service',
      description: t('choose_exactly_what_you_need') || 'Choose exactly what you need',
    },
    {
      number: '3',
      title: t('confirm_location') || 'Confirm Location',
      description: t('share_service_location') || 'Share your service location',
    },
    {
      number: '4',
      title: t('worker_assigned') || 'Worker Assigned',
      description: t('worker_assigned_desc') || 'A nearby worker will accept',
    },
    {
      number: '5',
      title: t('worker_arrives') || 'Worker Arrives',
      description: t('track_worker_arrival') || 'Track the worker’s arrival',
    },
    {
      number: '6',
      title: t('verify_and_begin') || 'Verify & Begin',
      description: t('start_service_verification') || 'Start service after verification',
    },
  ];

  // Handle email action.
  const handleEmailPress = () => {
    window.open('mailto:customer.support@clicksolver.com', '_self') ||
      alert(t('unable_to_open_mail_app') || 'Unable to open mail app');
  };

  // Handle call action.
  const handleCallPress = async () => {
    setLoadingCall(true);
    try {
      const phoneNumber = "7981793632";
      if (phoneNumber) {
        window.open(`tel:${phoneNumber}`, '_self') ||
          alert(t('unable_to_open_dialer') || 'Unable to open dialer');
      } else {
        alert(t('no_phone_number_received') || 'No phone number received');
      }
    } catch {
      alert(t('failed_to_retrieve_phone_number') || 'Failed to retrieve phone number');
    } finally {
      setLoadingCall(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow`}>
        <button onClick={() => navigate(-1)} className="focus:outline-none">
          <IoArrowBack size={24} className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('help_support') || 'Help & Support'}
        </h2>
        <button onClick={handleEmailPress} className="focus:outline-none">
          <IoMailOutline size={24} className="text-orange-500" />
        </button>
      </div>

      {/* Steps Section */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className={`text-center mb-6 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('follow_steps') || 'Follow these simple steps to get started'}
        </p>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-full p-4 mb-4 shadow`}
          >
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center mr-4">
              <span className="text-white font-semibold text-lg">{step.number}</span>
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{step.description}</p>
            </div>
          </div>
        ))}

        {/* Call-To-Action Button */}
        <button 
          onClick={() => navigate('/', { replace: true })}
          className="w-full rounded-full mt-8 focus:outline-none"
        >
          <div className="py-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
            <span className="text-white font-semibold text-center block">
              {t('book_service_now') || 'Book a Service Now'}
            </span>
          </div>
        </button>
      </div>

      {/* Floating Call Button */}
      <button 
        onClick={handleCallPress} 
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-lg focus:outline-none"
      >
        {loadingCall ? (
          <span className="text-white">Loading...</span>
        ) : (
          <IoCall size={24} className="text-white" />
        )}
      </button>
    </div>
  );
};

export default HelpScreen;
