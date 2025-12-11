// Types pour les réponses API
export interface ApiShowResponse {
  id: string;
  title: string;
  type: string;
  emission: string;
  broadcast_date: string;
  duration: number;
  frequency: string;
  description: string;
  status: string;
  presenters: ApiPresenterResponse[];
  segments: ApiSegmentResponse[];
}

export interface ApiPresenterResponse {
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}

export interface ApiSegmentResponse {
  title: string;
  type: string;
  duration: number;
  description: string;
  startTime: string | null;
  position: number;
  guests: ApiGuestResponse[];
}

export interface ApiGuestResponse {
  name: string;
  contact_info: string | null;
  biography: string | null;
  role: string;
  avatar: string | null;
}
