import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { MdLocationOn } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const PLACES_API_KEY = 'iN1RT7PQ41Z0DVxin6jlf7xZbmbIZPtb9CyNwtlT';

const LocationSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationRoute = useLocation();
  const { serviceName, savings, tipAmount, offer } = locationRoute.state || {};

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [serviceArray, setServiceArray] = useState([]);

  const { isDarkMode } = useTheme();
  const inputRef = useRef(null);

  // Focus the input on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Store serviceName if available.
  useEffect(() => {
    if (serviceName) {
      setServiceArray(serviceName);
    }
  }, [serviceName]);

  // Fetch suggestions from the Ola Maps autocomplete API.
  const fetchSuggestions = useCallback(async () => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setNoResults(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${PLACES_API_KEY}`;
      const response = await axios.get(url, {
        headers: { 'X-Request-Id': `req-${Date.now()}` },
      });
      if (response.data && response.data.predictions && response.data.predictions.length > 0) {
        const places = response.data.predictions.map((place) => ({
          id: place.place_id,
          title: place.structured_formatting.main_text,
          address: place.structured_formatting.secondary_text,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        }));
        setSuggestions(places);
        setNoResults(false);
      } else {
        setSuggestions([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
      setNoResults(true);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [query]);

  // Debounce the fetch for 300ms.
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [query, fetchSuggestions]);

  // Navigate back to user location screen.
  const goBackToUserLocation = useCallback(
    (extraParams = {}) => {
      navigate('/user-location', {
        state: {
          serviceName,
          savings,
          tipAmount,
          offer: offer || null,
          ...extraParams,
        },
      });
    },
    [navigate, serviceName, savings, tipAmount, offer]
  );

  // When a suggestion is pressed, update the query and navigate back.
  const handleSuggestionPress = useCallback(
    (item) => {
      setQuery(item.title);
      goBackToUserLocation({ suggestion: item });
      setSuggestions([]);
    },
    [goBackToUserLocation]
  );

  // Render a suggestion item.
  const renderItem = useCallback(
    ({ item }) => (
      <div
        className={`flex items-center p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer hover:${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}
        onClick={() => handleSuggestionPress(item)}
      >
        <div className="mr-3">
          <MdLocationOn size={24} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
        <div className="flex-1">
          <p className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.title}</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{item.address}</p>
        </div>
        <div>
          <AiOutlineClose size={18} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`} />
        </div>
      </div>
    ),
    [handleSuggestionPress, isDarkMode]
  );

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} min-h-screen`}>
      {/* Search Bar */}
      <div className={`flex items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button onClick={goBackToUserLocation} className="mr-4">
          <FaArrowLeft size={18} className={`${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
        </button>
        <input
          ref={inputRef}
          type="text"
          className={`flex-1 p-2 border rounded-md outline-none bg-transparent ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          placeholder={t('search_placeholder') || 'Search for a location...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query.length > 0 && (
          <button onClick={() => setQuery('')} className="ml-2">
            <AiOutlineClose size={18} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`} />
          </button>
        )}
      </div>

      {/* Suggestions List or Loading/No Results */}
      {loadingSuggestions ? (
        <div className="flex justify-center items-center mt-6">
          <p>{t('loading') || 'Loading...'}</p>
        </div>
      ) : noResults ? (
        <div className="flex justify-center items-center mt-6">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('no_locations_found') || 'No locations found'}
          </p>
        </div>
      ) : (
        <div className="mt-2">
          <ul className={`${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
            {suggestions.map((item) => (
              <li key={item.id}>{renderItem({ item })}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
