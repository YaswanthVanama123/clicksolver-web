import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { MdErrorOutline, MdArrowBack, MdFilterList, MdCheckCircle, MdLocalShipping, MdCheckBox, MdCheckBoxOutlineBlank, MdSearchOff } from 'react-icons/md';
import { IoIosSearch } from 'react-icons/io';
import { FaHammer } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import searchLoading from '../assets/searchLoading.json';
import { useTheme } from '../context/ThemeContext';
import i18n from '../i18n/i18n';

// Helper function to format dates.
const formatDate = (dateString) => {
  if (!dateString) return i18n.t('pending') || 'Pending';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

// Card component for a single service item.
const ServiceItemCard = ({ item, tab }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isCancelled =
    item.complete_status === 'cancel' ||
    item.complete_status === 'usercanceled' ||
    item.complete_status === 'workercanceled';

  const buttonLabel = isCancelled
    ? t('cancelled') || 'Cancelled'
    : t('view_details') || 'View Details';
  const disabled = isCancelled;

  const serviceName =
    item.service_booked && item.service_booked.length > 0
      ? item.service_booked[0]?.serviceName
      : t('unknown_service') || 'Unknown Service';

  const imageUrl =
    item.service_booked && item.service_booked.length > 0
      ? item.service_booked[0].imageUrl
      : null;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow">
      {/* Top Row: Image and Text */}
      <div className="flex flex-row items-center">
        <img
          className="w-16 h-16 rounded-lg bg-gray-200 mr-4 object-cover"
          src={imageUrl || 'https://via.placeholder.com/60'}
          alt="Service"
        />
        <div className="flex flex-col flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
            {t(`singleService_${serviceName}`) || serviceName}
          </p>
          <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
            ₹{item.total_cost}
          </p>
        </div>
      </div>
      {/* Bottom Row: Button aligned right */}
      <div className="flex justify-end mt-2">
        <button
          className={`px-3 py-2 rounded text-sm font-medium ${
            disabled
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-orange-500 text-white'
          }`}
          onClick={() => {
            if (!disabled) {
              if (tab === (t('ongoing') || 'Ongoing')) {
                navigate('/ServiceTrackingItem', {
                  state: { tracking_id: item.tracking_id },
                });
              } else {
                navigate('/ServiceTrackingItem', {
                  state: { tracking_id: item.tracking_id },
                });
              }
            }
          }}
          disabled={disabled}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

const ErrorRetryView = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <MdErrorOutline size={48} className="text-red-500" />
      <p className="text-center text-red-500 my-2">
        {t('something_went_wrong') || 'Something went wrong. Please try again.'}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 border border-orange-500 rounded text-orange-500"
      >
        {t('retry') || 'Retry'}
      </button>
    </div>
  );
};

