import React from 'react';
import { MoreVertical, Users, Pin, Archive, Trash2 } from 'lucide-react';
import { Menu } from '@headlessui/react';
import type { ChatRoom } from '../../types';

interface ChatHeaderProps {
  room: ChatRoom;
  onShowMembers: () => void;
  onShowPinnedMessages: () => void;
  onArchiveRoom: () => void;
  onDeleteRoom?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  onShowMembers,
  onShowPinnedMessages,
  onArchiveRoom,
  onDeleteRoom,
}) => {
  return (
    <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
        {room.description && (
          <p className="text-sm text-gray-500">{room.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onShowMembers}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
          title="Voir les membres"
        >
          <Users className="h-5 w-5" />
        </button>
        <button
          onClick={onShowPinnedMessages}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
          title="Messages épinglés"
        >
          <Pin className="h-5 w-5" />
        </button>

        <Menu as="div" className="relative">
          <Menu.Button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg">
            <MoreVertical className="h-5 w-5" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onArchiveRoom}
                  className={`${
                    active ? 'bg-gray-50' : ''
                  } w-full px-4 py-2 text-left text-sm text-gray-700 flex items-center gap-2`}
                >
                  <Archive className="h-4 w-4" />
                  Archiver la discussion
                </button>
              )}
            </Menu.Item>
            {onDeleteRoom && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onDeleteRoom}
                    className={`${
                      active ? 'bg-gray-50' : ''
                    } w-full px-4 py-2 text-left text-sm text-red-600 flex items-center gap-2`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer la discussion
                  </button>
                )}
              </Menu.Item>
            )}
          </Menu.Items>
        </Menu>
      </div>
    </div>
  );
};

export default ChatHeader;