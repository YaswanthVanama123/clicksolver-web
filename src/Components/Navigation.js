import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import { useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { FaCrosshairs, FaAngleRight } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import { IoMdCall } from 'react-icons/io';
import { LuMessageCircleMore } from 'react-icons/lu';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

// Local assets – adjust paths as necessary
import startMarker from '../assets/start-marker.png';
import endMarker from '../assets/end-marker.png';

const Navigation = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const route = useLocation();
  const params = route.state || {};

  // ========= STATE VARIABLES =========
  const [routeData, setRouteData] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [decodedId, setDecodedId] = useState(null);
  const [encodedData, setEncodedData] = useState(null);
  const [addressDetails, setAddressDetails] = useState({});
  const [pin, setPin] = useState('');
  const [serviceArray, setServiceArray] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  // ========= REFS =========
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // ========= EXTRACT ROUTE PARAMETERS =========
  useEffect(() => {
    const { encodedId } = params;
    if (encodedId) {
      setEncodedData(encodedId);
      try {
        setDecodedId(atob(encodedId));
      } catch (err) {
        console.error('Error decoding Base64:', err);
      }
    }
  }, [params]);

    useEffect(() => {
      const handlePopState = () => {
        navigate('/', { replace: true });
      };
  
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }, [navigate]);   

  // ========= COUNTDOWN TIMER =========
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  // ========= FETCH WORKER DETAILS =========
  const fetchWorkerDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('cs_token');
      const response = await axios.post(
        'https://backend.clicksolver.com/api/worker/navigation/details',
        { notificationId: decodedId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 404) {
        navigate('/skill-registration');
      } else {
        const {
          name,
          phone_number,
          pin,
          profile,
          pincode,
          area,
          city,
          service_booked,
          average_rating,
          service_counts,
        } = response.data;
        setPin(String(pin));
        setAddressDetails({
          name,
          phone_number,
          profile,
          pincode,
          area,
          city,
          rating: average_rating,
          serviceCounts: service_counts,
        });
        setServiceArray(service_booked);
      }
    } catch (error) {
      console.error('Error fetching worker details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [decodedId, navigate]);

  useEffect(() => {
    if (decodedId) {
      fetchWorkerDetails();
    }
  }, [decodedId, fetchWorkerDetails]);

  // ========= FETCH LOCATION DETAILS =========
  const fetchLocationDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'https://backend.clicksolver.com/api/user/location/navigation',
        { params: { notification_id: decodedId } }
      );
      const { startPoint, endPoint } = response.data;
      // Reverse coordinates from [lat, lng] to [lng, lat]
      const reversedStart = [startPoint[1], startPoint[0]];
      const reversedEnd = [endPoint[1], endPoint[0]];
      setLocationDetails({ startPoint: reversedStart, endPoint: reversedEnd });
      await fetchRoute(reversedStart, reversedEnd);
    } catch (error) {
      console.error('Error fetching location details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [decodedId]);

  // ========= FETCH ROUTE USING OLA ROUTE API =========
  const fetchOlaRoute = useCallback(async (startPoint, endPoint) => {
    try {
      const url = 'http://localhost:5000/api/route';
      const payload = { startPoint, endPoint };
      const response = await axios.post(url, payload);
      const encodedPolyline = response.data.routes?.[0]?.overview_polyline;
      if (!encodedPolyline) {
        console.error('No polyline found in response');
        return null;
      }
      const decodedCoords = polyline
        .decode(encodedPolyline)
        .map(([lat, lng]) => [lng, lat]);
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: decodedCoords,
        },
      };
    } catch (error) {
      console.error('Error fetching route from OlaMaps:', error);
      return null;
    }
  }, []);

  const fetchRoute = useCallback(
    async (startPoint, endPoint) => {
      try {
        const routeFeature = await fetchOlaRoute(startPoint, endPoint);
        if (routeFeature && routeFeature.geometry && routeFeature.geometry.coordinates.length > 0) {
          setRouteData(routeFeature);
        } else {
          console.error('Route data invalid:', routeFeature);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    },
    [fetchOlaRoute]
  );

  useEffect(() => {
    if (decodedId) {
      fetchLocationDetails();
    }
  }, [decodedId, fetchLocationDetails]);

  // ========= HELPER FUNCTION: Add Route Layer =========
  const addRouteLayer = (map, data) => {
    if (map.getSource('route')) {
      map.getSource('route').setData(data);
    } else {
      map.addSource('route', {
        type: 'geojson',
        data: data,
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FF5722',
          'line-width': 4,
        },
      });
    }
  };

  // ========= INITIALIZE OLA MAPS =========
  useEffect(() => {
    const initializeMap = () => {
      try {
        if (window.OlaMaps) {
          const olaMaps = new window.OlaMaps({ apiKey: 'q0k6sOfYNxdt3bGvqF6W1yvANHeVtrsu9T5KW9a4' });
          const map = olaMaps.init({
            container: mapContainerRef.current,
            center: locationDetails ? locationDetails.startPoint : [80.519353, 16.987142],
            zoom: 9,
            style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
          });
          mapInstanceRef.current = map;
  
          // Add markers for start and end points
          if (locationDetails) {
            const startEl = document.createElement('img');
            startEl.src = startMarker;
            startEl.style.width = '32px';
            startEl.style.height = '32px';
            new window.OlaMaps.Marker({ element: startEl })
              .setLngLat(locationDetails.startPoint)
              .addTo(map);
  
            const endEl = document.createElement('img');
            endEl.src = endMarker;
            endEl.style.width = '32px';
            endEl.style.height = '32px';
            new window.OlaMaps.Marker({ element: endEl })
              .setLngLat(locationDetails.endPoint)
              .addTo(map);
          }
  
          map.on('load', () => {
            if (routeData) {
              addRouteLayer(map, routeData);
            }
          });
  
          map.setCenter(locationDetails ? locationDetails.startPoint : [80.519353, 16.987142]);
          map.setZoom(18);
        } else {
          console.error('Ola Maps SDK failed to load.');
        }
      } catch (error) {
        console.error('Error during OlaMaps initialization:', error);
      }
    };
  
    if (!window.OlaMaps) {
      const script = document.createElement('script');
      script.src = 'https://www.unpkg.com/olamaps-web-sdk@latest/dist/olamaps-web-sdk.umd.js';
      script.async = true;
      script.onload = initializeMap;
      script.onerror = () => console.error('Failed to load OlaMaps SDK.');
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [locationDetails, routeData]);

  // ========= UPDATE ROUTE ON MAP WHEN routeData CHANGES =========
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && routeData) {
      if (!map.isStyleLoaded()) {
        map.once('load', () => {
          addRouteLayer(map, routeData);
        });
      } else {
        addRouteLayer(map, routeData);
      }
    }
  }, [routeData]);

  // ========= UI HELPER: Render a Service Item =========
  const renderServiceItem = (item, index) => (
    <div key={index} className="flex justify-between items-center py-1">
      <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} w-24`}>
        {t(`singleService_${item.main_service_id}`) || item.serviceName}
      </p>
    </div>
  );

  // ========= ACTION HANDLERS =========
  const phoneCall = async () => {
    try {
      const response = await axios.post(
        'https://backend.clicksolver.com/api/worker/call',
        { decodedId }
      );
      if (response.status === 200 && response.data.mobile) {
        window.location.href = `tel:${response.data.mobile}`;
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

  const messageChatting = () => {
    navigate('/chat-screen', {
      state: {
        request_id: decodedId,
        senderType: 'user',
        profileImage: addressDetails.profile,
        profileName: addressDetails.name,
      },
    });
  };

  // ========= MODAL HANDLERS =========
  const closeModal = () => setModalVisible(false);
  const openConfirmationModal = () => setConfirmationModalVisible(true);
  const closeConfirmationModal = () => setConfirmationModalVisible(false);
  const handleCancelModal = () => setModalVisible(true);

  const handleCancelBooking = useCallback(async () => {
    setConfirmationModalVisible(false);
    setModalVisible(false);
    try {
      setIsLoading(true);
      const response = await axios.post(
        'https://backend.clicksolver.com/api/user/work/cancel',
        { notification_id: decodedId }
      );
      if (response.status === 200) {
        const token = localStorage.getItem('cs_token');
        await axios.post(
          'https://backend.clicksolver.com/api/user/action/cancel',
          { encodedId: encodedData, screen: '' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate('/notifications');
      } else {
        alert('Cancellation failed: Your cancellation time of 2 minutes is over.');
      }
    } catch (error) {
      alert('There was an error processing your cancellation.');
    } finally {
      setIsLoading(false);
    }
  }, [decodedId, encodedData, navigate]);

  // ========= RENDER =========
  return (
    <div className={`relative min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Map Container */}
      <div className="w-full h-[50vh]">
        {locationDetails ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className={`${isDarkMode ? 'text-white' : 'text-black'}`}>
              {t('loading_map') || 'Loading Map...'}
            </p>
          </div>
        )}
        {/* Refresh Button */}
        <button
          className={`absolute top-8 right-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full p-2 z-50`}
          onClick={fetchLocationDetails}
        >
          <MdRefresh className="rotate-180" size={22} />
        </button>
      </div>

      {/* Bottom Card */}
      <div
        className={`absolute bottom-0 w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-2xl shadow-lg p-6`}
        style={{ height: '50vh' }}
      >
        {/* Drag Indicator */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
        </div>
        {/* Top Text and Location */}
        <div className="mb-4 text-center">
          <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {t('commander_on_way') || 'Commander on the way'}
          </p>
          <div className="flex items-center justify-center mt-2">
            <img
              src="https://i.postimg.cc/qvJw8Kzy/Screenshot-2024-11-13-170828-removebg-preview.png"
              alt="Location Pin"
              className="w-5 h-5 mr-2"
            />
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {addressDetails.area || 'Area not set'}
            </p>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex">
          {/* Left Section: Services, PIN & Cancel */}
          <div className="flex-1 pr-4">
            <div className="mb-4 overflow-y-auto" style={{ maxHeight: '8rem' }}>
              {serviceArray && serviceArray.map((item, index) => renderServiceItem(item, index))}
            </div>
            <div className="mb-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('pin') || 'PIN'}</p>
              <div className="flex space-x-2 mt-1">
                {pin.split('').map((digit, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 border ${isDarkMode ? 'border-white' : 'border-gray-800'} rounded flex items-center justify-center`}
                  >
                    <p className="text-sm">{digit}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-md h-10 flex items-center justify-center border`}
              onClick={handleCancelModal}
            >
              <p className="text-xs text-gray-500">{t('cancel') || 'Cancel'}</p>
            </button>
          </div>
          {/* Right Section: Worker Profile */}
          <div className="w-32 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
              {addressDetails.profile && (
                <img
                  src={addressDetails.profile}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {addressDetails.name || 'Worker Name'}
            </p>
            {addressDetails.rating !== undefined && (
              <div className="flex items-center mt-1">
                <p className={`text-sm mr-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {Number(addressDetails.rating).toFixed(1)}
                </p>
              </div>
            )}
            {addressDetails.serviceCounts !== undefined && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {t('no_of_services') || 'No of Services:'} {addressDetails.serviceCounts || 0}
              </p>
            )}
            <div className="flex space-x-2 mt-2">
              <button
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
                onClick={() => (window.location.href = `tel:${addressDetails.phone_number || ''}`)}
              >
                <IoMdCall size={18} className="text-[#FF5722]" />
              </button>
              <button
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
                onClick={messageChatting}
              >
                <LuMessageCircleMore size={18} className="text-[#FF5722]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {modalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50"
          onClick={() => setModalVisible(false)}
        >
          <div
            className={`w-full p-6 rounded-t-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className="absolute top-4 left-4">
              <AiOutlineArrowLeft size={20} className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <h2 className={`text-center text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {t('cancellation_reason_title') || 'What is the reason for your cancellation?'}
            </h2>
            <p className={`text-center text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('cancellation_reason_subtitle') || "Could you let us know why you're canceling?"}
            </p>
            <div className="space-y-4">
              {['found_better_price', 'wrong_location', 'wrong_service', 'more_time', 'others'].map((key) => (
                <button
                  key={key}
                  className="flex justify-between items-center w-full"
                  onClick={() => setConfirmationModalVisible(true)}
                >
                  <span className={`text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {t(key) || key.replace('_', ' ')}
                  </span>
                  <FaAngleRight size={16} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
          <div className={`w-full p-6 rounded-t-2xl relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button onClick={closeConfirmationModal} className="absolute top-4 right-4">
              <RxCrossCircled size={20} className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <h2 className={`text-center text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {t('confirmation_title') || 'Are you sure you want to cancel this Service?'}
            </h2>
            <p className={`text-center text-sm my-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('confirmation_subtitle') ||
                'Please avoid canceling – we’re working to connect you with the best expert to solve your problem.'}
            </p>
            <button
              className="w-full bg-orange-600 py-3 rounded-md"
              onClick={handleCancelBooking}
            >
              <span className="text-white text-lg">
                {t('cancel_service') || 'Cancel my service'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Crosshairs Button */}
      <div className={`fixed right-5 ${'bottom-[290px]'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-full p-3 shadow-md`}>
        <button onClick={() => { /* extra tap handler if needed */ }}>
          <FaCrosshairs size={24} className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`} />
        </button>
      </div>
    </div>
  );
};

export default Navigation;
