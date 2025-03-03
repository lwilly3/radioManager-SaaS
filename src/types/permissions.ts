export interface UserPermissions {
  // Conducteurs
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
  
  // Utilisateurs
  can_acces_users_section: boolean;
  can_view_users: boolean;
  can_edit_users: boolean;
  can_desable_users: boolean;
  can_delete_users: boolean;
  can_manage_roles: boolean;
  can_assign_roles: boolean;
  
  // Invités
  can_acces_guests_section: boolean;
  can_view_guests: boolean;
  can_edit_guests: boolean;
  can_delete_guests: boolean;
  
  // Présentateurs
  can_acces_presenters_section: boolean;
  can_view_presenters: boolean;
  can_edit_presenters: boolean;
  can_delete_presenters: boolean;
  
  // Émissions
  can_acces_emissions_section: boolean;
  can_view_emissions: boolean;
  can_create_emissions: boolean;
  can_edit_emissions: boolean;
  can_delete_emissions: boolean;
  can_manage_emissions: boolean;
  
  // Système
  can_view_notifications: boolean;
  can_manage_notifications: boolean;
  can_view_audit_logs: boolean;
  can_view_login_history: boolean;
  can_manage_settings: boolean;
  
  // Communication
  can_view_messages: boolean;
  can_send_messages: boolean;
  can_delete_messages: boolean;
  
  // Fichiers
  can_view_files: boolean;
  can_upload_files: boolean;
  can_delete_files: boolean;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Partial<UserPermissions>;
}

export interface PermissionCategory {
  id: string;
  name: string;
  permissions: Array<{
    key: keyof UserPermissions;
    label: string;
    description: string;
  }>;
}

export const permissionCategories: PermissionCategory[] = [
  {
    id: 'conducteurs',
    name: 'Conducteurs',
    permissions: [
      { key: 'can_acces_showplan_section', label: 'Accéder aux conducteurs', description: 'Peut accéder à la section des conducteurs' },
      { key: 'can_acces_showplan_broadcast_section', label: 'Accéder à la diffusion', description: 'Peut accéder à la section de diffusion des conducteurs' },
      { key: 'can_create_showplan', label: 'Créer des conducteurs', description: 'Peut créer de nouveaux conducteurs' },
      { key: 'can_edit_showplan', label: 'Modifier des conducteurs', description: 'Peut modifier les conducteurs existants' },
      { key: 'can_archive_showplan', label: 'Archiver des conducteurs', description: 'Peut archiver les conducteurs' },
      { key: 'can_archiveStatusChange_showplan', label: 'Changer le statut d\'archive', description: 'Peut modifier le statut d\'archive des conducteurs' },
      { key: 'can_delete_showplan', label: 'Supprimer des conducteurs', description: 'Peut supprimer des conducteurs' },
      { key: 'can_destroy_showplan', label: 'Détruire des conducteurs', description: 'Peut détruire définitivement des conducteurs' },
      { key: 'can_changestatus_showplan', label: 'Changer le statut', description: 'Peut changer le statut des conducteurs' },
      { key: 'can_changestatus_owned_showplan', label: 'Changer le statut (propriétaire)', description: 'Peut changer le statut de ses propres conducteurs' },
      { key: 'can_changestatus_archived_showplan', label: 'Changer le statut (archivés)', description: 'Peut changer le statut des conducteurs archivés' },
      { key: 'can_setOnline_showplan', label: 'Mettre en ligne', description: 'Peut mettre des conducteurs en ligne' },
      { key: 'can_viewAll_showplan', label: 'Voir tous les conducteurs', description: 'Peut voir tous les conducteurs, y compris ceux des autres' }
    ]
  },
  {
    id: 'utilisateurs',
    name: 'Utilisateurs',
    permissions: [
      { key: 'can_acces_users_section', label: 'Accéder aux utilisateurs', description: 'Peut accéder à la section des utilisateurs' },
      { key: 'can_view_users', label: 'Voir les utilisateurs', description: 'Peut voir les utilisateurs' },
      { key: 'can_edit_users', label: 'Modifier les utilisateurs', description: 'Peut modifier les informations des utilisateurs' },
      { key: 'can_desable_users', label: 'Désactiver les utilisateurs', description: 'Peut désactiver des comptes utilisateurs' },
      { key: 'can_delete_users', label: 'Supprimer les utilisateurs', description: 'Peut supprimer des comptes utilisateurs' },
      { key: 'can_manage_roles', label: 'Gérer les rôles', description: 'Peut gérer les rôles des utilisateurs' },
      { key: 'can_assign_roles', label: 'Assigner des rôles', description: 'Peut assigner des rôles aux utilisateurs' }
    ]
  },
  {
    id: 'invites',
    name: 'Invités',
    permissions: [
      { key: 'can_acces_guests_section', label: 'Accéder aux invités', description: 'Peut accéder à la section des invités' },
      { key: 'can_view_guests', label: 'Voir les invités', description: 'Peut voir les invités' },
      { key: 'can_edit_guests', label: 'Modifier les invités', description: 'Peut modifier les informations des invités' },
      { key: 'can_delete_guests', label: 'Supprimer les invités', description: 'Peut supprimer des invités' }
    ]
  },
  {
    id: 'presentateurs',
    name: 'Présentateurs',
    permissions: [
      { key: 'can_acces_presenters_section', label: 'Accéder aux présentateurs', description: 'Peut accéder à la section des présentateurs' },
      { key: 'can_view_presenters', label: 'Voir les présentateurs', description: 'Peut voir les présentateurs' },
      { key: 'can_edit_presenters', label: 'Modifier les présentateurs', description: 'Peut modifier les informations des présentateurs' },
      { key: 'can_delete_presenters', label: 'Supprimer les présentateurs', description: 'Peut supprimer des présentateurs' }
    ]
  },
  {
    id: 'emissions',
    name: 'Émissions',
    permissions: [
      { key: 'can_acces_emissions_section', label: 'Accéder aux émissions', description: 'Peut accéder à la section des émissions' },
      { key: 'can_view_emissions', label: 'Voir les émissions', description: 'Peut voir les émissions' },
      { key: 'can_create_emissions', label: 'Créer des émissions', description: 'Peut créer de nouvelles émissions' },
      { key: 'can_edit_emissions', label: 'Modifier les émissions', description: 'Peut modifier les émissions existantes' },
      { key: 'can_delete_emissions', label: 'Supprimer les émissions', description: 'Peut supprimer des émissions' },
      { key: 'can_manage_emissions', label: 'Gérer les émissions', description: 'Peut gérer tous les aspects des émissions' }
    ]
  },
  {
    id: 'systeme',
    name: 'Système',
    permissions: [
      { key: 'can_view_notifications', label: 'Voir les notifications', description: 'Peut voir les notifications' },
      { key: 'can_manage_notifications', label: 'Gérer les notifications', description: 'Peut gérer les notifications' },
      { key: 'can_view_audit_logs', label: 'Voir les journaux d\'audit', description: 'Peut voir les journaux d\'audit' },
      { key: 'can_view_login_history', label: 'Voir l\'historique de connexion', description: 'Peut voir l\'historique de connexion' },
      { key: 'can_manage_settings', label: 'Gérer les paramètres', description: 'Peut gérer les paramètres du système' }
    ]
  },
  {
    id: 'communication',
    name: 'Communication',
    permissions: [
      { key: 'can_view_messages', label: 'Voir les messages', description: 'Peut voir les messages' },
      { key: 'can_send_messages', label: 'Envoyer des messages', description: 'Peut envoyer des messages' },
      { key: 'can_delete_messages', label: 'Supprimer des messages', description: 'Peut supprimer des messages' }
    ]
  },
  {
    id: 'fichiers',
    name: 'Fichiers',
    permissions: [
      { key: 'can_view_files', label: 'Voir les fichiers', description: 'Peut voir les fichiers' },
      { key: 'can_upload_files', label: 'Téléverser des fichiers', description: 'Peut téléverser des fichiers' },
      { key: 'can_delete_files', label: 'Supprimer des fichiers', description: 'Peut supprimer des fichiers' }
    ]
  }
];

