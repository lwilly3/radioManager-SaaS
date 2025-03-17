import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, User } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { usersApi } from '../../../services/api/users';
import { presenterApi, CreatePresenterData } from '../../../services/api/presenters';
import type { Users } from '../../../types/user';

interface CreatePresenterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUserId?: number;
}

const CreatePresenterDialog: React.FC<CreatePresenterDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedUserId
}) => {
  const token = useAuthStore((state) => state.token);
  const [users, setUsers] = useState<Users[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [formData, setFormData] = useState<Partial<CreatePresenterData>>({
    biography: '',
    contact_info: '',
    isMainPresenter: false,
  });

  useEffect(() => {
    if (isOpen && token) {
      if (selectedUserId) {
        fetchSelectedUser(selectedUserId);
      } else {
        fetchNonPresenterUsers();
      }
    }
  }, [isOpen, token, selectedUserId]);

  const fetchSelectedUser = async (userId: number) => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await usersApi.getById(token, userId);
      setSelectedUser(response);
    } catch (err) {
      setError('Erreur lors du chargement des informations utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNonPresenterUsers = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await usersApi.getNonPresenters(token);
      setUsers(response.users);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser) return;

    try {
      setIsLoading(true);
      await presenterApi.create(token, {
        ...formData,
        name: `${selectedUser.name} ${selectedUser.family_name}`,
        users_id: selectedUser.id,
      });
      onSuccess();
    } catch (err) {
      setError('Erreur lors de la création du présentateur');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.name.toLowerCase().includes(searchLower) ||
      user.family_name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Nouveau présentateur
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              {error}
            </div>
          )}

          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un utilisateur
              </label>
              {!selectedUser && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Chargement des utilisateurs...
                  </div>
                ) : selectedUser ? (
                  <div className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {selectedUser.profilePicture ? (
                        <img
                          src={selectedUser.profilePicture}
                          alt={selectedUser.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {selectedUser.name} {selectedUser.family_name}
                      </div>
                      <div className="text-sm text-gray-500">{selectedUser.email}</div>
                    </div>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
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
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Aucun utilisateur disponible
                  </div>
                )}
              </div>
            </div>

            {selectedUser && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biographie
                  </label>
                  <textarea
                    value={formData.biography || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, biography: e.target.value })
                    }
                    rows={3}
                    className="form-textarea"
                    placeholder="Biographie du présentateur..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Informations de contact
                  </label>
                  <input
                    type="text"
                    value={formData.contact_info || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_info: e.target.value })
                    }
                    className="form-input"
                    placeholder="Informations de contact supplémentaires..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isMainPresenter"
                    checked={formData.isMainPresenter || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isMainPresenter: e.target.checked,
                      })
                    }
                    className="form-checkbox h-4 w-4 text-indigo-600"
                  />
                  <label
                    htmlFor="isMainPresenter"
                    className="text-sm text-gray-700"
                  >
                    Présentateur principal
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                    disabled={isLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Création...' : 'Créer le présentateur'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreatePresenterDialog;