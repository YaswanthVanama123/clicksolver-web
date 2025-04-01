import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
// Icons from react-icons
import { FaArrowLeftLong, FaAngleRight } from 'react-icons/fa6';
import { MdCircle, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { IoMdCall } from 'react-icons/io';

const ServiceTrackingItemScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Read tracking_id from location.state (ensure you pass it when navigating)
  const tracking_id = location.state?.tracking_id;
  console.log('Received tracking_id:', tracking_id);

  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  // Track window dimensions
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { width } = dimensions;
  console.log('Window width:', width);

  const [details, setDetails] = useState({});
  const [serviceArray, setServiceArray] = useState([]);
  const [pin, setPin] = useState('4567');
  const [paymentExpanded, setPaymentExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // For rotating the chevron icon when toggling payment details
  const rotateStyle = {
    transform: `rotate(${paymentExpanded ? 180 : 0}deg)`,
    transition: 'transform 0.3s',
  };

  const togglePaymentDetails = () => {
    console.log('Toggling payment details. Current state:', paymentExpanded);
    setPaymentExpanded(!paymentExpanded);
  };

  // Function to initiate a phone call
  const phoneCall = async () => {
    try {
      console.log('Initiating phone call for tracking_id:', tracking_id);
      const response = await axios.post(
        'https://backend.clicksolver.com/api/worker/tracking/call',
        { tracking_id }
      );
      console.log('Phone call response:', response.data);
      if (response.status === 200 && response.data.mobile) {
        const phoneNumber = response.data.mobile;
        console.log('Initiating dial with number:', phoneNumber);
        window.open(`tel:${phoneNumber}`, '_self');
      } else {
        console.log('Failed to initiate call:', response.data);
      }
    } catch (error) {
      console.error(
        'Error initiating call:',
        error.response ? error.response.data : error.message
      );
    }
  };

  // Define timeline steps with keys and fallback labels.
  const timelineSteps = [
    { key: 'collected_item', fallback: 'Collected Item' },
    { key: 'work_started', fallback: 'Work Started' },
    { key: 'work_completed', fallback: 'Work Completed' },
    { key: 'delivered', fallback: 'Delivered' },
  ];

  // Build timeline data using translation for status titles.
  const timelineData = useMemo(() => {
    const currentStatusKey =
      details.service_status &&
      details.service_status.toLowerCase().replace(/\s+/g, '_');
    console.log('Converted service_status:', currentStatusKey);
    const currentStatusIndex = timelineSteps.findIndex(
      (step) => step.key === currentStatusKey
    );
    console.log('Current status index:', currentStatusIndex);
    return timelineSteps.map((step, index) => {
      const stepTitle = t(step.key) || step.fallback;
      console.log(`Timeline step ${index}:`, { stepTitle });
      const isActive =
        currentStatusIndex !== -1 && index <= currentStatusIndex;
      return {
        title: stepTitle,
        iconColor: isActive ? '#ff4500' : '#a1a1a1',
        lineColor: isActive ? '#ff4500' : '#a1a1a1',
      };
    });
  }, [details.service_status, t]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        console.log('Fetching booking details for tracking_id:', tracking_id);
        const response = await axios.post(
          'https://backend.clicksolver.com/api/service/tracking/user/item/details',
          { tracking_id }
        );
        const { data } = response.data;
        console.log('Fetched data:', data);
        setPin(data.tracking_pin);
        setDetails(data);
        setServiceArray(data.service_booked);
      } catch (error) {
        console.error('Error fetching bookings data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (tracking_id) {
      fetchBookings();
    }
  }, [tracking_id]);

  // Open PhonePe Scanner (simulate with window.open)
  const openPhonePeScanner = () => {
    const url = 'phonepe://scan';
    window
      .open(url, '_self')
      ?.catch(() =>
        window.open(
          'https://play.google.com/store/apps/details?id=com.phonepe.app',
          '_blank'
        )
      );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="text-xl text-orange-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`flex items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} shadow`}>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="p-2 focus:outline-none"
        >
          <FaArrowLeftLong size={20} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold">
          {t('service_trackings') || 'Service Trackings'}
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 overflow-y-auto">
        {/* User Profile */}
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-400 rounded-full mr-4">
            <img
              src={details.profile}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium">{details.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">{details.service}</p>
          </div>
          <button className="p-2 focus:outline-none" onClick={phoneCall}>
            <IoMdCall size={22} color="#FF5722" />
          </button>
        </div>

        {/* PIN */}
        <div className="flex items-end gap-2 pb-2 pl-4">
          <p className="text-lg font-medium">{t('pin') || 'PIN'}</p>
          <div className="flex space-x-1">
            {pin.split('').map((digit, index) => (
              <div key={index} className="w-6 h-6 border border-gray-500 rounded flex items-center justify-center">
                <p className="text-base font-medium">{digit}</p>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-t-2 border-gray-200 dark:border-gray-700 mb-4" />

        {/* Service Details */}
        <div className="mb-4 px-2">
          <h2 className="text-lg font-semibold mb-2">{t('service_details') || 'Service Details'}</h2>
          <div className="pl-4">
            {serviceArray.map((service, index) => (
              <p key={index} className="text-base mb-1">
                {t(`singleService_${service.main_service_id}`) || service.serviceName}
              </p>
            ))}
          </div>
        </div>

        <hr className="border-t-2 border-gray-200 dark:border-gray-700 mb-4" />

        {/* Additional Info Section */}
        <div className="mb-4 px-2">
          <h2 className="text-lg font-semibold mb-2">{t('additional_info') || 'Additional Info'}</h2>
          <div className="flex flex-col items-center">
            {details.data?.estimatedDuration && (
              <p className="text-base mb-2">
                {t('estimated_time') || 'Estimated Time:'} {details.data.estimatedDuration}
              </p>
            )}
            {details.data?.image && (
              <img
                src={details.data.image}
                alt="Additional"
                className="w-40 h-40 object-cover rounded"
              />
            )}
          </div>
        </div>

        <hr className="border-t-2 border-gray-200 dark:border-gray-700 mb-4" />

        {/* Service Timeline */}
        <div className="mb-4 px-2">
          <h2 className="text-lg font-semibold mb-2">{t('service_timeline') || 'Service Timeline'}</h2>
          <div className="pl-4">
            {timelineData.map((item, index) => (
              <div key={index} className="flex items-start mb-3">
                <div className="flex flex-col items-center">
                  <MdCircle size={14} style={{ color: item.iconColor }} />
                  {index !== timelineData.length - 1 && (
                    <div
                      className="w-[2px]"
                      style={{ height: '50px', backgroundColor: timelineData[index + 1].iconColor }}
                    ></div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium">{item.title}</p>
                  {/* <p className="text-xs text-gray-500">{item.time}</p> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-t-2 border-gray-200 dark:border-gray-700 mb-4" />

        {/* Address */}
        <div className="mb-4 px-2">
          <h2 className="text-lg font-semibold mb-2">{t('address') || 'Address'}</h2>
          <div className="flex items-center">
            <img
              src="https://i.postimg.cc/rpb2czKR/1000051859-removebg-preview.png"
              alt="Location Pin"
              className="w-6 h-6 mr-3"
            />
            <p className="text-base">{details.area}</p>
          </div>
        </div>

        <hr className="border-t-2 border-gray-200 dark:border-gray-700 mb-4" />

        {/* Payment Details Toggle */}
        <div className="mb-4">
          <button
            className={`w-full flex items-center justify-between px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded`}
            onClick={togglePaymentDetails}
          >
            <span className="text-base font-semibold">
              {t('payment_details') || 'Payment Details'}
            </span>
            <div style={rotateStyle}>
              <FaAngleRight size={20} color="#ff4500" />
            </div>
          </button>
        </div>

        {paymentExpanded && (
          <div className="px-4">
            <div className="space-y-2">
              {serviceArray.map((service, index) => (
                <div key={index} className="flex justify-between">
                  <p className="text-sm">
                    {t(`singleService_${service.main_service_id}`) || service.serviceName}
                  </p>
                  <p className="text-sm font-semibold">₹{service.cost.toFixed(2)}</p>
                </div>
              ))}
              {details.discount > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm">{t('discount') || 'Discount'}</p>
                  <p className="text-sm font-semibold">₹{details.discount}</p>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-sm font-semibold">{t('grand_total') || 'Grand Total'}</p>
                <p className="text-sm font-semibold">₹{details.total_cost}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button 
          onClick={openPhonePeScanner} 
          className="w-full py-3 rounded bg-orange-500 hover:bg-orange-600 mt-4"
        >
          <span className="text-white text-base font-semibold">{t('pay') || 'PAY'}</span>
        </button>
      </div>
    </div>
  );
};

export default ServiceTrackingItemScreen;
