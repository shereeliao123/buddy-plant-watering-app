import { Plant } from '../types/plantTypes';
import { supabase } from '../lib/supabase';

// Check if running in StackBlitz
const isStackBlitz = window.location.hostname.includes('stackblitz');

// Check if browser supports notifications
const isNotificationSupported = 'Notification' in window && 'serviceWorker' in navigator;

// Get notification preference from Supabase users table
export const getNotificationPreference = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }

    const { data, error } = await supabase
      .from('users')
      .select('notifications_enabled')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }

    if (!data) {
      console.log('Creating new user preferences row');
      const { data: newData, error: insertError } = await supabase
        .from('users')
        .insert({ id: user.id, notifications_enabled: false })
        .select('notifications_enabled')
        .single();

      if (insertError) {
        console.error('Error creating notification preferences:', insertError);
        throw insertError;
      }
      return newData?.notifications_enabled ?? false;
    }

    return data?.notifications_enabled ?? false;
  } catch (error) {
    console.error('Error in getNotificationPreference:', error);
    return false;
  }
};

// Save notification preference to Supabase users table
export const setNotificationPreference = async (enabled: boolean): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      console.log('Creating new user row');
      const { error: insertError } = await supabase
        .from('users')
        .insert({ id: user.id, notifications_enabled: enabled });

      if (insertError) {
        console.error('Error creating user row:', insertError);
        throw insertError;
      }
    } else {
      console.log('Updating existing user row');
      const { error: updateError } = await supabase
        .from('users')
        .update({ notifications_enabled: enabled })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user row:', updateError);
        throw updateError;
      }
    }

    if (enabled) {
      await subscribeToPushNotifications();
    }

    return enabled;
  } catch (error) {
    console.error('Error in setNotificationPreference:', error);
    return getNotificationPreference();
  }
};

// Request notification permission from the browser
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported) {
    console.log('Notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission status:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Subscribe to push notifications
const subscribeToPushNotifications = async () => {
  if (!isNotificationSupported || isStackBlitz) {
    console.log('Push notifications not supported or running in StackBlitz');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Send subscription to Supabase Edge Function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        subscription,
        userId: user.id,
        message: 'Subscription successful!'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }

    console.log('Push notification subscription successful');
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
};

// Show a browser notification
const showBrowserNotification = (title: string, body: string) => {
  if (!isNotificationSupported || Notification.permission !== 'granted') {
    return;
  }

  new Notification(title, {
    body,
    icon: 'fauget.png'
  });
};

// Check if a plant needs watering today and show notification
export const checkAndNotifyPlantWatering = async (plant: Plant) => {
  if (!isNotificationSupported) {
    console.log('Notifications not supported');
    return;
  }

  const notificationsEnabled = await getNotificationPreference();
  if (!notificationsEnabled) {
    console.log('Notifications disabled by user');
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecentWateringDate = plant.wateringHistory?.[0];
  const lastWateredDate = mostRecentWateringDate ? new Date(mostRecentWateringDate) : null;

  console.log(`Checking plant: ${plant.name}`);
  console.log('Last watered date:', lastWateredDate?.toLocaleDateString() || 'Never');

  if (!lastWateredDate) {
    console.log(`${plant.name} has never been watered - sending notification`);
    showBrowserNotification('Time to Water Your Plant!', `${plant.name} needs watering today! 🌿💧`);
    return;
  }

  lastWateredDate.setHours(0, 0, 0, 0);

  const daysSinceWatered = Math.floor(
    (today.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysUntilWatering = plant.wateringFrequencyDays - daysSinceWatered;

  console.log({
    plantName: plant.name,
    lastWatered: lastWateredDate.toLocaleDateString(),
    daysSinceWatered,
    wateringFrequency: plant.wateringFrequencyDays,
    daysUntilWatering,
    needsWateringToday: daysUntilWatering <= 0
  });

  if (daysUntilWatering <= 0) {
    console.log(`Sending notification for ${plant.name}`);
    showBrowserNotification('Time to Water Your Plant!', `${plant.name} needs watering today! 🌿💧`);

    // Send push notification if available
    if (!isStackBlitz) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              subscription,
              userId: user.id,
              message: `${plant.name} needs watering today! 🌿💧`
            })
          });
        }
      }
    }
  }
};