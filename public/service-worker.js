self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/fauget.png',
    badge: '/fauget.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('PlantPal', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});