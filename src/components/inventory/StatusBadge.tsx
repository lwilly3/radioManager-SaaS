// Badge de statut d'équipement
import React from 'react';

interface StatusBadgeProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const defaultColors: Record<string, string> = {
  'disponible': '#22C55E',
  'attribué': '#3B82F6',
  'en maintenance': '#F59E0B',
  'hors service': '#EF4444',
  'en transit': '#8B5CF6',
  'réservé': '#06B6D4',
  'en mission': '#EC4899',
  'perdu': '#6B7280',
  'volé': '#DC2626',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  name, 
  color,
  size = 'sm' 
}) => {
  const bgColor = color || defaultColors[name.toLowerCase()] || '#6B7280';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${bgColor}20`,
        color: bgColor,
      }}
    >
      <span 
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: bgColor }}
      />
      {name}
    </span>
  );
};

export default StatusBadge;
