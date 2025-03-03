import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { guestSchema } from '../../../schemas/rundownSchema';
import FormField from '../../common/FormField';
import type { Guest, GuestFormData, GuestRole } from '../../../types';

interface GuestFormProps {
  onAdd: (guest: Guest) => void;
  onCancel: () => void;
  initialData?: Guest;
}

const guestRoles: { value: GuestRole; label: string }[] = [
  { value: 'journalist', label: 'Journaliste' },
  { value: 'expert', label: 'Expert' },
  { value: 'artist', label: 'Artiste' },
  { value: 'politician', label: 'Politique' },
  { value: 'athlete', label: 'Athlète' },
  { value: 'writer', label: 'Écrivain' },
  { value: 'scientist', label: 'Scientifique' },
  { value: 'other', label: 'Autre' },
];

const GuestForm: React.FC<GuestFormProps> = ({ onAdd, onCancel, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: GuestFormData) => {
    const newGuest: Guest = {
      id: initialData?.id || uuidv4(),
      ...data,
    };
    onAdd(newGuest);
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nom" error={errors.name?.message} required>
          <input
            type="text"
            {...register('name')}
            className="form-input"
            placeholder="Ex: Jean Dupont"
          />
        </FormField>

        <FormField label="Rôle" error={errors.role?.message} required>
          <select {...register('role')} className="form-input">
            <option value="">Sélectionner un rôle</option>
            {guestRoles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Biographie" error={errors.biography?.message}>
        <textarea
          {...register('biography')}
          className="form-textarea"
          rows={3}
          placeholder="Courte biographie de l'invité..."
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Email" error={errors.contact?.email?.message}>
          <input
            type="email"
            {...register('contact.email')}
            className="form-input"
            placeholder="email@exemple.com"
          />
        </FormField>

        <FormField label="Téléphone" error={errors.contact?.phone?.message}>
          <input
            type="tel"
            {...register('contact.phone')}
            className="form-input"
            placeholder="+33 6 12 34 56 78"
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {initialData ? "Modifier l'invité" : "Ajouter l'invité"}
        </button>
      </div>
    </div>
  );
};

export default GuestForm;