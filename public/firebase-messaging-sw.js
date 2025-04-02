importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBkLOXcokAA9gkzyyzDHCDfMoYJCc9q9iQ",
  authDomain: "clicksolver-fa1a6.firebaseapp.com",
  storageBucket: "clicksolver-fa1a6.firebasestorage.app",
  projectId: "clicksolver-fa1a6",
  messagingSenderId: "217390086215",
  appId: "1:217390086215:web:ad768dcc136217d9015962",
  measurementId: "G-DXSNFC5J88",
  vapidKey: "BJmb2ElsXTf7tsAthRqASNvL4CkvCOOFnoY4rpEY19FFuAhdztvO6uOfCjhX2BfIOCKdOmH8pdw7JAkh-WNjddE"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  // Forward the payload to all client windows so the main app can log it
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      console.log('[SW] Forwarding message to client:', client.url);
      client.postMessage({
        type: 'FCM_BACKGROUND_MESSAGE',
        payload,
      });
    });
  });

  // Prepare notification details
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/firebase-logo.png',
    data: payload.data,
  };

  console.log('[SW] Notification details:', notificationTitle, notificationOptions);

  // Store the notification in IndexedDB
  storeNotification(payload.data);

  console.log('[SW] Showing system notification');
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Function to store notifications in IndexedDB
function storeNotification(data) {
  console.log('[SW] Storing notification in IndexedDB:', data);
  
  // Updated the version to 2 to match the existing database version.
  const request = indexedDB.open('notificationDB', 2);

  request.onupgradeneeded = (event) => {
    console.log('[SW] Upgrading IndexedDB version...');
    const db = event.target.result;
    if (!db.objectStoreNames.contains('pendingNotifications')) {
      console.log('[SW] Creating object store: pendingNotifications');
      db.createObjectStore('pendingNotifications', { keyPath: 'id', autoIncrement: true });
    } else {
      console.log('[SW] Object store already exists: pendingNotifications');
    }
  };

  request.onsuccess = (event) => {
    console.log('[SW] IndexedDB opened successfully');
    const db = event.target.result;
    const tx = db.transaction('pendingNotifications', 'readwrite');
    const store = tx.objectStore('pendingNotifications');

    const notificationData = {
      screen: data?.screen,
      notification_id: data?.notification_id,
      timestamp: Date.now()
    };

    console.log('[SW] Adding notification data to store:', notificationData);
    const addRequest = store.add(notificationData);

    addRequest.onsuccess = () => {
      console.log('[SW] Notification stored successfully:', notificationData);
    };

    addRequest.onerror = (e) => {
      console.error('[SW] Error storing notification:', e.target.error);
    };
  };

  request.onerror = (event) => {
    console.error('[SW] Database open error:', event.target.error);
  };
}


// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.data);
  event.notification.close();

  const { screen, notification_id } = event.notification.data;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      console.log(`[SW] Navigating to: ${screen} (ID: ${notification_id})`);
      const targetPath = screen || '/';
      const encodedId = btoa(notification_id);

      for (const client of clientList) {
        if (client.url.includes(targetPath) && 'focus' in client) {
          console.log('[SW] Found existing client, focusing');
          return client.focus().then(() => {
            client.postMessage({
              type: 'NAVIGATE',
              path: targetPath,
              state: { encodedId }
            });
          });
        }
      }
      
      if (self.clients.openWindow) {
        console.log('[SW] Opening new window for target path:', targetPath);
        return self.clients.openWindow(`${self.origin}${targetPath}`);
      }
    })
  );
});
