import React from 'react';
import Header from '../components/Header';
import PlantList from '../components/PlantList';

const HomePage: React.FC = () => {
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