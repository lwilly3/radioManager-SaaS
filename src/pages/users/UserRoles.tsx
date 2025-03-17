import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Plus, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { usersApi } from '../../services/api/users';
import { rolesApi } from '../../services/api/roles';
import type { Users, Role } from '../../types/user';

const UserRoles: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const [user, setUser] = useState<Users | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !id) return;

      try {
        setIsLoading(true);
        const [userData, allRoles] = await Promise.all([
          usersApi.getById(token, parseInt(id)),
          rolesApi.getAll(token),
        ]);

        setUser(userData);
        setAvailableRoles(allRoles);
        setSelectedRoles(userData.roles.map((role) => role.id));
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, id]);

  const handleRoleToggle = async (roleId: number) => {
    if (!token || !user) return;

    const isRoleAssigned = selectedRoles.includes(roleId);
    const newRoles = isRoleAssigned
      ? selectedRoles.filter((id) => id !== roleId)
      : [...selectedRoles, roleId];

    try {
      if (isRoleAssigned) {
        await rolesApi.unassignRoles(token, user.id, [roleId]);
      } else {
        await rolesApi.assignRoles(token, user.id, [roleId]);
      }

      setSelectedRoles(newRoles);

      // Update user roles in state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              roles: availableRoles.filter((role) =>
                newRoles.includes(role.id)
              ),
            }
          : null
      );
    } catch (err) {
      setError('Erreur lors de la mise à jour des rôles');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-red-600">
        Utilisateur non trouvé
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Retour aux utilisateurs
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Gestion des rôles
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Gérez les rôles de {user.name} {user.family_name}
          </p>
        </div>

        {error && (
          <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Rôles assignés
              </h3>
              <span className="text-sm text-gray-500">
                {selectedRoles.length} rôle(s)
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    selectedRoles.includes(role.id)
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedRoles.includes(role.id)
                          ? 'bg-indigo-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Shield
                        className={`h-5 w-5 ${
                          selectedRoles.includes(role.id)
                            ? 'text-indigo-600'
                            : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          selectedRoles.includes(role.id)
                            ? 'text-indigo-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {role.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRoleToggle(role.id)}
                    className={`p-1 rounded-full ${
                      selectedRoles.includes(role.id)
                        ? 'text-indigo-600 hover:bg-indigo-100'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {selectedRoles.includes(role.id) ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoles;