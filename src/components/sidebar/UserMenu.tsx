import React from 'react';
import { LogOut, UserCircle, User, Tag } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useLogout } from '../../hooks/auth/useLogout';
import AppVersion from '../settings/AppVersion';

const UserMenu: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      <Menu as="div" className="relative w-full">
        <Menu.Button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.username}
            </p>
            <p className="text-xs text-gray-500">Connecté</p>
          </div>
        </Menu.Button>

        <Menu.Items className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full px-4 py-2 text-left text-sm text-gray-700 flex items-center gap-2`}
                onClick={() => navigate('/profile')}
              >
                <UserCircle className="h-4 w-4" />
                Mon profil
              </button>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full px-4 py-2 text-left text-sm text-gray-700 flex items-center gap-2`}
                onClick={() => navigate('/settings?tab=versions')}
              >
                <Tag className="h-4 w-4" />
                Informations de version
              </button>
            )}
          </Menu.Item>
          
          <div className="border-t border-gray-100 my-1"></div>
          
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={logout}
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full px-4 py-2 text-left text-sm text-red-600 flex items-center gap-2`}
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
      
      <div className="mt-2 text-center">
        <AppVersion className="justify-center" />
      </div>
    </div>
  );
};

export default UserMenu;