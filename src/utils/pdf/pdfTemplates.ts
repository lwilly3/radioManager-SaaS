/**
 * Définition des templates PDF pour l'export des conducteurs et archives
 * 
 * Deux templates disponibles :
 * - classic: Format simple et épuré (portrait par défaut)
 * - professional: Format avancé avec en-tête, horaires, notes techniques (paysage par défaut)
 */

export type PdfTemplateId = 'classic' | 'professional';
export type PdfOrientation = 'portrait' | 'landscape';

export interface PdfTemplate {
  id: PdfTemplateId;
  name: string;
  description: string;
  defaultOrientation: PdfOrientation;
  features: string[];
  preview?: string; // URL vers une image de prévisualisation
}

/**
 * Templates PDF pour les conducteurs
 */
export const PDF_TEMPLATES: Record<PdfTemplateId, PdfTemplate> = {
  classic: {
    id: 'classic',
    name: 'Classique',
    description: 'Format simple et épuré, idéal pour une impression rapide',
    defaultOrientation: 'portrait',
    features: [
      'En-tête centré',
      'Informations de base',
      'Tableau des segments simplifié',
      'Pied de page avec pagination',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professionnel',
    description: 'Format complet avec horaires détaillés et notes techniques',
    defaultOrientation: 'landscape',
    features: [
      'En-tête avec logo et badge de statut',
      'Horaires calculés par segment',
      'Notes techniques affichées',
      'Section équipe (présentateurs/invités)',
      'Option annexe citations',
      'Informations de génération détaillées',
    ],
  },
};

/**
 * Templates PDF pour les archives
 */
export const ARCHIVE_PDF_TEMPLATES: Record<PdfTemplateId, PdfTemplate> = {
  classic: {
    id: 'classic',
    name: 'Classique',
    description: 'Liste simple des archives avec informations essentielles',
    defaultOrientation: 'portrait',
    features: [
      'Tableau récapitulatif compact',
      'Filtres de recherche affichés',
      'Informations de base par archive',
      'Pied de page avec pagination',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professionnel',
    description: 'Export détaillé avec segments, invités et notes techniques',
    defaultOrientation: 'landscape',
    features: [
      'En-tête stylisé avec badge',
      'Statistiques globales',
      'Détails complets par archive',
      'Segments avec horaires calculés',
      'Notes techniques et invités',
      'Filigrane et informations de génération',
    ],
  },
};

/**
 * Template par défaut
 */
export const DEFAULT_PDF_TEMPLATE: PdfTemplateId = 'professional';

/**
 * Obtenir un template conducteur par son ID
 */
export const getPdfTemplate = (id: PdfTemplateId): PdfTemplate => {
  return PDF_TEMPLATES[id] || PDF_TEMPLATES[DEFAULT_PDF_TEMPLATE];
};

/**
 * Obtenir un template archives par son ID
 */
export const getArchivePdfTemplate = (id: PdfTemplateId): PdfTemplate => {
  return ARCHIVE_PDF_TEMPLATES[id] || ARCHIVE_PDF_TEMPLATES[DEFAULT_PDF_TEMPLATE];
};

/**
 * Liste des templates conducteur pour les sélecteurs
 */
export const getPdfTemplatesList = (): PdfTemplate[] => {
  return Object.values(PDF_TEMPLATES);
};

/**
 * Liste des templates archives pour les sélecteurs
 */
export const getArchivePdfTemplatesList = (): PdfTemplate[] => {
  return Object.values(ARCHIVE_PDF_TEMPLATES);
};
