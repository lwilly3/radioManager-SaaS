import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { rolesApi } from '../../services/api/roles';
import type { Role } from '../../types/user';

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchRoles();
  }, [token]);

  const fetchRoles = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const data = await rolesApi.getAll(token);
      setRoles(data);
    } catch (err) {
      setError('Erreur lors du chargement des rôles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!token || !newRoleName.trim()) return;

    try {
      const newRole = await rolesApi.create(token, newRoleName.trim());
      setRoles([...roles, newRole]);
      setNewRoleName('');
      setShowAddForm(false);
    } catch (err) {
      setError('Erreur lors de la création du rôle');
    }
  };

  const handleUpdateRole = async () => {
    if (!token || !editingRole) return;

    try {
      await rolesApi.update(token, editingRole.id, editingRole.name);
      setRoles(roles.map(role => 
        role.id === editingRole.id ? editingRole : role
      ));
      setEditingRole(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!token) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      return;
    }

    try {
      await rolesApi.delete(token, roleId);
      setRoles(roles.filter(role => role.id !== roleId));
    } catch (err) {
      setError('Erreur lors de la suppression du rôle');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Gestion des rôles</h2>
            <p className="text-gray-600 mt-1">
              Créez et gérez les rôles utilisateur
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouveau rôle
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Nouveau rôle</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Nom du rôle"
                className="flex-1 form-input"
              />
              <button
                onClick={handleCreateRole}
                disabled={!newRoleName.trim()}
                className="btn btn-primary"
              >
                Créer
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewRoleName('');
                }}
                className="btn btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              {editingRole?.id === role.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                    className="flex-1 form-input"
                  />
                  <button
                    onClick={handleUpdateRole}
                    className="p-2 text-green-600 hover:text-green-700"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditingRole(null)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-medium">{role.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingRole(role)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Modifier"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {roles.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Aucun rôle trouvé</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 btn btn-primary"
              >
                Créer un rôle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;