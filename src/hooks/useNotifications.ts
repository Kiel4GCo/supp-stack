import { useState, useEffect, useCallback } from 'react';

export type NotificationPermission = 'default' | 'granted' | 'denied';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'denied' as NotificationPermission;

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      return result as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied' as NotificationPermission;
    }
  }, [isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return null;

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  const scheduleReminder = useCallback((
    supplementName: string,
    reminderTime: string,
    days: string[]
  ) => {
    if (!isSupported || permission !== 'granted') return null;

    // Parse the time
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

    // Check if today is a reminder day
    if (!days.includes(currentDay)) return null;

    // Calculate milliseconds until reminder
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);
    
    const msUntilReminder = reminderDate.getTime() - now.getTime();
    
    // Only schedule if the time is in the future
    if (msUntilReminder <= 0) return null;

    const timeoutId = setTimeout(() => {
      sendNotification(`Time to take ${supplementName}`, {
        body: `It's ${reminderTime} - your scheduled reminder for ${supplementName}`,
        tag: `reminder-${supplementName}`,
        requireInteraction: true,
      });
    }, msUntilReminder);

    return timeoutId;
  }, [isSupported, permission, sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleReminder,
  };
}
