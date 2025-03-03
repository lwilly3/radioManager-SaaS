import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, ChatRoom } from '../types';

/**
 * Interface defining the chat store state and actions.
 * Manages chat rooms, messages, and related functionality.
 */
interface ChatState {
  rooms: ChatRoom[];                    // List of all chat rooms
  messages: Record<string, Message[]>;   // Messages by room ID
  activeRoomId: string | null;          // Currently selected room
  pinnedMessages: Record<string, string[]>; // Pinned messages by room
  draftMessages: Record<string, string>;    // Saved message drafts by room
  
  // Room actions
  setActiveRoom: (roomId: string) => void;
  addRoom: (room: ChatRoom) => void;
  markRoomAsRead: (roomId: string) => void;
  archiveRoom: (roomId: string) => void;
  
  // Message actions
  addMessage: (roomId: string, message: Message) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  editMessage: (roomId: string, messageId: string, newContent: string) => void;
  
  // Message interaction actions
  pinMessage: (roomId: string, messageId: string) => void;
  unpinMessage: (roomId: string, messageId: string) => void;
  addReaction: (roomId: string, messageId: string, emoji: string, userId: string) => void;
  removeReaction: (roomId: string, messageId: string, emoji: string, userId: string) => void;
  saveDraft: (roomId: string, content: string) => void;
}

// Mock data for development purposes
const mockRoom: ChatRoom = {
  id: '1',
  name: 'Équipe technique',
  type: 'team',
  description: 'Discussion de l\'équipe technique',
  participants: ['1', '2', '3'],
  unreadCount: 0,
  createdAt: new Date().toISOString(),
  createdBy: '1',
};

/**
 * Chat store implementation using Zustand with persistence.
 * Handles all chat-related state and operations.
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      rooms: [mockRoom],
      messages: {},
      activeRoomId: null,
      pinnedMessages: {},
      draftMessages: {},

      // Room management
      setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

      addRoom: (room) =>
        set((state) => ({
          rooms: [...state.rooms, room],
          messages: { ...state.messages, [room.id]: [] },
        })),

      markRoomAsRead: (roomId) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId ? { ...room, unreadCount: 0 } : room
          ),
        })),

      // Message management
      addMessage: (roomId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]: [...(state.messages[roomId] || []), message],
          },
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  lastMessage: message,
                  unreadCount: room.unreadCount + 1,
                }
              : room
          ),
        })),

      // Message interactions
      pinMessage: (roomId, messageId) =>
        set((state) => ({
          pinnedMessages: {
            ...state.pinnedMessages,
            [roomId]: [...(state.pinnedMessages[roomId] || []), messageId],
          },
        })),

      unpinMessage: (roomId, messageId) =>
        set((state) => ({
          pinnedMessages: {
            ...state.pinnedMessages,
            [roomId]: (state.pinnedMessages[roomId] || []).filter(
              (id) => id !== messageId
            ),
          },
        })),

      // Reaction management
      addReaction: (roomId, messageId, emoji, userId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]: state.messages[roomId].map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    reactions: [
                      ...(message.reactions || []),
                      { emoji, count: 1, users: [userId] },
                    ],
                  }
                : message
            ),
          },
        })),

      removeReaction: (roomId, messageId, emoji, userId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]: state.messages[roomId].map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    reactions: (message.reactions || [])
                      .map((reaction) =>
                        reaction.emoji === emoji
                          ? {
                              ...reaction,
                              count: reaction.count - 1,
                              users: reaction.users.filter((id) => id !== userId),
                            }
                          : reaction
                      )
                      .filter((reaction) => reaction.count > 0),
                  }
                : message
            ),
          },
        })),

      // Draft management
      saveDraft: (roomId, content) =>
        set((state) => ({
          draftMessages: {
            ...state.draftMessages,
            [roomId]: content,
          },
        })),

      // Room archiving
      archiveRoom: (roomId) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId ? { ...room, isArchived: true } : room
          ),
        })),

      // Message editing and deletion
      deleteMessage: (roomId, messageId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]: state.messages[roomId].filter(
              (message) => message.id !== messageId
            ),
          },
        })),

      editMessage: (roomId, messageId, newContent) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]: state.messages[roomId].map((message) =>
              message.id === messageId
                ? { ...message, content: newContent }
                : message
            ),
          },
        })),
    }),
    {
      name: 'chat-storage', // Storage key for persistence
    }
  )
);