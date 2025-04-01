import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { IoMdTime } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { MdSearchOff } from 'react-icons/md';
import Lottie from 'lottie-react';
import searchLoadingAnimation from '../assets/searchLoading.json';
import { useTheme } from '../context/ThemeContext';

const SearchItem = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { isDarkMode } = useTheme();

  // Initial placeholder and texts for animation
  const initialPlaceholder = t('searchFor') + ' ';
  const additionalTexts = [
    t('electrician'),
    t('plumber'),
    t('cleaningServices'),
    t('painter'),
    t('mechanic'),
  ];
  const trendingSearches = [
    t('trendingProfessionalCleaning'),
    t('trendingElectricians'),
    t('trendingPlumbers'),
    t('trendingSalon'),
    t('trendingCarpenters'),
    t('trendingWashingMachineRepair'),
    t('trendingRefrigeratorRepair'),
    t('trendingRORepair'),
    t('trendingFurnitureAssembly'),
    t('trendingMicrowaveRepair'),
  ];

  const [placeholderText, setPlaceholderText] = useState(initialPlaceholder);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Animate placeholder text letter by letter
  const updatePlaceholder = useCallback(() => {
    const word = additionalTexts[currentIndex];
    if (currentWordIndex < word.length) {
      setPlaceholderText((prev) => prev + word[currentWordIndex]);
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      setPlaceholderText(initialPlaceholder);
      setCurrentIndex((prev) => (prev + 1) % additionalTexts.length);
      setCurrentWordIndex(0);
    }
  }, [currentIndex, currentWordIndex, additionalTexts, initialPlaceholder]);

  useEffect(() => {
    const interval = setInterval(updatePlaceholder, 200);
    return () => clearInterval(interval);
  }, [updatePlaceholder]);

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentServices');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  const handleInputChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://backend.clicksolver.com/api/services?search=${query}`
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  };

  const storeRecentService = useCallback(async (service) => {
    try {
      const existingJson = localStorage.getItem('recentServices');
      let updatedServices = [];
      if (existingJson) {
        const existingServices = JSON.parse(existingJson);
        updatedServices = existingServices.filter(
          (existingService) =>
            existingService.main_service_id !== service.main_service_id
        );
        updatedServices.unshift(service);
      } else {
        updatedServices = [service];
      }
      updatedServices = updatedServices.slice(0, 5);
      localStorage.setItem('recentServices', JSON.stringify(updatedServices));
      setRecentSearches(updatedServices);
    } catch (error) {
      console.error('Error storing recent service:', error);
    }
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
  }, []);

  const handleServiceClick = useCallback(
    (item) => {
      storeRecentService(item);
      navigate('/serviceBooking', {
        state: { serviceName: item.service_category, id: item.main_service_id },
      });
    },
    [navigate, storeRecentService]
  );

  const renderSuggestionItem = (item, index) => (
    <div
      key={index}
      className={`flex items-center gap-4 p-3 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} cursor-pointer`}
      onClick={() => handleServiceClick(item)}
    >
      <img
        src={item.service_details?.urls || 'https://via.placeholder.com/150'}
        alt={item.service_tag}
        className="w-20 h-16 rounded-sm object-cover"
      />
      <div className="flex-1">
        <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-[#1D2951]'}`}>
          {t(`singleService_${item.main_service_id}`) || item.service_tag}
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
          {t(`descriptionSingleService_${item.main_service_id}`) || item.service_details?.about}
        </p>
      </div>
    </div>
  );

  const renderRecentSearchItem = (item, index) => (
    <div
      key={`${item.main_service_id}-${index}`}
      className="flex flex-row gap-5 py-2 items-center cursor-pointer"
      onClick={() =>
        navigate('/serviceBooking', {
          state: { serviceName: item.service_category, id: item.main_service_id },
        })
      }
    >
      <div className={`p-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded`}>
        <IoMdTime size={30} color="#d7d7d7" />
      </div>
      <p className={`text-base md:text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {t(`singleService_${item.main_service_id}`) || item.service_tag}
      </p>
    </div>
  );

  const renderTrendingSearches = () =>
    trendingSearches.map((item, index) => (
      <div
        key={index}
        className={`p-2 md:p-3 rounded-full mr-2 mb-2 cursor-pointer border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
      >
        <p className={`text-base md:text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>{item}</p>
      </div>
    ));

  // Auto focus the search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleHome = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col`}>
      {/* Search Bar */}
      <div className={`flex flex-row items-center border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'} m-4 p-2`}>
        <button onClick={handleHome} className="pl-2">
          <AiOutlineArrowLeft size={20} className={`${isDarkMode ? 'text-white' : 'text-black'}`} />
        </button>
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 h-10 md:h-12 pl-2 text-sm md:text-base font-semibold bg-transparent outline-none"
            style={{ color: isDarkMode ? 'white' : '#1D2951' }}
            placeholder={placeholderText}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 100)}
          />
          {searchQuery.length > 0 && (
            <button onClick={handleClear} className="absolute right-2">
              <RxCross2 size={20} className={`${isDarkMode ? 'text-white' : 'text-black'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Suggestions Area */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery.length > 0 && suggestions.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded mt-1`}>
            {suggestions.map((item, index) => renderSuggestionItem(item, index))}
          </div>
        )}
        {searchQuery.length > 0 && suggestions.length === 0 && !loading && (
          <div className="flex flex-col items-center mt-8 px-4">
            <MdSearchOff size={45} className={`${isDarkMode ? 'text-white' : 'text-black'}`} />
            <p className={`text-xl md:text-2xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-500'}`}>
              {t('noResultsFound')}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center my-4 px-2`}>
              {t('noResultsDescription')}
            </p>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-full h-2 my-2`}></div>
            <div className="p-4">
              <p className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-black'} mb-2`}>
                {t('trendingSearches')}
              </p>
              <div className="flex flex-wrap">{renderTrendingSearches()}</div>
            </div>
          </div>
        )}
        {searchQuery.length === 0 && suggestions.length === 0 && (
          <div className="p-4">
            <div className="mb-4 p-4">
              <p className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-black'} mb-2`}>
                {t('recents')}
              </p>
              {recentSearches.map((item, index) => renderRecentSearchItem(item, index))}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-full h-2 my-2`}></div>
            <div className="p-4">
              <p className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-black'} mb-2`}>
                {t('trendingSearches')}
              </p>
              <div className="flex flex-wrap">{renderTrendingSearches()}</div>
            </div>
          </div>
        )}
        {loading && (
          <div className="w-full h-24">
            <Lottie animationData={searchLoadingAnimation} loop={true} className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchItem;
