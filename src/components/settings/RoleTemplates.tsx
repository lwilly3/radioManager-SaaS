import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash,
  Check,
  X,
  Shield,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { generateKey } from '../../utils/keyGenerator';
import {
  RoleTemplate,
  UserPermissions,
  permissionCategories,
  defaultRoleTemplates,
} from '../../types/permissions';
import { useRoleTemplates } from '../../hooks/permissions/useRoleTemplates';

interface RoleTemplatesProps {
  onApplyTemplate: (template: RoleTemplate) => void;
}

const RoleTemplates: React.FC<RoleTemplatesProps> = ({ onApplyTemplate }) => {
  const [templates, setTemplates] =
    useState<RoleTemplate[]>(defaultRoleTemplates);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RoleTemplate | null>(
    null
  );
  const [newTemplate, setNewTemplate] = useState<Partial<RoleTemplate>>({
    name: '',
    description: '',
    permissions: {},
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isLoading,
    error,
  } = useRoleTemplates();

  // Charger les modèles depuis l'API au chargement du composant
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const apiTemplates = await fetchTemplates();
        console.log('Fetched templates:', apiTemplates); // Débogage
        if (Array.isArray(apiTemplates) && apiTemplates.length > 0) {
          setTemplates(apiTemplates);
        } else {
          console.warn('apiTemplates is not an array or empty, using defaults');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des modèles:', err);
        setNotification({
          type: 'error',
          message:
            'Erreur lors du chargement des modèles : ' + (err as Error).message,
        });
        setTimeout(() => setNotification(null), 5000);
      }
    };

    loadTemplates();
  }, [fetchTemplates]);

  // Afficher les notifications d'erreur
  useEffect(() => {
    if (error) {
      setNotification({ type: 'error', message: error });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [error]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleEditTemplate = (template: RoleTemplate) => {
    setEditingTemplate(template);
    setNewTemplate(template);
    setIsEditing(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const success = await deleteTemplate(id);
      if (success) {
        setTemplates(templates.filter((t) => t.id !== id));
        setNotification({
          type: 'success',
          message: 'Modèle supprimé avec succès',
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Erreur lors de la suppression du modèle',
      });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name) {
      setNotification({
        type: 'error',
        message: 'Le nom du modèle est requis',
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing template
        const success = await updateTemplate(newTemplate as RoleTemplate);
        if (success) {
          setTemplates(
            templates.map((t) =>
              t.id === editingTemplate.id
                ? ({ ...t, ...newTemplate } as RoleTemplate)
                : t
            )
          );
          setNotification({
            type: 'success',
            message: 'Modèle mis à jour avec succès',
          });
        }
      } else {
        // Create new template
        const template = await createTemplate({
          name: newTemplate.name || 'Nouveau modèle',
          description: newTemplate.description || '',
          permissions: newTemplate.permissions || {},
        });

        if (template) {
          setTemplates([...templates, template]);
          setNotification({
            type: 'success',
            message: 'Modèle créé avec succès',
          });
        }
      }

      setIsEditing(false);
      setEditingTemplate(null);
      setNewTemplate({ name: '', description: '', permissions: {} });
    } catch (err) {
      setNotification({
        type: 'error',
        message: editingTemplate
          ? 'Erreur lors de la mise à jour du modèle'
          : 'Erreur lors de la création du modèle',
      });
    }

    setTimeout(() => setNotification(null), 3000);
  };

  const handleTogglePermission = (
    key: keyof UserPermissions,
    value: boolean
  ) => {
    setNewTemplate({
      ...newTemplate,
      permissions: {
        ...newTemplate.permissions,
        [key]: value,
      },
    });
  };

  const handleToggleCategoryPermissions = (
    categoryId: string,
    value: boolean
  ) => {
    const category = permissionCategories.find((c) => c.id === categoryId);
    if (!category) return;

    const updatedPermissions = { ...newTemplate.permissions };

    category.permissions.forEach((permission) => {
      updatedPermissions[permission.key] = value;
    });

    setNewTemplate({
      ...newTemplate,
      permissions: updatedPermissions,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {notification && (
        <div
          className={`p-4 ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          } rounded-t-lg flex items-center gap-2`}
        >
          {notification.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          <p>{notification.message}</p>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Modèles de rôles</h2>
            <p className="text-gray-600 mt-1">
              Créez et gérez des modèles de permissions pour les présentateurs
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Nouveau modèle
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-4 flex items-center justify-between">
              <span>
                {editingTemplate
                  ? 'Modifier le modèle'
                  : 'Nouveau modèle de rôle'}
              </span>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du modèle
                </label>
                <input
                  type="text"
                  value={newTemplate.name || ''}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  className="form-input"
                  placeholder="Ex: Administrateur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTemplate.description || ''}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      description: e.target.value,
                    })
                  }
                  className="form-textarea"
                  rows={2}
                  placeholder="Description du rôle et des permissions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  {permissionCategories.map((category) => (
                    <div key={category.id} className="border-b last:border-b-0">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-indigo-600" />
                          <h4 className="font-medium">{category.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCategoryPermissions(
                                  category.id,
                                  true
                                );
                              }}
                              className="p-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
                              title="Tout activer"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCategoryPermissions(
                                  category.id,
                                  false
                                );
                              }}
                              className="p-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                              title="Tout désactiver"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          {expandedCategories.has(category.id) ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {expandedCategories.has(category.id) && (
                        <div className="divide-y">
                          {category.permissions.map((permission) => (
                            <div
                              key={String(permission.key)}
                              className="flex items-center justify-between p-3 hover:bg-gray-50"
                            >
                              <div>
                                <p className="text-sm">{permission.label}</p>
                                <p className="text-xs text-gray-500">
                                  {permission.description}
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={
                                    newTemplate.permissions?.[permission.key] ||
                                    false
                                  }
                                  onChange={(e) =>
                                    handleTogglePermission(
                                      permission.key,
                                      e.target.checked
                                    )
                                  }
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingTemplate(null);
                  }}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="btn btn-primary flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingTemplate ? 'Mettre à jour' : 'Créer le modèle'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(templates) &&
            templates.map(
              (
                template // Ajout de la vérification Array.isArray
              ) => (
                <div
                  key={generateKey(template.id)}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-medium">{template.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Supprimer"
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <div className="space-y-1 mb-4">
                    {template.permissions &&
                      Object.entries(template.permissions)
                        .slice(0, 3)
                        .map(([key, value]) => {
                          // Trouver le libellé de la permission
                          const permissionInfo = permissionCategories
                            .flatMap((cat) => cat.permissions)
                            .find((p) => p.key === key);

                          return (
                            <div
                              key={key}
                              className="flex items-center gap-2 text-xs text-gray-500"
                            >
                              {value ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                              <span>
                                {permissionInfo?.label ||
                                  key.replace('can_', '').replace('_', ' ')}
                              </span>
                            </div>
                          );
                        })}
                    {template.permissions &&
                      Object.keys(template.permissions).length > 3 && (
                        <div className="text-xs text-gray-500">
                          + {Object.keys(template.permissions).length - 3}{' '}
                          autres permissions
                        </div>
                      )}
                  </div>
                  <button
                    onClick={() => onApplyTemplate(template)}
                    className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                    disabled={isLoading}
                  >
                    Appliquer ce modèle
                  </button>
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
};

export default RoleTemplates;
