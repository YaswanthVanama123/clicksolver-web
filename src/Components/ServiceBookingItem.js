import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
// Import icons from react-icons
import { FaArrowLeftLong } from 'react-icons/fa6';
import { MdCircle } from 'react-icons/md';
import { FaAngleRight } from 'react-icons/fa';

const ServiceBookingItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tracking_id = location.state?.tracking_id;
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const [details, setDetails] = useState({});
  const [serviceArray, setServiceArray] = useState([]);
  const [paymentExpanded, setPaymentExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({});

  // Toggle payment details & animate chevron rotation via inline style
  const togglePaymentDetails = () => {
    setPaymentExpanded(!paymentExpanded);
  };
  const rotateStyle = {
    transform: `rotate(${paymentExpanded ? 180 : 0}deg)`,
    transition: 'transform 0.3s',
  };

  // Map status keys to display names using translations
  const statusDisplayNames = {
    accept: t('commander_accepted') || 'Commander Accepted',
    arrived: t('commander_arrived') || 'Commander Arrived',
    workCompleted: t('work_completed') || 'Work Completed',
    paymentCompleted: t('payment_completed') || 'Payment Completed',
  };

  const getTimelineData = useMemo(() => {
    const statusKeys = Object.keys(status);
    const currentStatusIndex = statusKeys.findIndex((key) => status[key] === null);
    return statusKeys.map((statusKey, index) => ({
      key: statusKey,
      title: statusDisplayNames[statusKey],
      time: status[statusKey] || null,
      iconColor:
        index <= currentStatusIndex || currentStatusIndex === -1
          ? '#ff4500'
          : '#a1a1a1',
      lineColor:
        index <= currentStatusIndex || currentStatusIndex === -1
          ? '#ff4500'
          : '#a1a1a1',
    }));
  }, [status, statusDisplayNames]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `https://backend.clicksolver.com/api/service/booking/item/details`,
          { tracking_id }
        );
        const { data } = response.data;
        setStatus(data.time || {});
        setDetails(data);
        setServiceArray(data.service_booked);
      } catch (error) {
        console.error('Error fetching bookings data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [tracking_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-orange-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
    >
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={() =>
            navigate('/tabs/home', {
              replace: true,
            })
          }
          className="p-2 focus:outline-none"
        >
          <FaArrowLeftLong size={20} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold">
          {t('service_trackings') || 'Service Trackings'}
        </h1>
      </div>

      <div className="overflow-y-auto">
        {/* User Profile */}
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center bg-orange-500 rounded-full mr-4">
            <span className="text-white text-2xl font-bold">
              {details.name ? details.name.charAt(0).toUpperCase() : ''}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium">{details.name}</p>
            <p className="text-sm" style={{ color: isDarkMode ? '#a3a3a3' : '#6b7280' }}>
              {details.service}
            </p>
          </div>
        </div>

        <hr className={`border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-4`} />

        {/* Service Details */}
        <div className="mb-4 px-2">
          <h2 className="text-lg font-semibold mb-2">
            {t('service_details') || 'Service Details'}
          </h2>
          <div className="pl-4">
            {serviceArray.map((service, index) => (
              <p key={index} className="text-base mb-1">
                {t(`singleService_${service.main_service_id}`) || service.serviceName}
              </p>
            ))}
          </div>
        </div>

        <hr className={`border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-4`} />

        {/* Service Timeline */}
        <div className="mb-4 px-2">
          <h2 className="text-lg font-semibold mb-2">
            {t('service_timeline') || 'Service Timeline'}
          </h2>
          <div className="pl-4">
            {getTimelineData.map((item, index) => (
              <div key={index} className="flex items-start mb-3">
                <div className="flex flex-col items-center">
                  <MdCircle size={14} style={{ color: item.iconColor }} />
                  {index !== getTimelineData.length - 1 && (
                    <div
                      className="w-[2px]"
                      style={{ height: '50px', backgroundColor: getTimelineData[index + 1].iconColor }}
                    ></div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium">{item.title}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.time ? item.time : t('pending') || 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className={`border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-4`} />

        {/* Address */}
        <div className="mb-4 px-2">
          <h2 className="text-lg font-semibold mb-2">
            {t('address') || 'Address'}
          </h2>
          <div className="flex items-center">
            <img
              src="https://i.postimg.cc/rpb2czKR/1000051859-removebg-preview.png"
              alt="Location Pin"
              className="w-6 h-6 mr-3"
            />
            <p className="text-base">{details.area}</p>
          </div>
        </div>

        {/* Payment Details Toggle */}
        <div className="mb-4">
          <button
            className={`w-full flex items-center justify-between px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded`}
            onClick={togglePaymentDetails}
          >
            <span className="text-base font-semibold">
              {t('payment_details') || 'Payment Details'}
            </span>
            <FaAngleRight style={rotateStyle} size={20} color="#ff4500" />
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
                  <p className="text-sm">{t('cashback') || 'Cashback'}</p>
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

        <hr className={`border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} my-4`} />

        {/* Pay Button */}
        <button disabled className="w-full py-3 rounded bg-gray-400 cursor-not-allowed">
          <span className="text-white text-base font-semibold">
            {t('payed') || 'PAYED'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ServiceBookingItem;
