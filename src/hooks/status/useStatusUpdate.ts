import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { statusApi } from '../../services/api/status';
import type { Status } from '../../types';

export const useStatusUpdate = () => {
  const token = useAuthStore((state) => state.token);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (
    showId: string,
    newStatus: string
  ): Promise<boolean> => {
    if (!token || isUpdating) return false;

    setIsUpdating(true);
    try {
      // newStatus.name AU LIEU DE newStatus.id
      await statusApi.update(token, showId, newStatus);
      return true;
    } catch (error) {
      console.error('Status update failed:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateStatus,
    isUpdating,
  };
};
