import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Lottie from 'lottie-react';
import waitingLoading from '../assets/waitingLoading.json';

const apiKey = 'q0k6sOfYNxdt3bGvqF6W1yvANHeVtrsu9T5KW9a4';

const WaitingUser = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationRoute = useLocation();
  const routeParams = locationRoute.state || {};

  const [decodedId, setDecodedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('waiting');
  
  const [cancelMessage, setCancelMessage] = useState('');
  const [city, setCity] = useState(null);
  const [area, setArea] = useState(null);
  const [pincode, setPincode] = useState(null);
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState(null);
  const [locationCoords, setLocationCoords] = useState([81.05078857408955, 16.699433706595414]);
  const [service, setService] = useState(null);
  const [alternateName, setAlternateName] = useState(null);
  const [encodedData, setEncodedData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [backendLoading, setBackendLoading] = useState(false);
  const [offer, setOffer] = useState(null);

  const attemptCountRef = useRef(0);
  const mapContainerRef = useRef(null);

  // -------------------- Ola Maps Initialization --------------------
  useEffect(() => {
    const initializeMap = () => {
      if (window.OlaMaps) {
        const olaMaps = new window.OlaMaps({ apiKey });
        const myMap = olaMaps.init({
          style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
          container: mapContainerRef.current,
          center: [locationCoords[0], locationCoords[1]],
          zoom: 16,
        });

        myMap.on('load', () => {
          new window.OlaMaps.Marker()
            .setLngLat([locationCoords[0], locationCoords[1]])
            .addTo(myMap);
        });
      } else {
        console.error('Ola Maps SDK failed to load.');
      }
    };

    if (!window.OlaMaps) {
      const script = document.createElement('script');
      script.src = 'https://www.unpkg.com/olamaps-web-sdk@latest/dist/olamaps-web-sdk.umd.js';
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [locationCoords]);

  // -------------------- Decode Data (if any) --------------------
  useEffect(() => {
    if (
      encodedData &&
      ![
        'No workers found within 2 km radius',
        'No user found or no worker matches subservices',
        'No Firestore location data for these workers',
        'No workers match the requested subservices',
      ].includes(encodedData)
    ) {
      try {
        const decoded = Buffer.from(encodedData, 'base64').toString('utf-8');
        setDecodedId(decoded);
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [encodedData]);

  // -------------------- Extract Route Parameters --------------------
  useEffect(() => {
    const {
      area,
      city,
      pincode,
      alternateName,
      alternatePhoneNumber,
      serviceBooked,
      location: loc,
      discount,
      tipAmount,
      offer,
      encodedId,
    } = routeParams;

    setCity(city);
    setArea(area);
    setPincode(pincode);
    setAlternatePhoneNumber(alternatePhoneNumber);
    setAlternateName(alternateName);
    setService(serviceBooked);
    if (loc) setLocationCoords(loc);
    setDiscount(discount);
    setTipAmount(tipAmount);
    setOffer(offer || null);

    if (
      encodedId &&
      ![
        'No workers found within 2 km radius',
        'No user found or no worker matches subservices',
        'No Firestore location data for these workers',
        'No workers match the requested subservices',
      ].includes(encodedId)
    ) {
      setEncodedData(encodedId);
      try {
        const decoded = Buffer.from(encodedId, 'base64').toString('utf-8');
        setDecodedId(decoded);
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParams]);

  // -------------------- Fetch Nearby Workers --------------------
  const fetchData = async () => {
    const {
      area,
      city,
      pincode,
      alternateName,
      alternatePhoneNumber,
      serviceBooked,
      discount,
      tipAmount,
      offer,
    } = routeParams;

    setBackendLoading(true);
    try {
      const jwtToken = window.localStorage.getItem('cs_token');
      if (!jwtToken) return;

      const response = await axios.post(
        'https://backend.clicksolver.com/api/workers-nearby',
        {
          area,
          city,
          pincode,
          alternateName,
          alternatePhoneNumber,
          serviceBooked,
          discount,
          tipAmount,
          offer,
        },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      if (response.status === 200) {
        const encode = response.data;
        setEncodedData(encode);
        if (
          encode &&
          ![
            'No workers found within 2 km radius',
            'No user found or no worker matches subservices',
            'No Firestore location data for these workers',
            'No workers match the requested subservices',
          ].includes(encode)
        ) {
          // Log user action
          await axios.post(
            'https://backend.clicksolver.com/api/user/action',
            {
              encodedId: encode,
              screen: 'userwaiting',
              serviceBooked,
              area,
              city,
              pincode,
              alternateName,
              alternatePhoneNumber,
              location: locationCoords,
              discount,
              tipAmount,
              offer,
            },
            { headers: { Authorization: `Bearer ${jwtToken}` } }
          );
        }
      }
    } catch (error) {
      console.error('Error fetching nearby workers:', error);
    } finally {
      setBackendLoading(false);
    }
  };

  // -------------------- Cancel Workflow --------------------
  const handleManualCancel = () => {
    setModalVisible(true);
  };

  const handleSelectReason = (reason) => {
    setSelectedReason(reason);
    setModalVisible(false);
    setConfirmationModalVisible(true);
  };

  const handleCancelBooking = async () => {
    setConfirmationModalVisible(false);
    setBackendLoading(true);
    try {
      if (decodedId) {
        await axios.post('https://backend.clicksolver.com/api/user/cancellation', {
          user_notification_id: decodedId,
          cancellation_reason: selectedReason,
        });
        const cs_token = window.localStorage.getItem('cs_token');
        await axios.post(
          'https://backend.clicksolver.com/api/user/action/cancel',
          { encodedId: encodedData, screen: 'userwaiting', offer },
          { headers: { Authorization: `Bearer ${cs_token}` } }
        );
      }
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error calling cancellation API:', error);
      setCancelMessage('Cancel timed out');
      setTimeout(() => setCancelMessage(''), 3000);
      navigate('/', { replace: true });
    } finally {
      setBackendLoading(false);
    }
  };

  const handleCancelAndRetry = async () => {
    setBackendLoading(true);
    try {
      attemptCountRef.current += 1;
      if (attemptCountRef.current > 3) {
        // Force-cancel after 3 attempts
        await axios.post('https://backend.clicksolver.com/api/user/cancellation', {
          user_notification_id: decodedId,
        });
        const cs_token = window.localStorage.getItem('cs_token');
        await axios.post(
          'https://backend.clicksolver.com/api/user/action/cancel',
          { encodedId: encodedData, screen: 'userwaiting', offer },
          { headers: { Authorization: `Bearer ${cs_token}` } }
        );
        navigate('/', { replace: true });
        return;
      }

      // Cancel previous request if any
      if (decodedId) {
        try {
          await axios.post('https://backend.clicksolver.com/api/user/cancellation', {
            user_notification_id: decodedId,
          });
        } catch (error) {
          console.error('Error cancelling previous request:', error);
        }
      }
      // Then re-request
      const cs_token = window.localStorage.getItem('cs_token');
      await axios.post(
        'https://backend.clicksolver.com/api/user/action/cancel',
        { encodedId: encodedData, screen: 'userwaiting', offer },
        { headers: { Authorization: `Bearer ${cs_token}` } }
      );
      await fetchData();
    } catch (error) {
      console.error('Error in cancel and retry:', error);
    } finally {
      setBackendLoading(false);
    }
  };

  // -------------------- Polling for Status --------------------
  useEffect(() => {
    let intervalId;
    if (decodedId && decodedId !== 'No workersverified found within 2 km radius') {
      const checkStatus = async () => {
        setBackendLoading(true);
        try {
          const response = await axios.get(
            'https://backend.clicksolver.com/api/checking/status',
            {
              params: { user_notification_id: decodedId },
              validateStatus: (status) => status === 200 || status === 201,
            }
          );
          if (response.status === 201) {
            setStatus('accepted');
            const { notification_id } = response.data;
            if (typeof notification_id !== 'number') {
              throw new TypeError('Unexpected type for notification_id in API response');
            }
            const encodedNotificationId = Buffer.from(notification_id.toString(), 'utf-8').toString('base64');
            const cs_token = window.localStorage.getItem('cs_token');
            // Cancel the waiting action
            await axios.post(
              'https://backend.clicksolver.com/api/user/action/cancel',
              { encodedId: encodedData, screen: 'userwaiting', offer },
              { headers: { Authorization: `Bearer ${cs_token}` } }
            );
            // Move user to next screen
            await axios.post(
              'https://backend.clicksolver.com/api/user/action',
              {
                encodedId: encodedNotificationId,
                screen: 'UserNavigation',
                serviceBooked: service,
                offer,
              },
              { headers: { Authorization: `Bearer ${cs_token}` } }
            );
            navigate('/usernavigation', {
              replace: true,
              state: { encodedId: encodedNotificationId, service, offer },
            });
          } else if (response.status === 200) {
            setStatus('waiting');
          }
        } catch (error) {
          console.error('Error checking status:', error);
        } finally {
          setBackendLoading(false);
        }
      };

      checkStatus();
      intervalId = setInterval(checkStatus, 110000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [decodedId, service, offer, encodedData, navigate]);

  // -------------------- Timer --------------------
  useEffect(() => {
    const loadData = () => {
      try {
        const storedTime = window.localStorage.getItem(`estimatedTime${service}`);
        if (!storedTime) {
          const currentTime = Date.now();
          window.localStorage.setItem(`estimatedTime${service}`, currentTime.toString());
          setTimeLeft(600);
        } else {
          const savedTime = parseInt(storedTime, 10);
          const currentTime = Date.now();
          const timeDifference = Math.floor((currentTime - savedTime) / 1000);
          const remainingTime = 600 - timeDifference;
          setTimeLeft(remainingTime > 0 ? remainingTime : 0);
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadData();

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [service]);

 // ensure this is declared once
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col w-full min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* 1) MAP SECTION */}
      <div ref={mapContainerRef} className="w-full h-[60vh]" />

      {/* 2) BOTTOM CARD */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-t-2xl h-[40vh]">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        <div className="px-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              {t('looking_for_commander') || 'Looking best commander for you'}
            </p>
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium">
                {t('service_booked') || 'Service Booked'}
              </p>
              <button
                className="px-4 py-1 border border-gray-300 dark:border-gray-500 rounded-full text-sm"
                onClick={handleManualCancel}
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
        <hr className="my-2 border-gray-200 dark:border-gray-700" />
        <div className="flex justify-center items-center">
        <Lottie animationData={waitingLoading} loop style={{ width: 110, height: 110 }} />
          {/* {loading && <p className="text-sm">Loading...</p>} */}
        </div>
      </div>

      {/* 3) BACKEND LOADING OVERLAY */}
      {backendLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <p className="text-white text-lg">Loading...</p>
        </div>
      )}

      {/* 4) CANCELLATION REASON MODAL */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-end bg-black bg-opacity-50 z-50">
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-6">
            <p className="text-lg font-medium text-center mb-2">
              {t('cancellation_reason_question') || 'What is the reason for your cancellation?'}
            </p>
            <p className="text-sm text-center mb-4">
              {t('cancellation_reason_subtitle') || "Could you let us know why you're canceling?"}
            </p>
            <div className="flex flex-col gap-4">
              <button
                className="text-left text-base"
                onClick={() => handleSelectReason(t('reason_better_price') || 'Found a better price')}
              >
                {t('reason_better_price') || 'Found a better price'}
              </button>
              <button
                className="text-left text-base"
                onClick={() => handleSelectReason(t('reason_wrong_location') || 'Wrong work location')}
              >
                {t('reason_wrong_location') || 'Wrong work location'}
              </button>
              <button
                className="text-left text-base"
                onClick={() => handleSelectReason(t('reason_wrong_service') || 'Wrong service booked')}
              >
                {t('reason_wrong_service') || 'Wrong service booked'}
              </button>
              <button
                className="text-left text-base"
                onClick={() => handleSelectReason(t('reason_more_time') || 'More time to assign a commander')}
              >
                {t('reason_more_time') || 'More time to assign a commander'}
              </button>
              <button
                className="text-left text-base"
                onClick={() => handleSelectReason(t('reason_others') || 'Others')}
              >
                {t('reason_others') || 'Others'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5) CONFIRMATION MODAL */}
      {confirmationModalVisible && (
        <div className="fixed inset-0 flex items-end bg-black bg-opacity-50 z-50">
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-6">
            <p className="text-lg font-medium text-center mb-2">
              {t('cancel_service_confirmation') || 'Are you sure you want to cancel this Service?'}
            </p>
            <p className="text-sm text-center mb-4">
              {t('cancel_service_warning') ||
                "Please avoid canceling – we’re working to connect you with the best expert to solve your problem."}
            </p>
            <div className="flex justify-center">
              <button
                className="bg-red-500 text-white rounded-full px-6 py-2"
                onClick={handleCancelBooking}
              >
                {t('cancel_my_service') || 'Cancel my service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6) TIMER */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow">
        <p className="text-lg font-semibold">{formatTime(timeLeft)}</p>
      </div>
    </div>
  );
};

export default WaitingUser;
