import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { showPlanSchema } from '../../../schemas/showPlanSchema';
import FormField from '../../common/FormField';
import type { ShowPlanFormData } from '../../../types';

interface ShowPlanFormProps {
  defaultValues: Partial<ShowPlanFormData>;
  onValuesChange: (values: Partial<ShowPlanFormData>) => void;
}

const ShowPlanForm: React.FC<ShowPlanFormProps> = ({
  defaultValues,
  onValuesChange,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<ShowPlanFormData>({
    resolver: zodResolver(showPlanSchema),
    mode: 'onChange',
    defaultValues,
  });

  React.useEffect(() => {
    const subscription = watch((value) => onValuesChange(value));
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  return (
    <div className="space-y-4">
      <FormField label="Titre" error={errors.title?.message}>
        <input
          type="text"
          {...register('title')}
          className="form-input"
          placeholder="Titre du conducteur"
        />
      </FormField>

      <FormField label="Type" error={errors.showType?.message} required>
        <select {...register('showType')} className="form-input">
          <option value="">Sélectionner un type</option>
          <option value="talk-show">Talk Show</option>
          <option value="news">Journal</option>
          <option value="entertainment">Divertissement</option>
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" error={errors.date?.message} required>
          <input type="date" {...register('date')} className="form-input" />
        </FormField>

        <FormField label="Heure" error={errors.time?.message} required>
          <input type="time" {...register('time')} className="form-input" />
        </FormField>
      </div>

      <FormField label="Description" error={errors.description?.message}>
        <textarea
          {...register('description')}
          rows={3}
          className="form-textarea"
          placeholder="Description du conducteur..."
        />
      </FormField>
    </div>
  );
};

export default ShowPlanForm;
