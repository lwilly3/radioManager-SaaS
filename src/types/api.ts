// Types pour les réponses API
export interface ApiShowResponse {
  id: string | number;
  title: string;
  type: string;
  emission: string;
  emission_id?: string | number | null;
  broadcast_date: string;
  duration?: number;
  frequency?: string;
  description?: string | null;
  status: string;
  presenters?: ApiPresenterResponse[];
  segments?: ApiSegmentResponse[];
}

export interface ApiPresenterResponse {
  id?: string | number;
  user_id?: string | number;
  name: string;
  contact_info?: string | null;
  biography?: string | null;
  isMainPresenter: boolean;
}

export interface ApiSegmentResponse {
  id?: string | number;
  title: string;
  type: string;
  duration: number;
  description?: string | null;
  startTime?: string | null;
  position?: number;
  technicalNotes?: string | null;
  guests?: ApiGuestResponse[];
}

export interface ApiGuestResponse {
  id?: string | number;
  name: string;
  contact_info?: string | null;
  biography?: string | null;
  role?: string | null;
  avatar?: string | null;
  phone?: string | null;
  email?: string | null;
}
