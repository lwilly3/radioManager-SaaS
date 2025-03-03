import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Calendar, ListTodo } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import TaskCreator from './TaskCreator';
import EventCreator from './EventCreator';
import type { Message } from '../../types';

interface MessageInputProps {
  onSendMessage: (content: string, type: Message['type']) => void;
  onAttachFiles: (files: FileList) => void;
  replyTo?: Message;
  onCancelReply?: () => void;
  draft?: string;
  onSaveDraft?: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onAttachFiles,
  replyTo,
  onCancelReply,
  draft = '',
  onSaveDraft,
}) => {
  const [message, setMessage] = useState(draft);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [showEventCreator, setShowEventCreator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim(), 'text');
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAttachFiles(e.target.files);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">
              Réponse à {replyTo.sender.name}
            </p>
            <p className="text-sm text-gray-700 truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            title="Joindre un fichier"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            title="Ajouter un emoji"
          >
            <Smile className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowTaskCreator(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            title="Créer une tâche"
          >
            <ListTodo className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowEventCreator(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            title="Créer un événement"
          >
            <Calendar className="h-5 w-5" />
          </button>

          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onSaveDraft?.(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="flex-1 resize-none form-textarea min-h-[44px] max-h-32"
            rows={1}
          />

          <button
            type="submit"
            disabled={!message.trim()}
            className="btn btn-primary"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>

      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker
            onSelect={(emoji) => {
              setMessage((prev) => prev + emoji);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {showTaskCreator && (
        <TaskCreator
          onSubmit={(task) => {
            onSendMessage(JSON.stringify(task), 'task');
            setShowTaskCreator(false);
          }}
          onClose={() => setShowTaskCreator(false)}
        />
      )}

      {showEventCreator && (
        <EventCreator
          onSubmit={(event) => {
            onSendMessage(JSON.stringify(event), 'event');
            setShowEventCreator(false);
          }}
          onClose={() => setShowEventCreator(false)}
        />
      )}
    </div>
  );
};

export default MessageInput;