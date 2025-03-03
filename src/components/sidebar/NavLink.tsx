import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, text, isActive }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-700 hover:bg-gray-50'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, {
      className: `h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`,
    })}
    <span>{text}</span>
  </Link>
);

export default NavLink;