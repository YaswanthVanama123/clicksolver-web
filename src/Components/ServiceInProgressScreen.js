import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Lottie from 'lottie-react';
// Replace with your actual Lottie JSON file path
import serviceLoadingAnimation from '../assets/serviceLoading.json';

const ServiceInProgressScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Assume encodedId is passed via location.state
  const { encodedId } = location.state || {};

  const [details, setDetails] = useState({});
  const [services, setServices] = useState([]);
  const [decodedId, setDecodedId] = useState(null);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

  // Decode encodedId (browsers support atob)
  useEffect(() => {
    if (encodedId) {
      try {
        setDecodedId(atob(encodedId));
      } catch (error) {
        console.error('Error decoding encodedId:', error);
      }
    }
  }, [encodedId]);

  const fetchBookings = useCallback(async () => {
    if (!decodedId) return;
    try {
      const response = await axios.post(
        'https://backend.clicksolver.com/api/user/work/progress/details',
        { decodedId }
      );
      const data = response.data[0];
      setDetails(data);

      // Map each service with its status details
      const mappedServices = data.service_booked.map((serviceBookedItem) => {
        const statusItem = data.service_status.find(
          (s) => s.serviceName === serviceBookedItem.serviceName
        );
        return {
          id: serviceBookedItem.main_service_id,
          name: serviceBookedItem.serviceName,
          quantity: serviceBookedItem.quantity,
          image:
            serviceBookedItem.url ||
            'https://i.postimg.cc/6Tsbn3S6/Image-8.png',
          status: {
            accept: statusItem?.accept || null,
            arrived: statusItem?.arrived || null,
            workCompleted: statusItem?.workCompleted || null,
          },
        };
      });
      setServices(mappedServices);
    } catch (error) {
      console.error('Error fetching bookings data:', error);
    }
  }, [decodedId]);

  useEffect(() => {
    fetchBookings();
  }, [decodedId, fetchBookings]);

  // Generate timeline data for a service based on its status
  const generateTimelineData = (status) => {
    const statusKeys = ['accept', 'arrived', 'workCompleted'];
    const statusDisplayNames = {
      accept: t('in_progress') || 'In Progress',
      arrived: t('work_started') || 'Work Started',
      workCompleted: t('work_completed') || 'Work Completed',
    };

    return statusKeys.map((statusKey) => ({
      key: statusKey,
      title: statusDisplayNames[statusKey],
      time: status[statusKey] || null,
      iconColor: status[statusKey] ? '#ff4500' : '#a1a1a1',
      lineColor: status[statusKey] ? '#ff4500' : '#a1a1a1',
    }));
  };

  const handleCompleteClick = () => {
    setConfirmationModalVisible(true);
  };

  const handleConfirmComplete = async () => {
    try {
      const response = await axios.post(
        'https://backend.clicksolver.com/api/work/time/completed/request',
        { notification_id: decodedId }
      );
      if (response.status === 200) {
        setConfirmationModalVisible(false);
      }
    } catch (error) {
      console.error('Error completing work:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="relative flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
        <FaArrowLeft
          size={20}
          className="absolute left-4 text-gray-800 dark:text-white cursor-pointer"
          onClick={() => navigate('/home')}
        />
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('service_in_progress') || 'Service In Progress'}
        </h1>
      </header>

      {/* Content */}
      <main className="p-4 overflow-y-auto">
        {/* Technician / Profile Section */}
        <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
          <div className="flex items-center">
            <img
              src={
                details.profile ||
                'https://i.postimg.cc/mZnDzdqJ/IMG-20240929-WA0024.jpg'
              }
              alt="Technician"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="ml-4 flex-1">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                {details.name || t('technician') || 'Technician'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {t('certified_technician') || 'Certified Technician'}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {t('estimated_completion') || 'Estimated Completion: 2 hours'}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('status') || 'Status:'}{' '}
            {services.length > 0
              ? services
                  .map(
                    (service) =>
                      t(`singleService_${service.id}`) || service.name
                  )
                  .join(', ')
              : t('pending') || 'Pending'}
          </p>
        </section>

        {/* Lottie Loading Animation */}
        <div className="flex justify-center my-6">
          <Lottie
            animationData={serviceLoadingAnimation}
            loop={true}
            className="w-full max-w-md"
          />
        </div>

        {/* Service Completed Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleCompleteClick}
            className="bg-orange-600 text-white py-2 px-6 rounded-full"
          >
            {t('service_completed') || 'Service Completed'}
          </button>
        </div>

        {/* Service Details Section */}
        <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              {t('service_details') || 'Service Details'}
            </h3>
            <MdKeyboardArrowRight size={24} className="text-orange-600" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <FaCalendarAlt size={20} className="text-orange-600" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('work_started') || 'Work started'}{' '}
                <span className="font-medium text-gray-800 dark:text-white">
                  {details.created_at
                    ? new Date(details.created_at).toLocaleString()
                    : t('pending') || 'Pending'}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt size={20} className="text-orange-600" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('location') || 'Location'}:{' '}
                <span className="font-medium text-gray-800 dark:text-white">
                  {details.area}
                </span>
              </span>
            </div>
          </div>

          {/* Render each service card with timeline */}
          <div className="mt-4 space-y-4">
            {services.map((service, index) => {
              const timelineData = generateTimelineData(service.status);
              return (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4 flex-1">
                      <h4 className="text-md font-medium text-gray-800 dark:text-white">
                        {t(`singleService_${service.id}`) || service.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t('quantity') || 'Quantity'}: {service.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('service_status') || 'Service Status:'}{' '}
                    <span className="font-medium text-gray-800 dark:text-white">
                      {timelineData.find((item) => item.time)?.title ||
                        t('pending') ||
                        'Pending'}
                    </span>
                  </p>
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-800 dark:text-white">
                      {t('service_timeline') || 'Service Timeline'}
                    </h5>
                    <div className="mt-2">
                      {timelineData.map((item) => (
                        <div key={item.key} className="flex items-start mb-2">
                            <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.iconColor }}></div>
                            {item.key !== 'workCompleted' && (
                                <div className="w-0.5 flex-1" style={{ backgroundColor: item.lineColor }}></div>
                            )}
                            </div>

                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.time
                                ? new Date(item.time).toLocaleString()
                                : t('pending') || 'Pending'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      {confirmationModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-4">
              {t('confirm_service_completion') || 'Confirm Service Completion'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
              {t('confirm_service_completion_message') ||
                'Are you sure you want to mark the service as completed? Once done, we will no longer track its progress.'}
            </p>
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-gray-400 text-white py-2 rounded"
                onClick={() => setConfirmationModalVisible(false)}
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                className="flex-1 bg-orange-600 text-white py-2 rounded"
                onClick={handleConfirmComplete}
              >
                {t('confirm') || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceInProgressScreen;
