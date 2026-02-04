import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Quote, Clock, User, Tag, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { ShowSegment, Guest } from '../../types';
import type { CreateQuoteData, QuoteCategory } from '../../types/quote';

// ════════════════════════════════════════════════════════════════
// VALIDATION SCHEMA - Mode rapide par défaut
// Seuls content et authorName sont requis
// ════════════════════════════════════════════════════════════════

const segmentQuoteSchema = z.object({
  // ✅ REQUIS (Mode rapide)
  content: z.string()
    .min(10, 'La citation doit contenir au moins 10 caractères')
    .max(1000, 'La citation ne peut pas dépasser 1000 caractères'),
  
  authorName: z.string()
    .min(2, 'Le nom de l\'intervenant est requis'),
  
  // Optionnels avec valeurs par défaut
  authorRole: z.enum(['guest', 'presenter', 'caller', 'other']).default('guest'),
  contentType: z.enum(['quote', 'key_idea', 'statement', 'fact']).default('quote'),
  category: z.enum([
    'politique', 'sport', 'culture', 'economie', 'societe', 'humour', 'autre'
  ]).optional(),
  
  tags: z.string().default(''), // Converti en array à la soumission
  importance: z.enum(['low', 'medium', 'high']).default('medium'),
  
  // Horodatage 100% optionnel
  timestamp: z.string().optional(),
  segmentMinute: z.number().min(0).optional().nullable(),
  approximateTime: z.enum(['start', 'middle', 'end']).optional(),
});

type SegmentQuoteFormData = z.infer<typeof segmentQuoteSchema>;

