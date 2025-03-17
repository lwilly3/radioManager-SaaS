import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '../store/useAuthStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  AlertCircle,
  MessageSquare,
  User,
} from 'lucide-react';
import TaskCreator from '../components/chat/TaskCreator';
import TaskDetailDialog from '../components/tasks/TaskDetailDialog';
import { usePresenters } from '../hooks/presenters/usePresenters';
import type { Task, TaskStatus } from '../types/task';

type TaskFilter = 'all' | 'assigned' | 'created';

const Tasks: React.FC = () => {
  const { user } = useAuthStore();
  const { tasks, isLoading, error, subscribeToTasks, updateTaskStatus } =
    useTaskStore();
  const { data: presenters = [] } = usePresenters();
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<
    'all' | 'low' | 'medium' | 'high'
  >('all');
  const [userFilter, setUserFilter] = useState<TaskFilter>('assigned');

  useEffect(() => {
    console.log('id de lutilisateur qui cree la tache');
    console.log(user.id);
    subscribeToTasks();
  }, [subscribeToTasks]);

  const filteredTasks = tasks.filter((task) => {
    // Filter by user
    const userFilterMatch =
      userFilter === 'all'
        ? true
        : userFilter === 'assigned'
        ? task.assignees.includes(user?.id || '')
        : userFilter === 'created'
        ? task.createdBy === user?.id
        : true;

    // Filter by search query and other criteria
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority =
      filterPriority === 'all' || task.priority === filterPriority;

    return userFilterMatch && matchesSearch && matchesStatus && matchesPriority;
  });

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    pending: filteredTasks.filter((t) => t.status === 'pending'),
    'in-progress': filteredTasks.filter((t) => t.status === 'in-progress'),
    completed: filteredTasks.filter((t) => t.status === 'completed'),
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as TaskStatus;
    updateTaskStatus(draggableId, newStatus);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
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
    console.log(assigneeId);
    console.log('/////////////////////////////////////', presenters);
    const presenter = presenters.find((p) => p.user_id === assigneeId);
    console.log(presenter);
    return presenter?.name || 'Présentateur inconnu';
  };

  const getLastComment = (task: Task) => {
    if (task.comments.length === 0) return null;
    return task.comments[task.comments.length - 1];
  };

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Une erreur est survenue lors du chargement des tâches
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches</h1>
          <p className="text-gray-600">
            Gérez et suivez les tâches de l'équipe
          </p>
        </div>
        <button
          onClick={() => setShowTaskCreator(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouvelle tâche
        </button>
      </header>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une tâche..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value as TaskFilter)}
          className="form-input"
        >
          <option value="assigned">Mes tâches assignées</option>
          <option value="created">Mes tâches créées</option>
          <option value="all">Toutes les tâches</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as TaskStatus | 'all')
          }
          className="form-input"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="in-progress">En cours</option>
          <option value="completed">Terminé</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) =>
            setFilterPriority(
              e.target.value as 'all' | 'low' | 'medium' | 'high'
            )
          }
          className="form-input"
        >
          <option value="all">Toutes les priorités</option>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['pending', 'in-progress', 'completed'] as TaskStatus[]).map(
              (status) => (
                <Droppable key={status} droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-lg border p-4 ${getStatusColor(
                        status
                      )}`}
                    >
                      <h2 className="font-medium text-gray-900 mb-4">
                        {status === 'pending'
                          ? 'En attente'
                          : status === 'in-progress'
                          ? 'En cours'
                          : 'Terminé'}
                        <span className="ml-2 text-sm text-gray-500">
                          ({tasksByStatus[status].length})
                        </span>
                      </h2>

                      <div className="space-y-3">
                        {tasksByStatus[status].map((task, index) => {
                          console.log('##########################', task);
                          const lastComment = getLastComment(task);

                          return (
                            <Draggable
                              key={`${task.id}-${status}`}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white rounded-lg shadow p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() => setSelectedTask(task)}
                                >
                                  <div className="flex items-start justify-between">
                                    <h3 className="font-medium text-gray-900">
                                      {task.title}
                                    </h3>
                                    <AlertCircle
                                      className={`h-4 w-4 ${getPriorityColor(
                                        task.priority
                                      )}`}
                                    />
                                  </div>

                                  {task.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Assignees Preview */}
                                  {task.assignees.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <div className="flex -space-x-2">
                                        {task.assignees
                                          .slice(0, 3)
                                          .map((assigneeId) => (
                                            <div
                                              key={`${task.id}-${assigneeId}`}
                                              className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
                                              title={getAssigneeName(
                                                assigneeId
                                              )}
                                            >
                                              <span className="text-xs font-medium text-indigo-600">
                                                {getAssigneeName(
                                                  assigneeId
                                                ).charAt(0)}
                                              </span>
                                            </div>
                                          ))}
                                        {task.assignees.length > 3 && (
                                          <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                            <span className="text-xs font-medium text-gray-600">
                                              +{task.assignees.length - 3}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-4">
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          <span>
                                            {new Date(
                                              task.dueDate
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {task.comments.length > 0 && (
                                      <div className="flex items-center gap-1 text-indigo-600">
                                        <MessageSquare className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                          {task.comments.length}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Last Comment Preview */}
                                  {lastComment && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center">
                                          <span className="text-[10px] font-medium text-indigo-600">
                                            {getAssigneeName(
                                              lastComment.createdBy
                                            ).charAt(0)}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {getAssigneeName(
                                            lastComment.createdBy
                                          )}
                                        </span>
                                      </div>
                                      <p className="text-gray-600 line-clamp-1">
                                        {lastComment.content}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              )
            )}
          </div>
        </DragDropContext>
      )}

      {showTaskCreator && (
        <TaskCreator
          onSubmit={async (taskData) => {
            if (!user) return;
            await useTaskStore.getState().createTask({
              ...taskData,
              status: 'pending',
              createdBy: user.id,
            });
            setShowTaskCreator(false);
          }}
          onClose={() => setShowTaskCreator(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default Tasks;
