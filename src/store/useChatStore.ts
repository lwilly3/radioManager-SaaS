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
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../api/firebase/firebase';
import type { Message, ChatRoom } from '../types/chat';

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
  deleteRoom: (roomId: string) => Promise<void>;
  markRoomAsRead: (roomId: string) => Promise<void>;
  archiveRoom: (roomId: string) => Promise<void>;
  addMessage: (roomId: string, message: Message) => Promise<void>;
  deleteMessage: (roomId: string, messageId: string) => Promise<void>;
  editMessage: (roomId: string, messageId: string, newContent: string) => Promise<void>;
  pinMessage: (roomId: string, messageId: string) => void;
  unpinMessage: (roomId: string, messageId: string) => void;
  addReaction: (roomId: string, messageId: string, emoji: string, userId: string) => Promise<void>;
  removeReaction: (roomId: string, messageId: string, emoji: string, userId: string) => Promise<void>;
  saveDraft: (roomId: string, content: string) => void;
  subscribeToRooms: () => void;
  subscribeToMessages: (roomId: string) => void;
  ensureDefaultTechniciansRoom: () => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
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
          const roomData = {
            ...room,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            unreadCount: room.participants.reduce(
              (acc, userId) => ({ ...acc, [userId]: 0 }),
              {}
            ),
          };
          
          await setDoc(roomRef, roomData);
          set((state) => ({
            rooms: [...state.rooms, room],
            messages: { ...state.messages, [room.id]: [] },
            isLoading: false,
          }));
        } catch (err) {
          console.error('Error adding room:', err);
          set({
            error: 'Error creating room',
            isLoading: false,
          });
        }
      },

      deleteRoom: async (roomId) => {
        try {
          // Delete all messages in the room
          const messagesRef = collection(db, `rooms/${roomId}/messages`);
          const messagesSnapshot = await getDocs(messagesRef);
          const batch = writeBatch(db);
          
          messagesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          
          // Delete the room document
          batch.delete(doc(db, 'rooms', roomId));
          await batch.commit();

          set((state) => ({
            rooms: state.rooms.filter((r) => r.id !== roomId),
            messages: Object.fromEntries(
              Object.entries(state.messages).filter(([key]) => key !== roomId)
            ),
            activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId,
          }));
        } catch (err) {
          console.error('Error deleting room:', err);
          set({ error: 'Error deleting room' });
        }
      },

      markRoomAsRead: async (roomId) => {
        const userId = get().activeRoomId;
        if (!userId) return;

        try {
          const roomRef = doc(db, 'rooms', roomId);
          await updateDoc(roomRef, {
            [`unreadCount.${userId}`]: 0,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.error('Error marking room as read:', err);
        }
      },

      archiveRoom: async (roomId) => {
        try {
          const roomRef = doc(db, 'rooms', roomId);
          await updateDoc(roomRef, {
            isArchived: true,
            updatedAt: serverTimestamp(),
          });
          
          set((state) => ({
            rooms: state.rooms.map((room) =>
              room.id === roomId ? { ...room, isArchived: true } : room
            ),
          }));
        } catch (err) {
          console.error('Error archiving room:', err);
        }
      },

      addMessage: async (roomId, message) => {
        set({ isLoading: true });
        try {
          const messagesRef = collection(db, `rooms/${roomId}/messages`);
          const messageData = {
            ...message,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          const docRef = await addDoc(messagesRef, messageData);
          const newMessage = { ...messageData, id: docRef.id };

          // Update room's last message and unread counts
          const roomRef = doc(db, 'rooms', roomId);
          await updateDoc(roomRef, {
            lastMessage: newMessage,
            updatedAt: serverTimestamp(),
            [`unreadCount.${message.sender.id}`]: 0,
          });

          set((state) => ({
            messages: {
              ...state.messages,
              [roomId]: [...(state.messages[roomId] || []), newMessage],
            },
            isLoading: false,
          }));
        } catch (err) {
          console.error('Error adding message:', err);
          set({ error: 'Error sending message', isLoading: false });
        }
      },

      deleteMessage: async (roomId, messageId) => {
        try {
          await deleteDoc(doc(db, `rooms/${roomId}/messages`, messageId));
          set((state) => ({
            messages: {
              ...state.messages,
              [roomId]: state.messages[roomId].filter((m) => m.id !== messageId),
            },
          }));
        } catch (err) {
          console.error('Error deleting message:', err);
        }
      },

      editMessage: async (roomId, messageId, newContent) => {
        try {
          const messageRef = doc(db, `rooms/${roomId}/messages`, messageId);
          await updateDoc(messageRef, {
            content: newContent,
            updatedAt: serverTimestamp(),
          });
          
          set((state) => ({
            messages: {
              ...state.messages,
              [roomId]: state.messages[roomId].map((m) =>
                m.id === messageId ? { ...m, content: newContent } : m
              ),
            },
          }));
        } catch (err) {
          console.error('Error editing message:', err);
        }
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
        try {
          const messageRef = doc(db, `rooms/${roomId}/messages`, messageId);
          await updateDoc(messageRef, {
            [`reactions.${emoji}`]: {
              count: 1,
              users: [userId],
              updatedAt: serverTimestamp(),
            },
          });
        } catch (err) {
          console.error('Error adding reaction:', err);
        }
      },

      removeReaction: async (roomId, messageId, emoji, userId) => {
        try {
          const messageRef = doc(db, `rooms/${roomId}/messages`, messageId);
          await updateDoc(messageRef, {
            [`reactions.${emoji}.users`]: [],
            [`reactions.${emoji}.count`]: 0,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.error('Error removing reaction:', err);
        }
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
            const rooms = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as ChatRoom[];
            
            set({ rooms, isLoading: false });
          },
          (err) => {
            console.error('Error fetching rooms:', err);
            set({
              error: 'Error fetching rooms',
              isLoading: false,
            });
          }
        );
      },

      subscribeToMessages: (roomId) => {
        set({ isLoading: true });
        const q = query(
          collection(db, `rooms/${roomId}/messages`),
          orderBy('createdAt', 'asc')
        );
        
        onSnapshot(
          q,
          (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Message[];
            
            set((state) => ({
              messages: { ...state.messages, [roomId]: messages },
              isLoading: false,
            }));
          },
          (err) => {
            console.error('Error fetching messages:', err);
            set({
              error: 'Error fetching messages',
              isLoading: false,
            });
          }
        );
      },

      ensureDefaultTechniciansRoom: async () => {
        set({ isLoading: true });
        try {
          const roomsRef = collection(db, 'rooms');
          const q = query(roomsRef);
          const snapshot = await getDocs(q);
          const techniciansRoomExists = snapshot.docs.some(
            (doc) => doc.data().name === 'Techniciens'
          );

          if (!techniciansRoomExists) {
            const defaultRoom: ChatRoom = {
              id: 'technicians-room',
              name: 'Techniciens',
              type: 'team',
              description: 'Discussion par défaut pour les techniciens',
              participants: ['1'],
              unreadCount: { '1': 0 },
              createdAt: new Date().toISOString(),
              createdBy: 'system',
              isArchived: false,
            };

            await setDoc(doc(db, 'rooms', defaultRoom.id), {
              ...defaultRoom,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            set((state) => ({
              rooms: [...state.rooms, defaultRoom],
              messages: { ...state.messages, [defaultRoom.id]: [] },
            }));
          }
          set({ isLoading: false });
        } catch (err) {
          console.error('Error creating default room:', err);
          set({
            error: 'Error creating default room',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);