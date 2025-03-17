export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  size: number;
  mimeType: string;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
  updatedAt?: any; // For Firebase Timestamp
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'file' | 'task' | 'event';
  sender: {
    id: string;
    name: string;
  };
  timestamp: any; // For Firebase Timestamp
  createdAt?: any; // For Firebase Timestamp
  updatedAt?: any; // For Firebase Timestamp
  replyTo?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
    };
  };
  attachments?: Attachment[];
  reactions?: Record<string, MessageReaction>;
  taskInfo?: {
    title: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignees: string[];
  };
  eventInfo?: {
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    attendees: string[];
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'team' | 'private';
  description?: string;
  participants: string[];
  unreadCount: Record<string, number>;
  lastMessage?: Message;
  createdAt: string | any; // String for local, Timestamp for Firestore
  updatedAt?: any; // For Firebase Timestamp
  createdBy: string;
  isArchived?: boolean;
}

// Show-specific chat messages
export interface ShowChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  attachments?: Attachment[];
  readBy: string[]; // Array of user IDs who have read the message
}