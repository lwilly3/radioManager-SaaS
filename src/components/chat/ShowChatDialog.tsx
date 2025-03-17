import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Send, Smile, Paperclip, User, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '../../store/useAuthStore';
import { useShowChatStore } from '../../store/useShowChatStore';
import EmojiPicker from './EmojiPicker';
import * as linkify from 'linkifyjs';
import LinkPreview from './LinkPreview';
import type { ShowChatMessage } from '../../types/chat';

interface ShowChatDialogProps {
  showId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShowChatDialog: React.FC<ShowChatDialogProps> = ({
  showId,
  isOpen,
  onClose,
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [textareaHeight, setTextareaHeight] = useState('44px');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useAuthStore();
  const { messages, sendMessage, subscribeToShowChat } = useShowChatStore();

  useEffect(() => {
    if (isOpen && showId) {
      const unsubscribe = subscribeToShowChat(showId);
      return () => unsubscribe();
    }
  }, [showId, isOpen, subscribeToShowChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
      setTextareaHeight(`${newHeight}px`);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !message.trim()) return;

    const newMessage: Omit<ShowChatMessage, 'id' | 'timestamp'> = {
      content: message.trim(),
      sender: {
        id: user.id,
        name: user.name,
      },
      attachments: [],
      read: false,
    };

    try {
      await sendMessage(showId, newMessage);
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
        setTextareaHeight('44px');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const renderMessageContent = (content: string) => {
    const links = linkify.find(content);
    if (!links.length) {
      return <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{content}</p>;
    }

    let lastIndex = 0;
    const elements = [];
    links.forEach((link, i) => {
      if (link.start > lastIndex) {
        elements.push(
          <span key={`text-${i}`}>
            {content.slice(lastIndex, link.start)}
          </span>
        );
      }
      elements.push(
        <LinkPreview key={`link-${i}`} url={link.href} />
      );
      lastIndex = link.end;
    });
    if (lastIndex < content.length) {
      elements.push(
        <span key="text-end">
          {content.slice(lastIndex)}
        </span>
      );
    }
    return <div className="whitespace-pre-wrap break-words text-sm sm:text-base">{elements}</div>;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <Dialog.Panel className="w-full sm:max-w-2xl bg-white rounded-t-lg sm:rounded-lg shadow-xl h-[85vh] sm:h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 p-3 sm:p-4 border-b">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg sm:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <Dialog.Title className="text-lg font-semibold flex-1">
              Discussion du conducteur
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hidden sm:block"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ height: `calc(100% - ${textareaHeight} - 140px)` }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender.id === user?.id ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  {msg.sender.avatar ? (
                    <img
                      src={msg.sender.avatar}
                      alt={msg.sender.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
                <div
                  className={`flex-1 max-w-[80%] sm:max-w-[70%] ${
                    msg.sender.id === user?.id ? 'ml-auto' : ''
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 ${
                      msg.sender.id === user?.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.sender.name}</span>
                      <span className={`text-xs ${
                        msg.sender.id === user?.id ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {format(new Date(msg.timestamp), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message..."
                  className="w-full resize-none rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 text-base sm:text-sm"
                  style={{ height: textareaHeight }}
                />
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2">
                    <EmojiPicker
                      onSelect={(emoji) => {
                        setMessage((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Smile className="h-5 w-5" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() && attachments.length === 0}
                  className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1"
                  >
                    <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ShowChatDialog;