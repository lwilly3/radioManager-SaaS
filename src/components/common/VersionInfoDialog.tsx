import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Tag, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useVersionStore } from '../../store/useVersionStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import semver from 'semver';

interface VersionInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const VersionInfoDialog: React.FC<VersionInfoDialogProps> = ({ isOpen, onClose }) => {
  const { currentVersion, versions, fetchVersions, isLoading, error } = useVersionStore();
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, fetchVersions]);

  // Trier les versions par ordre décroissant
  const sortedVersions = [...versions].sort((a, b) => 
    semver.compare(b.version, a.version)
  );

  // Obtenir la dernière version
  const latestVersion = sortedVersions.length > 0 ? sortedVersions[0] : null;
  
  // Vérifier si une mise à jour est disponible
  const updateAvailable = latestVersion && semver.gt(latestVersion.version, currentVersion);

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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="h-6 w-6 text-indigo-600" />
              <Dialog.Title className="text-lg font-semibold">
                Informations de version
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="spinner" />
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 rounded-lg text-red-700">
                {error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{currentVersion}</span>
                      <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                        Installée
                      </span>
                    </div>
                    
                    {updateAvailable && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                        <ArrowUp className="h-4 w-4" />
                        <span>Mise à jour disponible</span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-md font-medium">Historique des versions</h3>
                
                <div className="space-y-3">
                  {sortedVersions.map((version) => (
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

                {updateAvailable && latestVersion && (
                  <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-lg">
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
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VersionInfoDialog;