import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import QuickSearch from '../Components/QuickSearch';
import Lottie from 'lottie-react';
import cardsLoading from '../assets/cardsLoading.json';
import { FiSunset, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { MdNightsStay } from 'react-icons/md';
import { FaSun, FaBell, FaQuestionCircle, FaStar, FaRegStar } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function ServiceApp() {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState(null);
  const [messageBoxDisplay, setMessageBoxDisplay] = useState(false);
  const [trackScreen, setTrackScreen] = useState([]);
  const [name, setName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [decodedId, setDecodedId] = useState(null);
  const scrollViewRef = useRef(null);

  // Screen width for responsiveness
  const width = window.innerWidth;
  const isTablet = width > 600;

  // Hard-coded special offers
  const specialOffers = useMemo(
    () => [
      {
        id: '1',
        title: '20%',
        subtitle: t('new_user_special') || 'New User Special',
        description:
          t('new_user_special_description') ||
          'New users get a 20% discount on their first booking.',
        imageBACKENDAP: 'https://i.postimg.cc/HsGnL9F1/58d3ebe039b0649cfcabe95ae59f4328.png',
        bgClass: 'bg-yellow-100',
        textColor: 'text-orange-600',
      },
      {
        id: '2',
        title: '50%',
        subtitle: t('summer_sale') || 'Summer Sale',
        description:
          t('summer_sale_description') ||
          'Get a 50% discount on all services booked during summer.',
        imageBACKENDAP: 'https://i.postimg.cc/rwtnJ3vB/b08a4579e19f4587bc9915bc0f7502ee.png',
        bgClass: isDarkMode ? 'bg-white' : 'bg-green-100',
        textColor: 'text-green-600',
      },
      {
        id: '3',
        title: '30%',
        subtitle: t('refer_a_friend') || 'Refer a Friend',
        description:
          t('refer_a_friend_description') ||
          'Refer a friend and get 30% off on your next service booking.',
        imageBACKENDAP: 'https://i.postimg.cc/Kzwh9wZC/4c63fba81d3b7ef9ca889096ad629283.png',
        bgClass: 'bg-blue-100',
        textColor: 'text-blue-600',
      },
    ],
    [isDarkMode, t]
  );

  // Attempt to translate user name if needed
  const translateUserName = async (userName, targetLang) => {
    if (targetLang.toLowerCase() === 'en') return userName;
    try {
      const response = await axios.post('https://backend.clicksolver.com/api/translate', {
        text: userName,
        fromLang: 'en',
        toLang: targetLang,
      });
      if (response.data && response.data.translatedText) {
        return response.data.translatedText;
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
    return userName;
  };

  // If URL has an encodedId param, decode it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedId = params.get('encodedId');
    if (encodedId) {
      try {
        const decoded = atob(encodedId);
        setDecodedId(decoded);
        setModalVisible(true);
      } catch (error) {
        console.error('Failed to decode encodedId:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchTrackDetails();
    setGreetingBasedOnTime();
  }, []);

  // Fetch service categories
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://backend.clicksolver.com/api/servicecategories');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tracking details
  const fetchTrackDetails = async () => {
    try {
      const cs_token = localStorage.getItem('cs_token');
      if (cs_token) {
        const response = await axios.get('https://backend.clicksolver.com/api/user/track/details', {
          headers: { Authorization: `Bearer ${cs_token}` },
        });
        const track = response?.data?.track || [];
        const { user, profile } = response.data;
        const targetLang = i18n.language || 'en';
        const translatedName = await translateUserName(user || response.data, targetLang);

        setName(translatedName);
        setProfile(profile);
        setMessageBoxDisplay(track.length > 0);
        setTrackScreen(track);
      }
    } catch (error) {
      console.error('Error fetching track details:', error);
    }
  };

  // Set greeting
  const setGreetingBasedOnTime = () => {
    const currentHour = new Date().getHours();
    let greetingMessage = t('good_day') || 'Good Day';
    let icon = <FaSun size={20} className="text-orange-600" />;
    if (currentHour < 12) {
      greetingMessage = t('good_morning') || 'Good Morning';
      icon = <FaSun size={20} className="text-orange-600" />;
    } else if (currentHour < 17) {
      greetingMessage = t('good_afternoon') || 'Good Afternoon';
      icon = <FiSunset size={20} className="text-orange-600" />;
    } else {
      greetingMessage = t('good_evening') || 'Good Evening';
      icon = <MdNightsStay size={20} className="text-gray-500" />;
    }
    setGreeting(greetingMessage);
    setGreetingIcon(icon);
  };

  // Navigation
  const handleNotification = () => {
    navigate('/notifications');
  };

  const handleHelp = () => {
    navigate('/help');
  };

  const handleBookCommander = (serviceName, id) => {
    navigate('/serviceCategory', { state: { serviceObject: serviceName, id } });
  };

  // Render special offers with hidden scrollbar
// Inside your ServiceApp component:

// Inside your ServiceApp component:

const renderSpecialOffers = () => (
  <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap hide-scrollbar gap-4">
    {specialOffers.map((offer) => (
      <div
        key={offer.id}
        className={`
          flex flex-row justify-between items-center
          rounded-lg p-4 flex-shrink-0
          ${offer.bgClass}
          /* For small screens: 80% width with 10% margin for peek effect */
          w-[85%] mr-[5%]
          /* For medium+ screens: revert to auto width, no forced margin */
          md:w-auto md:mr-0
        `}
        style={{ minWidth: '14rem' }} // Ensures a minimum width on larger screens
      >
        {/* Text Container */}
        <div className="flex-1 mr-2">
          <p
            className={`
              /* Smaller heading on small screens, bigger on md+ */
              text-2xl md:text-4xl font-bold
              ${offer.textColor}
              whitespace-normal break-words
            `}
          >
            {offer.title}
          </p>
          <p
            className="
              text-base md:text-lg font-semibold text-gray-600
              whitespace-normal break-words
            "
          >
            {offer.subtitle}
          </p>
          <p
            className="
              text-sm md:text-base text-gray-500
              whitespace-normal break-words
            "
          >
            {offer.description}
          </p>
        </div>

        {/* Image */}
        <img
          src={offer.imageBACKENDAP}
          alt="Offer"
          className="
            self-end
            /* Smaller image on small screens, bigger on md+ */
            w-24 h-24 md:w-36 md:h-36
            object-contain
          "
        />
      </div>
    ))}
  </div>
);



  // Render services
  const renderServices = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Lottie animationData={cardsLoading} loop style={{ width: 150, height: 150 }} />
        </div>
      );
    }
    return services.map((service) => (
      <div
        key={service.service_id}
        className={`flex flex-row items-center gap-4 p-4 mb-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <img
          src={service.service_urls || 'https://via.placeholder.com/100x100'}
          alt={service.service_name}
          className="w-40 h-28 rounded-lg object-cover"
        />
        <div className="flex-1 pl-4">
          <p
            className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            {t(`service_${service.service_id}`) || service.service_name}
          </p>
          <button
            className="mt-2 px-4 py-1 bg-orange-500 text-white rounded-lg"
            onClick={() => handleBookCommander(service.service_name, service.service_id)}
          >
            {t('book_now') || 'Book Now ➔'}
          </button>
        </div>
      </div>
    ));
  };

  // Submit feedback
  const submitFeedback = async () => {
    try {
      const cs_token = localStorage.getItem('cs_token');
      await axios.post(
        'https://backend.clicksolver.com/api/user/feedback',
        {
          rating,
          comment,
          notification_id: decodedId,
        },
        {
          headers: { Authorization: `Bearer ${cs_token}` },
        }
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      closeModal();
    }
  };

  const closeModal = () => {
    setRating(0);
    setComment('');
    setModalVisible(false);
  };

  return (
    // Apply hide-scrollbar to the root container to hide vertical scrollbar
    <div
      className={`min-h-screen p-4 hide-scrollbar ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white-100 text-gray-900'
      }`}
    >
      {/* Sticky Header */}
      <div
        className={`sticky top-0 z-50 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white-100'
        } pb-4 mb-4`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/account')}>
              {profile ? (
                <img src={profile} alt="User" className="w-8 h-8 rounded-full" />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex justify-center items-center mr-2 ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <p
                    className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {name?.charAt(0)?.toUpperCase() || 'U'}
                  </p>
                </div>
              )}
            </button>
            <div className="flex flex-col ml-2">
              <p
                className={`text-lg italic ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {greeting} <span>{greetingIcon}</span>
              </p>
              <p
                className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}
              >
                {name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/notifications')}>
              <FaBell
                size={23}
                className={isDarkMode ? 'text-white' : 'text-gray-800'}
              />
            </button>
            <button onClick={() => navigate('/help')}>
              <FaQuestionCircle
                size={23}
                className={isDarkMode ? 'text-white' : 'text-gray-800'}
              />
            </button>
          </div>
        </div>
        <QuickSearch />
      </div>

      {/* Main Content */}
      <div className={`${messageBoxDisplay ? 'mb-24' : ''}`}>
        {/* Special Offers */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p
              className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              {t('special_offers') || 'Special Offers'}
            </p>
          </div>
          {renderSpecialOffers()}
        </div>

        {/* Services */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p
              className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              {t('services') || 'Services'}
            </p>
          </div>
          {renderServices()}
        </div>
      </div>

      {/* Tracking Message Box */}
      {messageBoxDisplay && (
        <div
          className={`fixed bottom-14 left-0 right-0 z-50 p-4 ${
            isDarkMode ? 'bg-gray-700' : 'bg-white'
          } shadow`}
        >
          <div className="flex overflow-x-auto hide-scrollbar" ref={scrollViewRef}>
            {trackScreen.map((item, index) => (
              <div
                key={index}
                className={`flex flex-row justify-between items-center rounded-lg p-4 mr-4 cursor-pointer ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                style={{ width: trackScreen.length > 1 ? '80%' : '88%' }}
                onClick={() => {
                  navigate(item.screen, {
                    state: {
                      encodedId: item.encodedId,
                      area: item.area,
                      city: item.city,
                      pincode: item.pincode,
                      alternateName: item.alternateName,
                      alternatePhoneNumber: item.alternatePhoneNumber,
                      serviceBooked: item.serviceBooked,
                      location: item.location,
                      offer: item.offer,
                    },
                  });
                }}
              >
                <div className="flex flex-row items-center flex-1">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex justify-center items-center">
                    {item.screen === 'Paymentscreen' ? (
                      <i className="fab fa-paypal text-white text-xl"></i>
                    ) : item.screen === 'UserNavigation' ? (
                      <i className="fas fa-truck text-white text-xl"></i>
                    ) : item.screen === 'userwaiting' ? (
                      <FiSearch className="text-white text-xl" />
                    ) : item.screen === 'OtpVerification' ? (
                      <FiAlertCircle className="text-white text-xl" />
                    ) : item.screen === 'worktimescreen' ? (
                      <i className="fas fa-hammer text-white text-xl"></i>
                    ) : (
                      <FiAlertCircle className="text-white text-xl" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-lg font-bold truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {item.serviceBooked && item.serviceBooked.length > 0
                        ? item.serviceBooked
                            .slice(0, 2)
                            .map(
                              (service) =>
                                t(`singleService_${service.main_service_id}`) ||
                                service.serviceName
                            )
                            .join(', ') +
                          (item.serviceBooked.length > 2 ? '...' : '')
                        : t('service_booked', 'Service Booked')}
                    </p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {item.screen === 'Paymentscreen'
                        ? t('payment_in_progress', 'Payment in progress')
                        : item.screen === 'UserNavigation'
                        ? t('commander_on_the_way', 'Commander is on the way')
                        : item.screen === 'userwaiting'
                        ? t('user_waiting_for_help', 'User is waiting for help')
                        : item.screen === 'OtpVerification'
                        ? t('user_waiting_for_otp', 'User is waiting for OTP verification')
                        : item.screen === 'worktimescreen'
                        ? t('work_in_progress', 'Work in progress')
                        : t('nothing', 'Nothing')}
                    </p>
                  </div>
                </div>
                <div className="ml-3">
                  <i className="feather icon-chevrons-right text-gray-500 text-lg"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {isModalVisible && (
        <div
          className="fixed inset-0 flex justify-center items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className={`rounded-t-lg p-6 w-full max-w-md ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <button
              className="self-end bg-orange-500 rounded-full p-2"
              onClick={closeModal}
            >
              <i className="fas fa-times text-white"></i>
            </button>
            <h2
              className={`text-xl font-medium mt-2 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              {t('feedback_modal_title') || 'How was the quality of your Service?'}
            </h2>
            <p
              className={`text-sm text-center mt-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {t('feedback_modal_subtitle') ||
                'Your answer is anonymous. This helps us improve our service.'}
            </p>
            <div className="flex justify-center my-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="mx-1">
                  {star <= rating ? (
                    <FaStar size={30} className="text-yellow-400" />
                  ) : (
                    <FaRegStar size={30} className="text-gray-400" />
                  )}
                </button>
              ))}
            </div>
            <textarea
              className={`w-full h-20 p-2 border rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
              }`}
              placeholder={t('feedback_placeholder') || 'Write your comment here...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <div className="flex justify-between mt-4">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white'
                }`}
              >
                {t('feedback_not_now') || 'Not now'}
              </button>
              <button
                onClick={submitFeedback}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
              >
                {t('feedback_submit') || 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceApp;
