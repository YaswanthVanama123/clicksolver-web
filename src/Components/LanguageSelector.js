import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '../i18n/languageChange';
import { LANGUAGE_KEY } from '../i18n/i18n';
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
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // Load saved language from localStorage using LANGUAGE_KEY
  useEffect(() => {
    const savedLanguageCode = localStorage.getItem(LANGUAGE_KEY);
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
      localStorage.setItem(LANGUAGE_KEY, selectedLanguage);
      console.log("changed to key", LANGUAGE_KEY);
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
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {t('Languages')}
      </h1>

      {/* Selected Language */}
      <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {t('Selected Language')}
      </h2>
      <div className={`p-4 rounded-lg mb-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
        <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {getSelectedLanguageLabel()}
        </p>
      </div>

      {/* All Languages */}
      <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
