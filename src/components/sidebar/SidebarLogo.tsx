import React from 'react';
import { Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

const SidebarLogo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2">
    <Radio className="h-8 w-8 text-indigo-600" />
    <h1 className="text-xl font-bold text-gray-900">RadioManager</h1>
  </Link>
);

export default SidebarLogo;