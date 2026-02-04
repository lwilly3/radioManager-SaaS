// Types pour les réponses API
export interface ApiShowResponse {
  id: string;
  title: string;
  type: string;
  emission: string;
  emission_id?: number | string;
  broadcast_date: string;
  duration: number;
  frequency: string;
  description: string;
  status: string;
  presenters: ApiPresenterResponse[];
  segments: ApiSegmentResponse[];
}

export interface ApiPresenterResponse {
  id: number | string;
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}

export interface ApiSegmentResponse {
  id: number | string;
  title: string;
  type: string;
  duration: number;
  description: string;
  startTime: string | null;
  position: number;
  guests: ApiGuestResponse[];
}

export interface ApiGuestResponse {
  id: number | string;
  name: string;
  contact_info: string | null;
  biography: string | null;
  role: string;
  avatar: string | null;
}
