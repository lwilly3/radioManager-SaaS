import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, description }) => (
  <div className="bg-white rounded-lg shadow p-4 lg:p-6">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-gray-50 rounded-lg shrink-0">{icon}</div>
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-gray-600 truncate">{title}</h3>
        <p className="text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
    </div>
  </div>
);

export default StatCard;