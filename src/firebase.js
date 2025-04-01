import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';

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

// Unified navigation handler
export const handleNotificationNavigation = (navigate, data) => {
  if (!data) return;
  
  const { screen, notification_id } = data;
  if (!screen || !notification_id) return;

  const encodedId = btoa(notification_id);
  navigate(screen.toLowerCase() === 'home' ? '/' : screen, { 
    state: { encodedId } 
  });
};

// Token management and foreground handler
export const requestFCMToken = async (navigate) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }
    
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });
    
    console.log('FCM Token:', token);
    
    const cs_token = localStorage.getItem('cs_token'); // User auth token stored after login
    const storedFcm = localStorage.getItem('fcm_token');
    
    if (!storedFcm && cs_token) {
      localStorage.setItem('fcm_token', token);
      await axios.post(
        'https://backend.clicksolver.com/api/user/store-fcm-token',
        { fcmToken: token },
        { headers: { Authorization: `Bearer ${cs_token}` } }
      );
      console.log('FCM token stored and sent to backend.');
    }
    
    // Listen for foreground messages.
    onMessage(messaging, (payload) => {
      console.log('Foreground notification received:', payload);
      const data = payload.data;
      // Use our custom navigation handler.
      handleNotificationNavigation(navigate, data);
    });
  } catch (error) {
    console.error('Error obtaining FCM token or handling messages:', error);
  }
};