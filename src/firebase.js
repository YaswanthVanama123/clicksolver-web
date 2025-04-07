import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';
import { getPendingNotifications, clearPendingNotifications } from './indexedDBHelpers';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const handleNotificationNavigation = (navigate, data) => {
  console.log('[FCM] Handling notification navigation:', data);
  if (!data) return;
  
  const { screen, notification_id } = data;
  if (!screen || !notification_id) {
    console.warn('[FCM] Invalid notification data');
    return;
  }

  console.log(`[FCM] Navigating to: ${screen} with ID: ${notification_id}`);
  const encodedId = btoa(notification_id);
  const targetPath = screen.toLowerCase() === 'home' ? '/' : screen;
  navigate(targetPath, { state: { encodedId } });
  
}; 

export const requestFCMToken = async (navigate) => {
  try {
    console.log('[FCM] Current permission:', Notification.permission);

    if (Notification.permission === 'denied') {
      alert('Notifications are blocked. Please enable them in your browser settings.');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notifications are required to receive updates. Please allow notifications.');
        return;
      }
    }

    console.log('[FCM] Registering service worker');
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    console.log('[FCM] Getting FCM token');
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log('[FCM] Token obtained:', token);

      const cs_token = localStorage.getItem('cs_token');
      const storedFcm = localStorage.getItem('fcm_token');

      if (!storedFcm && cs_token) {
        console.log('[FCM] Storing new FCM token to server');
        await axios.post(
          'https://backend.clicksolver.com/api/user/store-fcm-token',
          { fcmToken: token },
          { headers: { Authorization: `Bearer ${cs_token}` } }
        );
        localStorage.setItem('fcm_token', token);
        console.log('[FCM] Token stored successfully');
      }

      // Foreground message listener
      console.log('[FCM] Listening for foreground messages');
      onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message received:', payload);
        handleNotificationNavigation(navigate, payload.data);
      });
    } else {
      console.warn('[FCM] Failed to get FCM token');
    }

  } catch (error) {
    console.error('[FCM] Error requesting FCM token:', error);
  }
};