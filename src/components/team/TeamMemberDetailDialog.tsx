import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Mail, Phone, Radio, Calendar, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import type { TeamMember } from '../../types';

interface TeamMemberDetailDialogProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
}

const TeamMemberDetailDialog: React.FC<TeamMemberDetailDialogProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    host: 'Animateur',
    producer: 'Producteur',
    technician: 'Technicien',
    editor: 'Monteur',
    journalist: 'Journaliste',
  };

  const handleEdit = () => {
    onClose();
    navigate(`/team/${member.id}/edit`);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div>
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {member.name}
              </Dialog.Title>
              <p className="mt-1 text-sm text-gray-600">
                {roleLabels[member.role]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg"
                title="Modifier le membre"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Informations</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Membre depuis {format(new Date(member.joinedAt), 'MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Radio className="h-4 w-4" />
                    <span>{member.shows?.length || 0} émission(s)</span>
                  </div>
                </div>
              </div>
            </div>

            {member.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Biographie</h3>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Fermer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TeamMemberDetailDialog;