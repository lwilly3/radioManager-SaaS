import React from 'react';
import { useShowPlanStore } from '../../store/useShowPlanStore';
import { useAuthStore } from '../../store/useAuthStore';
import ShowPlanCard from './ShowPlanCard';
import ShowPlanListView from './ShowPlanListView';
import { generateKey } from '../../utils/keyGenerator';

interface ShowPlanListProps {
  viewMode: 'grid' | 'list';
  showPlans: any[]; // Utiliser les showPlans filtrés passés en props
}

const ShowPlanList: React.FC<ShowPlanListProps> = ({ viewMode, showPlans }) => {
  const setShowPlans = useShowPlanStore((state) => state.setShowPlans);
  const allShowPlans = useShowPlanStore((state) => state.showPlans);
  const permissions = useAuthStore((state) => state.permissions);

  const handleStatusChange = (showPlanId: string, newStatus: string) => {
    setShowPlans(
      allShowPlans.map((showPlan) =>
        showPlan.id === showPlanId
          ? { ...showPlan, status: newStatus }
          : showPlan
      )
    );
  };

  if (showPlans.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Aucun conducteur trouvé pour le moment</p>
      </div>
    );
  }

  // Trier les conducteurs: d'abord ceux "en-cours", puis par priorité de statut, puis par date
  const sortedShowPlans = [...showPlans].sort((a, b) => {
    // Mettre les "en-cours" en premier
    if (a.status === 'en-cours' && b.status !== 'en-cours') return -1;
    if (a.status !== 'en-cours' && b.status === 'en-cours') return 1;
    
    // Ensuite trier par priorité de statut
    if (a.status.priority !== b.status.priority) {
      return a.status.priority - b.status.priority;
    }
    
    // Enfin trier par date (du plus récent au plus ancien)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return viewMode === 'grid' ? (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sortedShowPlans.map((showPlan) => (
        <ShowPlanCard
          key={generateKey(showPlan.id)}
          showPlan={showPlan}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  ) : (
    <div className="space-y-4">
      {sortedShowPlans.map((showPlan) => (
        <ShowPlanListView
          key={generateKey(showPlan.id)}
          showPlan={showPlan}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};

export default ShowPlanList;