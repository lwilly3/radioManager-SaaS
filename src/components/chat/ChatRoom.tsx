import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import ChatHeader from './ChatHeader';
import Message from './Message';
import MessageInput from './MessageInput';
import { v4 as uuidv4 } from 'uuid';
import type { Message as MessageType } from '../../types';

/**
 * ChatRoom component displays a single chat room with messages and input.
 * Handles message sending, reactions, and various message interactions.
 */
interface ChatRoomProps {
  roomId: string;  // ID of the current chat room
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  // Refs and state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<MessageType | undefined>();
  
  // Store hooks
  const currentUser = useAuthStore((state) => state.user);
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
  } = useChatStore();

  // Get current room and its messages
  const room = rooms.find((r) => r.id === roomId);
  const roomMessages = messages[roomId] || [];

  // Auto-scroll and mark as read on new messages
  useEffect(() => {
    markRoomAsRead(roomId);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomId, roomMessages.length, markRoomAsRead]);

  /**
   * Handles sending a new message
   * @param content Message content
   * @param type Message type (text, file, etc.)
   */
  const handleSendMessage = (content: string, type: MessageType['type']) => {
    if (!currentUser || !room) return;

    const newMessage: MessageType = {
      id: uuidv4(),
      content,
      type,
      sender: currentUser,
      timestamp: new Date().toISOString(),
      replyTo: replyTo
        ? {
            id: replyTo.id,
            content: replyTo.content,
            sender: replyTo.sender,
          }
        : undefined,
    };

    addMessage(roomId, newMessage);
    setReplyTo(undefined);
  };

  /**
   * Handles file attachments
   * @param files List of files to attach
   */
  const handleAttachFiles = async (files: FileList) => {
    if (!currentUser || !room) return;

    // Convert files to attachments
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

  /**
   * Handles message reactions
   * @param messageId ID of the message to react to
   * @param emoji Emoji reaction
   */
  const handleReaction = (messageId: string, emoji: string) => {
    if (!currentUser) return;

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

  if (!room) return null;

  return (
    <div className="h-full flex flex-col">
      <ChatHeader
        room={room}
        onShowMembers={() => {}}
        onShowPinnedMessages={() => {}}
        onArchiveRoom={() => {}}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {roomMessages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isCurrentUser={message.sender.id === currentUser?.id}
            onReply={() => setReplyTo(message)}
            onPin={() => pinMessage(roomId, message.id)}
            onDelete={() => deleteMessage(roomId, message.id)}
            onEdit={(newContent) => editMessage(roomId, message.id, newContent)}
            onReact={(emoji) => handleReaction(message.id, emoji)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        onAttachFiles={handleAttachFiles}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(undefined)}
        draft={draftMessages[roomId]}
        onSaveDraft={(content) => saveDraft(roomId, content)}
      />
    </div>
  );
};

export default ChatRoom;