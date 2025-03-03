import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoreVertical, Reply, Pin } from 'lucide-react';
import { Menu } from '@headlessui/react';
import TaskMessage from './messages/TaskMessage';
import EventMessage from './messages/EventMessage';
import FileMessage from './messages/FileMessage';
import MessageReactions from './MessageReactions';
import type { Message as MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
  onReply: () => void;
  onPin: () => void;
  onDelete: () => void;
  onEdit: (newContent: string) => void;
  onReact: (emoji: string) => void;
}

const Message: React.FC<MessageProps> = ({
  message,
  isCurrentUser,
  onReply,
  onPin,
  onDelete,
  onEdit,
  onReact,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleEdit = () => {
    if (editedContent.trim() !== message.content) {
      onEdit(editedContent.trim());
    }
    setIsEditing(false);
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'task':
        return <TaskMessage task={message.taskInfo!} />;
      case 'event':
        return <EventMessage event={message.eventInfo!} />;
      case 'file':
        return <FileMessage attachments={message.attachments!} />;
      default:
        return isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border rounded-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleEdit();
              }
            }}
            autoFocus
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        );
    }
  };

  return (
    <div
      className={`flex items-start gap-3 group ${
        isCurrentUser ? 'flex-row-reverse' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <span className="text-indigo-600 font-medium">
          {message.sender.name.charAt(0)}
        </span>
      </div>

      <div className="flex-1 min-w-0 relative">
        <div
          className={`max-w-[70%] ${
            isCurrentUser
              ? 'bg-indigo-600 text-white ml-auto'
              : 'bg-white text-gray-900'
          } rounded-lg p-3 shadow`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{message.sender.name}</span>
            <span className="text-xs opacity-75">
              {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
            </span>
          </div>

          {message.replyTo && (
            <div className="mb-2 p-2 bg-black/10 rounded text-sm">
              <p className="opacity-75">
                Réponse à {message.replyTo.sender.name}
              </p>
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          )}

          {renderMessageContent()}

          {message.reactions && message.reactions.length > 0 && (
            <MessageReactions
              reactions={message.reactions}
              onReact={onReact}
              isCurrentUser={isCurrentUser}
            />
          )}
        </div>

        <div
          className={`absolute top-0 ${
            isCurrentUser ? 'left-0' : 'right-0'
          } opacity-0 group-hover:opacity-100 transition-opacity`}
        >
          <Menu as="div" className="relative">
            <Menu.Button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="h-4 w-4" />
            </Menu.Button>
            <Menu.Items className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onReply}
                    className={`${
                      active ? 'bg-gray-50' : ''
                    } w-full px-4 py-2 text-left text-sm text-gray-700 flex items-center gap-2`}
                  >
                    <Reply className="h-4 w-4" />
                    Répondre
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onPin}
                    className={`${
                      active ? 'bg-gray-50' : ''
                    } w-full px-4 py-2 text-left text-sm text-gray-700 flex items-center gap-2`}
                  >
                    <Pin className="h-4 w-4" />
                    Épingler
                  </button>
                )}
              </Menu.Item>
              {isCurrentUser && (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setIsEditing(true)}
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } w-full px-4 py-2 text-left text-sm text-gray-700`}
                      >
                        Modifier
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onDelete}
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } w-full px-4 py-2 text-left text-sm text-red-600`}
                      >
                        Supprimer
                      </button>
                    )}
                  </Menu.Item>
                </>
              )}
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Message;