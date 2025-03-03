import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ChatRoomList from '../components/chat/ChatRoomList';
import ChatRoom from '../components/chat/ChatRoom';
import NewChatDialog from '../components/chat/NewChatDialog';
import { useChatStore } from '../store/useChatStore';

const Chat: React.FC = () => {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const activeRoomId = useChatStore((state) => state.activeRoomId);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar with chat rooms */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle discussion</span>
          </button>
        </div>
        <ChatRoomList />
      </div>

      {/* Main chat area */}
      <div className="flex-1 bg-gray-50">
        {activeRoomId ? (
          <ChatRoom roomId={activeRoomId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Sélectionnez une discussion pour commencer</p>
          </div>
        )}
      </div>

      {/* New chat dialog */}
      <NewChatDialog
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />
    </div>
  );
};

export default Chat;