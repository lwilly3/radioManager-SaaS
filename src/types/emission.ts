export interface Emission {
  id: number;
  title: string;
  synopsis: string;
  type: string;
  duration: number;
  frequency: string;
  description: string;
}

export interface CreateEmissionData {
  title: string;
  synopsis: string;
  type: string;
  duration: number;
  frequency: string;
  description: string;
}

export interface UpdateEmissionData {
  title: string;
  synopsis: string;
  type: string;
  duration: number;
  frequency: string;
  description: string;
}

export interface CreateShowPlanPayload {
  title: string;
  type: string;
  broadcast_date: string;
  duration: number;
  frequency: string;
  description?: string;
  status: string;
  emission_id: number;
  presenter_ids: number[];
  segments: {
    title: string;
    type: string;
    position: number;
    duration: number;
    description?: string;
    guest_ids: number[];
  }[];
}