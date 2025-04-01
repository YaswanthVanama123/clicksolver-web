import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCrosshairs } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const UserLocation = () => {
  const navigate = useNavigate();
  const locationRoute = useLocation();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { serviceName, savings, tipAmount, offer, suggestion } = locationRoute.state || {};

  // State variables
  const [service, setService] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [userLocation, setUserLocation] = useState(null); // [lng, lat]
  const [locationLoading, setLocationLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [inputText, setInputText] = useState(suggestion ? suggestion.title : '');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState('');
  const [alternateName, setAlternateName] = useState('');
  const [cityError, setCityError] = useState('');
  const [areaError, setAreaError] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [showOutOfPolygonModal, setShowOutOfPolygonModal] = useState(false);

  // Refs for the map container, map instance and marker
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Example polygon geofences (coordinates as [lat, lng])
  const polygonGeofences = [
    {
      id: 'zone1',
      coordinates: [
        [17.006761409194525, 80.53093335197622],
        [17.005373260064985, 80.53291176992008],
        [16.998813039026402, 80.52664649280518],
        [16.993702747389463, 80.52215964720267],
        [16.98846563857974, 80.5205112174242],
        [16.985436512096513, 80.52097340481015],
        [16.982407772736835, 80.51886205401541],
        [16.987520443064497, 80.51325397397363],
        [16.99023324951544, 80.51463921162184],
        [16.995343035509578, 80.51463907310551],
        [16.997739960285273, 80.5172774280341],
        [16.998812144956858, 80.5151667160207],
        [17.001713715885202, 80.51609017256038],
        [17.002827038610846, 80.51776432647671],
        [17.003291715895045, 80.52011454583169],
        [17.00505854929827, 80.52875703518436],
        [17.00682448638898, 80.5309333429243],
        [17.006761409194525, 80.53093335197622],
      ],
    },
    // ... other zones if needed.
  ];

  // Ray-casting algorithm to check if point [lng, lat] is inside a polygon ([lat, lng] coordinates)
  const isPointInPolygon = (point, polygon) => {
    // Convert polygon coordinates from [lat, lng] to [lng, lat]
    const poly = polygon.map(coord => [coord[1], coord[0]]);
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Set service and discount from route params
  useEffect(() => {
    if (serviceName) {
      setService(serviceName);
      setDiscount(savings);
    }
  }, [locationRoute.state]);

  // Function to send location data to backend
  const sendDataToServer = useCallback(async (longitude, latitude) => {
    try {
      const token = localStorage.getItem('cs_token');
      if (!token) {
        console.error(t('no_token_found') || 'No token found');
        return;
      }
      const response = await axios.post(
        'https://backend.clicksolver.com/api/user/location',
        { longitude: String(longitude), latitude: String(latitude) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        console.log(t('location_sent_successfully') || 'User location sent successfully');
      }
    } catch (error) {
      console.error(t('failed_to_send_location') || 'Failed to send user location:', error);
    }
  }, [t]);

  // Reverse geocode via Ola Maps API
  const fetchAndSetPlaceDetails = useCallback(async (latitude, longitude) => {
    const apiKey = 'q0k6sOfYNxdt3bGvqF6W1yvANHeVtrsu9T5KW9a4';
    const url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`;
    try {
      const response = await axios.get(url, {
        headers: { 'X-Request-Id': `req-${Date.now()}` },
      });
      if (response.data && response.data.results && response.data.results.length > 0) {
        const place = response.data.results[0];
        const addressComponents = place.address_components;
        const fetchedPincode =
          addressComponents.find(comp => comp.types.includes('postal_code'))?.long_name || '';
        let fetchedCity =
          addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';
        if (!fetchedCity) {
          fetchedCity =
            addressComponents.find(comp => comp.types.includes('administrative_area_level_3'))?.long_name || '';
        }
        if (!fetchedCity) {
          fetchedCity =
            addressComponents.find(comp => comp.types.includes('administrative_area_level_2'))?.long_name || '';
        }
        const fetchedArea = place.formatted_address || '';
        console.log('Extracted Location Details:', { city: fetchedCity, area: fetchedArea, pincode: fetchedPincode });
        setCity(fetchedCity);
        setArea(fetchedArea);
        setPincode(fetchedPincode);
      } else {
        console.warn(t('no_address_found') || 'No address details found.');
      }
    } catch (error) {
      console.error(t('failed_to_fetch_place_details') || 'Failed to fetch place details:', error);
    }
  }, [t]);

  // Get user's current location via browser geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = suggestion ? suggestion : position.coords;
        setUserLocation([longitude, latitude]); // [lng, lat]
        sendDataToServer(longitude, latitude);
        fetchAndSetPlaceDetails(latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        console.error(t('geolocation_error') || 'Geolocation error:', error);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, [suggestion, t, fetchAndSetPlaceDetails, sendDataToServer]);

  // Initialize Ola Maps
  useEffect(() => {
    const initializeMap = () => {
      if (window.OlaMaps) {
        const olaMaps = new window.OlaMaps({ apiKey: 'q0k6sOfYNxdt3bGvqF6W1yvANHeVtrsu9T5KW9a4' });
        const map = olaMaps.init({
          container: mapContainerRef.current,
          center: userLocation ? userLocation : [80.519353, 16.987142],
          zoom: 9,
          style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
        });
        mapInstanceRef.current = map;

        map.on('load', () => {
          // Add polygon geofences
          const features = polygonGeofences.map(fence => ({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [fence.coordinates.map(coord => [coord[1], coord[0]])],
            },
            properties: { id: fence.id },
          }));
          const geoJson = { type: 'FeatureCollection', features };
          map.addSource('polygonGeofence', {
            type: 'geojson',
            data: geoJson,
          });
          map.addLayer({
            id: 'polygonGeofenceFill',
            type: 'fill',
            source: 'polygonGeofence',
            paint: { 'fill-color': 'rgba(240,240,240,0.4)' },
          });

          // Add or update marker
          if (userLocation) {
            if (!markerRef.current) {
              markerRef.current = map.addMarker({
                coordinates: userLocation,
                color: '#FF0000',
              });
            } else {
              markerRef.current.setLngLat(userLocation);
            }
            map.setCenter(userLocation);
            map.setZoom(18);
          }

          // Update location on map click
          map.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            const newLocation = [lng, lat];
            setUserLocation(newLocation);
            sendDataToServer(lng, lat);
            fetchAndSetPlaceDetails(lat, lng);
            if (markerRef.current) {
              markerRef.current.setLngLat(newLocation);
            } else {
              markerRef.current = map.addMarker({
                coordinates: newLocation,
                color: '#FF0000',
              });
            }
          });
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
  }, [userLocation, fetchAndSetPlaceDetails, sendDataToServer]);

  // Update map when userLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(18);
    }
  }, [userLocation]);

  // Crosshairs – re-fetch location
  const handleCrosshairsPress = () => {
    setInputText('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = [longitude, latitude];
        setUserLocation(newLoc);
        sendDataToServer(longitude, latitude);
        fetchAndSetPlaceDetails(latitude, longitude);
        if (markerRef.current) {
          markerRef.current.setLngLat(newLoc);
        } else if (mapInstanceRef.current) {
          markerRef.current = mapInstanceRef.current.addMarker({
            coordinates: newLoc,
            color: '#FF0000',
          });
        }
      },
      (error) => {
        console.error(t('geolocation_error') || 'Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Confirm location and validate if it lies within any geofence
  const handleConfirmLocation = async () => {
    setConfirmLoading(true);
    if (userLocation) {
      const inAnyGeofence = polygonGeofences.some(fence => isPointInPolygon(userLocation, fence.coordinates));
      if (!inAnyGeofence) {
        setShowOutOfPolygonModal(true);
        setConfirmLoading(false);
        return;
      }
    }
    setShowMessageBox(true);
    try {
      const token = localStorage.getItem('cs_token');
      if (!token) {
        console.error(t('no_token_found') || 'No token found');
        setConfirmLoading(false);
        return;
      }
      const response = await axios.get(`https://backend.clicksolver.com/api/get/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const data = response.data;
        console.log(t('user_data_fetched') || 'User data fetched:', data);
        setAlternatePhoneNumber(data.phone_number || '');
        setAlternateName(data.name);
      } else {
        console.warn(t('unexpected_response') || 'Unexpected response:', response);
      }
    } catch (error) {
      console.error(t('failed_to_fetch_user_data') || 'Failed to fetch user data:', error);
      setShowMessageBox(false);
    }
    setConfirmLoading(false);
  };

  // "Remind Me" handler when location is out of service
  const handleRemindMe = async () => {
    try {
      const token = localStorage.getItem('cs_token');
      if (!token) {
        console.error(t('no_token_found') || 'No token found');
        setShowOutOfPolygonModal(false);
        return;
      }
      const response = await axios.post(
        `https://backend.clicksolver.com/api/send/reminder`,
        { area, city },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(t('reminder_sent') || 'Reminder sent successfully:', response.data);
    } catch (error) {
      console.error(t('failed_to_send_reminder') || 'Failed to send reminder:', error);
    } finally {
      setShowOutOfPolygonModal(false);
    }
  };

  // Validate address details and navigate to the next page
  const handleBookCommander = () => {
    let hasError = false;
    setCityError('');
    setAreaError('');
    setPincodeError('');
    setPhoneError('');
    setNameError('');
    if (!city) {
      setCityError(t('city_required') || 'City is required.');
      hasError = true;
    }
    if (!area) {
      setAreaError(t('area_required') || 'Area is required.');
      hasError = true;
    }
    if (!pincode) {
      setPincodeError(t('pincode_required') || 'Pincode is required.');
      hasError = true;
    }
    if (!alternatePhoneNumber) {
      setPhoneError(t('phone_required') || 'Phone number is required.');
      hasError = true;
    }
    if (!alternateName) {
      setNameError(t('name_required') || 'Name is required.');
      hasError = true;
    }
    if (!hasError) {
      setShowMessageBox(false);
      navigate('/userwaiting', {
        state: {
          area,
          city,
          pincode,
          alternateName,
          alternatePhoneNumber,
          serviceBooked: service,
          location: userLocation,
          discount,
          tipAmount,
          offer: offer || null,
        },
      });
    }
  };

  const handleBackPress = () => {
    navigate(-1);
  };

  const totalServiceCost = service.reduce((sum, s) => sum + s.totalCost, 0);
  const renderServiceItem = (item, index) => {
    if (discount > 0) {
      const allocatedDiscount = Math.round((item.totalCost / totalServiceCost) * discount);
      const finalCost = item.totalCost - allocatedDiscount;
      return (
        <div key={index} className="flex justify-between items-center py-2">
          <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} w-20`}>
            {t(`singleService_${item.main_service_id}`) || item.serviceName}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            <span className="line-through" style={{ color: isDarkMode ? '#aaa' : '#555' }}>₹{item.totalCost}</span> ₹{finalCost}
          </p>
        </div>
      );
    } else {
      return (
        <div key={index} className="flex justify-between items-center py-2">
          <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} w-20`}>
            {t(`singleService_${item.main_service_id}`) || item.serviceName}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>₹{item.totalCost}</p>
        </div>
      );
    }
  };

  return (
    <div className={`relative min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Search Box */}
      <div className="absolute top-8 left-0 right-0 z-50 flex justify-center">
        <div className={`flex items-center rounded-lg w-11/12 shadow-md h-14 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button onClick={handleBackPress} className="mr-3">
            <FaArrowLeft size={18} className={`${isDarkMode ? 'text-white' : 'text-gray-500'}`} />
          </button>
          <div className="mr-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <input
            className="flex-1 outline-none text-sm px-2 bg-transparent"
            style={{ color: isDarkMode ? 'white' : '#1D2951' }}
            placeholder={t('search_location') || 'Search location ...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() =>
              navigate('/LocationSearch', { state: { serviceName, savings, tipAmount, offer } })
            }
          />
          <button onClick={() => {}} className="ml-2">
            <span className="text-xl" style={{ color: isDarkMode ? 'white' : 'black' }}>♡</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[75vh]">
        <div ref={mapContainerRef} className="w-full h-full"></div>
        {locationLoading && (
          <div className="absolute inset-0 flex justify-center items-center" style={{ backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255,255,255,0.7)' }}>
            <span style={{ color: isDarkMode ? 'white' : 'black' }}>Loading...</span>
          </div>
        )}
      </div>

      {/* Booking Card */}
      <div className={`absolute bottom-0 w-full p-4 rounded-t-2xl shadow-lg h-[30vh] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="h-full flex flex-col justify-between">
          <div className="overflow-y-auto">
            {service.map((item, index) => renderServiceItem(item, index))}
          </div>
          <button onClick={handleConfirmLocation} className="w-full bg-orange-600 rounded-md py-3">
            {confirmLoading ? (
              <span className="text-white text-center">Loading...</span>
            ) : (
              <span className="text-white text-center text-lg">
                {t('confirm_location') || 'Confirm Location'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Out-of-Polygon Modal */}
      {showOutOfPolygonModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className={`p-6 rounded-lg w-4/5 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              {t('location_not_serviceable') || 'Location Not Serviceable'}
            </p>
            <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} my-4 px-2`}>
              {t('location_not_available', { city: city || t('this') || 'this' }) ||
                `We are not in ${city || 'this'} location. Please choose another location or tap "Remind Me" to get a notification when service is available.`}
            </p>
            <div className="flex justify-around w-full">
              <button onClick={() => setShowOutOfPolygonModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded-md">
                {t('cancel') || 'Cancel'}
              </button>
              <button onClick={handleRemindMe} className="bg-orange-600 text-white px-4 py-2 rounded-md">
                {t('remind_me') || 'Remind Me'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Box Modal */}
      {showMessageBox && (
        <div className="fixed inset-0 flex justify-center items-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className={`p-6 rounded-lg w-4/5 relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {confirmLoading ? (
              <div className="flex flex-col items-center">
                <span style={{ color: isDarkMode ? 'white' : 'black' }}>Loading...</span>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('fetching_details') || 'Fetching details...'}
                </p>
              </div>
            ) : (
              <>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
                  {t('enter_complete_address') || 'Enter complete address!'}
                </p>
                <div className="mb-2">
                  <label className="block text-sm" style={{ color: isDarkMode ? 'lightgray' : 'gray' }}>
                    {t('city') || 'City'}
                  </label>
                  <input
                    className="w-full h-10 border rounded-md px-3 text-sm"
                    style={{
                      borderColor: isDarkMode ? 'lightgray' : '#ccc',
                      backgroundColor: isDarkMode ? '#2D3748' : '#fff',
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                    placeholder={t('city_placeholder') || 'City'}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  {cityError && <p className="text-red-500 text-xs">{cityError}</p>}
                </div>
                <div className="mb-2">
                  <label className="block text-sm" style={{ color: isDarkMode ? 'lightgray' : 'gray' }}>
                    {t('area') || 'Area'}
                  </label>
                  <input
                    className="w-full h-10 border rounded-md px-3 text-sm"
                    style={{
                      borderColor: isDarkMode ? 'lightgray' : '#ccc',
                      backgroundColor: isDarkMode ? '#2D3748' : '#fff',
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                    placeholder={t('area_placeholder') || 'Area'}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                  {areaError && <p className="text-red-500 text-xs">{areaError}</p>}
                </div>
                <div className="mb-2">
                  <label className="block text-sm" style={{ color: isDarkMode ? 'lightgray' : 'gray' }}>
                    {t('pincode') || 'Pincode'}
                  </label>
                  <input
                    className="w-full h-10 border rounded-md px-3 text-sm"
                    style={{
                      borderColor: isDarkMode ? 'lightgray' : '#ccc',
                      backgroundColor: isDarkMode ? '#2D3748' : '#fff',
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                    placeholder={t('pincode_placeholder') || 'Pincode'}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  {pincodeError && <p className="text-red-500 text-xs">{pincodeError}</p>}
                </div>
                <div className="mb-2">
                  <label className="block text-sm" style={{ color: isDarkMode ? 'lightgray' : 'gray' }}>
                    {t('phone_number') || 'Phone number'}
                  </label>
                  <input
                    className="w-full h-10 border rounded-md px-3 text-sm"
                    style={{
                      borderColor: isDarkMode ? 'lightgray' : '#ccc',
                      backgroundColor: isDarkMode ? '#2D3748' : '#fff',
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                    placeholder={t('alternate_phone') || 'Alternate phone number'}
                    value={alternatePhoneNumber}
                    onChange={(e) => setAlternatePhoneNumber(e.target.value)}
                  />
                  {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
                </div>
                <div className="mb-2">
                  <label className="block text-sm" style={{ color: isDarkMode ? 'lightgray' : 'gray' }}>
                    {t('name') || 'Name'}
                  </label>
                  <input
                    className="w-full h-10 border rounded-md px-3 text-sm"
                    style={{
                      borderColor: isDarkMode ? 'lightgray' : '#ccc',
                      backgroundColor: isDarkMode ? '#2D3748' : '#fff',
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                    placeholder={t('alternate_name') || 'Alternate name'}
                    value={alternateName}
                    onChange={(e) => setAlternateName(e.target.value)}
                  />
                  {nameError && <p className="text-red-500 text-xs">{nameError}</p>}
                </div>
                <button onClick={handleBookCommander} className="w-full bg-orange-600 py-3 rounded-md mt-4">
                  <span className="text-white text-lg">{t('book_commander') || 'Book Commander'}</span>
                </button>
                <button onClick={() => setShowMessageBox(false)} className="absolute top-2 right-2 text-xl" style={{ color: isDarkMode ? 'white' : 'black' }}>
                  ×
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Crosshairs Button */}
      <div className={`fixed right-5 ${'bottom-[290px]'} rounded-full p-3 shadow-md`} style={{ backgroundColor: isDarkMode ? '#2D3748' : '#fff' }}>
        <button onClick={handleCrosshairsPress}>
          <FaCrosshairs size={24} style={{ color: isDarkMode ? '#A0AEC0' : '#555' }} />
        </button>
      </div>
    </div>
  );
};

export default UserLocation;
