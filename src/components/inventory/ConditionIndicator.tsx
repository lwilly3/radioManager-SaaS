// Indicateur de condition d'équipement
import React from 'react';

interface ConditionIndicatorProps {
  name: string;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const conditionColors: Record<string, string> = {
  'neuf': '#22C55E',
  'excellent': '#22C55E',
  'bon': '#3B82F6',
  'correct': '#F59E0B',
  'usé': '#F97316',
  'endommagé': '#EF4444',
  'hors service': '#6B7280',
};

const conditionScores: Record<string, number> = {
  'neuf': 100,
  'excellent': 90,
  'bon': 75,
  'correct': 60,
  'usé': 40,
  'endommagé': 20,
  'hors service': 0,
};

export const ConditionIndicator: React.FC<ConditionIndicatorProps> = ({ 
  name, 
  color,
  showLabel = true,
  size = 'md' 
}) => {
  const barColor = color || conditionColors[name.toLowerCase()] || '#6B7280';
  const score = conditionScores[name.toLowerCase()] ?? 50;
  
  const sizeClasses = {
    sm: { bar: 'h-1', text: 'text-xs' },
    md: { bar: 'h-2', text: 'text-sm' },
    lg: { bar: 'h-3', text: 'text-base' },
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between">
          <span className={`font-medium ${sizeClasses[size].text}`} style={{ color: barColor }}>
            {name}
          </span>
          <span className={`text-gray-400 ${sizeClasses[size].text}`}>
            {score}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size].bar}`}>
        <div
          className={`${sizeClasses[size].bar} rounded-full transition-all duration-300`}
          style={{ 
            width: `${score}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
};

export default ConditionIndicator;
