import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useChatStore } from '../../store/useChatStore';
import NotificationBadge from '../common/NotificationBadge';

interface ChatRoomListProps {
  onSelectRoom?: () => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ onSelectRoom }) => {
  const { rooms, activeRoomId, setActiveRoom } = useChatStore();

  const handleRoomSelect = (roomId: string) => {
    setActiveRoom(roomId);
    onSelectRoom?.();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => handleRoomSelect(room.id)}
          className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 relative ${
            activeRoomId === room.id ? 'bg-gray-50' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-600 font-medium">
              {room.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
              {room.lastMessage && (
                <span className="text-xs text-gray-500">
                  {format(new Date(room.lastMessage.timestamp), 'HH:mm', {
                    locale: fr,
                  })}
                </span>
              )}
            </div>
            {room.lastMessage && (
              <p className="text-sm text-gray-600 truncate">
                {room.lastMessage.sender.name}: {room.lastMessage.content}
              </p>
            )}
          </div>
          {room.unreadCount > 0 && (
            <NotificationBadge count={room.unreadCount} />
          )}
        </button>
      ))}
    </div>
  );
};

export default ChatRoomList;