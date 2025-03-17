import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Users } from 'lucide-react';
import { usePresenters } from '../../hooks/presenters/usePresenters';
import FormField from '../common/FormField';
import type { TaskFormData } from '../../types/task';

const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'La priorité est requise',
  }),
  dueDate: z.string().optional(),
  assignees: z.array(z.string()),
});

interface TaskCreatorProps {
  onSubmit: (task: TaskFormData) => void;
  onClose: () => void;
  initialAssignees?: string[];
}

const TaskCreator: React.FC<TaskCreatorProps> = ({
  onSubmit,
  onClose,
  initialAssignees = [],
}) => {
  const { data: presenters = [], isLoading: isLoadingPresenters } =
    usePresenters();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      assignees: initialAssignees,
    },
  });

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Nouvelle tâche</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
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

          <FormField label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              className="form-textarea"
              rows={3}
              placeholder="Description détaillée de la tâche..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Priorité"
              error={errors.priority?.message}
              required
            >
              <select {...register('priority')} className="form-input">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </FormField>

            <FormField label="Date d'échéance" error={errors.dueDate?.message}>
              <input
                type="date"
                {...register('dueDate')}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </FormField>
          </div>

          <FormField
            label="Assignés"
            error={errors.assignees?.message}
            // description="Sélectionnez les présentateurs responsables de cette tâche"
          >
            {isLoadingPresenters ? (
              <div className="h-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                {presenters.map((presenter) => (
                  <label
                    key={presenter.user_id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={presenter.user_id}
                      {...register('assignees')}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {presenter.name}
                        </p>
                        {presenter.contact?.email && (
                          <p className="text-sm text-gray-500">
                            {presenter.contact.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoadingPresenters}
            >
              Créer la tâche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreator;
