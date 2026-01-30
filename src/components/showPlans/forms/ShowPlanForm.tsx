import React from 'react';
import { useShowPlanFormStore } from '../../../store/useShowPlanFormStore';
import FormField from '../../common/FormField';

/**
 * Formulaire des informations principales du conducteur.
 * 
 * Ce composant utilise directement le store Zustand pour gérer l'état,
 * ce qui garantit la persistance des valeurs lors des re-renders
 * (par exemple, lors de l'ajout d'un segment).
 * 
 * Architecture:
 * - Les inputs sont "contrôlés" (value + onChange)
 * - Le store Zustand est la seule source de vérité
 * - Pas de synchronisation bidirectionnelle complexe
 */
const ShowPlanForm: React.FC = () => {
  const { formData, updateFormData } = useShowPlanFormStore();

  return (
    <div className="space-y-4">
      <FormField label="Titre" required>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => updateFormData({ title: e.target.value })}
          className="form-input"
          placeholder="Titre du conducteur"
        />
      </FormField>

      <FormField label="Type" required>
        <select
          value={formData.showType || ''}
          onChange={(e) => updateFormData({ showType: e.target.value as any })}
          className="form-input"
        >
          <option value="">Sélectionner un type</option>
          <option value="talk-show">Talk Show</option>
          <option value="news">Journal</option>
          <option value="entertainment">Divertissement</option>
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" required>
          <input
            type="date"
            value={formData.date || ''}
            onChange={(e) => updateFormData({ date: e.target.value })}
            className="form-input"
          />
        </FormField>

        <FormField label="Heure" required>
          <input
            type="time"
            value={formData.time || ''}
            onChange={(e) => updateFormData({ time: e.target.value })}
            className="form-input"
          />
        </FormField>
      </div>

      <FormField label="Description">
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={3}
          className="form-textarea"
          placeholder="Description du conducteur..."
        />
      </FormField>
    </div>
  );
};

export default ShowPlanForm;