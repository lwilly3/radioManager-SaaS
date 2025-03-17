import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, Users, Shield, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTeamStore } from '../../store/useTeamStore';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { ChatRoom } from '../../types';

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatDialog: React.FC<NewChatDialogProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const members = useTeamStore((state) => state.members);
  const addRoom = useChatStore((state) => state.addRoom);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);
  const { user } = useAuthStore();

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedMembers([]);
      setRoomName('');
      setRoomDescription('');
      setError(null);
    }
  }, [isOpen]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
                         member.email.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleCreateRoom = async () => {
    if (!user) return;
    if (!roomName.trim()) {
      setError('Le nom de la discussion est requis');
      return;
    }
    if (selectedMembers.length === 0) {
      setError('Sélectionnez au moins un participant');
      return;
    }

    try {
      const newRoom: ChatRoom = {
        id: uuidv4(),
        name: roomName.trim(),
        description: roomDescription.trim() || undefined,
        type: 'team',
        participants: [...selectedMembers, user.id],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: user.id,
        isArchived: false
      };

      await addRoom(newRoom);
      setActiveRoom(newRoom.id);
      onClose();
    } catch (err) {
      setError('Erreur lors de la création de la discussion');
    }
  };

  const handleSelectAll = () => {
    setSelectedMembers(members.map(m => m.id));
  };

  const handleUnselectAll = () => {
    setSelectedMembers([]);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Nouvelle discussion
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la discussion
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="form-input"
                placeholder="Ex: Équipe technique"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnelle)
              </label>
              <textarea
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                className="form-textarea"
                rows={2}
                placeholder="Description de la discussion..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Participants
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    Tout sélectionner
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleUnselectAll}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher des membres..."
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
              {filteredMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, member.id]);
                      } else {
                        setSelectedMembers(
                          selectedMembers.filter((id) => id !== member.id)
                        );
                      }
                    }}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </label>
              ))}
              {filteredMembers.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Aucun membre trouvé
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <button onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button
              onClick={handleCreateRoom}
              className="btn btn-primary flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              Créer la discussion
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default NewChatDialog;