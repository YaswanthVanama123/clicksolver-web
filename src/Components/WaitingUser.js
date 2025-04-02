import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';
import Lottie from 'lottie-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import waitingLoading from '../assets/waitingLoading.json';

// Import OlaMaps from the SDK package
import { OlaMaps } from 'olamaps-web-sdk';

// Marker Images (replace with your actual asset imports)
const startMarker = require('../assets/start-marker.png');
const endMarker = require('../assets/end-marker.png');

const WaitingUser = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const locationRoute = useLocation();
  const routeParams = locationRoute.state || {};
  const apiKey = 'q0k6sOfYNxdt3bGvqF6W1yvANHeVtrsu9T5KW9a4';

  const [decodedId, setDecodedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('waiting');
  const [cancelMessage, setCancelMessage] = useState('');
  const [city, setCity] = useState(null);
  const [area, setArea] = useState(null);
  const [pincode, setPincode] = useState(null);
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState(null);
  // Coordinates in [lng, lat]
  const [locationCoords, setLocationCoords] = useState([81.05078857408955, 16.699433706595414]);
  const [service, setService] = useState(null);
  const [alternateName, setAlternateName] = useState(null);
  const [encodedData, setEncodedData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [backendLoading, setBackendLoading] = useState(false);
  const [offer, setOffer] = useState(null);

  const attemptCountRef = useRef(0);
  const mapContainerRef = useRef(null);

  // ------------------ Decode Encoded Data ------------------
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

    useEffect(() => {
      const handlePopState = () => {
        navigate('/', { replace: true });
      };
  
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }, [navigate]); 

  // ------------------ Extract Route Parameters ------------------
  useEffect(() => {
    const {
      area,
      city,
      pincode,
      alternateName,
      alternatePhoneNumber,
      serviceBooked,
      location,
      discount,
      tipAmount,
      offer,
      encodedId,
    } = routeParams;
    if (city) setCity(city);
    if (area) setArea(area);
    if (pincode) setPincode(pincode);
    if (alternateName) setAlternateName(alternateName);
    if (alternatePhoneNumber) setAlternatePhoneNumber(alternatePhoneNumber);
    if (serviceBooked) setService(serviceBooked);
    if (location) setLocationCoords(location);
    if (discount) setDiscount(discount);
    if (tipAmount) setTipAmount(tipAmount);
    if (offer) setOffer(offer);
    if (encodedId) {
      setEncodedData(encodedId);
      try {
        const decoded = Buffer.from(encodedId, 'base64').toString('utf-8');
        setDecodedId(decoded);
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [routeParams]);

  // ------------------ Fetch Data from Backend ------------------
  const fetchData = async () => {
    const {
      area,
      city,
      pincode,
      alternateName,
      alternatePhoneNumber,
      serviceBooked,
      location,
      discount,
      tipAmount,
      offer,
    } = routeParams;
    if (city) setCity(city);
    if (area) setArea(area);
    if (pincode) setPincode(pincode);
    if (alternateName) setAlternateName(alternateName);
    if (alternatePhoneNumber) setAlternatePhoneNumber(alternatePhoneNumber);
    if (serviceBooked) setService(serviceBooked);
    if (location) setLocationCoords(location);
    if (discount) setDiscount(discount);
    if (tipAmount) setTipAmount(tipAmount);
    if (offer) setOffer(offer);
    setBackendLoading(true);
    try {
      const jwtToken = localStorage.getItem('cs_token');
      if (!jwtToken) return;
      const response = await axios.post(
        'https://backend.clicksolver.com/api/workers-nearby',
        {
          area,
          city,
          pincode,
          alternateName,
          alternatePhoneNumber,
          serviceBooked: service,
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
          await axios.post(
            'https://backend.clicksolver.com/api/user/action',
            {
              encodedId: encode,
              screen: 'userwaiting',
              serviceBooked: service,
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

  useEffect(() => {
    const { encodedId } = routeParams;
    if (
      encodedId &&
      encodedData !== 'No workers found within 2 km radius' &&
      encodedData !== 'No user found or no worker matches subservices' &&
      encodedData !== 'No Firestore location data for these workers' &&
      encodedData !== 'No workers match the requested subservices'
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
  }, [routeParams]);

  // ------------------ Cancellation Workflow ------------------
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
        const cs_token = localStorage.getItem('cs_token');
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
        await axios.post('https://backend.clicksolver.com/api/user/cancellation', {
          user_notification_id: decodedId,
        });
        const cs_token = localStorage.getItem('cs_token');
        await axios.post(
          'https://backend.clicksolver.com/api/user/action/cancel',
          { encodedId: encodedData, screen: 'userwaiting', offer },
          { headers: { Authorization: `Bearer ${cs_token}` } }
        );
        navigate('/', { replace: true });
        return;
      }
      if (decodedId) {
        try {
          await axios.post('https://backend.clicksolver.com/api/user/cancellation', {
            user_notification_id: decodedId,
          });
        } catch (error) {
          console.error('Error cancelling previous request:', error);
        }
      }
      const cs_token = localStorage.getItem('cs_token');
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

  // ------------------ Timer ------------------
  useEffect(() => {
    const storedTime = localStorage.getItem(`estimatedTime${service}`);
    if (!storedTime) {
      const currentTime = Date.now();
      localStorage.setItem(`estimatedTime${service}`, currentTime.toString());
      setTimeLeft(600);
    } else {
      const savedTime = parseInt(storedTime, 10);
      const currentTime = Date.now();
      const timeDifference = Math.floor((currentTime - savedTime) / 1000);
      const remainingTime = 600 - timeDifference;
      setTimeLeft(remainingTime > 0 ? remainingTime : 0);
    }
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ------------------ Initialize Ola Maps (Replacing Mapbox) ------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const olaMaps = new OlaMaps({ apiKey });
    const myMap = olaMaps.init({
      container: mapContainerRef.current,
      center: locationCoords, // Use locationCoords instead of the global location
      zoom: 16,
      style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
    });
    myMap.on('load', () => {
      // For demonstration, add a marker using an image URL.
      const markerEl = document.createElement('div');
      markerEl.className = 'w-10 h-10 bg-cover bg-center';
      markerEl.style.backgroundImage =
        "url('https://i.postimg.cc/ZRdQkj5d/Screenshot-2024-11-13-164652-removebg-preview.png')";
      olaMaps
        .addMarker({ element: markerEl, anchor: 'bottom', offset: [0, -10] })
        .setLngLat(locationCoords)
        .addTo(myMap);
      setLoading(false);
    });
  }, [locationCoords]);

  // ------------------ UI Rendering using Tailwind CSS ------------------
  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* MAP SECTION */}
      <div className="w-full h-[60vh] relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <p className="text-white">{t('loading_map') || 'Loading...'}</p>
          </div>
        )}
      </div>

      {/* BOTTOM CARD */}
      <div className="absolute bottom-0 w-full h-[40vh] bg-white dark:bg-gray-800 rounded-t-2xl p-4 shadow-lg">
        <div className="w-16 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-auto mb-4"></div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {t('looking_for_commander') || 'Looking best commander for you'}
          </p>
          <button
            onClick={handleManualCancel}
            className="px-4 py-1 border border-gray-300 dark:border-gray-500 rounded-full text-sm text-gray-600 dark:text-gray-300"
          >
            {t('cancel') || 'Cancel'}
          </button>
        </div>
        <hr className="border-gray-200 dark:border-gray-700" />
        <div className="flex justify-center items-center mt-4">
          <Lottie animationData={waitingLoading} loop style={{ width: 120, height: 120 }} />
        </div>
      </div>

      {/* BACKEND LOADING OVERLAY */}
      {backendLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <p className="text-white text-lg">Loading...</p>
        </div>
      )}

      {/* CANCEL REASON MODAL */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-end bg-black bg-opacity-50">
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-6 relative">
            <button
              onClick={() => setModalVisible(false)}
              className="absolute top-4 right-4 text-xl text-gray-800 dark:text-gray-200"
            >
              ×
            </button>
            <h3 className="text-lg font-medium text-center text-gray-800 dark:text-white mb-2">
              {t('cancellation_reason_question') || 'What is the reason for your cancellation?'}
            </h3>
            <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-4 border-b pb-2">
              {t('cancellation_reason_subtitle') || "Could you let us know why you're canceling?"}
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleSelectReason('Found a better price')}
                className="text-left text-base text-gray-800 dark:text-white"
              >
                {t('reason_better_price') || 'Found a better price'}
              </button>
              <button
                onClick={() => handleSelectReason('Wrong work location')}
                className="text-left text-base text-gray-800 dark:text-white"
              >
                {t('reason_wrong_location') || 'Wrong work location'}
              </button>
              <button
                onClick={() => handleSelectReason('Wrong service booked')}
                className="text-left text-base text-gray-800 dark:text-white"
              >
                {t('reason_wrong_service') || 'Wrong service booked'}
              </button>
              <button
                onClick={() => handleSelectReason('More time to assign a commander')}
                className="text-left text-base text-gray-800 dark:text-white"
              >
                {t('reason_more_time') || 'More time to assign a commander'}
              </button>
              <button
                onClick={() => handleSelectReason('Others')}
                className="text-left text-base text-gray-800 dark:text-white"
              >
                {t('reason_others') || 'Others'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmationModalVisible && (
        <div className="fixed inset-0 flex items-end bg-black bg-opacity-50">
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-6 relative">
            <button
              onClick={() => setConfirmationModalVisible(false)}
              className="absolute top-4 right-4 text-xl text-gray-800 dark:text-gray-200"
            >
              ×
            </button>
            <h3 className="text-lg font-medium text-center text-gray-800 dark:text-white mb-2 border-b pb-2">
              {t('cancel_service_confirmation') || 'Are you sure you want to cancel this Service?'}
            </h3>
            <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-4">
              {t('cancel_service_warning') ||
                "Please avoid canceling – we’re working to connect you with the best expert to solve your problem."}
            </p>
            <button
              onClick={handleCancelBooking}
              className="bg-red-500 text-white rounded-full px-6 py-2 mx-auto block"
            >
              {t('cancel_my_service') || 'Cancel my service'}
            </button>
          </div>
        </div>
      )}

      {/* TIMER */}
      <div className="absolute top-4 right-4 p-2 rounded-lg shadow bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
        <p className="text-lg font-semibold">{formatTime(timeLeft)}</p>
      </div>
    </div>
  );
};

export default WaitingUser;
