
import React from 'react';
import FormField from '../../common/FormField';
import type { Emission } from '../../../types/emission';

interface EmissionSelectProps {
  emissions: Emission[];
  selectedEmission: number | null;
  onSelect: (emissionId: number | null) => void;
}

const EmissionSelect: React.FC<EmissionSelectProps> = ({
  emissions,
  selectedEmission,
  onSelect,
}) => {
  return (
    <FormField
      label="Émission"
      error={!selectedEmission ? "Veuillez sélectionner une émission" : undefined}
      required
    >
      <select
        value={selectedEmission || ''}
        onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
        className="form-input"
      >
        <option value="">Sélectionner une émission</option>
        {emissions.map((emission) => (
          <option key={emission.id} value={emission.id}>
            {emission.title}
          </option>
        ))}
      </select>
    </FormField>
  );
};

export default EmissionSelect;
