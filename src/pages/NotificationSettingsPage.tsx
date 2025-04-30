import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { ChevronLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotificationPreference, setNotificationPreference, requestNotificationPermission } from '../utils/notifications';

const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the current notification preference when the page loads
  useEffect(() => {
    const loadNotificationPreference = async () => {
      try {
        setError(null);
        const enabled = await getNotificationPreference();
        setNotificationsEnabled(enabled);
      } catch (error) {
        console.error('Error loading notification preferences:', error);
        setError('Failed to load notification preferences. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadNotificationPreference();
  }, []);

  const handleToggleNotifications = async () => {
    setUpdating(true);
    setError(null);

    try {
      const newState = !notificationsEnabled;
      
      if (newState) {
        // If enabling notifications, request permission first
        const granted = await requestNotificationPermission();
        if (!granted) {
          setError('Notification permission denied by browser');
          return;
        }
      }

      // Update the preference in Supabase
      const updatedState = await setNotificationPreference(newState);
      setNotificationsEnabled(updatedState);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      setError('Failed to update notification preferences. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-buddy-pink">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-buddy-brown hover:text-buddy-green transition-colors duration-200 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="ml-1">Back to My Plants</span>
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-buddy-brown mb-6">Notification Settings</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-buddy-brown"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-buddy-brown" />
                <div>
                  <h3 className="font-medium text-buddy-brown">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Get reminders when your plants need watering</p>
                </div>
              </div>
              
              <button
                onClick={handleToggleNotifications}
                disabled={updating || loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  notificationsEnabled ? 'bg-buddy-green' : 'bg-gray-200'
                } ${(updating || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={notificationsEnabled}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationSettingsPage;
