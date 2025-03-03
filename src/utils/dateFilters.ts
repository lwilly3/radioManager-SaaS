import { addDays, addMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, isAfter, isSameDay, isSameMonth, getDay, isWithinInterval } from 'date-fns';

/**
 * Filtre les conducteurs en fonction d'une période de date spécifiée
 * @param showPlans - Liste des conducteurs à filtrer
 * @param dateFilter - Filtre de date à appliquer
 * @returns Liste des conducteurs filtrés par date
 */
export const filterShowPlansByDate = (showPlans: any[], dateFilter: string) => {
  if (!showPlans || showPlans.length === 0) return [];
  if (dateFilter === 'all') return showPlans;

  const now = new Date();
  const today = startOfDay(now);
  const endToday = endOfDay(now);
  const startThisWeek = startOfWeek(now, { weekStartsOn: 1 }); // Lundi
  const endThisWeek = endOfWeek(now, { weekStartsOn: 1 }); // Dimanche
  const startLastWeek = addDays(startThisWeek, -7);
  const startThisMonth = startOfMonth(now);
  const endThisMonth = endOfMonth(now);
  const startNextMonth = startOfMonth(addMonths(now, 1));
  const endNextMonth = endOfMonth(addMonths(now, 1));
  
  // Déterminer le weekend (samedi et dimanche)
  const currentDay = getDay(now);
  const daysUntilWeekend = currentDay === 6 || currentDay === 0 ? 0 : 6 - currentDay; // 6 = samedi
  const startWeekend = startOfDay(addDays(now, daysUntilWeekend));
  const endWeekend = endOfDay(addDays(startWeekend, 1)); // Dimanche soir

  return showPlans.filter(showPlan => {
    const showDate = new Date(showPlan.date);
    
    switch (dateFilter) {
      case 'today':
        // Aujourd'hui
        return isSameDay(showDate, now);
      
      case 'this-week-full':
        // Cette semaine entière (du lundi au dimanche)
        return isWithinInterval(showDate, { start: startThisWeek, end: endThisWeek });
        
      case 'weekend':
        // Ce weekend (samedi et dimanche)
        return isWithinInterval(showDate, { start: startWeekend, end: endWeekend });
        
      case 'this-week':
        // Plus tard cette semaine (jours restants de la semaine actuelle, excluant aujourd'hui)
        return isAfter(showDate, endToday) && isBefore(showDate, endThisWeek);
        
      case 'last-week':
        // Il y a plus d'une semaine
        return isBefore(showDate, startLastWeek);
        
      case 'this-month':
        // Ce mois-ci
        return isSameMonth(showDate, now);
        
      case 'past-months':
        // Il y a plusieurs mois
        return isBefore(showDate, startThisMonth);
        
      case 'next-month':
        // Le mois prochain
        return isAfter(showDate, endThisMonth) && isBefore(showDate, endNextMonth);
        
      case 'future-months':
        // Les mois prochains (après le mois prochain)
        return isAfter(showDate, endNextMonth);
        
      default:
        return true;
    }
  });
};