export const getPendingNotifications = () => {
    console.log('[DB] Fetching pending notifications');
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('notificationDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('pendingNotifications', 'readonly');
        const store = tx.objectStore('pendingNotifications');
        
        store.getAll().onsuccess = (e) => {
          console.log(`[DB] Found ${e.target.result.length} pending notifications`);
          resolve(e.target.result);
        };
        
        store.getAll().onerror = (e) => {
          console.error('[DB] Error fetching notifications:', e.target.error);
          reject(e.target.error);
        };
      };
      
      request.onerror = (event) => {
        console.error('[DB] Database open error:', event.target.error);
        reject(event.target.error);
      };
    });
  };
  
  export const clearPendingNotifications = () => {
    console.log('[DB] Clearing all notifications');
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('notificationDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('pendingNotifications', 'readwrite');
        
        tx.objectStore('pendingNotifications').clear().onsuccess = () => {
          console.log('[DB] Notifications cleared successfully');
          resolve();
        };
        
        tx.objectStore('pendingNotifications').clear().onerror = (e) => {
          console.error('[DB] Error clearing notifications:', e.target.error);
          reject(e.target.error);
        };
      };
      
      request.onerror = (event) => {
        console.error('[DB] Database open error:', event.target.error);
        reject(event.target.error);
      };
    });
  };