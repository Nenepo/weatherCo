const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed', error);
    return null;
  }
}

export async function ensureNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const status = await Notification.requestPermission();
    return status === 'granted';
  } catch (error) {
    console.error('Notification permission request failed', error);
    return false;
  }
}

export async function subscribeUserToPush(registration) {
  if (!registration || !registration.pushManager) return null;
  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;
    const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
    return subscription;
  } catch (error) {
    console.error('Push subscription failed', error);
    return null;
  }
}

export async function initPushAndRegisterOnServer(userMeta) {
  const registration = await registerServiceWorker();
  if (!registration) return false;
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) return false;
  const subscription = await subscribeUserToPush(registration);
  if (!subscription) return false;

  try {
    await fetch(import.meta.env.VITE_PUSH_SERVER_URL + '/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, meta: userMeta }),
    });
    return true;
  } catch (error) {
    console.error('Failed to register subscription on server', error);
    return false;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


