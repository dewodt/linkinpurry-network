import { useNavigate } from '@tanstack/react-router';

import { useEffect, useState } from 'react';

import { Config } from '@/lib/config';
import { subscribeNotification } from '@/services/notification';

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const navigate = useNavigate();

  // // On mount ask for permission
  // useEffect(() => {
  //   if ('Notification' in window) {
  //     setPermission(Notification.permission);
  //   }
  // }, []);

  // Request notification permission function
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    // if granted, register service worker
    if (permission === 'granted') {
      await registerServiceWorker();
    }
  };

  // Register service worker function
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: Config.getInstance().get('VAPID_PUBLIC_KEY'),
      });

      // Send subscription to server
      await subscribeNotification(subscription);
    } catch (error) {
      console.error('Error registering service worker:', error);
    }
  };

  // Listen for new messages using service worker
  useEffect(() => {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, url } = event.data;

      if (url) {
        navigate({ to: url });
      }
    });
  }, [navigate]);

  return {
    permission,
    requestPermission,
  };
}
