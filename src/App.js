// App.js
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './i18n/i18n';
import ServiceApp from './Screens/ServiceApp';
import PaintingServices from './Screens/Indiv';
import SingleService from './Screens/SingleService';
import LoginScreen from './Components/LoginScreen';
import VerificationScreen from './Components/VerificationScreen';
import OrderScreen from './Components/OrderScreen';
import UserLocation from './Components/UserLocation';
import LocationSearch from './Components/LocationSearch';
import WaitingUser from './Components/WaitingUser';
import RecentServices from './Components/RecentServices';
import ServiceTrackingListScreen from './Components/ServiceTrackingListScreen';
import ProfileScreen from './Components/ProfileScreen';
import LanguageSelector from './Components/LanguageSelector';
import { FaHome, FaClipboard, FaWallet, FaUser } from 'react-icons/fa';
import EditProfile from './Components/EditProfile';
import HelpScreen from './Components/HelpScreen';
import MyReferrals from './Components/MyReferrals';
import ReferralScreen from './Components/ReferralScreen';
import AboutCS from './Components/AboutCS';
import AccountDelete from './Components/AccountDelete';
import ServiceBookingItem from './Components/ServiceBookingItem';
import ServiceBookingOngoingItem from './Components/ServiceBookingOngoingItem';
import ServiceTrackingItemScreen from './Components/ServiceTrackingItemScreen';
import Navigation from './Components/Navigation';
import ServiceInProgressScreen from './Components/ServiceInProgressScreen';
import Payment from './Components/Paymentscreen';
import { requestFCMToken,handleNotificationNavigation  } from './firebase';
import SearchItem from './Components/SearchItem';
import { getPendingNotifications, clearPendingNotifications } from './indexedDBHelpers';
import ScrollToTop from './Components/ScrollToTop';
import PrivacyPolicyPage from './Components/PrivacyPolicyPage';

// --- TabNavigator Component ---
function TabNavigator() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow py-2 flex justify-around">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive
            ? 'flex flex-col items-center text-orange-500'
            : 'flex flex-col items-center text-gray-500'
        }
      >
        <FaHome size={24} />
        <span className="text-xs">Home</span>
      </NavLink>
      <NavLink
        to="/bookings"
        className={({ isActive }) =>
          isActive
            ? 'flex flex-col items-center text-orange-500'
            : 'flex flex-col items-center text-gray-500'
        }
      >
        <FaClipboard size={24} />
        <span className="text-xs">Bookings</span>
      </NavLink>
      <NavLink
        to="/tracking"
        className={({ isActive }) =>
          isActive
            ? 'flex flex-col items-center text-orange-500'
            : 'flex flex-col items-center text-gray-500'
        }
      >
        <FaWallet size={24} />
        <span className="text-xs">Tracking</span>
      </NavLink>
      <NavLink
        to="/account"
        className={({ isActive }) =>
          isActive
            ? 'flex flex-col items-center text-orange-500'
            : 'flex flex-col items-center text-gray-500'
        }
      >
        <FaUser size={24} />
        <span className="text-xs">Account</span>
      </NavLink>
    </div>
  );
}

// --- AppContent Component ---
function AppContent() {
  const location = useLocation();
  // Define routes where the TabNavigator should be visible.
  const tabRoutes = ['/', '/bookings', '/tracking', '/account'];

  return (
    <>
      <div className="pb-16 overflow-hidden">
        <Routes>
          <Route path="/" element={<ServiceApp />} />

          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          
          <Route path="/search" element={<SearchItem />} />
          <Route path="/ServiceTrackingItem" element={<ServiceTrackingItemScreen />} />
          <Route path="/UserNavigation" element={<Navigation />} />
          <Route path="/worktimescreen" element={<ServiceInProgressScreen />} />
          <Route path="/Paymentscreen" element={<Payment />} />
          <Route path="/referral" element={<ReferralScreen />} />
          <Route path="/about-cs" element={<AboutCS />} />
          <Route path="/delete-account" element={<AccountDelete />} />
          <Route path="/serviceBookingItem" element={<ServiceBookingItem />} />
          <Route path="/ServiceBookingOngoingItem" element={<ServiceBookingOngoingItem />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/help" element={<HelpScreen />} />
          <Route path="/serviceCategory" element={<PaintingServices />} />
          <Route path="/serviceBooking" element={<SingleService />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/verification" element={<VerificationScreen />} />
          <Route path="/orderScreen" element={<OrderScreen />} />
          <Route path="/user-location" element={<UserLocation />} />
          <Route path="/LocationSearch" element={<LocationSearch />} />
          <Route path="/userwaiting" element={<WaitingUser />} />
          <Route path="/bookings" element={<RecentServices />} />
          <Route path="/tracking" element={<ServiceTrackingListScreen />} />
          <Route path="/account" element={<ProfileScreen />} />
          <Route path="/language-selector" element={<LanguageSelector />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {tabRoutes.includes(location.pathname) && <TabNavigator />}
    </>
  );
}

// --- App Component ---
function App() {
  const navigate = useNavigate();

  // Process pending notifications when the document becomes visible.
  // const handleVisibilityChange = async () => {
  //   if (document.visibilityState === 'visible') {
  //     try {
  //       const notifications = await getPendingNotifications();
  //       notifications.forEach(({ screen, notification_id }) => {
  //         if (screen && notification_id) {
  //           navigate(screen, { state: { encodedId: btoa(notification_id) } });
  //         }
  //       });
  //       await clearPendingNotifications();
  //     } catch (error) {
  //       console.error('Notification processing failed:', error);
  //     }
  //   }
  // };

  const handleVisibilityChange = () => {
    console.log(`[APP] Visibility changed to: ${document.visibilityState}`);
    
    if (document.visibilityState === 'visible') {
      console.log('[APP] App entered foreground, checking notifications');
      getPendingNotifications()
        .then(notifications => {
          console.log(`[APP] Processing ${notifications.length} pending notifications`);
          notifications.forEach(notification => {
            handleNotificationNavigation(navigate, notification);
          });
          return clearPendingNotifications();
        })
        .then(() => console.log('[APP] Notifications processed and cleared'))
        .catch(error => console.error('[APP] Error processing notifications:', error));
    }
  };



  useEffect(() => {
    requestFCMToken(navigate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);


  return <AppContent />;
}

// --- AppWrapper Component ---
function AppWrapper() {
  return (
    <ThemeProvider>
      <Router>
       <ScrollToTop />
        <App />
      </Router>
    </ThemeProvider>
  );
}

export default AppWrapper;
