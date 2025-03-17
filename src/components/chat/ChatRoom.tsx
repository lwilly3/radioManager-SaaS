import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import ChatHeader from './ChatHeader';
import Message from './Message';
import MessageInput from './MessageInput';
import { v4 as uuidv4 } from 'uuid';
import type { Message as MessageType } from '../../types/chat';

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<MessageType | undefined>();
  const scrollTimeoutRef = useRef<number | null>(null);

  const { user: currentUser, permissions } = useAuthStore();
  const {
    messages,
    addMessage,
    markRoomAsRead,
    pinMessage,
    unpinMessage,
    addReaction,
    removeReaction,
    deleteMessage,
    editMessage,
    saveDraft,
    draftMessages,
    rooms,
    archiveRoom,
    deleteRoom
  } = useChatStore();

  const room = rooms.find((r) => r.id === roomId);
  const roomMessages = messages[roomId] || [];
  const canManageRoom = room?.createdBy === currentUser?.id;

  useEffect(() => {
    if (permissions?.can_view_messages) {
      useChatStore.getState().subscribeToMessages(roomId);
      markRoomAsRead(roomId);
      
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [roomId, roomMessages.length, markRoomAsRead, permissions]);

  const handleSendMessage = (content: string, type: MessageType['type']) => {
    if (!currentUser || !room || !permissions?.can_send_messages) return;

    const newMessage: MessageType = {
      id: uuidv4(),
      content,
      type,
      sender: currentUser,
      timestamp: new Date().toISOString(),
      ...(replyTo
        ? {
            replyTo: {
              id: replyTo.id,
              content: replyTo.content,
              sender: replyTo.sender,
            },
          }
        : {}),
    };

    addMessage(roomId, newMessage);
    setReplyTo(undefined);
  };

  const handleAttachFiles = async (files: FileList) => {
    if (!currentUser || !room || !permissions?.can_upload_files) return;

    const attachments = Array.from(files).map((file) => ({
      id: uuidv4(),
      name: file.name,
      type: file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('audio/')
        ? 'audio'
        : file.type.startsWith('video/')
        ? 'video'
        : 'document',
      url: URL.createObjectURL(file),
      size: file.size,
      mimeType: file.type,
    }));

    const newMessage: MessageType = {
      id: uuidv4(),
      content: '',
      type: 'file',
      sender: currentUser,
      timestamp: new Date().toISOString(),
      attachments,
    };

    addMessage(roomId, newMessage);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!currentUser || !permissions?.can_send_messages) return;

    const message = roomMessages.find((m) => m.id === messageId);
    if (!message) return;

    const existingReaction = message.reactions?.find((r) => r.emoji === emoji);
    const hasReacted = existingReaction?.users.includes(currentUser.id);

    if (hasReacted) {
      removeReaction(roomId, messageId, emoji, currentUser.id);
    } else {
      addReaction(roomId, messageId, emoji, currentUser.id);
    }
  };

  const handleArchiveRoom = async () => {
    if (!canManageRoom) return;
    if (window.confirm('Êtes-vous sûr de vouloir archiver cette discussion ?')) {
      await archiveRoom(roomId);
    }
  };

  const handleDeleteRoom = async () => {
    if (!canManageRoom) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette discussion ? Cette action est irréversible.')) {
      await deleteRoom(roomId);
    }
  };

  if (!room || !permissions?.can_view_messages) return null;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <ChatHeader
        room={room}
        onShowMembers={() => {}}
        onShowPinnedMessages={() => {}}
        onArchiveRoom={handleArchiveRoom}
        onDeleteRoom={canManageRoom ? handleDeleteRoom : undefined}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="py-4 space-y-1">
          {roomMessages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isCurrentUser={message.sender.id === currentUser?.id}
              onReply={() =>
                permissions?.can_send_messages && setReplyTo(message)
              }
              onPin={() => pinMessage(roomId, message.id)}
              onDelete={() =>
                permissions?.can_delete_messages &&
                deleteMessage(roomId, message.id)
              }
              onEdit={(newContent) =>
                permissions?.can_send_messages &&
                editMessage(roomId, message.id, newContent)
              }
              onReact={(emoji) => handleReaction(message.id, emoji)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {permissions?.can_send_messages && (
        <MessageInput
          onSendMessage={handleSendMessage}
          onAttachFiles={handleAttachFiles}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(undefined)}
          draft={draftMessages[roomId]}
          onSaveDraft={(content) => saveDraft(roomId, content)}
        />
      )}
    </div>
  );
};

export default ChatRoom;