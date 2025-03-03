import type { Show } from '../types';

/**
 * Filtre les émissions en fonction d'une chaîne de recherche et d'un type
 * @param shows - Liste des émissions à filtrer
 * @param searchQuery - Chaîne de recherche
 * @param showType - Type d'émission à filtrer
 * @returns Liste des émissions filtrées
 */
export const filterShows = (
  shows: Show[], 
  searchQuery: string = '', 
  showType: string = ''
): Show[] => {
  if (!shows || shows.length === 0) return [];
  
  return shows.filter(show => {
    // Filtre par type d'émission
    if (showType && show.type !== showType) {
      return false;
    }
    
    // Filtre par recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      // Recherche dans le titre
      if (show.title && show.title.toLowerCase().includes(query)) {
        return true;
      }
      
      // Recherche dans la description
      if (show.description && show.description.toLowerCase().includes(query)) {
        return true;
      }
      
      // Recherche dans le type (traduit)
      const showTypeLabels: Record<string, string> = {
        'morning-show': 'matinale',
        'news': 'journal',
        'talk-show': 'talk-show',
        'music-show': 'émission musicale',
        'cultural': 'magazine culturel',
        'sports': 'sport',
        'documentary': 'documentaire',
        'entertainment': 'divertissement',
        'debate': 'débat',
        'other': 'autre',
      };
      
      if (show.type && showTypeLabels[show.type]?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Recherche dans la fréquence (traduite)
      const frequencyLabels: Record<string, string> = {
        'daily': 'quotidienne',
        'weekly': 'hebdomadaire',
        'monthly': 'mensuelle',
        'special': 'spéciale',
      };
      
      if (show.frequency && frequencyLabels[show.frequency]?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Aucune correspondance trouvée
      return false;
    }
    
    // Aucun filtre appliqué
    return true;
  });
};