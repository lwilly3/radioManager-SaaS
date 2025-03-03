import React from 'react';
import { Menu } from 'lucide-react';
import SidebarLogo from './SidebarLogo';
import RadioControl from '../audio/RadioControl';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => (
  <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden z-10">
    <SidebarLogo />
    <div className="flex items-center gap-2">
      <RadioControl />
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md text-gray-500 hover:text-gray-700"
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  </header>
);

export default MobileHeader;