import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import QuickSearch from '../Components/QuickSearch';
import Lottie from 'lottie-react';
import cardsLoading from '../assets/cardsLoading.json';
import { FiSunset, FiSearch } from 'react-icons/fi';
import { MdNightsStay } from 'react-icons/md';
import { IoIosArrowBack } from 'react-icons/io';
import { FaBell, FaQuestionCircle, FaStar, FaRegStar } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

const PaintingServices = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const locationRoute = useLocation();
  const [subservice, setSubServices] = useState([]);
  const [name, setName] = useState('');
  const [sid, setId] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);
  const width = window.innerWidth;
  const isTablet = width >= 600;

  // On mount, extract route parameters from location.state (if available) or fallback to URL query.
  useEffect(() => {
    let serviceObject, id;
    if (locationRoute.state) {
      serviceObject = locationRoute.state.serviceObject;
      id = locationRoute.state.id;
    } else {
      const params = new URLSearchParams(window.location.search);
      serviceObject = params.get('serviceObject');
      id = params.get('id');
    }
    if (serviceObject) {
      setName(serviceObject);
      setId(id);
      fetchServices(serviceObject);
    }
  }, [locationRoute.state]);

  // Fetch subservices from the backend
  const fetchServices = useCallback(async (serviceObject) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://backend.clicksolver.com/api/individual/service',
        { serviceObject }
      );
      setSubServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle back button: navigate back (or to home)
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Dummy search handler: navigate to search page
  const handleSearch = useCallback(() => {
    navigate('/search');
  }, [navigate]);

  // Handle booking: navigate to serviceBooking screen with state
  const handleBookCommander = useCallback(
    (serviceId, id) => {
      navigate('/serviceBooking', { state: { serviceName: serviceId, id } });
    },
    [navigate]
  );

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} min-h-screen`}>
      {/* Header with back arrow, title, and search icon */}
      <div className="flex items-center justify-between p-4 sticky top-0 z-50" style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc' }}>
        <button onClick={handleBack} className="p-2">
          <IoIosArrowBack size={24} color={isDarkMode ? '#fff' : '#000'} />
        </button>
        <h1 className="text-xl font-bold text-center flex-1 mx-4" style={{ color: isDarkMode ? '#fff' : '#2d3748' }}>
          {t(`service_${sid}`) || name}
        </h1>
        <button onClick={handleSearch} className="p-2">
          <FiSearch size={24} color={isDarkMode ? '#fff' : '#000'} />
        </button>
      </div>

      {/* Banner */}
      <div className={`flex items-center rounded-lg mx-4 my-4 ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
        <div className="flex-1 p-4">
          <div className="mb-2">
            <p className="text-2xl font-bold" style={{ color: '#ed8936' }}>
              {t('just_49') || 'Just 49/-'}
            </p>
            <p className="text-base mt-1 font-semibold" style={{ color: isDarkMode ? '#e2e8f0' : '#4a5568' }}>
              {t(`service_${sid}`) || name}
            </p>
            <p className="text-sm mt-1 opacity-80" style={{ color: isDarkMode ? '#a0aec0' : '#718096' }}>
              {t('just_pay') || 'Just pay to book a Commander Inspection!'}
            </p>
          </div>
        </div>
        <img
          src="https://i.postimg.cc/nLSx6CFs/ec25d95ccdd81fad0f55cc8d83a8222e.png"
          alt="Banner"
          className={`object-cover rounded-lg ${isTablet ? 'w-32 h-32' : 'w-24 h-24'}`}
        />
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Lottie animationData={cardsLoading} loop style={{ width: 150, height: 150 }} />
        </div>
      )}

      {/* Services List */}
      <div className="mx-4">
        {subservice.map((service) => (
          <ServiceItem
            key={service.service_id}
            title={service.service_name}
            imageUrl={service.service_urls}
            handleBookCommander={handleBookCommander}
            serviceId={service.service_name}
            isDarkMode={isDarkMode}
            t={t}
            id={service.service_id}
          />
        ))}
      </div>
    </div>
  );
};

const ServiceItem = React.memo(
  ({ title, imageUrl, handleBookCommander, serviceId, isDarkMode, t, id }) => {
    const width = window.innerWidth;
    const isTablet = width >= 600;
    return (
      <div className={`flex flex-row items-center gap-4 p-4 rounded-lg shadow mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div>
          <img
            src={imageUrl || 'https://via.placeholder.com/100x100'}
            alt={title}
            className={`rounded-lg ${isTablet ? 'w-48 h-32' : 'w-40 h-28'} object-cover`}
          />
        </div>
        <div className="flex-1 pl-4">
          <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {t(`IndivService_${id}`) || title}
          </p>
          <button
            onClick={() => handleBookCommander(serviceId, id)}
            className="mt-2 px-4 py-1 bg-orange-500 text-white rounded-lg shadow"
          >
            {t('book_now') || 'Book Now ➔'}
          </button>
        </div>
      </div>
    );
  }
);

export default PaintingServices;
