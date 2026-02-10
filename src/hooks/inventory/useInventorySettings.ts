// Hook pour la gestion des paramètres d'inventaire

import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToInventorySettings,
  updateInventorySettings,
} from '../../api/firebase/inventory';
import type { InventorySettings, ConfigurableOption } from '../../types/inventory';
import { useAuthStore } from '../../store/useAuthStore';

export const useInventorySettings = () => {
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const user = useAuthStore((state) => state.user);

  // Écoute temps réel des paramètres
  useEffect(() => {
    const unsubscribe = subscribeToInventorySettings(
      (loadedSettings) => {
        setSettings(loadedSettings);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erreur chargement paramètres inventaire:', err);
        setError('Impossible de charger les paramètres');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Mise à jour d'une liste spécifique
  const updateList = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'missionTypes' | 'conditionStates' | 'documentTypes'>,
    items: ConfigurableOption[]
  ) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      // Nettoyer les undefined pour Firebase (remplacer par null)
      const cleanedItems = items.map(item => {
        const cleaned: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(item)) {
          cleaned[key] = value === undefined ? null : value;
        }
        return cleaned as ConfigurableOption;
      });
      await updateInventorySettings(
        { [listName]: cleanedItems },
        user.id
      );
    } catch (err) {
      console.error(`Erreur mise à jour ${listName}:`, err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  // Ajouter une option à une liste
  const addOption = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'missionTypes' | 'conditionStates' | 'documentTypes'>,
    option: Omit<ConfigurableOption, 'id' | 'order'>
  ) => {
    if (!settings || !user?.id) return;
    
    const currentList = settings[listName];
    const newOption: ConfigurableOption = {
      ...option,
      id: `${listName.slice(0, 3)}-${Date.now()}`,
      order: currentList.length + 1,
      isActive: true,
    };
    
    await updateList(listName, [...currentList, newOption]);
  }, [settings, updateList, user?.id]);

  // Mettre à jour une option
  const updateOption = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'missionTypes' | 'conditionStates' | 'documentTypes'>,
    optionId: string,
    updates: Partial<ConfigurableOption>
  ) => {
    if (!settings || !user?.id) return;
    
    const currentList = settings[listName];
    const updatedList = currentList.map(opt =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );
    
    await updateList(listName, updatedList);
  }, [settings, updateList, user?.id]);

  // Supprimer (soft delete) une option
  const removeOption = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'missionTypes' | 'conditionStates' | 'documentTypes'>,
    optionId: string
  ) => {
    if (!settings || !user?.id) return;
    
    const currentList = settings[listName];
    const updatedList = currentList.map(opt =>
      opt.id === optionId ? { ...opt, isActive: false } : opt
    );
    
    await updateList(listName, updatedList);
  }, [settings, updateList, user?.id]);

  // Réactiver une option
  const restoreOption = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'missionTypes' | 'conditionStates' | 'documentTypes'>,
    optionId: string
  ) => {
    if (!settings || !user?.id) return;
    
    const currentList = settings[listName];
    const updatedList = currentList.map(opt =>
      opt.id === optionId ? { ...opt, isActive: true } : opt
    );
    
    await updateList(listName, updatedList);
  }, [settings, updateList, user?.id]);

  // Réordonner une liste
  const reorderList = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'missionTypes' | 'conditionStates' | 'documentTypes'>,
    orderedIds: string[]
  ) => {
    if (!settings || !user?.id) return;
    
    const currentList = settings[listName];
    const reorderedList = orderedIds.map((id, index) => {
      const option = currentList.find(opt => opt.id === id);
      return option ? { ...option, order: index + 1 } : null;
    }).filter(Boolean) as ConfigurableOption[];
    
    // Ajouter les éléments non réordonnés à la fin
    const remainingItems = currentList.filter(opt => !orderedIds.includes(opt.id));
    remainingItems.forEach((item, index) => {
      item.order = reorderedList.length + index + 1;
      reorderedList.push(item);
    });
    
    await updateList(listName, reorderedList);
  }, [settings, updateList, user?.id]);

  // Définir l'option par défaut
  const setDefaultOption = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'missionTypes' | 'conditionStates' | 'documentTypes'>,
    optionId: string
  ) => {
    if (!settings || !user?.id) return;
    
    const currentList = settings[listName];
    const updatedList = currentList.map(opt => ({
      ...opt,
      isDefault: opt.id === optionId,
    }));
    
    await updateList(listName, updatedList);
  }, [settings, updateList, user?.id]);

  // Mettre à jour les options globales
  const updateGlobalSettings = useCallback(async (
    updates: Partial<Pick<InventorySettings, 
      'defaultWarrantyMonths' | 
      'lowStockThreshold' | 
      'requireApprovalForTransfer' | 
      'requireApprovalForCompanyLoan' | 
      'requireApprovalForMission' |
      'notifyOnLowStock' |
      'notifyOnOverdueReturn' |
      'overdueThresholdDays' |
      'referencePrefix' |
      'referenceCounter'
    >>
  ) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      await updateInventorySettings(updates, user.id);
    } catch (err) {
      console.error('Erreur mise à jour paramètres globaux:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  // Helpers pour accéder aux listes actives
  const getActiveCategories = useCallback(() =>
    settings?.categories.filter(c => c.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  const getActiveStatuses = useCallback(() =>
    settings?.equipmentStatuses.filter(s => s.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  const getActiveMovementTypes = useCallback(() =>
    settings?.movementTypes.filter(m => m.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  const getActiveMissionTypes = useCallback(() =>
    settings?.missionTypes.filter(m => m.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  const getActiveConditions = useCallback(() =>
    settings?.conditionStates.filter(c => c.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  const getActiveDocumentTypes = useCallback(() =>
    settings?.documentTypes.filter(d => d.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  // Helper pour trouver l'option par défaut
  const getDefaultOption = useCallback((
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'missionTypes' | 'conditionStates' | 'documentTypes'>
  ) => {
    if (!settings) return null;
    const list = settings[listName];
    return list.find(opt => opt.isDefault && opt.isActive) || list.find(opt => opt.isActive) || null;
  }, [settings]);

  return {
    settings,
    isLoading,
    error,
    isSaving,
    
    // Mutations
    updateList,
    addOption,
    updateOption,
    removeOption,
    restoreOption,
    reorderList,
    setDefaultOption,
    updateGlobalSettings,
    
    // Helpers listes actives
    getActiveCategories,
    getActiveStatuses,
    getActiveMovementTypes,
    getActiveMissionTypes,
    getActiveConditions,
    getActiveDocumentTypes,
    getDefaultOption,
  };
};
