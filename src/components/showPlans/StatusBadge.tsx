import React from 'react';
import { useStatusStore } from '../../store/useStatusStore';
import { useWindowSize } from '../../hooks/useWindowSize';

// Mapping des noms courts pour mobile
const shortStatusNames: Record<string, string> = {
  'En préparation': 'Prép.',
  'En attente de diffusion': 'Attente',
  'En cours': 'Direct',
  'Terminé': 'Terminé',
  'Archivé': 'Archive',
};

interface StatusBadgeProps {
  status: string; // Correspond au "name" du statut
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onClick,
  onDelete,
  className = '',
}) => {
  const statuses = useStatusStore((state) => state.statuses);
  const statusConfig = statuses.find((s) => s.name === status); // Recherche dans `defaultStatuses`
  const { width } = useWindowSize();
  const isMobile = width < 640; // Breakpoint pour mobile

  // Si aucun statut correspondant n'est trouvé
  if (!statusConfig) return null;

  // Style basé sur les propriétés du statut
  const style = {
    backgroundColor: `${statusConfig.color}15`, // Couleur avec transparence
    color: statusConfig.color, // Couleur principale
    borderColor: `${statusConfig.color}30`, // Couleur pour la bordure
  };

  // Déterminer le texte à afficher selon la taille de l'écran
  const displayText = isMobile ? shortStatusNames[statusConfig.name] || statusConfig.name : statusConfig.name;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium border ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      } ${className}`}
      style={style}
      onClick={onClick}
    >
      {displayText}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-1 hover:opacity-80"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default StatusBadge;