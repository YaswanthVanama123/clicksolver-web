import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Function to detect system dark mode using window.matchMedia.
  const getSystemIsDark = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const systemIsDark = getSystemIsDark();
  const [themeMode, setThemeMode] = useState('system');
  const [isDarkMode, setIsDarkMode] = useState(systemIsDark);

  // When in system mode, listen for changes to the prefers-color-scheme media query.
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setIsDarkMode(e.matches);
      };
      // For modern browsers
      mediaQuery.addEventListener('change', handleChange);
      // Cleanup listener on unmount
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [themeMode]);

  // Toggle theme manually.
  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode('manual');
      setIsDarkMode(prev => !prev);
    } else {
      setIsDarkMode(prev => !prev);
    }
  };

  // Revert to following system setting.
  const useSystemTheme = () => {
    setThemeMode('system');
    setIsDarkMode(getSystemIsDark());
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, useSystemTheme, themeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to consume theme context.
export const useTheme = () => useContext(ThemeContext);
