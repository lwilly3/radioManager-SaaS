import React, { useState } from 'react';
import SegmentDetailsWithQuotes from './SegmentDetailsWithQuotes'; // Composant avec support citations
import type { ShowSegment } from '../../../types'; // Type TypeScript pour décrire la structure d'un segment.
import { generateKey } from '../../../utils/keyGenerator'; // Import de la fonction utilitaire

interface DetailedSegmentListProps {
  segments: ShowSegment[]; // Liste des segments à afficher.
  activeSegmentId: string | null; // ID du segment actuellement actif.
  onSegmentClick: (segmentId: string) => void; // Fonction callback appelée lorsqu'un segment est cliqué.
  // Props pour le contexte du conducteur (pour les citations)
  showPlanId?: string;
  showPlanTitle?: string;
  emissionId?: string;
  emissionName?: string;
  broadcastDate?: string;
}

// Composant principal qui affiche une liste détaillée de segments.
const DetailedSegmentList: React.FC<DetailedSegmentListProps> = ({
  segments,
  activeSegmentId,
  onSegmentClick,
  showPlanId,
  showPlanTitle,
  emissionId,
  emissionName,
  broadcastDate,
}) => {
  // État local pour suivre les segments actuellement développés.
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(
    new Set() // Initialisé comme un ensemble vide.
  );

  // Fonction pour développer ou réduire un segment spécifique.
  const toggleSegment = (segmentId: string) => {
    setExpandedSegments((prev) => {
      const next = new Set(prev); // Copie de l'ensemble précédent.
      if (next.has(segmentId)) {
        next.delete(segmentId); // Réduit le segment s'il est déjà développé.
      } else {
        next.add(segmentId); // Développe le segment s'il n'est pas encore développé.
      }
      return next; // Retourne le nouvel ensemble mis à jour.
    });
  };

  // Vérifier si segments est un tableau
  if (!Array.isArray(segments) || segments.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Aucun segment disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {segments.map((segment) => (
        <SegmentDetailsWithQuotes
          key={generateKey(segment.id ? segment.id.toString() : `segment-${Math.random()}`)}
          segment={segment}
          showPlanId={showPlanId || ''}
          showPlanTitle={showPlanTitle}
          emissionId={emissionId}
          emissionName={emissionName}
          broadcastDate={broadcastDate}
          isExpanded={expandedSegments.has(segment.id)}
          onToggle={() => {
            toggleSegment(segment.id);
            onSegmentClick(segment.id);
          }}
          isActive={activeSegmentId === segment.id}
        />
      ))}
    </div>
  );
};

export default DetailedSegmentList;