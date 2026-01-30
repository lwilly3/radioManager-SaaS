// import type { UserPermissions } from '../types/permissions';

// export interface LoginCredentials {
//   username: string;
//   password: string;
// }

// export interface LoginResponse {
//   access_token: string;
//   token_type: 'bearer';
//   permissions: UserPermissions;
// }

// export interface User {
//   id: string;
//   username: string;
// }

////////////////////////////// pour le chat avec firebase
// src/types/auth.ts
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  email: string;
  family_name: string;
  name: string;
  phone_number: null;

  permissions: {
    user_id: number; // Note : ton API retourne un nombre, pas une string
    can_acces_showplan_broadcast_section: boolean;
    can_acces_showplan_section: boolean;
    can_create_showplan: boolean;
    can_edit_showplan: boolean;
    can_archive_showplan: boolean;
    can_archiveStatusChange_showplan: boolean;
    can_delete_showplan: boolean;
    can_destroy_showplan: boolean;
    can_changestatus_showplan: boolean;
    can_changestatus_owned_showplan: boolean;
    can_changestatus_archived_showplan: boolean;
    can_setOnline_showplan: boolean;
    can_viewAll_showplan: boolean;
    can_acces_users_section: boolean;
    can_view_users: boolean;
    can_edit_users: boolean;
    can_desable_users: boolean;
    can_delete_users: boolean;
    can_manage_roles: boolean;
    can_assign_roles: boolean;
    can_acces_guests_section: boolean;
    can_view_guests: boolean;
    can_edit_guests: boolean;
    can_delete_guests: boolean;
    can_acces_presenters_section: boolean;
    can_view_presenters: boolean;
    can_edit_presenters: boolean;
    can_delete_presenters: boolean;
    can_acces_emissions_section: boolean;
    can_view_emissions: boolean;
    can_create_emissions: boolean;
    can_edit_emissions: boolean;
    can_delete_emissions: boolean;
    can_manage_emissions: boolean;
    can_view_notifications: boolean;
    can_manage_notifications: boolean;
    can_view_audit_logs: boolean;
    can_view_login_history: boolean;
    can_manage_settings: boolean;
    can_view_messages: boolean;
    can_send_messages: boolean;
    can_delete_messages: boolean;
    can_view_files: boolean;
    can_upload_files: boolean;
    can_delete_files: boolean;
    // Permissions module Citations
    quotes_view: boolean;
    quotes_create: boolean;
    quotes_edit: boolean;
    quotes_delete: boolean;
    quotes_publish: boolean;
    stream_transcription_view: boolean;
    stream_transcription_create: boolean;
    quotes_capture_live: boolean;
    granted_at: string;
  };
}