export const defaultRoleTemplates: RoleTemplate[] = [
  {
    id: 'admin',
    name: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités',
    permissions: Object.fromEntries(
      permissionCategories.flatMap(category => 
        category.permissions.map(p => [p.key, true])
      )
    ) as Partial<UserPermissions>
  },
  {
    id: 'presenter',
    name: 'Présentateur',
    description: 'Gestion des conducteurs et des émissions',
    permissions: {
      can_acces_showplan_section: true,
      can_acces_showplan_broadcast_section: true,
      can_create_showplan: true,
      can_edit_showplan: true,
      can_changestatus_owned_showplan: true,
      can_viewAll_showplan: false,
      can_acces_guests_section: true,
      can_view_guests: true,
      can_edit_guests: true,
      can_acces_emissions_section: true,
      can_view_emissions: true,
      can_view_messages: true,
      can_send_messages: true,
      can_view_files: true,
      can_upload_files: true
    }
  },
  {
    id: 'technician',
    name: 'Technicien',
    description: 'Gestion technique des émissions',
    permissions: {
      can_acces_showplan_section: true,
      can_acces_showplan_broadcast_section: true,
      can_edit_showplan: true,
      can_changestatus_showplan: true,
      can_setOnline_showplan: true,
      can_viewAll_showplan: true,
      can_view_guests: true,
      can_view_emissions: true,
      can_view_messages: true,
      can_send_messages: true,
      can_view_files: true,
      can_upload_files: true
    }
  },
  {
    id: 'guest',
    name: 'Invité',
    description: 'Accès en lecture seule',
    permissions: {
      can_acces_showplan_section: true,
      can_viewAll_showplan: false,
      can_view_guests: true,
      can_view_emissions: true,
      can_view_messages: true,
      can_view_files: true
    }
  }
];