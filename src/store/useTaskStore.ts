import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../api/firebase/firebase';
import type { Task, TaskComment, TaskStatus } from '../types/task';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Task CRUD operations
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  archiveTask: (taskId: string) => Promise<void>;
  
  // Task status management
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  
  // Task comments
  addComment: (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;
  
  // Task assignees
  updateAssignees: (taskId: string, assigneeIds: string[]) => Promise<void>;
  
  // Subscriptions
  subscribeToTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,

      createTask: async (taskData) => {
        set({ isLoading: true });
        try {
          const taskRef = doc(collection(db, 'tasks'));
          const task: Task = {
            id: taskRef.id,
            ...taskData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
          };
          
          await setDoc(taskRef, task);
          set((state) => ({
            tasks: [...state.tasks, task],
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to create task', isLoading: false });
          console.error('Error creating task:', err);
        }
      },

      updateTask: async (taskId, updates) => {
        set({ isLoading: true });
        try {
          const taskRef = doc(db, 'tasks', taskId);
          const updatedData = {
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          await updateDoc(taskRef, updatedData);
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updatedData } : task
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to update task', isLoading: false });
          console.error('Error updating task:', err);
        }
      },

      deleteTask: async (taskId) => {
        set({ isLoading: true });
        try {
          await updateDoc(doc(db, 'tasks', taskId), {
            deleted: true,
            updatedAt: new Date().toISOString(),
          });
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to delete task', isLoading: false });
          console.error('Error deleting task:', err);
        }
      },

      archiveTask: async (taskId) => {
        set({ isLoading: true });
        try {
          await updateDoc(doc(db, 'tasks', taskId), {
            archived: true,
            updatedAt: new Date().toISOString(),
          });
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to archive task', isLoading: false });
          console.error('Error archiving task:', err);
        }
      },

      updateTaskStatus: async (taskId, status) => {
        set({ isLoading: true });
        try {
          await updateDoc(doc(db, 'tasks', taskId), {
            status,
            updatedAt: new Date().toISOString(),
          });
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to update task status', isLoading: false });
          console.error('Error updating task status:', err);
        }
      },

      addComment: async (taskId, commentData) => {
        set({ isLoading: true });
        try {
          const task = get().tasks.find((t) => t.id === taskId);
          if (!task) throw new Error('Task not found');

          const comment: TaskComment = {
            id: crypto.randomUUID(),
            ...commentData,
            createdAt: new Date().toISOString(),
          };

          const updatedComments = [...task.comments, comment];
          
          await updateDoc(doc(db, 'tasks', taskId), {
            comments: updatedComments,
            updatedAt: new Date().toISOString(),
          });

          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId ? { ...t, comments: updatedComments } : t
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to add comment', isLoading: false });
          console.error('Error adding comment:', err);
        }
      },

      deleteComment: async (taskId, commentId) => {
        set({ isLoading: true });
        try {
          const task = get().tasks.find((t) => t.id === taskId);
          if (!task) throw new Error('Task not found');

          const updatedComments = task.comments.filter((c) => c.id !== commentId);
          
          await updateDoc(doc(db, 'tasks', taskId), {
            comments: updatedComments,
            updatedAt: new Date().toISOString(),
          });

          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId ? { ...t, comments: updatedComments } : t
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to delete comment', isLoading: false });
          console.error('Error deleting comment:', err);
        }
      },

      updateAssignees: async (taskId, assigneeIds) => {
        set({ isLoading: true });
        try {
          await updateDoc(doc(db, 'tasks', taskId), {
            assignees: assigneeIds,
            updatedAt: new Date().toISOString(),
          });
          
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, assignees: assigneeIds } : task
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to update assignees', isLoading: false });
          console.error('Error updating assignees:', err);
        }
      },

      subscribeToTasks: () => {
        set({ isLoading: true });
        const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
        
        onSnapshot(
          q,
          (snapshot) => {
            const tasks = snapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() } as Task))
              .filter((task) => !task.deleted && !task.archived);
            
            set({ tasks, isLoading: false });
          },
          (err) => {
            set({ error: 'Failed to fetch tasks', isLoading: false });
            console.error('Error fetching tasks:', err);
          }
        );
      },
    }),
    {
      name: 'task-storage',
    }
  )
);