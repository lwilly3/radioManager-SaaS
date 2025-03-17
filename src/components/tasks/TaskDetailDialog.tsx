import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import {
  X,
  Clock,
  Users,
  AlertCircle,
  Paperclip,
  Send,
  Archive,
  Trash2,
  MoreVertical,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { usePresenters } from '../../hooks/presenters/usePresenters';
import * as linkify from 'linkifyjs';
import LinkPreview from '../chat/LinkPreview';
import type { Task, TaskComment } from '../../types/task';

interface TaskDetailDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const { addComment, deleteTask, archiveTask } = useTaskStore();
  const { data: presenters = [] } = usePresenters();

  const isInProgress = task.status === 'in-progress';

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [task.comments.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment: Omit<TaskComment, 'id' | 'createdAt'> = {
        content: newComment.trim(),
        createdBy: user.id,
        attachments: attachments.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size,
        })),
      };

      await addComment(task.id, comment);
      setNewComment('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isInProgress) return;
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?'))
      return;

    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (isInProgress) return;
    setIsArchiving(true);
    try {
      await archiveTask(task.id);
      onClose();
    } catch (error) {
      console.error('Failed to archive task:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAssigneeName = (assigneeId: string) => {
    const presenter = presenters.find((p) => p.user_id === assigneeId);
    return presenter?.name || 'Présentateur inconnu';
  };

  const renderCommentContent = (content: string) => {
    const links = linkify.find(content);
    if (!links.length) {
      return <p className="text-sm text-gray-600">{content}</p>;
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
    return <div className="text-sm text-gray-600">{elements}</div>;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />
                <Dialog.Title className="text-lg font-semibold">
                  {task.title}
                </Dialog.Title>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status === 'pending'
                  ? 'En attente'
                  : task.status === 'in-progress'
                  ? 'En cours'
                  : 'Terminé'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isInProgress && (
                <div className="relative" ref={actionsRef}>
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {showActions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={handleArchive}
                        disabled={isArchiving || isInProgress}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Archive className="h-4 w-4" />
                        {isArchiving ? 'Archivage...' : 'Archiver la tâche'}
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting || isInProgress}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting ? 'Suppression...' : 'Supprimer la tâche'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Task Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      className={`h-5 w-5 ${getPriorityColor(task.priority)}`}
                    />
                    <span
                      className={`text-sm font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      Priorité{' '}
                      {task.priority === 'low'
                        ? 'basse'
                        : task.priority === 'medium'
                        ? 'moyenne'
                        : 'haute'}
                    </span>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(task.dueDate), 'dd MMMM yyyy', {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {task.description && (
                  <p className="text-gray-600">{task.description}</p>
                )}

                {task.assignees.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <div className="flex flex-wrap gap-1">
                      {task.assignees.map((assigneeId) => (
                        <span
                          key={assigneeId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                        >
                          {getAssigneeName(assigneeId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Commentaires ({task.comments.length})
                </h3>

                <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-indigo-600">
                          {getAssigneeName(comment.createdBy).charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {getAssigneeName(comment.createdBy)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(
                                new Date(comment.createdAt),
                                'dd/MM/yyyy HH:mm',
                                { locale: fr }
                              )}
                            </span>
                          </div>
                          {renderCommentContent(comment.content)}
                          {comment.attachments &&
                            comment.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {comment.attachments.map((attachment) => (
                                  <a
                                    key={attachment.id}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    {attachment.name}
                                  </a>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>

                {/* New Comment Input */}
                <div className="space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ajouter un commentaire..."
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={2}
                    disabled={isSubmitting}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="attachments"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor="attachments"
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                      >
                        <Paperclip className="h-4 w-4" />
                        {attachments.length > 0
                          ? `${attachments.length} fichier(s)`
                          : 'Ajouter des fichiers'}
                      </label>
                    </div>
                    <button
                      onClick={handleSubmitComment}
                      disabled={
                        (!newComment.trim() && attachments.length === 0) ||
                        isSubmitting
                      }
                      className="btn btn-primary flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TaskDetailDialog;