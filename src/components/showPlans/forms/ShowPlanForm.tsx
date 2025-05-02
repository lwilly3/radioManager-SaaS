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
    defaultValues: {
      title: defaultValues.title || '',
      showType: defaultValues.showType || '',
      date: defaultValues.date || '',
      time: defaultValues.time || '',
      description: defaultValues.description || '',
    },
  });

  // Surveiller les changements et transmettre uniquement les valeurs non vides
  React.useEffect(() => {
    const subscription = watch((value) => {
      console.log('ShowPlanForm watched values:', value);
      const updatedValues: Partial<ShowPlanFormData> = {};
      if (value.title) updatedValues.title = value.title;
      if (value.showType) updatedValues.showType = value.showType;
      if (value.date) updatedValues.date = value.date;
      if (value.time) updatedValues.time = value.time;
      if (value.description !== undefined) updatedValues.description = value.description;

      // N'envoyer une mise à jour que s'il y a au moins une valeur non vide
      if (Object.keys(updatedValues).length > 0) {
        onValuesChange(updatedValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  return (
    <div className="space-y-4">
      <FormField label="Titre" error={errors.title?.message} required>
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