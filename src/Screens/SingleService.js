import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Lottie from 'lottie-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { FiSearch, FiMinus, FiPlus } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import { FaSpinner } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import singleCardAnim from '../assets/singlecard.json';
import cardsLoading from '../assets/cardsLoading.json';

const SingleService = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const locationRoute = useLocation();

  // Extract parameters from location.state or URL query
  let serviceName, id;
  if (locationRoute.state) {
    serviceName = locationRoute.state.serviceName;
    id = locationRoute.state.id;
  } else {
    const params = new URLSearchParams(window.location.search);
    serviceName = params.get('serviceName');
    id = params.get('id');
  }

  // State variables
  const [services, setServices] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [bookedServices, setBookedServices] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Fetch details from API
  const fetchDetails = useCallback(async () => {
    if (!serviceName) return;
    setLoading(true);
    try {
      const response = await axios.post(
        'https://backend.clicksolver.com/api/single/service',
        { serviceName }
      );
      const { relatedServices } = response.data;
      setServices(relatedServices || []);
      // Initialize quantities: start with 0 for each service
      const initialQuantities = {};
      (relatedServices || []).forEach((item) => {
        initialQuantities[item.main_service_id] = 0;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }, [serviceName]);

  // Fetch stored cart from localStorage
  const fetchStoredCart = useCallback(() => {
    if (!serviceName) return;
    try {
      const storedCart = localStorage.getItem(serviceName);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setBookedServices(parsedCart);
          const parsedQuantities = {};
          parsedCart.forEach((item) => {
            parsedQuantities[item.main_service_id] = item.quantity;
          });
          setQuantities((prev) => ({ ...prev, ...parsedQuantities }));
        }
      }
    } catch (error) {
      console.error('Error fetching stored cart:', error);
    }
  }, [serviceName]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (!loading) {
      fetchStoredCart();
    }
  }, [loading, fetchStoredCart]);

  // Recompute total and update booked services when quantities or services change
  useEffect(() => {
    let total = 0;
    services.forEach((srv) => {
      const qty = quantities[srv.main_service_id] || 0;
      const cost = parseFloat(srv.cost) || 0;
      total += cost * qty;
    });
    setTotalAmount(total);

    const newBooked = services
      .map((srv) => {
        const qty = quantities[srv.main_service_id] || 0;
        if (qty > 0) {
          return {
            serviceName: srv.service_tag,
            quantity: qty,
            cost: parseFloat(srv.cost) * qty,
            url: srv.service_details?.urls,
            description: srv.service_details?.about,
            main_service_id: srv.main_service_id,
          };
        }
        return null;
      })
      .filter(Boolean);
    setBookedServices(newBooked);

    if (newBooked.length > 0 && serviceName) {
      localStorage.setItem(serviceName, JSON.stringify(newBooked));
    }
  }, [quantities, services, serviceName]);

  // Quantity change handler
  const handleQuantityChange = (mainServiceId, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [mainServiceId]: Math.max(0, (prev[mainServiceId] || 0) + delta),
    }));
  };

  // Booking flow
  const handleBookNow = () => {
    setModalVisible(true);
  };

  const bookService = async () => {
    setBookingLoading(true);
    try {
      const cs_token = localStorage.getItem('cs_token');
      if (cs_token) {
        setModalVisible(false);
        setBookingLoading(false);
        navigate('/orderScreen', { state: { serviceName: bookedServices } });
      } else {
        setModalVisible(false);
        setBookingLoading(false);
        setLoginModalVisible(true);
      }
    } catch (error) {
      console.error('Error booking service:', error);
      setBookingLoading(false);
    }
  };

  const navigateToLogin = () => {
    setLoginModalVisible(false);
    navigate('/login');
  };

  // Navigation: Back button handler
  const handleBackPress = () => {
    navigate(-1);
  };

  // Search handler
  const handleSearch = () => {
    navigate('/search');
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 sticky top-0 z-50">
        <button onClick={handleBackPress} className="p-2">
          <IoIosArrowBack size={24} color={isDarkMode ? '#fff' : '#000'} />
        </button>
        <h1 className="text-xl font-bold text-center flex-1 mx-4" style={{ color: isDarkMode ? '#fff' : '#2d3748' }}>
          {t(`IndivService_${id}`) || serviceName}
        </h1>
        <button onClick={handleSearch} className="p-2">
          <FiSearch size={24} color={isDarkMode ? '#fff' : '#000'} />
        </button>
      </div>

      {/* Service Banner */}
      <div className="mx-4 my-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Lottie animationData={singleCardAnim} loop style={{ width: 200, height: 200 }} />
          </div>
        ) : (
          <div className="overflow-x-auto flex">
            {services.map((srv) => (
              <img
                key={srv.main_service_id}
                src={srv.service_urls[0]}
                alt="carousel"
                className="object-cover flex-shrink-0"
                style={{ width: '100%', height: '50vh' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Service Details */}
      <div className="p-4 border-b" style={{ backgroundColor: isDarkMode ? '#1a202c' : '#fff' }}>
        <h2 className="text-2xl font-bold" style={{ color: isDarkMode ? '#fff' : '#2d3748' }}>
          {t(`IndivService_${id}`) || serviceName}
        </h2>
        <p className="text-sm mt-1 opacity-80" style={{ color: isDarkMode ? '#a0aec0' : '#718096' }}>
          {t('spare_text') || 'Spare parts, if required, will incur additional charges'}
        </p>
      </div>

      {/* Services List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Lottie animationData={cardsLoading} loop style={{ width: 150, height: 150 }} />
          </div>
        ) : (
          services.map((srv) => (
            <div
              key={srv.main_service_id}
              className={`flex flex-row justify-between items-center p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold" style={{ color: isDarkMode ? '#fff' : '#2d3748' }}>
                  {t(`singleService_${srv.main_service_id}`) || srv.service_tag}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {t(`descriptionSingleService_${srv.main_service_id}`) || srv.service_details?.about}
                </p>
                <p className="text-base mt-1">₹{srv.cost}</p>
                <div
                  className="mt-2 flex items-center border rounded"
                  style={{
                    width: '8rem',
                    padding: '0.25rem 0.75rem',
                    borderColor: isDarkMode ? 'lightgray' : '#ccc',
                    color: isDarkMode ? '#fff' : '#2d2951',
                    justifyContent: 'space-between',
                  }}
                >
                  <button onClick={() => handleQuantityChange(srv.main_service_id, -1)}>
                    <FiMinus size={18} />
                  </button>
                  <span className="mx-2">
                    {quantities[srv.main_service_id] > 0
                      ? quantities[srv.main_service_id]
                      : t('add') || 'Add'}
                  </span>
                  <button onClick={() => handleQuantityChange(srv.main_service_id, 1)}>
                    <FiPlus size={18} />
                  </button>
                </div>
              </div>
              {srv.service_details?.urls && (
                <img
                  src={srv.service_details.urls}
                  alt="Service"
                  className="w-28 h-28 object-cover rounded"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Cart Bar */}
      {totalAmount > 0 && (
        <div
          className={`fixed bottom-0 left-0 right-0 flex justify-between items-center p-4 shadow`}
          style={{
            backgroundColor: isDarkMode ? '#1a202c' : '#fff',
            borderTop: isDarkMode ? '1px solid #4a5568' : '1px solid #e2e8f0',
          }}
        >
          <p className="text-lg font-bold" style={{ color: isDarkMode ? '#fff' : '#2d3748' }}>
            {t('total_amount') || 'Total:'} ₹{totalAmount}
          </p>
          <button
            onClick={handleBookNow}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            {t('view_cart') || 'View Cart'}
          </button>
        </div>
      )}

      {/* Booked Services Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-end">
          <div
            className={`w-full p-4 rounded-t-lg relative ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          >
            <button
              onClick={() => setModalVisible(false)}
              className="absolute top-2 right-2 bg-gray-300 rounded-full p-2"
            >
              <IoClose size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {t('booked_services') || 'Booked Services'}
            </h2>
            <div className="max-h-80 overflow-y-auto">
              {bookedServices.map((srv, idx) => (
                <div key={idx} className="flex items-center mb-4">
                  {srv.url ? (
                    <img
                      src={srv.url}
                      alt="Service"
                      className="w-20 h-20 object-cover rounded mr-4"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 mr-4" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold">
                      {t(`singleService_${srv.main_service_id}`) || srv.serviceName}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {t(`descriptionSingleService_${srv.main_service_id}`) || srv.description}
                    </p>
                    <div
                      className="mt-2 flex items-center rounded border px-3 py-1"
                      style={{
                        width: '8rem',
                        borderColor: isDarkMode ? 'lightgray' : '#ccc',
                        color: isDarkMode ? '#fff' : '#2d2951',
                        justifyContent: 'space-between',
                      }}
                    >
                      <button onClick={() => handleQuantityChange(srv.main_service_id, -1)}>
                        <FiMinus size={18} />
                      </button>
                      <span className="mx-2">{quantities[srv.main_service_id]}</span>
                      <button onClick={() => handleQuantityChange(srv.main_service_id, 1)}>
                        <FiPlus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-lg font-bold" style={{ color: isDarkMode ? '#fff' : '#2d3748' }}>
                {t('total_amount') || 'Total Amount:'} ₹{totalAmount}
              </p>
              {bookingLoading ? (
                <div className="flex justify-center items-center">
                  <FaSpinner className="animate-spin" size={24} />
                </div>
              ) : (
                <button
                  onClick={bookService}
                  className="bg-orange-500 text-white px-4 py-2 rounded"
                >
                  {t('view_cart') || 'View Cart'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {loginModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className={`w-5/6 md:w-1/2 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-4 rounded-lg`}>
            <h3 className="text-lg font-bold mb-2">
              {t('login_required') || 'Login Required'}
            </h3>
            <p className="text-sm mb-4">
              {t('login_required_message') ||
                'You need to log in to book services. Would you like to log in now?'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setLoginModalVisible(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={navigateToLogin}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                {t('login') || 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleService;
