/**
 * Filtre les conducteurs en fonction d'une chaîne de recherche
 * @param showPlans - Liste des conducteurs à filtrer
 * @param searchQuery - Chaîne de recherche
 * @returns Liste des conducteurs filtrés par la recherche
 */
export const filterShowPlansBySearch = (showPlans: any[], searchQuery: string) => {
  if (!showPlans || showPlans.length === 0) return [];
  if (!searchQuery || searchQuery.trim() === '') return showPlans;

  const query = searchQuery.toLowerCase().trim();

  return showPlans.filter(showPlan => {
    // Recherche dans le titre
    if (showPlan.title && showPlan.title.toLowerCase().includes(query)) {
      return true;
    }
    
    // Recherche dans l'émission
    if (showPlan.emission && showPlan.emission.toLowerCase().includes(query)) {
      return true;
    }
    
    // Recherche dans la description
    if (showPlan.description && showPlan.description.toLowerCase().includes(query)) {
      return true;
    }
    
    // Recherche dans les segments
    if (showPlan.segments && showPlan.segments.length > 0) {
      return showPlan.segments.some((segment: any) => 
        (segment.title && segment.title.toLowerCase().includes(query)) ||
        (segment.description && segment.description.toLowerCase().includes(query))
      );
    }
    
    // Recherche dans les invités
    if (showPlan.guests && showPlan.guests.length > 0) {
      return showPlan.guests.some((guest: any) => 
        (guest.name && guest.name.toLowerCase().includes(query))
      );
    }
    
    // Recherche dans les présentateurs
    if (showPlan.presenters && showPlan.presenters.length > 0) {
      return showPlan.presenters.some((presenter: any) => 
        (presenter.name && presenter.name.toLowerCase().includes(query))
      );
    }
    
    return false;
  });
};