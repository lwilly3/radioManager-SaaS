import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../../../src/api/firebase/firebase';
import type { Message, ChatRoom } from '../../types/chat';

interface ChatState {
  rooms: ChatRoom[];
  messages: Record<string, Message[]>;
  activeRoomId: string | null;
  pinnedMessages: Record<string, string[]>;
  draftMessages: Record<string, string>;
  isLoading: boolean;
  error: string | null;

  setActiveRoom: (roomId: string) => void;
  addRoom: (room: ChatRoom) => Promise<void>;
  markRoomAsRead: (roomId: string) => Promise<void>;
  archiveRoom: (roomId: string) => Promise<void>;
  addMessage: (roomId: string, message: Message) => Promise<void>;
  deleteMessage: (roomId: string, messageId: string) => Promise<void>;
  editMessage: (
    roomId: string,
    messageId: string,
    newContent: string
  ) => Promise<void>;
  pinMessage: (roomId: string, messageId: string) => void;
  unpinMessage: (roomId: string, messageId: string) => void;
  addReaction: (
    roomId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) => Promise<void>;
  removeReaction: (
    roomId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) => Promise<void>;
  saveDraft: (roomId: string, content: string) => void;
  subscribeToRooms: () => void;
  subscribeToMessages: (roomId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      rooms: [],
      messages: {},
      activeRoomId: null,
      pinnedMessages: {},
      draftMessages: {},
      isLoading: false,
      error: null,

      setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

      addRoom: async (room) => {
        set({ isLoading: true });
        try {
          const roomRef = doc(db, 'rooms', room.id);
          await setDoc(roomRef, {
            ...room,
            unreadCount: room.participants.reduce(
              (acc, userId) => ({ ...acc, [userId]: 0 }),
              {}
            ),
          });
          set({ isLoading: false });
        } catch (err) {
          set({
            error: 'Erreur lors de la création du salon',
            isLoading: false,
          });
        }
      },

      markRoomAsRead: async (roomId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          [`unreadCount.${userId}`]: 0,
        });
      },

      archiveRoom: async (roomId) => {
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, { isArchived: true });
      },

      addMessage: async (roomId, message) => {
        const messagesRef = collection(db, `rooms/${roomId}/messages`);
        await addDoc(messagesRef, message);

        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          lastMessage: message,
          unreadCount: Object.fromEntries(
            Object.entries(
              get().rooms.find((r) => r.id === roomId)?.unreadCount || {}
            ).map(([userId]) => [
              userId,
              userId === message.sender.id
                ? 0
                : (get().messages[roomId]?.length || 0) + 1,
            ])
          ),
        });
      },

      deleteMessage: async (roomId, messageId) => {
        await deleteDoc(doc(db, `rooms/${roomId}/messages`, messageId));
      },

      editMessage: async (roomId, messageId, newContent) => {
        const messageRef = doc(db, `rooms/${roomId}/messages`, messageId);
        await updateDoc(messageRef, { content: newContent });
      },

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

      addReaction: async (roomId, messageId, emoji, userId) => {
        const messageRef = doc(db, `rooms/${roomId}/messages`, messageId);
        const message = get().messages[roomId]?.find((m) => m.id === messageId);
        const reactions = message?.reactions || [];
        const existingReaction = reactions.find((r) => r.emoji === emoji);

        if (existingReaction) {
          await updateDoc(messageRef, {
            reactions: reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, userId] }
                : r
            ),
          });
        } else {
          await updateDoc(messageRef, {
            reactions: [...reactions, { emoji, count: 1, users: [userId] }],
          });
        }
      },

      removeReaction: async (roomId, messageId, emoji, userId) => {
        const messageRef = doc(db, `rooms/${roomId}/messages`, messageId);
        const message = get().messages[roomId]?.find((m) => m.id === messageId);
        const reactions = message?.reactions || [];

        await updateDoc(messageRef, {
          reactions: reactions
            .map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count - 1,
                    users: r.users.filter((id) => id !== userId),
                  }
                : r
            )
            .filter((r) => r.count > 0),
        });
      },

      saveDraft: (roomId, content) =>
        set((state) => ({
          draftMessages: { ...state.draftMessages, [roomId]: content },
        })),

      subscribeToRooms: () => {
        set({ isLoading: true });
        const q = query(collection(db, 'rooms'));
        onSnapshot(
          q,
          (snapshot) => {
            const rooms = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as ChatRoom)
            );
            set({ rooms, isLoading: false });
          },
          (err) => {
            set({
              error: 'Erreur lors de la récupération des salons',
              isLoading: false,
            });
          }
        );
      },

      subscribeToMessages: (roomId) => {
        set({ isLoading: true });
        const q = query(
          collection(db, `rooms/${roomId}/messages`),
          orderBy('timestamp')
        );
        onSnapshot(
          q,
          (snapshot) => {
            const messages = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Message)
            );
            set((state) => ({
              messages: { ...state.messages, [roomId]: messages },
              isLoading: false,
            }));
          },
          (err) => {
            set({
              error: 'Erreur lors de la récupération des messages',
              isLoading: false,
            });
          }
        );
      },
    }),
    { name: 'chat-storage' }
  )
);
