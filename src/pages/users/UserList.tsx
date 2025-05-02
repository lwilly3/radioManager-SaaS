import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, User, Shield, Trash2, Edit, ChevronDown, X, Filter, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { usersApi } from '../../services/api/users';
import { rolesApi } from '../../services/api/roles';
import type { Users, Role } from '../../types/user';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GenerateInviteLink from '../../components/auth/GenerateInviteLink';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Users[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const token = useAuthStore((state) => state.token);
  const [editingRolesForUser, setEditingRolesForUser] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const { permissions } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !error && permissions && !permissions.can_acces_users_section) {
      navigate('/404');
    }
  }, [permissions, isLoading, error, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const [usersData, rolesData] = await Promise.all([
          usersApi.getAll(token),
          rolesApi.getAll(token),
        ]);
        setUsers(usersData);
        setAvailableRoles(rolesData);
      } catch (err) {
        setError('Erreur lors du chargement des utilisateurs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleDeleteUser = async (userId: number) => {
    if (!token) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await usersApi.delete(token, userId);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      setError("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleEditRoles = (user: Users) => {
    setEditingRolesForUser(user.id);
    setSelectedRoles(user.roles.map(role => role.id));
  };

  const handleRoleToggle = async (roleId: number) => {
    if (!editingRolesForUser || !token) return;

    try {
      const newSelectedRoles = selectedRoles.includes(roleId)
        ? selectedRoles.filter(id => id !== roleId)
        : [...selectedRoles, roleId];

      if (selectedRoles.includes(roleId)) {
        await rolesApi.unassignRoles(token, editingRolesForUser, [roleId]);
      } else {
        await rolesApi.assignRoles(token, editingRolesForUser, [roleId]);
      }

      setSelectedRoles(newSelectedRoles);
      
      setUsers(users.map(user => {
        if (user.id === editingRolesForUser) {
          return {
            ...user,
            roles: availableRoles.filter(role => newSelectedRoles.includes(role.id))
          };
        }
        return user;
      }));
    } catch (err) {
      setError('Erreur lors de la mise à jour des rôles');
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.name.toLowerCase().includes(searchLower) ||
      user.family_name.toLowerCase().includes(searchLower);

    const matchesRole = selectedRole 
      ? user.roles.some(role => role.id === selectedRole)
      : true;

    return matchesSearch && matchesRole;
  });

  const handleInviteSent = (token: string) => {
    console.log(`Invitation envoyée avec le token: ${token}`);
    // Vous pouvez ajouter ici une notification ou une mise à jour de l'interface
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600">Gérez les utilisateurs et leurs rôles</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Mail className="h-5 w-5" />
            {showInviteForm ? "Masquer le formulaire d'invitation" : "Inviter un utilisateur"}
          </button>
          <button
            onClick={() => navigate('/users/create')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouvel utilisateur
          </button>
        </div>
      </header>

      {showInviteForm && (
        <GenerateInviteLink onInviteSent={handleInviteSent} />
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedRole || ''}
            onChange={(e) => setSelectedRole(e.target.value ? Number(e.target.value) : null)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
          >
            <option value="">Tous les rôles</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profilePicture ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.profilePicture}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name} {user.family_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <div 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleEditRoles(user)}
                        >
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <span
                                key={role.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {role.name}
                              </span>
                            ))}
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>

                        {editingRolesForUser === user.id && (
                          <div className="absolute z-50 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                            <div className="px-3 py-2 border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-700">Rôles</h4>
                                <button
                                  onClick={() => setEditingRolesForUser(null)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            {availableRoles.map((role) => (
                              <label
                                key={role.id}
                                className="flex items-center px-3 py-2 hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRoles.includes(role.id)}
                                  onChange={() => handleRoleToggle(role.id)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{role.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(user.created_at), 'dd MMMM yyyy', {
                        locale: fr,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Modifier"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucun utilisateur trouvé
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer un nouvel utilisateur.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/users/create')}
              className="btn btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvel utilisateur
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;