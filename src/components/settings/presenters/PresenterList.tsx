import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  User,
  Shield,
  Trash2,
  Edit,
  X,
  Filter,
  Mail,
  Users,
  Radio,
  Calendar,
} from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { usersApi } from '../../../services/api/users';
import { rolesApi } from '../../../services/api/roles';
import {
  presenterApi,
  PresenterResponse,
} from '../../../services/api/presenters';
import type { Users as UsersType, Role } from '../../../types/user';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreatePresenterDialog from './CreatePresenterDialog';
import EditPresenterDialog from './EditPresenterDialog';
import { useUpdatePermissions } from '../../../hooks/permissions/useUpdatePermissions';

const PresenterList: React.FC = () => {
  const [presenters, setPresenters] = useState<PresenterResponse[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const { token } = useAuthStore((state) => state);
  const [editingRolesForUser, setEditingRolesForUser] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPresenter, setEditingPresenter] = useState<PresenterResponse | null>(null);
  const [showNonPresenters, setShowNonPresenters] = useState(false);
  const [nonPresenters, setNonPresenters] = useState<UsersType[]>([]);
  const [isLoadingNonPresenters, setIsLoadingNonPresenters] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Initialize useUpdatePermissions hook
  const {
    updatePermissions,
    isLoading: isUpdatingPermissions,
    error: updateError,
    success,
  } = useUpdatePermissions();

  useEffect(() => {
    fetchPresenters();
  }, [token]);

  // Handle success or error from permission updates
  useEffect(() => {
    if (success) {
      setNotification({
        type: 'success',
        message: 'Permissions mises à jour avec succès',
      });
      setTimeout(() => setNotification(null), 3000);
    } else if (updateError) {
      setNotification({
        type: 'error',
        message: typeof updateError === 'string' ? updateError : 'Une erreur est survenue lors de la mise à jour des permissions',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [success, updateError]);

  const fetchPresenters = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await presenterApi.getAll(token);
      setPresenters(response.presenters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des présentateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNonPresenters = async () => {
    if (!token) return;

    try {
      setIsLoadingNonPresenters(true);
      const response = await usersApi.getNonPresenters(token);
      setNonPresenters(response.users);
      setShowNonPresenters(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoadingNonPresenters(false);
    }
  };

  const handleDelete = async (presenterId: number) => {
    if (!token) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce présentateur ?')) {
      return;
    }

    try {
      // Find the presenter to get the user ID
      const presenter = presenters.find((p) => p.id === presenterId);
      if (!presenter || !presenter.users_id) {
        throw new Error('Utilisateur non trouvé');
      }

      // Define permissions to revoke
      const presenterPermissions = {
        can_acces_showplan_section: false,
        can_create_showplan: false,
        can_changestatus_owned_showplan: false,
        can_delete_showplan: false,
        can_edit_showplan: false,
        can_archive_showplan: false,
        can_acces_guests_section: false,
        can_view_guests: false,
        can_edit_guests: false,
        can_view_archives: false,
      };

      // Update permissions for the specific user
      await updatePermissions(presenter.users_id, presenterPermissions);

      // Delete presenter
      await presenterApi.delete(token, presenterId);

      // Update local state
      setPresenters(presenters.filter((p) => p.id !== presenterId));

      setNotification({
        type: 'success',
        message: 'Présentateur supprimé avec succès',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du présentateur');
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors de la suppression du présentateur',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    setShowCreateDialog(true);
    setShowNonPresenters(false);
  };

  const filteredPresenters = presenters.filter((presenter) => {
    const matchesSearch =
      presenter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (presenter.username &&
        presenter.username.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Présentateurs</h2>
          <p className="text-gray-600 mt-1">
            Gérez les présentateurs de votre stations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchNonPresenters}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Users className="h-5 w-5" />
            Utilisateurs disponibles
          </button>
        </div>
      </header>

      {(error || notification) && (
        <div
          className={`p-4 ${
            notification?.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          } border-l-4 ${
            notification?.type === 'success'
              ? 'border-green-400'
              : 'border-red-400'
          }`}
        >
          {error || notification?.message}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un présentateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Non-Presenters List */}
      {showNonPresenters && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Utilisateurs disponibles</h3>
            <button
              onClick={() => setShowNonPresenters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoadingNonPresenters ? (
            <div className="flex justify-center py-4">
              <div className="spinner" />
            </div>
          ) : nonPresenters.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nonPresenters.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.name} {user.family_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUserSelect(user.id)}
                    className="mt-3 w-full btn btn-secondary text-sm"
                  >
                    Ajouter comme présentateur
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Tous les utilisateurs sont déjà présentateurs
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPresenters.map((presenter) => (
            <div
              key={presenter.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    {presenter.profilePicture ? (
                      <img
                        src={presenter.profilePicture}
                        alt={presenter.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {presenter.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {presenter.username}
                    </p>
                  </div>
                </div>

                {presenter.biography && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {presenter.biography}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4" />
                    <span>{presenter.shows_presented} émission(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(), 'MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-between">
                <button
                  onClick={() => setEditingPresenter(presenter)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(presenter.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  disabled={isUpdatingPermissions}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}

          {filteredPresenters.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucun présentateur trouvé
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter un nouveau présentateur.
              </p>
              <div className="mt-6">
                <button
                  onClick={fetchNonPresenters}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Users className="h-5 w-5" />
                  Utilisateurs disponibles
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showCreateDialog && (
        <CreatePresenterDialog
          isOpen={showCreateDialog}
          onClose={() => {
            setShowCreateDialog(false);
            setSelectedUserId(undefined);
          }}
          onSuccess={() => {
            setShowCreateDialog(false);
            setSelectedUserId(undefined);
            fetchPresenters();
          }}
          selectedUserId={selectedUserId}
        />
      )}

      {editingPresenter && (
        <EditPresenterDialog
          isOpen={true}
          presenter={editingPresenter}
          onClose={() => setEditingPresenter(null)}
          onSuccess={() => {
            setEditingPresenter(null);
            fetchPresenters();
          }}
        />
      )}
    </div>
  );
};

export default PresenterList;