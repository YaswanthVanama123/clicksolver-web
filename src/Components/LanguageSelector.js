import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { changeAppLanguage } from '../i18n/languageChange';
import { useTheme } from '../context/ThemeContext';
// Import radio button icons from react-icons/io5
import { IoRadioButtonOn, IoRadioButtonOff } from 'react-icons/io5';

const LanguageSelector = () => {
  // Supported languages
  const languages = [
    { label: 'English', code: 'en' },
    { label: 'हिंदी', code: 'hi' },
    { label: 'తెలుగు', code: 'te' },
  ];

  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // Load saved language (using localStorage in this example)
  useEffect(() => {
    const savedLanguageCode = localStorage.getItem('selectedLanguage');
    if (savedLanguageCode) {
      setSelectedLanguage(savedLanguageCode);
      changeAppLanguage(savedLanguageCode);
    } else {
      setSelectedLanguage('en');
      changeAppLanguage('en');
    }
  }, []);

  // Update language when a language item is clicked
  const onSelectLanguage = (lang) => {
    setSelectedLanguage(lang.code);
    changeAppLanguage(lang.code);
  };

  // Save the chosen language to localStorage and navigate home
  const onSaveSettings = async () => {
    try {
      localStorage.setItem('selectedLanguage', selectedLanguage);
      // Reset navigation (here simply navigate to '/' with replace)
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Utility: get display label for the selected language code
  const getSelectedLanguageLabel = () => {
    const currentLang = languages.find((l) => l.code === selectedLanguage);
    return currentLang ? currentLang.label : '';
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6`}>
      {/* Header */}
      <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'} mb-6`}>
        {t('Languages')}
      </h1>

      {/* Selected Language */}
      <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
        {t('Selected Language')}
      </h2>
      <div
        className={`p-4 rounded-lg mb-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
      >
        <p className="text-lg font-medium">{getSelectedLanguageLabel()}</p>
      </div>

      {/* All Languages */}
      <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
        {t('All Languages')}
      </h2>
      <div className="space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelectLanguage(lang)}
            className={`w-full flex justify-between items-center p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
          >
            <span className={`text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {lang.label}
            </span>
            {selectedLanguage === lang.code ? (
              <IoRadioButtonOn size={24} color="#ff5722" />
            ) : (
              <IoRadioButtonOff size={24} color="#aaa" />
            )}
          </button>
        ))}
      </div>

      {/* Save Settings Button */}
      <button
        onClick={onSaveSettings}
        className="mt-8 w-full bg-orange-500 py-3 rounded-lg text-white font-semibold"
      >
        {t('Save Settings')}
      </button>
    </div>
  );
};

export default LanguageSelector;
