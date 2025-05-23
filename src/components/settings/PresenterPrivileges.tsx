import React, { useState, useEffect, useRef } from 'react';
import { usePresenters } from '../../hooks/presenters/usePresenters';
import { useUpdatePermissions } from '../../hooks/permissions/useUpdatePermissions';
import { useUserPermissions } from '../../hooks/permissions/useUserPermissions';
import { useRoleTemplates } from '../../hooks/permissions/useRoleTemplates';
import {
  User,
  Check,
  X,
  AlertCircle,
  Loader,
  Search,
  Filter,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
  BookTemplate,
  RefreshCw,
  CheckSquare,
  Square,
} from 'lucide-react';
import { generateKey } from '../../utils/keyGenerator';
import {
  UserPermissions,
  permissionCategories,
  defaultRoleTemplates,
  RoleTemplate,
} from '../../types/permissions';
import { useAuthStore } from '../../store/useAuthStore';

interface PresenterWithPermissions {
  id: string;
  user_id?: number;
  name: string;
  profilePicture?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  permissions?: Partial<UserPermissions>;
}

const PresenterPrivileges: React.FC = () => {
  const { data: presenters = [], isLoading: isLoadingPresenters } =
    usePresenters();
  const [selectedPresenter, setSelectedPresenter] =
    useState<PresenterWithPermissions | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [permissionCategory, setPermissionCategory] = useState('conducteurs');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['conducteurs'])
  );
  const [templates, setTemplates] =
    useState<RoleTemplate[]>(defaultRoleTemplates);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPresentersList, setShowPresentersList] = useState(true);

  const prevPermissionsRef = useRef<Partial<UserPermissions> | null>(null);
  // Récupère les méthodes de useAuthStore
  const { setPermission, syncPermissionsWithFirestore } = useAuthStore();

  const userId =
    selectedPresenter?.user_id && selectedPresenter.user_id > 0
      ? selectedPresenter.user_id
      : -1;
  const {
    permissions,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useUserPermissions(userId);

  const {
    updatePermissions,
    updateMultiplePermissions,
    setAllPermissions,
    isLoading: isUpdating,
    error: updateError,
    success,
  } = useUpdatePermissions(userId);

  const { applyTemplate, isLoading: isTemplateLoading } = useRoleTemplates();

  useEffect(() => {
    if (success) {
      setNotification({
        type: 'success',
        message: 'Privilèges mis à jour avec succès',
      });
      setTimeout(() => setNotification(null), 3000);
    } else if (updateError || permissionsError) {
      setNotification({
        type: 'error',
        message: updateError || permissionsError || 'Erreur inconnue',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [success, updateError, permissionsError]);

  useEffect(() => {
    if (
      selectedPresenter &&
      permissions &&
      !isLoadingPermissions &&
      userId > 0
    ) {
      const permissionsChanged =
        JSON.stringify(permissions) !==
        JSON.stringify(prevPermissionsRef.current);
      if (permissionsChanged) {
        console.log(
          'Mise à jour des permissions locales depuis l’API :',
          permissions
        );
        setSelectedPresenter((prev) => ({
          ...prev!,
          permissions: { ...permissions }, // Synchronisation initiale avec l’API
        }));
        prevPermissionsRef.current = permissions;
      }
    }
  }, [permissions, isLoadingPermissions, selectedPresenter, userId]);

  const presentersWithPermissions: PresenterWithPermissions[] = presenters.map(
    (presenter) => ({
      ...presenter,
      permissions:
        selectedPresenter?.id === presenter.id && userId > 0
          ? selectedPresenter.permissions
          : undefined,
    })
  );

  const filteredPresenters = presentersWithPermissions.filter((presenter) => {
    const matchesSearch =
      presenter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (presenter.contact?.email &&
        presenter.contact.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole ? presenter.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) newSet.delete(categoryId);
      else newSet.add(categoryId);
      return newSet;
    });
  };

  // const handlePermissionChange = async (permission: string, value: boolean) => {
  //   if (!selectedPresenter || !selectedPresenter.user_id) return;

  //   // Sauvegarde des permissions actuelles pour rollback en cas d'échec
  //   const previousPermissions = { ...selectedPresenter.permissions };

  //   // Mise à jour locale immédiate pour réactivité dans l'UI
  //   setSelectedPresenter((prev) => ({
  //     ...prev!,
  //     permissions: { ...prev!.permissions, [permission]: value },
  //   }));

  //   try {
  //     console.log(`Envoi à l’API : ${permission} = ${value}`);
  //     // Étape 1 : Mise à jour des permissions via l'API
  //     await updatePermissions({ [permission]: value } as Partial<UserPermissions>);
  //     console.log('Mise à jour API réussie');

  //     // Étape 2 : Mise à jour des permissions dans le store Zustand
  //     // const updatedPermissions = {
  //     //   ...selectedPresenter.permissions,
  //     //   [permission]: value,
  //     // };
  //     // setPermission(updatedPermissions);

  //     // Étape 3 : Synchronisation avec Firestore après succès de l'API
  //     // await syncPermissionsWithFirestore();
  //     // console.log('Synchronisation avec Firestore réussie');

  //     // Notification de succès (optionnel)
  //     setNotification({
  //       type: 'success',
  //       message: 'Permission mise à jour avec succès',
  //     });
  //     setTimeout(() => setNotification(null), 3000);
  //   } catch (err: any) {
  //     // En cas d'échec (API ou Firestore), rollback de l'état local
  //     setSelectedPresenter((prev) => ({
  //       ...prev!,
  //       permissions: previousPermissions,
  //     }));
  //     setNotification({
  //       type: 'error',
  //       message: err.response?.data?.detail || 'Erreur lors de la mise à jour',
  //     });
  //     setTimeout(() => setNotification(null), 5000);
  //     console.error('Erreur lors de la mise à jour :', err);
  //   }
  // };

  const handlePermissionChange = async (permission: string, value: boolean) => {
    if (!selectedPresenter || !selectedPresenter.user_id) return;

    const previousPermissions = { ...selectedPresenter.permissions };
    console.log(`Tentative de mise à jour locale : ${permission} = ${value}`);
    setSelectedPresenter((prev) => ({
      ...prev!,
      permissions: { ...prev!.permissions, [permission]: value },
    }));

    try {
      console.log(`Envoi à l’API : ${permission} = ${value}`);
      await updatePermissions(selectedPresenter.user_id, {
        [permission]: value,
      } as Partial<UserPermissions>);
      console.log('Mise à jour API réussie');
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour API :', err);
      setSelectedPresenter((prev) => ({
        ...prev!,
        permissions: previousPermissions,
      }));
      setNotification({
        type: 'error',
        message:
          err.response?.data?.detail ||
          'Erreur lors de la mise à jour des permissions',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleApplyTemplate = async (template: RoleTemplate) => {
    if (!selectedPresenter || !selectedPresenter.user_id) return;

    const previousPermissions = { ...selectedPresenter.permissions };
    setSelectedPresenter({
      ...selectedPresenter,
      permissions: {
        ...selectedPresenter.permissions,
        ...template.permissions,
      },
    });

    try {
      await applyTemplate(selectedPresenter.user_id, template.id);
      setNotification({
        type: 'success',
        message: `Modèle "${template.name}" appliqué avec succès`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setSelectedPresenter({
        ...selectedPresenter,
        permissions: previousPermissions,
      });
      setNotification({
        type: 'error',
        message: "Erreur lors de l'application du modèle",
      });
      setTimeout(() => setNotification(null), 5000);
    }

    setShowTemplateSelector(false);
  };

  const handleToggleCategoryPermissions = async (
    categoryId: string,
    value: boolean
  ) => {
    if (!selectedPresenter || !selectedPresenter.user_id) return;

    const category = permissionCategories.find((c) => c.id === categoryId);
    if (!category) return;

    const permissionUpdates = Object.fromEntries(
      category.permissions.map((p) => [p.key, value])
    ) as Partial<UserPermissions>;

    const previousPermissions = { ...selectedPresenter.permissions };
    setSelectedPresenter({
      ...selectedPresenter,
      permissions: { ...selectedPresenter.permissions, ...permissionUpdates },
    });

    try {
      await updateMultiplePermissions(permissionUpdates);
      setNotification({
        type: 'success',
        message: `Toutes les permissions de la catégorie "${category.name}" ${
          value ? 'activées' : 'désactivées'
        }`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setSelectedPresenter({
        ...selectedPresenter,
        permissions: previousPermissions,
      });
      setNotification({
        type: 'error',
        message: 'Erreur lors de la mise à jour des permissions',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleResetAllPermissions = async (value: boolean) => {
    if (!selectedPresenter || !selectedPresenter.user_id) return;

    const allPermissionKeys = permissionCategories.flatMap((category) =>
      category.permissions.map((p) => p.key)
    );
    const resetPermissions = Object.fromEntries(
      allPermissionKeys.map((key) => [key, value])
    ) as Partial<UserPermissions>;

    const previousPermissions = { ...selectedPresenter.permissions };
    setSelectedPresenter({
      ...selectedPresenter,
      permissions: resetPermissions,
    });

    try {
      await setAllPermissions(value);
      setNotification({
        type: 'success',
        message: value
          ? 'Toutes les permissions activées'
          : 'Toutes les permissions désactivées',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setSelectedPresenter({
        ...selectedPresenter,
        permissions: previousPermissions,
      });
      setNotification({
        type: 'error',
        message: 'Erreur lors de la réinitialisation des permissions',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handlePresenterSelect = (presenter: PresenterWithPermissions) => {
    setSelectedPresenter(presenter);
    setShowPresentersList(false);
    console.log('Présentateur sélectionné :', presenter);
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
            <AlertCircle className="h-5 w-5" />
          )}
          <p>{notification.message}</p>
        </div>
      )}

      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Gestion des privilèges des présentateurs
        </h2>
        <p className="text-gray-600 mb-6">
          Définissez les permissions et les privilèges pour chaque présentateur
          de votre station.
        </p>

        {showPresentersList ? (
          <div>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un présentateur..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoadingPresenters ? (
              <div className="flex justify-center py-12">
                <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
            ) : filteredPresenters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPresenters.map((presenter) => (
                  <div
                    key={generateKey(presenter.id.toString())}
                    className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => handlePresenterSelect(presenter)}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          {presenter.profilePicture ? (
                            <img
                              src={presenter.profilePicture}
                              alt={presenter.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {presenter.name}
                          </h3>
                          {presenter.contact?.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <span>{presenter.contact.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(presenter.permissions || {})
                            .slice(0, 3)
                            .map(([key, value]) => {
                              const permissionInfo = permissionCategories
                                .flatMap((cat) => cat.permissions)
                                .find((p) => p.key === key);
                              return (
                                <div
                                  key={key}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                                >
                                  {value ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <X className="h-3 w-3 text-red-500" />
                                  )}
                                  <span className="truncate max-w-[150px]">
                                    {permissionInfo?.label ||
                                      key.replace('can_', '').replace('_', ' ')}
                                  </span>
                                </div>
                              );
                            })}
                          {presenter.permissions &&
                            Object.keys(presenter.permissions).length > 3 && (
                              <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs">
                                +{Object.keys(presenter.permissions).length - 3}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 border-t">
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        Gérer les privilèges
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Aucun présentateur trouvé</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium mb-3">Présentateurs</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un présentateur..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {isLoadingPresenters ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader className="h-6 w-6 text-indigo-600 animate-spin" />
                  </div>
                ) : filteredPresenters.length > 0 ? (
                  filteredPresenters.map((presenter) => (
                    <button
                      key={generateKey(presenter.id.toString())}
                      onClick={() => handlePresenterSelect(presenter)}
                      className={`w-full text-left p-4 hover:bg-gray-50 flex items-center gap-3 ${
                        selectedPresenter?.id === presenter.id
                          ? 'bg-indigo-50'
                          : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        {presenter.profilePicture ? (
                          <img
                            src={presenter.profilePicture}
                            alt={presenter.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{presenter.name}</p>
                        {presenter.contact?.email && (
                          <p className="text-sm text-gray-500">
                            {presenter.contact.email}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Aucun présentateur trouvé
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 border rounded-lg">
              {selectedPresenter ? (
                <div>
                  <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {selectedPresenter.profilePicture ? (
                          <img
                            src={selectedPresenter.profilePicture}
                            alt={selectedPresenter.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {selectedPresenter.name}
                        </h3>
                        {selectedPresenter.contact?.email && (
                          <p className="text-sm text-gray-500">
                            {selectedPresenter.contact.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowTemplateSelector(!showTemplateSelector)
                          }
                          className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg flex items-center gap-1"
                          title="Appliquer un modèle"
                          disabled={isLoadingPermissions || isTemplateLoading}
                        >
                          <BookTemplate className="h-5 w-5" />
                          <span className="text-sm hidden sm:inline">
                            Modèles
                          </span>
                        </button>
                        {showTemplateSelector && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <div className="px-3 py-2 border-b border-gray-100">
                              <h4 className="font-medium text-sm">
                                Appliquer un modèle
                              </h4>
                            </div>
                            {templates.map((template) => (
                              <button
                                key={template.id}
                                onClick={() => handleApplyTemplate(template)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                disabled={
                                  isLoadingPermissions || isTemplateLoading
                                }
                              >
                                <Shield className="h-4 w-4 text-indigo-500" />
                                <div>
                                  <div>{template.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {template.description}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative group">
                        <button
                          className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg flex items-center gap-1"
                          title="Actions rapides"
                          disabled={isLoadingPermissions || isUpdating}
                        >
                          <Filter className="h-5 w-5" />
                          <span className="text-sm hidden sm:inline">
                            Actions
                          </span>
                        </button>
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
                          <button
                            onClick={() => handleResetAllPermissions(true)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            disabled={isLoadingPermissions || isUpdating}
                          >
                            <CheckSquare className="h-4 w-4 text-green-500" />
                            Tout autoriser
                          </button>
                          <button
                            onClick={() => handleResetAllPermissions(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            disabled={isLoadingPermissions || isUpdating}
                          >
                            <Square className="h-4 w-4 text-red-500" />
                            Tout refuser
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => {
                              const defaultTemplate = templates.find(
                                (t) => t.id === 'presenter'
                              );
                              if (defaultTemplate)
                                handleApplyTemplate(defaultTemplate);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            disabled={isLoadingPermissions || isUpdating}
                          >
                            <RefreshCw className="h-4 w-4 text-indigo-500" />
                            Réinitialiser aux valeurs par défaut
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
                    {isLoadingPermissions ? (
                      <div className="flex justify-center py-12">
                        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
                      </div>
                    ) : permissionsError ? (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                        {permissionsError}
                      </div>
                    ) : !permissions || userId <= 0 ? (
                      <div className="text-center text-gray-500">
                        Aucune permission disponible
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {permissionCategories.map((category) => (
                          <div
                            key={category.id}
                            className="border rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                              disabled={isLoadingPermissions || isUpdating}
                            >
                              <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-indigo-600" />
                                <h4 className="font-medium">{category.name}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleCategoryPermissions(
                                        category.id,
                                        true
                                      );
                                    }}
                                    className="p-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 cursor-pointer"
                                    title="Tout activer"
                                  >
                                    <Check className="h-3 w-3" />
                                  </span>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleCategoryPermissions(
                                        category.id,
                                        false
                                      );
                                    }}
                                    className="p-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 cursor-pointer"
                                    title="Tout désactiver"
                                  >
                                    <X className="h-3 w-3" />
                                  </span>
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
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm">
                                          {permission.label}
                                        </p>
                                        <div className="group relative">
                                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                          <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                                            {permission.description}
                                          </div>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        {permission.description}
                                      </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={
                                          selectedPresenter?.permissions &&
                                          permission.key in
                                            selectedPresenter.permissions
                                            ? selectedPresenter.permissions[
                                                permission.key
                                              ]
                                            : false
                                        }
                                        onChange={(e) =>
                                          handlePermissionChange(
                                            permission.key,
                                            e.target.checked
                                          )
                                        }
                                        disabled={
                                          isLoadingPermissions || isUpdating
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
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    Sélectionnez un présentateur pour voir et modifier ses
                    privilèges
                  </p>
                  <button
                    onClick={() => setShowPresentersList(true)}
                    className="mt-4 btn btn-primary"
                    disabled={isLoadingPresenters || isLoadingPermissions}
                  >
                    Retour à la liste des présentateurs
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresenterPrivileges;
