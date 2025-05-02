import React from 'react';
import { Tag } from 'lucide-react';
import { useVersionStore } from '../../store/useVersionStore';
import { Link } from 'react-router-dom';
import semver from 'semver';

interface AppVersionProps {
  className?: string;
  onClick?: () => void;
}

const AppVersion: React.FC<AppVersionProps> = ({ className = '', onClick }) => {
  const { currentVersion, versions } = useVersionStore();
  
  // Obtenir la dernière version
  const latestVersion = versions.length > 0 
    ? versions.reduce((latest, current) => {
        if (!latest) return current;
        return semver.gt(current.version, latest.version) ? current : latest;
      }, null as any)
    : null;
  
  // Vérifier si une mise à jour est disponible
  const updateAvailable = latestVersion && semver.gt(latestVersion.version, currentVersion);
  
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ${className}`}
        title={updateAvailable ? "Mise à jour disponible" : "Version actuelle"}
      >
        <Tag className="h-3 w-3" />
        <span>v{currentVersion}</span>
        {updateAvailable && (
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </button>
    );
  }
  
  return (
    <Link 
      to="/settings?tab=versions" 
      className={`flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ${className}`}
      title={updateAvailable ? "Mise à jour disponible" : "Version actuelle"}
    >
      <Tag className="h-3 w-3" />
      <span>v{currentVersion}</span>
      {updateAvailable && (
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </Link>
  );
};

export default AppVersion;