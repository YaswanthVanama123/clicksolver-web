import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const QuickSearch = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Build initial placeholder and additional texts from translations.
  const initialPlaceholder = t('searchFor') + ' ';
  const additionalTexts = [
    t('electrician'),
    t('plumber'),
    t('cleaningServices'),
    t('painter'),
    t('mechanic'),
  ];

  const [placeholderText, setPlaceholderText] = useState(initialPlaceholder);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Update placeholder text letter by letter.
  const updatePlaceholder = useCallback(() => {
    const word = additionalTexts[currentIndex];
    if (currentWordIndex < word.length) {
      setPlaceholderText(prev => prev + word[currentWordIndex]);
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setPlaceholderText(initialPlaceholder);
      setCurrentIndex(prev => (prev + 1) % additionalTexts.length);
      setCurrentWordIndex(0);
    }
  }, [currentIndex, currentWordIndex, additionalTexts, initialPlaceholder]);

  useEffect(() => {
    const interval = setInterval(updatePlaceholder, 200);
    return () => clearInterval(interval);
  }, [updatePlaceholder]);

  const handleInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Navigate to a dedicated search page.
    navigate('/search');
  }, [navigate]);

  return (
    <div className={`w-full p-2 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} sticky top-0 z-50`}>
      <input
        type="text"
        className={`w-full h-10 border rounded px-2 focus:outline-none ${
          isDarkMode
            ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-400'
            : 'bg-white text-gray-800 border-gray-300 placeholder-gray-500'
        }`}
        placeholder={placeholderText}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setIsFocused(false), 100)}
      />
    </div>
  );
};

export default QuickSearch;
