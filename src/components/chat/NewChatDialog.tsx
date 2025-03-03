import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTeamStore } from '../../store/useTeamStore';
import { useChatStore } from '../../store/useChatStore';
import type { ChatRoom } from '../../types';

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatDialog: React.FC<NewChatDialogProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [roomName, setRoomName] = useState('');
  
  const members = useTeamStore((state) => state.members);
  const addRoom = useChatStore((state) => state.addRoom);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateRoom = () => {
    if (!roomName.trim() || selectedMembers.length === 0) return;

    const newRoom: ChatRoom = {
      id: uuidv4(),
      name: roomName.trim(),
      type: 'team',
      participants: selectedMembers,
      unreadCount: 0,
    };

    addRoom(newRoom);
    setActiveRoom(newRoom.id);
    onClose();
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
                Participants
              </label>
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
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <button onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button
              onClick={handleCreateRoom}
              disabled={!roomName.trim() || selectedMembers.length === 0}
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