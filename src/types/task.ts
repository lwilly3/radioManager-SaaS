import { Presenter } from './index';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignees: string[]; // Array of presenter IDs
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  chatRoomId?: string; // If created from chat
  messageId?: string; // If created from chat
  comments: TaskComment[];
  attachments?: TaskAttachment[];
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskComment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  attachments?: TaskAttachment[];
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  assignees: string[];
}