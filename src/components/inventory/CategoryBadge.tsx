// Badge de catégorie d'équipement
import React from 'react';
import { 
  Mic, 
  Monitor, 
  Laptop, 
  Radio, 
  Headphones, 
  Camera, 
  Speaker, 
  Cable, 
  Wifi, 
  HardDrive,
  Package,
} from 'lucide-react';

interface CategoryBadgeProps {
  name: string;
  icon?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'mic': Mic,
  'microphone': Mic,
  'monitor': Monitor,
  'ecran': Monitor,
  'laptop': Laptop,
  'ordinateur': Laptop,
  'radio': Radio,
  'headphones': Headphones,
  'casque': Headphones,
  'camera': Camera,
  'speaker': Speaker,
  'enceinte': Speaker,
  'cable': Cable,
  'wifi': Wifi,
  'reseau': Wifi,
  'harddrive': HardDrive,
  'stockage': HardDrive,
};

const categoryColors: Record<string, string> = {
  'audio': '#8B5CF6',
  'microphones': '#8B5CF6',
  'video': '#EC4899',
  'cameras': '#EC4899',
  'informatique': '#3B82F6',
  'ordinateurs': '#3B82F6',
  'diffusion': '#F59E0B',
  'broadcast': '#F59E0B',
  'eclairage': '#FBBF24',
  'reseau': '#06B6D4',
  'cables': '#6B7280',
  'mobilier': '#78716C',
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  name, 
  icon,
  color,
  size = 'sm' 
}) => {
  const bgColor = color || categoryColors[name.toLowerCase()] || '#6B7280';
  
  // Trouver l'icône
  const IconComponent = icon 
    ? iconMap[icon.toLowerCase()] 
    : iconMap[name.toLowerCase()] || Package;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${bgColor}15`,
        color: bgColor,
      }}
    >
      {IconComponent && <IconComponent className={iconSizes[size]} />}
      {name}
    </span>
  );
};

export default CategoryBadge;
