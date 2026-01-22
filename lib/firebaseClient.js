import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

let app = null;
let messaging = null;

export function initFirebaseClient(config) {
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }
  messaging = getMessaging(app);
  return { app, messaging };
}

export async function requestPermissionAndRegisterToken(config, vapidKey, registerEndpoint, userInfo) {
  initFirebaseClient(config);
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission not granted');

  const currentToken = await getToken(messaging, { vapidKey });
  if (!currentToken) throw new Error('Failed to get FCM token');

  // Send token to backend to register
  await fetch(registerEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: currentToken, userId: userInfo?.id, userType: userInfo?.type })
  });

  return currentToken;
}

export function listenForegroundMessages(cb) {
  if (!messaging) throw new Error('Messaging not initialized');
  onMessage(messaging, payload => cb(payload));
}