interface SegmentQuoteFormProps {
  segment: ShowSegment;
  showPlanId: string;
  showPlanTitle?: string;
  emissionId?: string;
  emissionName?: string;
  broadcastDate?: string;
  guests?: Guest[];
  onSubmit: (data: CreateQuoteData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Formulaire de création de citation sur segment
 * Mode rapide par défaut (2 champs), mode avancé dépliable
 */
export const SegmentQuoteForm: React.FC<SegmentQuoteFormProps> = ({
  segment,
  showPlanId,
  showPlanTitle,
  emissionId,
  emissionName,
  broadcastDate,
  guests = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SegmentQuoteFormData>({
    resolver: zodResolver(segmentQuoteSchema),
    defaultValues: {
      contentType: 'quote',
      importance: 'medium',
      authorRole: 'guest',
      tags: '',
    },
  });
  
  // Couleurs par type de segment
  const getSegmentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      intro: 'bg-blue-100 text-blue-700',
      interview: 'bg-purple-100 text-purple-700',
      music: 'bg-green-100 text-green-700',
      ad: 'bg-yellow-100 text-yellow-700',
      outro: 'bg-red-100 text-red-700',
      debate: 'bg-orange-100 text-orange-700',
      chronicle: 'bg-pink-100 text-pink-700',
      news: 'bg-cyan-100 text-cyan-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors.other;
  };
  
  // Sélection d'un invité pré-remplit les champs auteur
  const handleGuestSelect = (guestId: string) => {
    if (guestId === '' || guestId === 'manual') {
      setSelectedGuestId('');
      setValue('authorName', '');
      setValue('authorRole', 'other');
      return;
    }
    
    const guest = guests.find(g => String(g.id) === guestId);
    if (guest) {
      setSelectedGuestId(guestId);
      setValue('authorName', guest.name);
      setValue('authorRole', 'guest');
    }
  };
  
  const onFormSubmit = async (formData: SegmentQuoteFormData) => {
    const selectedGuest = guests.find(g => String(g.id) === selectedGuestId);
    
    const createData: CreateQuoteData = {
      content: formData.content,
      authorName: formData.authorName,
      authorId: selectedGuest ? String(selectedGuest.id) : undefined,
      authorRole: formData.authorRole,
      authorAvatar: selectedGuest?.avatar || undefined,
      
      // Liaison segment
      segmentId: segment.id,
      segmentTitle: segment.title,
      segmentType: segment.type,
      segmentPosition: parseInt(segment.position) || 0,
      
      // Contexte conducteur
      showPlanId,
      showPlanTitle,
      emissionId,
      emissionName,
      broadcastDate,
      
      // Horodatage optionnel
      timestamp: formData.timestamp || undefined,
      segmentMinute: formData.segmentMinute ?? undefined,
      approximateTime: formData.approximateTime,
      
      // Métadonnées
      contentType: formData.contentType,
      // Catégorie thématique directe
      category: formData.category as QuoteCategory | undefined,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      importance: formData.importance,
      
      sourceType: 'manual',
    };
    
    await onSubmit(createData);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* ════════════════════════════════════════════════════════════ */}
      {/* CONTEXTE SEGMENT (Information) */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getSegmentTypeColor(segment.type)}`}>
            {segment.type}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{segment.title}</span>
          <span className="text-gray-500 text-sm">({segment.duration} min)</span>
        </div>
      </div>
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODE RAPIDE : Intervenant + Citation */}
      {/* ════════════════════════════════════════════════════════════ */}
      
      {/* Sélection intervenant */}
      {guests.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <User className="inline-block w-4 h-4 mr-1" />
            Intervenant
          </label>
          <select
            value={selectedGuestId}
            onChange={(e) => handleGuestSelect(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="manual">-- Saisir manuellement --</option>
            {guests.map((guest) => (
              <option key={guest.id} value={String(guest.id)}>
                {guest.name} {guest.role ? `(${guest.role})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Nom intervenant */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom de l'intervenant <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('authorName')}
          className={`w-full rounded-lg border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            errors.authorName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } focus:ring-2 focus:ring-indigo-500`}
          placeholder="Ex: Jean Dupont"
        />
        {errors.authorName && (
          <p className="text-red-500 text-sm mt-1">{errors.authorName.message}</p>
        )}
      </div>
      
      {/* Citation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <Quote className="inline-block w-4 h-4 mr-1" />
          Citation / Extrait <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('content')}
          rows={3}
          className={`w-full rounded-lg border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } focus:ring-2 focus:ring-indigo-500`}
          placeholder="Saisissez la citation ou l'extrait..."
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* BOUTON MODE AVANCÉ */}
      {/* ════════════════════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
      >
        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showAdvanced ? 'Moins d\'options' : '+ Plus d\'options'}
      </button>
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODE AVANCÉ (dépliable) */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showAdvanced && (
        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Type + Catégorie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de contenu
              </label>
              <select
                {...register('contentType')}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="quote">💬 Citation exacte</option>
                <option value="key_idea">💡 Idée clé</option>
                <option value="statement">📢 Déclaration</option>
                <option value="fact">📊 Fait / Info</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie
              </label>
              <select
                {...register('category')}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">-- Optionnel --</option>
                <option value="politique">Politique</option>
                <option value="economie">Économie</option>
                <option value="culture">Culture</option>
                <option value="sport">Sport</option>
                <option value="societe">Société</option>
                <option value="humour">Humour</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          
          {/* Tags + Importance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Tag className="inline-block w-4 h-4 mr-1" />
                Tags (virgules)
              </label>
              <input
                type="text"
                {...register('tags')}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="interview, exclusif, politique"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Importance
              </label>
              <select
                {...register('importance')}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">⬇️ Faible</option>
                <option value="medium">➡️ Moyenne</option>
                <option value="high">⬆️ Haute</option>
              </select>
            </div>
          </div>
          
          {/* Horodatage optionnel */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              <Clock className="inline-block w-4 h-4 mr-1" />
              Horodatage (optionnel)
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Heure émission
                </label>
                <input
                  type="time"
                  step="1"
                  {...register('timestamp')}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Minute segment
                </label>
                <input
                  type="number"
                  min={0}
                  max={segment.duration}
                  {...register('segmentMinute', { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder={`0-${segment.duration}`}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Position
                </label>
                <select
                  {...register('approximateTime')}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">--</option>
                  <option value="start">Début</option>
                  <option value="middle">Milieu</option>
                  <option value="end">Fin</option>
                </select>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-1">
              L'horodatage est optionnel et n'empêche pas l'enregistrement.
            </p>
          </div>
        </div>
      )}
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* ACTIONS */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default SegmentQuoteForm;
