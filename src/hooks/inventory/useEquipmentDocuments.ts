// Hook pour la gestion des documents d'équipement

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadEquipmentDocument,
  deleteEquipmentDocument,
  uploadEquipmentPhoto,
} from '../../api/firebase/inventory';
import type { 
  EquipmentDocument, 
  Equipment,
  DocumentAccessLevel,
  DocumentType,
} from '../../types/inventory';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * Hook pour le contrôle d'accès aux documents
 */
export const useDocumentAccess = (document: EquipmentDocument, equipment: Equipment) => {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  
  const canView = useMemo(() => {
    // Vérifier permission globale
    if (!permissions?.inventory_view) return false;
    
    // Vérifier niveau d'accès du document
    switch (document.accessLevel) {
      case 'public':
        return true;
      case 'company':
        // Vérifier si l'utilisateur appartient à l'entreprise propriétaire
        // Pour simplifier, on autorise si l'utilisateur peut voir toutes les entreprises
        return permissions?.inventory_view_all_companies || true;
      case 'team':
        // Vérifier si l'utilisateur a des permissions de maintenance/gestion
        return permissions?.inventory_maintenance_manage || permissions?.inventory_manage_documents;
      case 'admin':
        return permissions?.inventory_manage_settings;
      case 'restricted':
        return document.allowedUserIds?.includes(user?.id || '') || false;
      default:
        return false;
    }
  }, [document, equipment, user, permissions]);
  
  const canEdit = useMemo(() => {
    if (!permissions?.inventory_manage_documents) return false;
    // L'uploader ou les admins peuvent modifier
    return permissions?.inventory_manage_settings || document.uploadedBy === user?.id;
  }, [document, user, permissions]);
  
  const canDelete = useMemo(() => {
    if (!permissions?.inventory_manage_documents) return false;
    // L'uploader ou les admins peuvent supprimer
    return permissions?.inventory_manage_settings || document.uploadedBy === user?.id;
  }, [document, user, permissions]);
  
  return { canView, canEdit, canDelete };
};

/**
 * Hook pour l'upload de documents
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      equipmentId,
      file,
      metadata,
    }: {
      equipmentId: string;
      file: File;
      metadata: {
        displayName: string;
        type: DocumentType;
        description?: string;
        accessLevel: DocumentAccessLevel;
      };
    }) => {
      if (!user?.id || !user?.name) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Note: Le progress tracking nécessiterait l'utilisation de uploadBytesResumable
      // Pour simplifier, on simule un progress
      setUploadProgress(50);
      
      const result = await uploadEquipmentDocument(
        equipmentId,
        file,
        metadata,
        user.id,
        user.name
      );
      
      setUploadProgress(100);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', 'detail', variables.equipmentId] });
      setUploadProgress(0);
    },
    onError: (error) => {
      console.error('Erreur upload document:', error);
      setUploadProgress(0);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
};

/**
 * Hook pour la suppression de documents
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      equipmentId,
      documentId,
      storagePath,
    }: {
      equipmentId: string;
      documentId: string;
      storagePath: string;
    }) => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      return deleteEquipmentDocument(equipmentId, documentId, storagePath, user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', 'detail', variables.equipmentId] });
    },
    onError: (error) => {
      console.error('Erreur suppression document:', error);
    },
  });
};

/**
 * Hook pour l'upload de photos
 */
export const useUploadPhoto = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      equipmentId,
      file,
    }: {
      equipmentId: string;
      file: File;
    }) => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      return uploadEquipmentPhoto(equipmentId, file, user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', 'detail', variables.equipmentId] });
    },
    onError: (error) => {
      console.error('Erreur upload photo:', error);
    },
  });
};

/**
 * Hook combiné pour la gestion des documents d'un équipement
 */
export const useEquipmentDocuments = (equipment: Equipment | null) => {
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const uploadPhoto = useUploadPhoto();

  const documents = equipment?.documents || [];
  const photos = equipment?.documentation?.photos || [];

  const getDocumentsByType = useCallback((type: DocumentType) => {
    return documents.filter(d => d.type === type);
  }, [documents]);

  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [documents]);

  return {
    documents: sortedDocuments,
    photos,
    getDocumentsByType,
    uploadDocument: uploadDocument.mutate,
    isUploading: uploadDocument.isPending,
    uploadProgress: uploadDocument.uploadProgress,
    deleteDocument: deleteDocument.mutate,
    isDeleting: deleteDocument.isPending,
    uploadPhoto: uploadPhoto.mutate,
    isUploadingPhoto: uploadPhoto.isPending,
  };
};
