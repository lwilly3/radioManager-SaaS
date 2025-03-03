import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRundownStore } from '../../../store/useRundownStore';
import { rundownSchema } from '../../../schemas/rundownSchema';
import FormField from '../../common/FormField';
import NewSegmentForm from '../segments/NewSegmentForm';
import SegmentList from '../segments/SegmentList';
import { v4 as uuidv4 } from 'uuid';
import type { RundownFormData, ShowSegment } from '../../../types';

interface NewRundownFormProps {
  onClose: () => void;
}

const NewRundownForm: React.FC<NewRundownFormProps> = ({ onClose }) => {
  const [segments, setSegments] = useState<ShowSegment[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RundownFormData>({
    resolver: zodResolver(rundownSchema)
  });

  const setRundowns = useRundownStore((state) => state.setRundowns);
  const rundowns = useRundownStore((state) => state.rundowns);

  const handleAddSegment = (segment: ShowSegment) => {
    setSegments([...segments, segment]);
  };

  const handleReorderSegments = (reorderedSegments: ShowSegment[]) => {
    setSegments(reorderedSegments);
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(segments.filter((segment) => segment.id !== segmentId));
  };

  const onSubmit = (data: RundownFormData) => {
    const newRundown = {
      id: uuidv4(),
      title: data.title,
      date: `${data.date}T${data.time}`,
      description: data.description || '',
      status: 'draft' as const,
      segments
    };

    setRundowns([...rundowns, newRundown]);
    reset();
    setSegments([]);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
      <div className="space-y-4">
        <FormField
          label="Titre de l'émission"
          error={errors.title?.message}
        >
          <input
            type="text"
            {...register('title')}
            className="form-input"
            placeholder="Ex: Matinale Info"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Date"
            error={errors.date?.message}
          >
            <input
              type="date"
              {...register('date')}
              className="form-input"
            />
          </FormField>

          <FormField
            label="Heure"
            error={errors.time?.message}
          >
            <input
              type="time"
              {...register('time')}
              className="form-input"
            />
          </FormField>
        </div>

        <FormField
          label="Description (optionnelle)"
          error={errors.description?.message}
        >
          <textarea
            {...register('description')}
            rows={3}
            className="form-textarea"
            placeholder="Description de l'émission..."
          />
        </FormField>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Segments</h3>
        <div className="space-y-4">
          <NewSegmentForm onAdd={handleAddSegment} />
          
          {segments.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Segments ajoutés ({segments.length})
              </h4>
              <SegmentList
                segments={segments}
                onReorder={handleReorderSegments}
                onDelete={handleDeleteSegment}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary"
        >
          Annuler
        </button>
        <button type="submit" className="btn btn-primary">
          Créer le conducteur
        </button>
      </div>
    </form>
  );
};

export default NewRundownForm;