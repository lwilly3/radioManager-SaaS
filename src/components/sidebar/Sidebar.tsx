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
  CheckSquare,
  UserCog,
  Quote,
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
  const permissions = useAuthStore((state) => state.permissions);

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

          {permissions?.can_acces_showplan_section && (
            <NavLink
              to="/show-plans"
              icon={<Radio />}
              text="Conducteurs Prêts à Diffuser"
              isActive={location.pathname.startsWith('/show-plans')}
            />
          )}

          {permissions?.can_create_showplan && (
            <NavLink
              to="/my-show-plans"
              icon={<FileText />}
              text="Mes Conducteurs"
              isActive={location.pathname.startsWith('/my-show-plans')}
            />
          )}


{permissions?.can_view_messages && (
            <NavLink
              to="/chat"
              icon={<MessageSquare />}
              text="Discussion"
              isActive={location.pathname === '/chat'}
            />
          )}

          {permissions?.can_view_tasks && (
            <NavLink
              to="/tasks"
              icon={<CheckSquare />}
              text="Tâches"
              isActive={location.pathname.startsWith('/tasks')}
            />
          )}


          {permissions?.can_acces_emissions_section && (
            <NavLink
              to="/shows"
              icon={<Tv />}
              text="Émissions"
              isActive={location.pathname.startsWith('/shows')}
            />
          )}

          {permissions?.can_acces_guests_section && (
            <NavLink
              to="/guests"
              icon={<UserCircle />}
              text="Invités"
              isActive={location.pathname.startsWith('/guests')}
            />
          )}

          {permissions?.quotes_view && (
            <NavLink
              to="/quotes"
              icon={<Quote />}
              text="Citations"
              isActive={location.pathname.startsWith('/quotes')}
            />
          )}

          {permissions?.can_view_users && (
            <NavLink
              to="/team"
              icon={<Users />}
              text="Équipe"
              isActive={location.pathname === '/team'}
            />
          )}

          {permissions?.can_acces_users_section && (
            <NavLink
              to="/users"
              icon={<UserCog />}
              text="Utilisateurs"
              isActive={location.pathname.startsWith('/users')}
            />
          )}

          {permissions?.can_view_archives && (
            <NavLink
              to="/archives"
              icon={<Archive />}
              text="Archives"
              isActive={location.pathname.startsWith('/archives')}
            />
          )}

          {permissions?.can_manage_settings && (
            <NavLink
              to="/settings"
              icon={<Settings />}
              text="Paramètres"
              isActive={location.pathname === '/settings'}
            />
          )}
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