const ServiceTrackingListScreen = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const width = window.innerWidth;
  const isTablet = width >= 600;

  // Raw filter options and their translations.
  const rawFilterOptions = ['Collected Item', 'Work started', 'Work Completed'];
  const statusTranslationMapping = {
    'Collected Item': t('collected_item') || 'Collected Item',
    'Work started': t('work_started') || 'Work Started',
    'Work Completed': t('work_completed') || 'Work Completed',
  };

  const [serviceData, setServiceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tokenFound, setTokenFound] = useState(true);

  // Fetch tracking services data from the backend.
  const fetchBookings = async () => {
    setLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('cs_token');
      if (!token) {
        setTokenFound(false);
        setServiceData([]);
        setFilteredData([]);
        setLoading(false);
        return;
      }
      setTokenFound(true);
      const response = await axios.get(
        'https://backend.clicksolver.com/api/user/tracking/services',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServiceData(response.data);
      setFilteredData(response.data);
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Update filtered data when selected filters change.
  useEffect(() => {
    const filtered =
      selectedFilters.length > 0
        ? serviceData.filter((item) => selectedFilters.includes(item.service_status))
        : serviceData;
    setFilteredData(filtered);
  }, [selectedFilters, serviceData]);

  const toggleFilter = (statusKey) => {
    setSelectedFilters((prev) =>
      prev.includes(statusKey) ? prev.filter((s) => s !== statusKey) : [...prev, statusKey]
    );
  };

  const handleOutsidePress = () => {
    if (isFilterVisible) setIsFilterVisible(false);
  };

  const handleCardPress = (trackingId) => {
    navigate('/ServiceTrackingItem', { state: { tracking_id: trackingId } });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative" onClick={handleOutsidePress}>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 shadow z-10">
        <button onClick={() => navigate(-1)}>
          <MdArrowBack size={24} className={`${isDarkMode ? 'text-white' : 'text-black'}`} />
        </button>
        <h1 className="text-lg md:text-xl font-medium text-gray-800 dark:text-white">
          {t('service_tracking') || 'Service Tracking'}
        </h1>
        <button onClick={() => setIsFilterVisible(!isFilterVisible)}>
          <MdFilterList size={24} className={`${isDarkMode ? 'text-white' : 'text-black'}`} />
        </button>
      </div>

      {/* Filter Dropdown */}
      {isFilterVisible && (
        <div className="absolute right-4 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg z-20">
          <p className="text-sm font-semibold text-gray-600 mb-2">
            {t('project_type') || 'PROJECT TYPE'}
          </p>
          {rawFilterOptions.map((option, index) => (
            <button
              key={index}
              className="flex items-center w-full py-1"
              onClick={() => toggleFilter(option)}
            >
              {selectedFilters.includes(option) ? (
                <MdCheckBox size={20} className="text-gray-700" />
              ) : (
                <MdCheckBoxOutlineBlank size={20} className="text-gray-700" />
              )}
              <span className="ml-2 text-sm text-gray-700">
                {statusTranslationMapping[option]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Lottie animationData={searchLoading} loop style={{ width: 200, height: 200 }} />
          </div>
        ) : !tokenFound || filteredData.length === 0 ? (
          <div className="flex flex-col justify-center items-center mt-8">
            <MdSearchOff size={48} className="text-gray-500" />
            <p className="mt-2 text-gray-500">
              {tokenFound
                ? t('no_results_found') || 'No results found'
                : t('no_trackings_available') || 'No trackings available'}
            </p>
          </div>
        ) : error ? (
          <ErrorRetryView onRetry={fetchBookings} />
        ) : (
          filteredData.map((item, index) => (
            <div
              key={`${item.notification_id}_${index}`}
              className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow cursor-pointer"
              onClick={() => handleCardPress(item.tracking_id)}
            >
              <div className="flex flex-row items-center flex-1">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex justify-center items-center mr-3">
                  {item.service_status === 'Work Completed' ? (
                    <MdCheckCircle size={24} className="text-white" />
                  ) : item.service_status === 'Work started' ? (
                    <FaHammer size={24} className="text-white" />
                  ) : (
                    <MdLocalShipping size={24} className="text-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {item.service_status === 'Work Completed'
                      ? t('work_completed') || 'Completed'
                      : item.service_status === 'Work started'
                      ? t('in_progress') || 'In Progress'
                      : item.service_status === 'Collected Item'
                      ? t('collected_item') || 'Item Collected'
                      : t('on_the_way') || 'On the Way'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                  <p className="text-xs text-gray-500">{item.tracking_key}</p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded text-xs font-medium ${
                  item.service_status === 'Work Completed'
                    ? 'bg-green-200'
                    : item.service_status === 'Work started'
                    ? 'bg-yellow-200'
                    : 'bg-blue-200'
                }`}
              >
                <span className="text-gray-800">
                  {item.service_status === 'Work Completed'
                    ? t('work_completed') || 'Completed'
                    : item.service_status === 'Work started'
                    ? t('in_progress') || 'In Progress'
                    : item.service_status === 'Collected Item'
                    ? t('collected_item') || 'Item Collected'
                    : t('on_the_way') || 'On the Way'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceTrackingListScreen;
