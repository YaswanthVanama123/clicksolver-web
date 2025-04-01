// indexedDBHelpers.js

/**
 * Retrieves all pending notifications stored in IndexedDB.
 * @returns {Promise<Array>} A promise that resolves with an array of notifications.
 */
// export function getPendingNotifications() {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open('notificationDB', 1);
//       request.onupgradeneeded = (event) => {
//         const db = event.target.result;
//         if (!db.objectStoreNames.contains('pendingNotifications')) {
//           db.createObjectStore('pendingNotifications', { keyPath: 'id', autoIncrement: true });
//         }
//       };
  
//       request.onsuccess = (event) => {
//         const db = event.target.result;
//         const transaction = db.transaction('pendingNotifications', 'readonly');
//         const store = transaction.objectStore('pendingNotifications');
//         const allNotificationsRequest = store.getAll();
//         allNotificationsRequest.onsuccess = () => {
//           resolve(allNotificationsRequest.result);
//         };
//         allNotificationsRequest.onerror = () => {
//           reject(allNotificationsRequest.error);
//         };
//       };
  
//       request.onerror = (event) => {
//         reject(event.target.error);
//       };
//     });
//   }
export const getPendingNotifications = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('notificationDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('pendingNotifications', 'readonly');
        const store = tx.objectStore('pendingNotifications');
        store.getAll().onsuccess = (e) => resolve(e.target.result);
      };
  
      request.onerror = (event) => reject(event.target.error);
    });
  };
  
  /**
   * Clears all pending notifications stored in IndexedDB.
   * @returns {Promise<void>} A promise that resolves when clearing is complete.
   */
//   export function clearPendingNotifications() {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open('notificationDB', 1);
//       request.onsuccess = (event) => {
//         const db = event.target.result;
//         const transaction = db.transaction('pendingNotifications', 'readwrite');
//         const store = transaction.objectStore('pendingNotifications');
//         const clearRequest = store.clear();
//         clearRequest.onsuccess = () => {
//           resolve();
//         };
//         clearRequest.onerror = () => {
//           reject(clearRequest.error);
//         };
//       };
//       request.onerror = (event) => {
//         reject(event.target.error);
//       };
//     });
//   }

export const clearPendingNotifications = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('notificationDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('pendingNotifications', 'readwrite');
        tx.objectStore('pendingNotifications').clear().onsuccess = resolve;
      };
  
      request.onerror = (event) => reject(event.target.error);
    });
  };
  