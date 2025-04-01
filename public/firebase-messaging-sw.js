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

// Utility to store notifications
function storeNotification(notificationData) {
  const request = indexedDB.open('notificationDB', 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('pendingNotifications')) {
      db.createObjectStore('pendingNotifications', { keyPath: 'id', autoIncrement: true });
    }
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction('pendingNotifications', 'readwrite');
    const store = transaction.objectStore('pendingNotifications');
    store.add({
      screen: notificationData.screen,
      notification_id: notificationData.notification_id,
      timestamp: Date.now()
    });
  };
}

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/firebase-logo.png',
    data: {
      screen: payload.data?.screen || '/',
      notification_id: payload.data?.notification_id
    }
  };

  storeNotification(payload.data);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { screen, notification_id } = event.notification.data;
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const targetPath = screen || '/';
      const encodedId = btoa(notification_id);
      
      for (const client of clientList) {
        if (client.url.includes(targetPath) && 'focus' in client) {
          return client.focus().then(() => {
            client.postMessage({ type: 'NAVIGATE', path: targetPath, state: { encodedId } });
          });
        }
      }
      
      if (self.clients.openWindow) {
        return self.clients.openWindow(`${self.origin}${targetPath}`);
      }
    })
  );
});