import api from '../../api/api';
import type { ApiShowResponse, ApiSegmentResponse, ApiGuestResponse } from '../../types/api';
import type { ShowPlan, ShowType, SegmentType, Guest } from '../../types';

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const mapShowType = (type: string): ShowType => {
  const normalized = type?.toLowerCase();
  const allowed: ShowType[] = [
    'morning-show',
    'news',
    'talk-show',
    'music-show',
    'cultural',
    'sports',
    'documentary',
    'entertainment',
    'debate',
    'other',
  ];

  return (allowed.find((value) => value === normalized) ?? 'other') as ShowType;
};

const mapSegmentType = (type: string): SegmentType => {
  const normalized = type?.toLowerCase();
  const allowed: SegmentType[] = [
    'intro',
    'interview',
    'music',
    'ad',
    'outro',
    'other',
  ];

  return (allowed.find((value) => value === normalized) ?? 'other') as SegmentType;
};

const mapGuestCollection = (segments: ApiSegmentResponse[]): Guest[] => {
  const guestMap = new Map<string, Guest>();
  let incrementalId = 1;

  const resolveGuestId = (rawId: string | number | undefined, fallbackKey: string): number => {
    if (typeof rawId === 'number' && Number.isFinite(rawId)) {
      return rawId;
    }

    if (typeof rawId === 'string') {
      const parsed = Number.parseInt(rawId, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    const existing = guestMap.get(fallbackKey);
    if (existing) {
      return existing.id;
    }

    return incrementalId++;
  };

  segments.forEach((segment) => {
    (segment.guests ?? []).forEach((guest: ApiGuestResponse, index: number) => {
      const key = String(guest.id ?? `${segment.title}-${index}`);
      const guestId = resolveGuestId(guest.id, key);

      if (!guestMap.has(key)) {
        guestMap.set(key, {
          id: guestId,
          name: guest.name,
          contact_info: guest.contact_info ?? null,
          biography: guest.biography ?? null,
          role: guest.role ?? null,
          phone: guest.phone ?? null,
          email: guest.email ?? null,
          avatar: guest.avatar ?? null,
          segments: [],
          appearances: [],
        });
      }
    });
  });

  return Array.from(guestMap.values());
};

// Convert API response to internal format
const mapApiShowToShowPlan = (apiShow: ApiShowResponse): ShowPlan => {
  const segments = apiShow.segments ?? [];

  const showType = mapShowType(apiShow.type);

  return {
    id: String(apiShow.id),
    emission_id: apiShow.emission_id != null ? String(apiShow.emission_id) : undefined,
    emission: apiShow.emission,
    title: apiShow.title,
    type: showType,
    showType,
    date: apiShow.broadcast_date,
    description: apiShow.description ?? undefined,
    status: apiShow.status,
    segments: segments.map((segment, index) => ({
      id: String(segment.id ?? `${apiShow.id}-${index}`),
      title: segment.title,
      duration: segment.duration,
      type: mapSegmentType(segment.type),
      description: segment.description ?? undefined,
      startTime: segment.startTime ?? '',
      position: segment.position != null ? String(segment.position) : String(index),
      technicalNotes: segment.technicalNotes ?? undefined,
      guests: (segment.guests ?? []).map((guest: ApiGuestResponse, guestIndex) =>
        String(guest.id ?? `${segment.title}-${guestIndex}`)
      ),
    })),
    presenters: (apiShow.presenters ?? []).map((presenter, index) => ({
      id: String(presenter.id ?? `${apiShow.id}-presenter-${index}`),
      user_id: String(presenter.user_id ?? presenter.id ?? `${apiShow.id}-user-${index}`),
      name: presenter.name,
      contact: presenter.contact_info
        ? {
            email: presenter.contact_info || undefined,
          }
        : undefined,
      isMainPresenter: Boolean(presenter.isMainPresenter),
    })),
    guests: mapGuestCollection(segments),
  };
};

export const showsApi = {
  // Retourne les conducteurs prêts à diffuser
  getAll_production: async (token: string): Promise<ShowPlan[]> => {
    try {
      const response = await api.get('/shows/production', authHeaders(token));
      return response.data.map(mapApiShowToShowPlan);
    } catch (error) {
      console.error('Failed to fetch production shows:', error);
      throw error;
    }
  },

  // Retourne les conducteurs de l'utilisateur connecté
  getAll_Owned: async (token: string): Promise<ShowPlan[]> => {
    try {
      const response = await api.get('/shows/owned', authHeaders(token));
      return response.data.map(mapApiShowToShowPlan);
    } catch (error) {
      console.error('Failed to fetch owned shows:', error);
      throw error;
    }
  },

  // Get show by ID
  getById: async (token: string, id: string): Promise<ShowPlan> => {
    try {
      const response = await api.get(`/shows/x/${id}`, authHeaders(token));
      return mapApiShowToShowPlan(response.data);
    } catch (error) {
      console.error(`Failed to fetch show ${id}:`, error);
      throw error;
    }
  },

  // Create new showPlan creation d'un conducteur
  create: async (token: string, data: any): Promise<any> => {
    try {
      const response = await api.post(
        '/shows/detail',
        data,
        authHeaders(token)
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create show:', error);
      throw error;
    }
  },

  // Update show
  update: async (token: string, id: string, data: any): Promise<ShowPlan> => {
    try {
      console.log('Données envoyées à l\'API:', data);
      const response = await api.patch(
        `/shows/detail/${id}`,
        data,
        authHeaders(token)
      );
      return mapApiShowToShowPlan(response.data);
    } catch (error) {
      console.error(`Failed to update show ${id}:`, error);
      throw error;
    }
  },

  // Update show status
  updateStatus: async (
    token: string,
    id: string,
    status: string
  ): Promise<void> => {
    try {
      await api.patch(`/shows/status/${id}`, { status }, authHeaders(token));
    } catch (error) {
      console.error(`Failed to update show status for ${id}:`, error);
      throw error;
    }
  },

  // Delete show
  deleteDel: async (showId: string, token: string) => {
    try {
      const response = await api.delete(`/shows/del/${showId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};