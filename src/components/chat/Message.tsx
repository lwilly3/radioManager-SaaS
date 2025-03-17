import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reply, Pin, Edit2, Trash2, MoreVertical, User } from 'lucide-react';
import { Menu } from '@headlessui/react';
import TaskMessage from './messages/TaskMessage';
import EventMessage from './messages/EventMessage';
import FileMessage from './messages/FileMessage';
import MessageReactions from './MessageReactions';
import LinkPreview from './LinkPreview';
import * as linkify from 'linkifyjs';
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
        return message.taskInfo ? (
          <TaskMessage task={message.taskInfo} />
        ) : (
          <p className="text-gray-500">Tâche invalide ou supprimée</p>
        );
      case 'event':
        return message.eventInfo ? (
          <EventMessage event={message.eventInfo} />
        ) : (
          <p className="text-gray-500">Événement invalide ou supprimé</p>
        );
      case 'file':
        return message.attachments ? (
          <FileMessage attachments={message.attachments} />
        ) : (
          <p className="text-gray-500">Fichier invalide ou supprimé</p>
        );
      default:
        if (isEditing) {
          return (
            <div className="relative">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 pr-20 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                }}
                autoFocus
              />
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          );
        } else {
          const links = linkify.find(message.content);
          if (!links.length) {
            return (
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
            );
          }

          let lastIndex = 0;
          const elements = [];
          links.forEach((link, i) => {
            if (link.start > lastIndex) {
              elements.push(
                <span key={`text-${i}`}>
                  {message.content.slice(lastIndex, link.start)}
                </span>
              );
            }
            elements.push(<LinkPreview key={`link-${i}`} url={link.href} />);
            lastIndex = link.end;
          });
          if (lastIndex < message.content.length) {
            elements.push(
              <span key="text-end">{message.content.slice(lastIndex)}</span>
            );
          }
          return (
            <div className="whitespace-pre-wrap break-words">{elements}</div>
          );
        }
    }
  };

  const senderName = message.sender?.name || 'Utilisateur inconnu';
  const senderFamilyName = message.sender?.family_name || '';
  const senderInitial = senderName.charAt(0) || '?';

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-2 hover:bg-gray-50 ${
        isCurrentUser ? 'flex-row-reverse' : ''
      }`}
    >
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isCurrentUser
              ? 'bg-indigo-100 text-indigo-600'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {senderInitial}
        </div>
      </div>

      <div
        className={`flex-1 min-w-0 relative ${
          isCurrentUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-lg p-3 shadow-sm ${
            isCurrentUser
              ? 'ml-auto bg-indigo-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {senderName + ' ' + senderFamilyName}
            </span>
            <span className="text-xs opacity-75">
              {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
            </span>
          </div>

          {message.replyTo && (
            <div
              className={`mb-2 p-2 rounded text-sm ${
                isCurrentUser ? 'bg-indigo-700' : 'bg-gray-100'
              }`}
            >
              <p className="opacity-75">
                Réponse à{' '}
                {message.replyTo.sender?.name || 'Utilisateur inconnu'}
              </p>
              <div className="max-h-20 overflow-y-auto">
                <p>{message.replyTo.content}</p>
              </div>
            </div>
          )}

          {renderMessageContent()}

          {message.reactions && message.reactions.length > 0 && (
            <div className="mt-2">
              <MessageReactions
                reactions={message.reactions}
                onReact={onReact}
                isCurrentUser={isCurrentUser}
              />
            </div>
          )}
        </div>

        <div
          className={`absolute top-0 ${
            isCurrentUser ? 'left-0' : 'right-0'
          } opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
        >
          <button
            onClick={onReply}
            className="p-1 text-gray-400 hover:text-indigo-600 rounded"
            title="Répondre"
          >
            <Reply className="h-4 w-4" />
          </button>
          {isCurrentUser && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                title="Modifier"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={onPin}
            className="p-1 text-gray-400 hover:text-indigo-600 rounded"
            title="Épingler"
          >
            <Pin className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
