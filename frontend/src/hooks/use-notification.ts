import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { Config } from '@/lib/config';
import { subscribeNotification } from '@/services/notification';

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const navigate = useNavigate();

  // On mount set permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission function & also register the service worker if granted
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      console.error('This browser does not support notifications');
      return;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    setPermission(permission);

    // If granted, gas
    if (permission === 'granted') {
      await subscribeToNotification();
    }
  };

  // Register service worker function
  const subscribeToNotification = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: Config.getInstance().get('VAPID_PUBLIC_KEY'),
      });

      // Send subscription to server
      await subscribeNotification(subscription);
    } catch (error) {
      toast.error('Error registering service worker');
      console.error('Error registering service worker:', error);
    }
  };

  // Listen for new messages using service worker
  useEffect(() => {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { url } = event.data;

      if (url) {
        navigate({ to: url });
      }
    });
  }, [navigate]);

  return {
    permission,
    requestPermission,
    subscribeToNotification,
  };
}
