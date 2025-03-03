import api from '../../api/api';
import type { Status } from '../../types';

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const statusApi = {
  update: async (
    token: string,
    showId: string,
    statusName: string
  ): Promise<void> => {
    try {
      // console.log(` ///////////// ${showId} et ${statusName}`);
      // console.log(` ///////////// shoh id fixe a 4`);

      await api.patch(
        `shows/status/${showId}`,
        { status: statusName },
        authHeaders(token)
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  },
};
