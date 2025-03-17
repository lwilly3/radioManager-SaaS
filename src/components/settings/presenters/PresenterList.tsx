import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  User,
  Radio,
  Calendar,
  Edit2,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  presenterApi,
  PresenterResponse,
} from '../../../services/api/presenters';
import { usersApi } from '../../../services/api/users';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreatePresenterDialog from './CreatePresenterDialog';
import EditPresenterDialog from './EditPresenterDialog';
import type { Users as Utilisateurs } from '../../../types/user';

const PresenterList: React.FC = () => {
  const [presenters, setPresenters] = useState<PresenterResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPresenter, setEditingPresenter] =
    useState<PresenterResponse | null>(null);
  const [showNonPresenters, setShowNonPresenters] = useState(false);
  const [nonPresenters, setNonPresenters] = useState<Utilisateurs[]>([]);
  const [isLoadingNonPresenters, setIsLoadingNonPresenters] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchPresenters();
  }, [token]);

  const fetchPresenters = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await presenterApi.getAll(token);
      setPresenters(response.presenters);
    } catch (err) {
      setError('Erreur lors du chargement des présentateurs');
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
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoadingNonPresenters(false);
    }
  };

  const handleDelete = async (presenterId: number) => {
    if (!token) return;

    if (
      !window.confirm('Êtes-vous sûr de vouloir supprimer ce présentateur ?')
    ) {
      return;
    }

    try {
      await presenterApi.delete(token, presenterId);
      setPresenters(presenters.filter((p) => p.id !== presenterId));
    } catch (err) {
      setError('Erreur lors de la suppression du présentateur');
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    setShowCreateDialog(true);
    setShowNonPresenters(false);
  };

  const filteredPresenters = presenters.filter((presenter) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      presenter.name.toLowerCase().includes(searchLower) ||
      presenter.username.toLowerCase().includes(searchLower) ||
      presenter.biography?.toLowerCase().includes(searchLower)
    );
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
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
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
                  <Edit2 className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(presenter.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
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
