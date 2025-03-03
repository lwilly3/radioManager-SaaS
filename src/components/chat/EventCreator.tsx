import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import FormField from '../common/FormField';
import type { EventInfo } from '../../types';

const eventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  location: z.string().optional(),
  attendees: z.array(z.string()),
});

interface EventCreatorProps {
  onSubmit: (event: EventInfo) => void;
  onClose: () => void;
}

const EventCreator: React.FC<EventCreatorProps> = ({ onSubmit, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EventInfo>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      attendees: [],
    },
  });

  const startDate = watch('startDate');

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Nouvel événement</h3>
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
              placeholder="Ex: Réunion d'équipe"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Date de début"
              error={errors.startDate?.message}
              required
            >
              <input
                type="datetime-local"
                {...register('startDate')}
                className="form-input"
                min={new Date().toISOString().slice(0, 16)}
              />
            </FormField>

            <FormField
              label="Date de fin"
              error={errors.endDate?.message}
              required
            >
              <input
                type="datetime-local"
                {...register('endDate')}
                className="form-input"
                min={startDate}
              />
            </FormField>
          </div>

          <FormField label="Lieu" error={errors.location?.message}>
            <input
              type="text"
              {...register('location')}
              className="form-input"
              placeholder="Ex: Studio 1"
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
              Créer l'événement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreator;