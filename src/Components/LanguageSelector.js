import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { changeAppLanguage } from '../i18n/languageChange';
import { useTheme } from '../context/ThemeContext';
import { IoRadioButtonOn, IoRadioButtonOff } from 'react-icons/io5';

const LanguageSelector = () => {
  // Supported languages
  const languages = [
    { label: 'English', code: 'en' },
    { label: 'हिंदी', code: 'hi' },
    { label: 'తెలుగు', code: 'te' },
  ];

  const { t } = useTranslation();
  // You can still use the context if needed to toggle dark mode externally,
  // but Tailwind’s dark mode classes work automatically when the dark class is set.
  const { isDarkMode } = useTheme(); 
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // Load saved language from localStorage
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

  // Save the chosen language and navigate home
  const onSaveSettings = async () => {
    try {
      localStorage.setItem('selectedLanguage', selectedLanguage);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Utility: get display label for the selected language
  const getSelectedLanguageLabel = () => {
    const currentLang = languages.find((l) => l.code === selectedLanguage);
    return currentLang ? currentLang.label : '';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-black dark:text-white mb-6">
        {t('Languages')}
      </h1>

      {/* Selected Language */}
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {t('Selected Language')}
      </h2>
      <div className="p-4 rounded-lg mb-6 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
        <p className="text-lg font-medium text-black dark:text-white">
          {getSelectedLanguageLabel()}
        </p>
      </div>

      {/* All Languages */}
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {t('All Languages')}
      </h2>
      <div className="space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelectLanguage(lang)}
            className="w-full flex justify-between items-center p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          >
            <span className="text-lg text-black dark:text-white">
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
