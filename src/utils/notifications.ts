import { Plant } from '../types/plantTypes';
import { supabase } from '../lib/supabase';

// Check if running in StackBlitz
const isStackBlitz = window.location.hostname.includes('stackblitz');

// Check if browser supports notifications
const isNotificationSupported = 'Notification' in window && 'serviceWorker' in navigator;

// Session-level flag to track if notification check has run in current session
let notificationCheckCompletedForSession = false;

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

interface NotificationHistory {
  lastNotified: string;
  count: number;
}

// Session storage to track which plants have been notified in current session
const sessionNotifiedPlants = new Set<string>();

// Get the notification history from localStorage with improved type safety
const getNotificationHistory = (): Record<string, NotificationHistory> => {
  try {
    const history = localStorage.getItem('plantNotificationHistory');
    return history ? JSON.parse(history) : {};
  } catch (error) {
    console.error('Error parsing notification history:', error);
    return {};
  }
};

// Save notification history to localStorage with validation
const saveNotificationHistory = (history: Record<string, NotificationHistory>) => {
  try {
    localStorage.setItem('plantNotificationHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving notification history:', error);
  }
};

// Check if a notification has been sent today for a specific plant
const hasNotifiedToday = (plantId: string): boolean => {
  try {
    // Check if already notified in current session
    if (sessionNotifiedPlants.has(plantId)) {
      return true;
    }

    const history = getNotificationHistory();
    const record = history[plantId];
    
    if (!record) return false;
    
    const today = new Date();
    const lastNotificationDate = new Date(record.lastNotified);
    
    return today.toDateString() === lastNotificationDate.toDateString();
  } catch (error) {
    console.error('Error checking notification history:', error);
    return false;
  }
};

// Update notification history for a plant with count tracking
const updateNotificationHistory = (plantId: string) => {
  try {
    // Add to session tracking
    sessionNotifiedPlants.add(plantId);

    const history = getNotificationHistory();
    const today = new Date();
    const record = history[plantId] || { lastNotified: '', count: 0 };
    
    const lastNotificationDate = record.lastNotified ? new Date(record.lastNotified) : null;
    
    if (!lastNotificationDate || today.toDateString() !== lastNotificationDate.toDateString()) {
      record.count = 1;
    } else {
      record.count++;
    }
    
    history[plantId] = {
      lastNotified: today.toISOString(),
      count: record.count
    };
    
    saveNotificationHistory(history);
    console.log(`Updated notification history for plant ${plantId}:`, history[plantId]);
  } catch (error) {
    console.error('Error updating notification history:', error);
  }
};

// Show a browser notification with improved error handling and logging
const showBrowserNotification = (title: string, body: string, plantId: string) => {
  if (!isNotificationSupported || Notification.permission !== 'granted') {
    console.log('Notifications not supported or permission not granted');
    return;
  }

  try {
    if (hasNotifiedToday(plantId)) {
      console.log(`Already notified about plant ${plantId} today, skipping notification`);
      return;
    }

    new Notification(title, {
      body,
      icon: '/fauget.png',
      tag: `plant-${plantId}`, // Prevent duplicate notifications
      renotify: false // Don't show duplicate notifications
    });

    updateNotificationHistory(plantId);
    console.log(`Notification sent for plant ${plantId}`);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Check if a plant needs watering today and show notification
export const checkAndNotifyPlantWatering = async (plant: Plant) => {
  // Skip if already checked in this session
  if (sessionNotifiedPlants.has(plant.id)) {
    return;
  }

  if (!isNotificationSupported) {
    console.log('Notifications not supported');
    return;
  }

  try {
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
      showBrowserNotification(
        'Time to Water Your Plant!',
        `${plant.name} needs watering today! 🌿💧`,
        plant.id
      );
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
      showBrowserNotification(
        'Time to Water Your Plant!',
        `${plant.name} needs watering today! 🌿💧`,
        plant.id
      );

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
  } catch (error) {
    console.error('Error checking plant watering status:', error);
  }
};

// New function to check all plants once per session
export const checkAllPlantsOnce = async (plants: Plant[]) => {
  // Skip if already checked in this session
  if (notificationCheckCompletedForSession) {
    console.log('Notification check already completed for this session');
    return;
  }
  
  // Mark session check as completed
  notificationCheckCompletedForSession = true;
  
  console.log('Performing one-time session check for all plants');
  
  // Process all plants
  for (const plant of plants) {
    await checkAndNotifyPlantWatering(plant);
  }
  
  console.log('Session notification check completed');
};

// Reset session check (useful for testing or manual triggers)
export const resetSessionCheck = () => {
  notificationCheckCompletedForSession = false;
  sessionNotifiedPlants.clear();
  console.log('Session notification check status reset');
};
