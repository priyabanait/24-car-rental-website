# Firebase Push Setup (Frontend)

Steps to enable push notifications for the Next.js client:

1. Add Firebase config to environment (at least in `.env.local`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_WEB_PUSH_VAPID_KEY
```

2. Add the service worker `public/firebase-messaging-sw.js` (already added). Replace `firebaseConfig` placeholders with your values.

3. Use the helper `lib/firebaseClient.js` from your page or a hook:

Example (client-side):

```js
import { requestPermissionAndRegisterToken, initFirebaseClient } from '../lib/firebaseClient';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// call this when user logs in or sets preferences
await requestPermissionAndRegisterToken(firebaseConfig, vapidKey, '/api/notifications/register-token', { id: userId, type: 'driver' });
```

4. Listen for foreground messages:

```js
import { listenForegroundMessages } from '../lib/firebaseClient';
listenForegroundMessages(payload => {
  console.log('Foreground payload', payload);
  // show in-app banner / toast etc.
});
```

5. Install client dependency:

```
cd websitevenky
npm install
```

6. Test flow:
- Register a token with the backend.
- Use admin UI or `POST /api/notifications/admin/send-specific` to send a message to that user.
- Check notification delivery in foreground and background (service worker shows notification when app is in background).

