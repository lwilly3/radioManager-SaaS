import React, { useEffect, useState } from 'react'; // Add useState
import ShowPlans from './ShowPlans';
import { useAuthStore } from '../store/useAuthStore';
import { useShowPlanStore } from '../store/useShowPlanStore';

const MyShowPlans: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const showPlans = useShowPlanStore((state) => state.showPlans);
  const [filteredShows, setFilteredShows] = useState(showPlans); // Local state for filtered shows

  // Filter shows based on user when showPlans or user changes
  useEffect(() => {
    const filtered = showPlans.filter(show => 
      show.presenters.some(presenter => presenter.id === user?.id)
    );
    setFilteredShows(filtered);
  }, [user, showPlans]); // No setShowPlans in dependencies

  return (
    <ShowPlans 
      title="Mes Conducteurs"
      description="Gérez vos conducteurs personnels"
      baseUrl="/my-show-plans"
    />
  );
};

export default MyShowPlans;