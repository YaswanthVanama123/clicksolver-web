import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { MdErrorOutline } from 'react-icons/md';
import { IoIosSearch } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * Helper function to format dates.
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Pending';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

/** 
 * A single booking item card
 */
const ServiceItemCard = ({ item, tab }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const isCancelled =
    item.complete_status === 'cancel' ||
    item.complete_status === 'usercanceled' ||
    item.complete_status === 'workercanceled';

  let buttonLabel = t('view_details') || 'View Details';
  let disabled = false;
  if (isCancelled) {
    buttonLabel = t('cancelled') || 'Cancelled';
    disabled = true;
  }

  const serviceName =
    item.service_booked && item.service_booked.length > 0
      ? item.service_booked[0]?.main_service_id
      : t('unknown_service') || 'Unknown Service';

  const imageUrl =
    item.service_booked && item.service_booked.length > 0
      ? item.service_booked[0].imageUrl
      : null;

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 mb-3 shadow`}>
      {/* Top row: image + text */}
      <div className="flex flex-row">
        <img
          className="w-14 h-14 rounded bg-gray-200 object-cover"
          src={imageUrl || 'https://via.placeholder.com/60'}
          alt="Service"
        />
        <div className="flex flex-col ml-3 flex-1">
          <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-1 truncate`}>
            {t(`singleService_${serviceName}`) || serviceName}
          </p>
          <p className="text-xs text-gray-500 mb-1">
            {formatDate(item.created_at)}
          </p>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            ₹{item.total_cost}
          </p>
        </div>
      </div>

      {/* Bottom row: button aligned to the right */}
      <div className="flex justify-end mt-2">
        <button
          className={`px-3 py-2 rounded text-sm font-medium ${
            disabled 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : 'bg-orange-500 text-white'
          }`}
          onClick={() => {
            if (!disabled) {
              if (tab === 'ongoing') {
                navigate('/ServiceBookingOngoingItem', {
                  state: { tracking_id: item.notification_id },
                });
              } else {
                navigate('/serviceBookingItem', {
                  state: { tracking_id: item.notification_id },
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

/** 
 * Renders an error view with a retry button
 */
const ErrorRetryView = ({ onRetry }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

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

/** 
 * Main Component
 */
const RecentServices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Tab states
  const [selectedTab, setSelectedTab] = useState('ongoing');
  // Data states
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Search states
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  // Token presence
  const [tokenFound, setTokenFound] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('cs_token');
      if (!token) {
        setTokenFound(false);
        setBookingsData([]);
        setLoading(false);
        return;
      }
      setTokenFound(true);

      let response;
      if (selectedTab === 'ongoing') {
        response = await axios.get(
          'https://backend.clicksolver.com/api/user/ongoingBookings',
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.get(
          'https://backend.clicksolver.com/api/user/bookings',
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setBookingsData(response.data);
    } catch (err) {
      console.error('Error fetching bookings data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedTab]);

  /** 
   * Filter data based on selected tab and search input
   */
  const getFilteredData = () => {
    let data = [];
    if (selectedTab === 'completed') {
      data = bookingsData.filter(
        (item) =>
          item.complete_status !== 'cancel' &&
          item.complete_status !== 'usercanceled' &&
          item.complete_status !== 'workercanceled'
      );
    } else if (selectedTab === 'cancelled') {
      data = bookingsData.filter(
        (item) =>
          item.complete_status === 'cancel' ||
          item.complete_status === 'usercanceled' ||
          item.complete_status === 'workercanceled'
      );
    } else {
      // 'ongoing'
      data = bookingsData;
    }

    if (searchActive && searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      data = data.filter((item) => {
        if (
          item.service_booked &&
          item.service_booked.length > 0 &&
          item.service_booked[0].serviceName
        ) {
          return item.service_booked[0].serviceName
            .toLowerCase()
            .includes(lowerSearch);
        }
        return false;
      });
    }

    // Sort descending by creation date
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return data;
  };

  const filteredData = getFilteredData();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* TOP BAR */}
      <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h1 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {t('my_services') || 'My Services'}
        </h1>
        <button
          onClick={() => {
            setSearchActive(!searchActive);
            setSearchText('');
          }}
        >
          <IoIosSearch size={24} className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
        </button>
      </div>

      {/* SEARCH BOX OR TABS */}
      {searchActive ? (
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4`}>
          <input
            type="text"
            className={`w-full p-2 rounded border border-gray-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} text-sm`}
            placeholder={t('search_services') || 'Search services...'}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      ) : (
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex justify-center items-center p-2`}>
          {['ongoing', 'completed', 'cancelled'].map((tab) => {
            const active = tab === selectedTab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`mx-1 px-4 py-2 rounded-full border text-sm font-medium ${
                  active
                    ? 'bg-orange-500 text-white border-orange-500'
                    : `${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-gray-300`
                }`}
              >
                {t(tab) || tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading...</p>
          </div>
        ) : !tokenFound ? (
          <div className="flex flex-col justify-center items-center p-4">
            <MdErrorOutline size={48} color="#888" />
            <p className="mt-2 text-gray-500">
              {t('no_data_available') || 'No data available'}
            </p>
          </div>
        ) : error ? (
          <ErrorRetryView onRetry={fetchBookings} />
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col justify-center items-center">
            <MdErrorOutline size={48} color="#888" />
            <p className="mt-2 text-gray-500">
              {t('no_results_found') || 'No results found'}
            </p>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <ServiceItemCard
              key={`${item.notification_id}_${index}`}
              item={item}
              tab={selectedTab}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecentServices;
