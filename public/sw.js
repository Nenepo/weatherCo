/* Basic service worker for push notifications and click handling */

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { title: 'Weather Update', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Weather Update';
  const options = {
    body: payload.body || 'Here is your daily weather update.',
    icon: payload.icon || '/vite.svg',
    badge: payload.badge || '/vite.svg',
    data: { url: payload.url || '/' },
    tag: payload.tag || 'weather-daily',
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});


