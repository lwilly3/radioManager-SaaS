import { create } from 'zustand';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  limit,
  writeBatch,
  doc,
  setDoc,
  getDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../api/firebase/firebase';
import { useAuthStore } from './useAuthStore';
import type { ShowChatMessage } from '../types/chat';

interface ShowChatState {
  messages: ShowChatMessage[];
  unreadMessages: ShowChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (
    showId: string,
    message: Omit<ShowChatMessage, 'id' | 'timestamp'>
  ) => Promise<void>;
  subscribeToShowChat: (showId: string) => () => void;
  subscribeToUnreadMessages: (showId: string) => () => void;
  markMessagesAsRead: (showId: string) => Promise<void>;
  initializeShowChat: (showId: string) => Promise<void>;
}

export const useShowChatStore = create<ShowChatState>((set) => ({
  messages: [],
  unreadMessages: [],
  isLoading: false,
  error: null,

  initializeShowChat: async (showId) => {
    try {
      const showChatRef = doc(db, 'show_chats', showId);
      const showChatDoc = await getDoc(showChatRef);

      if (!showChatDoc.exists()) {
        await setDoc(showChatRef, {
          showId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // const messagesRef = collection(showChatRef, 'messages');
        // await addDoc(messagesRef, {
        //   content: 'Discussion du conducteur initialisée',
        //   sender: { id: 'system', name: 'Système' },
        //   timestamp: serverTimestamp(),
        //   readBy: [],
        // });
      }
    } catch (error) {
      console.error('Error initializing show chat:', error);
      set({ error: 'Failed to initialize chat' });
    }
  },

  sendMessage: async (showId, messageData) => {
    try {
      await useShowChatStore.getState().initializeShowChat(showId);

      const showChatRef = doc(db, 'show_chats', showId);
      const messagesRef = collection(showChatRef, 'messages');

      const batch = writeBatch(db);
      batch.update(showChatRef, { updatedAt: serverTimestamp() });
      await batch.commit();

      await addDoc(messagesRef, {
        ...messageData,
        timestamp: serverTimestamp(),
        readBy: [messageData.sender.id],
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToShowChat: (showId) => {
    set({ isLoading: true });

    useShowChatStore
      .getState()
      .initializeShowChat(showId)
      .then(() => {
        const messagesRef = collection(db, 'show_chats', showId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              timestamp:
                doc.data().timestamp?.toDate().toISOString() ||
                new Date().toISOString(),
              readBy: doc.data().readBy || [],
            })) as ShowChatMessage[];

            set({ messages, isLoading: false });
          },
          (error) => {
            console.error('Error subscribing to chat:', error);
            set({ error: 'Failed to load chat messages', isLoading: false });
          }
        );

        return unsubscribe;
      });

    return () => {};
  },

  subscribeToUnreadMessages: (showId) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return () => {};

    useShowChatStore
      .getState()
      .initializeShowChat(showId)
      .then(() => {
        const messagesRef = collection(db, 'show_chats', showId, 'messages');
        const q = query(
          messagesRef,
          where('sender.id', '!=', userId),
          orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const allMessages = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              timestamp:
                doc.data().timestamp?.toDate().toISOString() ||
                new Date().toISOString(),
              readBy: doc.data().readBy || [],
            })) as ShowChatMessage[];

            const unreadMessages = allMessages.filter(
              (msg) => !msg.readBy.includes(userId)
            );
            // .slice(0, 1);

            set({ unreadMessages });
          },
          (error) => {
            console.error('Error subscribing to unread messages:', error);
            set({ error: 'Failed to load unread messages' });
          }
        );

        return unsubscribe;
      });

    return () => {};
  },

  markMessagesAsRead: async (showId) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      await useShowChatStore.getState().initializeShowChat(showId);

      const messagesRef = collection(db, 'show_chats', showId, 'messages');
      const q = query(messagesRef); // Tous les messages

      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const readBy = data.readBy || [];
        if (!readBy.includes(userId)) {
          batch.update(doc.ref, { readBy: arrayUnion(userId) });
        }
      });

      await batch.commit();

      set((state) => ({
        unreadMessages: state.unreadMessages.filter(
          (msg) => !msg.readBy.includes(userId)
        ),
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
      set({ error: 'Failed to mark messages as read' });
    }
  },
}));
