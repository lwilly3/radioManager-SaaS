import React, { useState, useRef } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Calendar,
  ListTodo,
  X,
  Image,
  FileText,
  Music,
  Video,
} from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import TaskCreator from './TaskCreator';
import EventCreator from './EventCreator';
import type { Message } from '../../types';
import { serverTimestamp } from 'firebase/firestore';

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
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
      e.target.value = ''; // Reset input
    }
  };

  const attachmentTypes = [
    {
      icon: <Image className="h-4 w-4" />,
      label: 'Image',
      accept: 'image/*',
      ref: imageInputRef,
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Document',
      accept: '.pdf,.doc,.docx,.txt',
      ref: fileInputRef,
    },
    {
      icon: <Music className="h-4 w-4" />,
      label: 'Audio',
      accept: 'audio/*',
      ref: audioInputRef,
    },
    {
      icon: <Video className="h-4 w-4" />,
      label: 'Vidéo',
      accept: 'video/*',
      ref: videoInputRef,
    },
  ];

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
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                onSaveDraft?.(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              className="w-full resize-none rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px] max-h-32 py-2 px-3"
              rows={1}
            />
          </div>

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Joindre un fichier"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              {showAttachMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  {attachmentTypes.map((type, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => type.ref.current?.click()}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                      {type.icon}
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {attachmentTypes.map((type, index) => (
                <input
                  key={index}
                  type="file"
                  ref={type.ref}
                  accept={type.accept}
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Ajouter un emoji"
            >
              <Smile className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowTaskCreator(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Créer une tâche"
            >
              <ListTodo className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowEventCreator(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Créer un événement"
            >
              <Calendar className="h-5 w-5" />
            </button>

            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
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