import React, { useEffect, useState } from 'react';
import ShowPlans from './ShowPlans';
import { useAuthStore } from '../store/useAuthStore';
import { useShowPlanStore } from '../store/useShowPlanStore';
import { useUserPreferencesStore } from '../store/useUserPreferencesStore';

const MyShowPlans: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const showPlans = useShowPlanStore((state) => state.showPlans);
  const [filteredShows, setFilteredShows] = useState(showPlans);
  
  // Load user preferences when component mounts
  const { loadPreferences } = useUserPreferencesStore();
  
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Filter shows based on user when showPlans or user changes
  useEffect(() => {
    const filtered = showPlans.filter(show => 
      show.presenters.some(presenter => presenter.id === user?.id)
    );
    setFilteredShows(filtered);
  }, [user, showPlans]);

  return (
    <ShowPlans 
      title="Mes Conducteurs"
      description="Gérez vos conducteurs personnels"
      baseUrl="/my-show-plans"
    />
  );
};

export default MyShowPlans;