import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createQuoteFormSchema, QuoteFormData } from '../../schemas/quoteSchema';
import { Loader2, Upload, X } from 'lucide-react';

interface QuoteFormProps {
  onSubmit: (data: QuoteFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<QuoteFormData>;
  showPlanGuests?: Array<{ id: string | number; name: string; role?: string; avatar?: string }>;
}

/**
 * Formulaire de création/édition de citation
 */
export default function QuoteForm({ 
  onSubmit, 
  onCancel,
  isSubmitting = false,
  defaultValues,
  showPlanGuests 
}: QuoteFormProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(createQuoteFormSchema),
    defaultValues: {
      ...defaultValues,
      tags: defaultValues?.tags || '',
    },
  });

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier que c'est un fichier audio
      if (!file.type.startsWith('audio/')) {
        alert('Veuillez sélectionner un fichier audio valide');
        return;
      }
      // Limite de taille : 50 MB
      if (file.size > 50 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 50 MB');
        return;
      }
      setAudioFile(file);
      setValue('audioFile', file);
    }
  };

  const handleGuestSelect = (guestId: string) => {
    if (guestId && showPlanGuests) {
      const guest = showPlanGuests.find(g => g.id.toString() === guestId);
      if (guest) {
        setValue('authorName', guest.name);
        setValue('authorRole', guest.role || '');
        setValue('authorAvatar', guest.avatar || '');
        setSelectedGuest(guestId);
      }
    } else {
      setSelectedGuest('');
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    setValue('audioFile', undefined);
  };

  const onFormSubmit = async (data: QuoteFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Citation */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Citation <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          rows={4}
          {...register('content')}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Entrez la citation ici..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* Auteur */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Auteur</h3>

        {/* Sélection rapide depuis les invités du conducteur */}
        {showPlanGuests && showPlanGuests.length > 0 && (
          <div className="mb-4">
            <label htmlFor="guestSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un invité du conducteur
            </label>
            <select
              id="guestSelect"
              value={selectedGuest}
              onChange={(e) => handleGuestSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Saisir manuellement --</option>
              {showPlanGuests.map((guest) => (
                <option key={guest.id} value={guest.id.toString()}>
                  {guest.name} {guest.role && `(${guest.role})`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Les invités listés proviennent du conducteur. Vous pouvez aussi saisir manuellement.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'auteur <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="authorName"
            {...register('authorName')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.authorName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {errors.authorName && (
            <p className="mt-1 text-sm text-red-600">{errors.authorName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="authorRole" className="block text-sm font-medium text-gray-700 mb-2">
            Rôle/Fonction
          </label>
          <input
            type="text"
            id="authorRole"
            {...register('authorRole')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Journaliste, Animateur..."
          />
        </div>
      </div>
      </div>

      {/* Avatar URL */}
      <div>
        <label htmlFor="authorAvatar" className="block text-sm font-medium text-gray-700 mb-2">
          URL de l'avatar
        </label>
        <input
          type="url"
          id="authorAvatar"
          {...register('authorAvatar')}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.authorAvatar ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://example.com/avatar.jpg"
        />
        {errors.authorAvatar && (
          <p className="mt-1 text-sm text-red-600">{errors.authorAvatar.message}</p>
        )}
      </div>

      {/* Contexte */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contexte (optionnel)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="showName" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'émission
            </label>
            <input
              type="text"
              id="showName"
              {...register('showName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Morning Show"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              {...register('date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-2">
            Timestamp
          </label>
          <input
            type="text"
            id="timestamp"
            {...register('timestamp')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="00:15:30"
          />
        </div>
      </div>

      {/* Métadonnées */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Métadonnées</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              id="category"
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Sélectionner...</option>
              <option value="politique">Politique</option>
              <option value="sport">Sport</option>
              <option value="culture">Culture</option>
              <option value="economie">Économie</option>
              <option value="societe">Société</option>
              <option value="humour">Humour</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              id="tags"
              {...register('tags')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="interview, exclusif, breaking"
            />
          </div>
        </div>
      </div>

      {/* Audio (optionnel) */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fichier audio (optionnel)</h3>
        
        {!audioFile ? (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="audioFile"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                </p>
                <p className="text-xs text-gray-500">MP3, WAV, OGG (MAX. 50MB)</p>
              </div>
              <input
                id="audioFile"
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleAudioChange}
              />
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded">
                <Upload className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{audioFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeAudio}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Création...' : 'Créer la citation'}
        </button>
      </div>
    </form>
  );
}
