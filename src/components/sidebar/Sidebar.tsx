import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Radio,
  LayoutList,
  Users,
  MessageSquare,
  Settings,
  X,
  Tv,
  UserCircle,
  LogOut,
  Archive,
  FileText,
} from 'lucide-react';
import SidebarLogo from './SidebarLogo';
import NavLink from './NavLink';
import RadioControl from '../audio/RadioControl';
import UserMenu from './UserMenu';
import { useAuthStore } from '../../store/useAuthStore';
import { useLogout } from '../../hooks/auth/useLogout';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden z-20 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-30 lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <SidebarLogo />
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-6">
            <RadioControl />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/"
            icon={<LayoutList />}
            text="Tableau de bord"
            isActive={location.pathname === '/'}
          />
          <NavLink
            to="/show-plans"
            icon={<Radio />}
            text="Conducteurs Prêts à Diffuser"
            isActive={location.pathname.startsWith('/show-plans')}
          />
          <NavLink
            to="/my-show-plans"
            icon={<FileText />}
            text="Mes Conducteurs"
            isActive={location.pathname.startsWith('/my-show-plans')}
          />
          <NavLink
            to="/shows"
            icon={<Tv />}
            text="Émissions"
            isActive={location.pathname.startsWith('/shows')}
          />
          <NavLink
            to="/guests"
            icon={<UserCircle />}
            text="Invités"
            isActive={location.pathname.startsWith('/guests')}
          />
          <NavLink
            to="/team"
            icon={<Users />}
            text="Équipe"
            isActive={location.pathname === '/team'}
          />
          <NavLink
            to="/chat"
            icon={<MessageSquare />}
            text="Discussion"
            isActive={location.pathname === '/chat'}
          />
          <NavLink
            to="/archives"
            icon={<Archive />}
            text="Archives"
            isActive={location.pathname.startsWith('/archives')}
          />
          <NavLink
            to="/settings"
            icon={<Settings />}
            text="Paramètres"
            isActive={location.pathname === '/settings'}
          />
        </nav>

        {/* User Menu and Logout */}
        <div className="p-4 border-t border-gray-200">
          <UserMenu />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;