import React, { useEffect } from 'react';
import Header from '../components/Header';
import PlantList from '../components/PlantList';
import { requestNotificationPermission } from '../utils/notifications';

const HomePage: React.FC = () => {
  useEffect(() => {
    // Request notification permission when the home page loads
    requestNotificationPermission();
  }, []);

  return (
    <div className="min-h-screen bg-buddy-pink">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <PlantList />
      </main>
    </div>
  );
};

export default HomePage;