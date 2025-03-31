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
  vapidKey: "BJmb2ElsXTf7tsAthRqASNvL4CkvCOOFnoY4rpEY19FFuAhdztvO6uOfCjhX2BfIOCKdOmH8pdw7JAkh-WNjddE	"
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
