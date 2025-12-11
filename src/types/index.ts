// Show Plan and related types
export interface ShowPlan {
  id: string;
  title: string;
  emission: string;
  emission_id?: string;
  type?: ShowType;
  showType: ShowType;
  date: string;
  description?: string;
  status: string;
  // status: Status;
  segments: ShowSegment[];
  presenters: Presenter[];
  guests: Guest[];
}

export type ShowTitle =
  | 'matinale'
  | 'midi-info'
  | 'journal'
  | 'club-sport'
  | 'culture-mag'
  | 'debat-soir'
  | 'musique-live'
  | 'interview'
  | 'chronique'
  | 'autre';

export type ShowType =
  | 'morning-show'
  | 'news'
  | 'talk-show'
  | 'music-show'
  | 'cultural'
  | 'sports'
  | 'documentary'
  | 'entertainment'
  | 'debate'
  | 'other';

// Segment types
export interface ShowSegment {
  id: string;
  title: string;
  duration: number;
  type: SegmentType;
  description?: string;
  startTime: string;
  position: string;
  technicalNotes?: string;
  guests?: string[];
}

export type SegmentType =
  | 'intro'
  | 'interview'
  | 'music'
  | 'ad'
  | 'outro'
  | 'other';

// Status type
export interface Status {
  id: string;
  name: string;
  color: string;
  priority: number;
}

// Presenter type
export interface Presenter {
  id: string;
  user_id: string;
  name: string;

  profilePicture?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  isMainPresenter: boolean;
}

// Guest types
// export interface Guest {
//   id: string;
//   name: string;
//   role: GuestRole;
//   biography?: string;
//   avatar?: string;
//   contact?: {
//     email?: string;
//     phone?: string;
//   };
// }
export interface Appearance {
  show_id: number;
  show_title: string;
  broadcast_date: string;
}

export interface Guest {
  id: number; // Requis pour GuestCard et navigation dans GuestDetailDialog
  name: string;
  contact_info: string | null;
  biography: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  avatar: string | null;
  segments: any[]; // À affiner si utilisé
  appearances: Appearance[];
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

// Team member types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  phone?: string;
  bio?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  shows?: string[];
}

export type TeamRole =
  | 'admin'
  | 'host'
  | 'producer'
  | 'technician'
  | 'editor'
  | 'journalist';

// Show rundown types
export interface ShowRundown {
  id: string;
  title: string;
  date: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'live' | 'completed';
  segments: ShowSegment[];
  guests: Guest[];
}
