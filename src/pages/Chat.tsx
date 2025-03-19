






import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate
import ChatRoomList from '../components/chat/ChatRoomList';
import ChatRoom from '../components/chat/ChatRoom';
import NewChatDialog from '../components/chat/NewChatDialog';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const Chat: React.FC = () => {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const { permissions, syncPermissionsWithFirestore, isLoading, error } = useAuthStore();
  const { subscribeToRooms, ensureDefaultTechniciansRoom } = useChatStore();
  const navigate = useNavigate(); // Ajouter useNavigate

  // if (!permissions?.can_view_messages) {
  //   navigate('/404'); // Rediriger vers la page 404

  //   }

  useEffect(() => {
    let mounted = true;

    const initializeChat = async () => {
      if (!mounted) return;

      try {
        await syncPermissionsWithFirestore();
        subscribeToRooms();
        await ensureDefaultTechniciansRoom();
      } catch (err) {
        console.error('Error initializing chat:', err);
      }
    };

    initializeChat();

    return () => {
      mounted = false;
    };
  }, [syncPermissionsWithFirestore, subscribeToRooms, ensureDefaultTechniciansRoom]);

  // Vérifier la permission et rediriger vers 404 si elle manque
  useEffect(() => {
    if (!isLoading && !error && permissions && !permissions.can_view_messages) {
      navigate('/404'); // Rediriger vers la page 404
    }
  }, [permissions, isLoading, error, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-red-600">
        {error}
      </div>
    );
  }
    
  // Si permissions.can_view_messages est false, la redirection aura déjà eu lieu grâce au useEffect
  // On peut donc continuer le rendu normal ici
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 md:hidden transition-opacity z-20 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Chat List Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 w-80 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out z-30 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-4 border-b border-gray-200">
          {permissions?.can_send_messages && (
            <button
              onClick={() => setIsNewChatOpen(true)}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvelle discussion</span>
            </button>
          )}
        </div>
        <ChatRoomList onSelectRoom={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-2 p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-medium">Discussion</h1>
        </div>

        {/* Chat Content */}
        {activeRoomId ? (
          <ChatRoom roomId={activeRoomId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            <p>Sélectionnez une discussion pour commencer</p>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      {permissions?.can_send_messages && (
        <NewChatDialog
          isOpen={isNewChatOpen}
          onClose={() => setIsNewChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Chat;



















// import React, { useState, useEffect } from 'react';
// import { Plus, ChevronLeft } from 'lucide-react';
// import ChatRoomList from '../components/chat/ChatRoomList';
// import ChatRoom from '../components/chat/ChatRoom';
// import NewChatDialog from '../components/chat/NewChatDialog';
// import { useChatStore } from '../store/useChatStore';
// import { useAuthStore } from '../store/useAuthStore';

// const Chat: React.FC = () => {
//   const [isNewChatOpen, setIsNewChatOpen] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const activeRoomId = useChatStore((state) => state.activeRoomId);
//   const { permissions, syncPermissionsWithFirestore, isLoading, error } = useAuthStore();
//   const { subscribeToRooms, ensureDefaultTechniciansRoom } = useChatStore();

//   useEffect(() => {
//     let mounted = true;

//     const initializeChat = async () => {
//       if (!mounted) return;
      
//       try {
//         await syncPermissionsWithFirestore();
//         subscribeToRooms();
//         await ensureDefaultTechniciansRoom();
//       } catch (err) {
//         console.error('Error initializing chat:', err);
//       }
//     };

//     initializeChat();

//     return () => {
//       mounted = false;
//     };
//   }, [syncPermissionsWithFirestore, subscribeToRooms, ensureDefaultTechniciansRoom]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
//         <div className="spinner" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-red-600">
//         {error}
//       </div>
//     );
//   }

//   if (!permissions?.can_view_messages) {
//     return (
//       <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-gray-600">
//         Vous n'avez pas la permission de voir les messages.
//       </div>
//     );
//   }

//   return (
//     <div className="h-[calc(100vh-4rem)] flex">
//       {/* Sidebar Overlay */}
//       <div
//         className={`fixed inset-0 bg-black/30 md:hidden transition-opacity z-20 ${
//           isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//         onClick={() => setIsSidebarOpen(false)}
//       />

//       {/* Chat List Sidebar */}
//       <div
//         className={`fixed md:static inset-y-0 left-0 w-80 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out z-30 
//           ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
//       >
//         <div className="p-4 border-b border-gray-200">
//           {permissions?.can_send_messages && (
//             <button
//               onClick={() => setIsNewChatOpen(true)}
//               className="w-full btn btn-primary flex items-center justify-center gap-2"
//             >
//               <Plus className="h-5 w-5" />
//               <span>Nouvelle discussion</span>
//             </button>
//           )}
//         </div>
//         <ChatRoomList onSelectRoom={() => setIsSidebarOpen(false)} />
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col bg-gray-50">
//         {/* Mobile Header */}
//         <div className="md:hidden flex items-center gap-2 p-4 bg-white border-b border-gray-200">
//           <button
//             onClick={() => setIsSidebarOpen(true)}
//             className="p-2 hover:bg-gray-100 rounded-lg"
//           >
//             <ChevronLeft className="h-5 w-5" />
//           </button>
//           <h1 className="font-medium">Discussion</h1>
//         </div>

//         {/* Chat Content */}
//         {activeRoomId ? (
//           <ChatRoom roomId={activeRoomId} />
//         ) : (
//           <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
//             <p>Sélectionnez une discussion pour commencer</p>
//           </div>
//         )}
//       </div>

//       {/* New Chat Dialog */}
//       {permissions?.can_send_messages && (
//         <NewChatDialog
//           isOpen={isNewChatOpen}
//           onClose={() => setIsNewChatOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Chat;