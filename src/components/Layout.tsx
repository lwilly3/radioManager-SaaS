import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar/Sidebar';
import MobileHeader from './sidebar/MobileHeader';
import RadioPlayer from './audio/RadioPlayer';

/**
 * Main layout component that provides the application structure.
 * Includes responsive sidebar, mobile header, and persistent radio player.
 */
const Layout: React.FC = () => {
  // State to control sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Only visible on mobile devices */}
      <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar - Fixed on desktop, sliding panel on mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content area with responsive padding */}
      <main className="pt-16 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <Outlet />
      </main>

      {/* Radio Player - Fixed at bottom of screen */}
      <RadioPlayer />
    </div>
  );
};

export default Layout;