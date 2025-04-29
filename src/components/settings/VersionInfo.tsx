import React, { useEffect, useState } from 'react';
import { useVersionStore } from '../../store/useVersionStore';
import { Tag, Info, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import semver from 'semver';
import type { Version } from '../../types/version';

const VersionInfo: React.FC = () => {
  const { currentVersion, versions, fetchVersions, isLoading, error } = useVersionStore();
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [showAllVersions, setShowAllVersions] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  // Trier les versions par ordre décroissant
  const sortedVersions = [...versions].sort((a, b) => 
    semver.compare(b.version, a.version)
  );

  // Obtenir la dernière version
  const latestVersion = sortedVersions.length > 0 ? sortedVersions[0] : null;
  
  // Vérifier si une mise à jour est disponible
  const updateAvailable = latestVersion && semver.gt(latestVersion.version, currentVersion);
  
  // Versions à afficher (toutes ou seulement les 3 dernières)
  const displayedVersions = showAllVersions 
    ? sortedVersions 
    : sortedVersions.slice(0, 3);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const toggleVersion = (version: string) => {
    if (expandedVersion === version) {
      setExpandedVersion(null);
    } else {
      setExpandedVersion(version);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center py-8">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Erreur</h2>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-semibold">Informations de version</h2>
          </div>
          {updateAvailable && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
              <ArrowUp className="h-4 w-4" />
              <span>Mise à jour disponible</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-gray-500" />
            <h3 className="text-md font-medium">Version actuelle</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{currentVersion}</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                  Installée
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-md font-medium mb-3">Historique des versions</h3>
          <div className="space-y-4">
            {displayedVersions.map((version: Version) => (
              <div 
                key={version.version}
                className={`border rounded-lg overflow-hidden ${
                  version.version === latestVersion?.version ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleVersion(version.version)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{version.version}</span>
                        {version.version === latestVersion?.version && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            Dernière
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 text-sm">
                        {formatDate(version.releaseDate)}
                      </span>
                    </div>
                    <div>
                      {expandedVersion === version.version ? (
                        <ArrowUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1">{version.description}</p>
                </div>

                {expandedVersion === version.version && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                    {version.features.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Nouvelles fonctionnalités</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {version.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600">{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {version.improvements.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Améliorations</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {version.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-gray-600">{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {version.bugfixes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Corrections de bugs</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {version.bugfixes.map((bugfix, index) => (
                            <li key={index} className="text-sm text-gray-600">{bugfix}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {sortedVersions.length > 3 && (
            <button
              onClick={() => setShowAllVersions(!showAllVersions)}
              className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              {showAllVersions ? 'Afficher moins' : `Afficher toutes les versions (${sortedVersions.length})`}
            </button>
          )}
        </div>

        {updateAvailable && latestVersion && (
          <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">Mise à jour disponible: {latestVersion.version}</h3>
            </div>
            <p className="text-gray-700 mb-3">{latestVersion.description}</p>
            <button className="btn btn-primary">
              Mettre à jour vers la version {latestVersion.version}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionInfo;