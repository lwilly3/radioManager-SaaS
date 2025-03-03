import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { teamMemberSchema } from '../../schemas/teamSchema';
import { useTeamStore } from '../../store/useTeamStore';
import FormField from '../../components/common/FormField';
import type { TeamMemberFormData } from '../../schemas/teamSchema';
import type { TeamMember } from '../../types';

const CreateTeamMember: React.FC = () => {
  const navigate = useNavigate();
  const addMember = useTeamStore((state) => state.addMember);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: TeamMemberFormData) => {
    const newMember: TeamMember = {
      id: uuidv4(),
      ...data,
      joinedAt: new Date().toISOString(),
      status: 'active',
      shows: [],
    };

    addMember(newMember);
    
    navigate('/team', { 
      replace: true,
      state: { 
        notification: {
          type: 'success' as const,
          message: 'Le membre a été ajouté avec succès'
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/team')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Retour à l'équipe</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Nouveau membre
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Ajoutez un nouveau membre à l'équipe
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            <FormField 
              label="Nom complet" 
              error={errors.name?.message}
              required
            >
              <input
                type="text"
                {...register('name')}
                className="form-input"
                placeholder="Ex: Jean Dupont"
              />
            </FormField>

            <FormField 
              label="Email"
              error={errors.email?.message}
              required
            >
              <input
                type="email"
                {...register('email')}
                className="form-input"
                placeholder="email@exemple.com"
              />
            </FormField>

            <FormField 
              label="Rôle"
              error={errors.role?.message}
              required
            >
              <select {...register('role')} className="form-input">
                <option value="">Sélectionner un rôle</option>
                <option value="admin">Administrateur</option>
                <option value="host">Animateur</option>
                <option value="producer">Producteur</option>
                <option value="technician">Technicien</option>
                <option value="editor">Monteur</option>
                <option value="journalist">Journaliste</option>
              </select>
            </FormField>

            <FormField 
              label="Téléphone"
              error={errors.phone?.message}
            >
              <input
                type="tel"
                {...register('phone')}
                className="form-input"
                placeholder="+33 6 12 34 56 78"
              />
            </FormField>

            <FormField
              label="Biographie"
              error={errors.bio?.message}
            >
              <textarea
                {...register('bio')}
                rows={4}
                className="form-textarea"
                placeholder="Biographie du membre..."
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/team')}
              className="w-full sm:w-auto btn btn-secondary"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="w-full sm:w-auto btn btn-primary"
            >
              Ajouter le membre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamMember;