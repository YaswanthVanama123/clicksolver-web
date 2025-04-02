// indexedDBHelpers.js

// Helper function to open the database and create the object store if necessary
export const openNotificationDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('notificationDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create the object store if it doesn't already exist
      if (!db.objectStoreNames.contains('pendingNotifications')) {
        db.createObjectStore('pendingNotifications', { keyPath: 'id', autoIncrement: true });
        console.log('[DB] Created object store: pendingNotifications');
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('[DB] Database open error:', event.target.error);
      reject(event.target.error);
    };
  });
};

export const getPendingNotifications = () => {
  console.log('[DB] Fetching pending notifications');
  return new Promise((resolve, reject) => {
    openNotificationDB()
      .then((db) => {
        const tx = db.transaction('pendingNotifications', 'readonly');
        const store = tx.objectStore('pendingNotifications');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = (e) => {
          console.log(`[DB] Found ${e.target.result.length} pending notifications`);
          resolve(e.target.result);
        };

        getAllRequest.onerror = (e) => {
          console.error('[DB] Error fetching notifications:', e.target.error);
          reject(e.target.error);
        };
      })
      .catch(reject);
  });
};

export const clearPendingNotifications = () => {
  console.log('[DB] Clearing all notifications');
  return new Promise((resolve, reject) => {
    openNotificationDB()
      .then((db) => {
        const tx = db.transaction('pendingNotifications', 'readwrite');
        const clearRequest = tx.objectStore('pendingNotifications').clear();

        clearRequest.onsuccess = () => {
          console.log('[DB] Notifications cleared successfully');
          resolve();
        };

        clearRequest.onerror = (e) => {
          console.error('[DB] Error clearing notifications:', e.target.error);
          reject(e.target.error);
        };
      })
      .catch(reject);
  });
};
