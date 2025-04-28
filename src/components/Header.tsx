import React from 'react';
import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-buddy-brown/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="fauget.png" alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-buddy-brown">
              Hi {user?.email?.split('@')[0]}!
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 text-buddy-brown hover:text-buddy-green transition-colors duration-200"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => signOut()}
              className="p-2 text-buddy-brown hover:text-buddy-green transition-colors duration-200"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;