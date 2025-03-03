import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Radio, User } from 'lucide-react';
import { useTeamStore } from '../../store/useTeamStore';
import TeamMemberDetailDialog from '../../components/team/TeamMemberDetailDialog';
import Notification from '../../components/common/Notification';
import type { TeamMember } from '../../types';

const TeamList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const members = useTeamStore((state) => state.members);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      window.history.replaceState({}, document.title);
      setTimeout(() => setNotification(null), 3000);
    }
  }, [location.state]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? member.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    host: 'Animateur',
    producer: 'Producteur',
    technician: 'Technicien',
    editor: 'Monteur',
    journalist: 'Journaliste',
  };

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Équipe</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez les membres de votre équipe
          </p>
        </div>
        <button 
          onClick={() => navigate('/team/create')}
          className="w-full sm:w-auto btn btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Nouveau membre</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un membre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Tous les rôles</option>
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{roleLabels[member.role]}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Radio className="h-4 w-4" />
                    <span>{member.shows?.length || 0} émission(s)</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{member.email}</p>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                <button 
                  onClick={() => setSelectedMember(member)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Voir les détails
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">Aucun membre trouvé</p>
            <button
              onClick={() => navigate('/team/create')}
              className="btn btn-primary"
            >
              Ajouter un membre
            </button>
          </div>
        )}
      </div>

      {selectedMember && (
        <TeamMemberDetailDialog
          member={selectedMember}
          isOpen={Boolean(selectedMember)}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default TeamList;