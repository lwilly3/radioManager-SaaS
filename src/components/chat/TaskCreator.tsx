import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import FormField from '../common/FormField';
import type { TaskInfo } from '../../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  status: z.enum(['pending', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  assignees: z.array(z.string()),
});

interface TaskCreatorProps {
  onSubmit: (task: TaskInfo) => void;
  onClose: () => void;
}

const TaskCreator: React.FC<TaskCreatorProps> = ({ onSubmit, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskInfo>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'pending',
      priority: 'medium',
      assignees: [],
    },
  });

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Nouvelle tâche</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <FormField label="Titre" error={errors.title?.message} required>
            <input
              type="text"
              {...register('title')}
              className="form-input"
              placeholder="Ex: Préparer le conducteur"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Priorité" error={errors.priority?.message} required>
              <select {...register('priority')} className="form-input">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </FormField>

            <FormField label="Statut" error={errors.status?.message} required>
              <select {...register('status')} className="form-input">
                <option value="pending">En attente</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </FormField>
          </div>

          <FormField label="Date d'échéance" error={errors.dueDate?.message}>
            <input
              type="date"
              {...register('dueDate')}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Créer la tâche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreator;