// Breadcrumb de localisation
import React from 'react';
import { Building2, MapPin, DoorOpen, ChevronRight } from 'lucide-react';

interface LocationBreadcrumbProps {
  companyName: string;
  siteName?: string;
  roomName?: string;
  specificLocation?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcons?: boolean;
}

export const LocationBreadcrumb: React.FC<LocationBreadcrumbProps> = ({ 
  companyName, 
  siteName, 
  roomName,
  specificLocation,
  size = 'sm',
  showIcons = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const items = [
    { icon: Building2, label: companyName },
    siteName && { icon: MapPin, label: siteName },
    roomName && { icon: DoorOpen, label: roomName },
    specificLocation && { icon: null, label: specificLocation },
  ].filter(Boolean) as Array<{ icon: typeof Building2 | null; label: string }>;

  return (
    <div className={`flex items-center flex-wrap text-gray-600 ${sizeClasses[size]}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className={`text-gray-400 ${iconSizes[size]}`} />
          )}
          <span className="flex items-center gap-1">
            {showIcons && item.icon && (
              <item.icon className={`text-gray-400 ${iconSizes[size]}`} />
            )}
            <span className={index === 0 ? 'font-medium' : ''}>
              {item.label}
            </span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default LocationBreadcrumb;
