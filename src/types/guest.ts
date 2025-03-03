
export interface Guest {
  id: string;
  name: string;
  role: GuestRole;
  biography?: string;
  avatar?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type GuestRole = 
  | 'journalist'
  | 'expert'
  | 'artist'
  | 'politician'
  | 'athlete'
  | 'writer'
  | 'scientist'
  | 'other';
