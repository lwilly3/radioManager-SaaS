// Onglet de paramètres Inventaire
import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Save,
  Loader2,
  GripVertical,
  Star,
  ChevronDown,
  ChevronUp,
  Settings,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Building2,
  DoorOpen,
  Hash,
} from 'lucide-react';
import { useInventorySettings, useLocationSelector, useCreateCompany, useCreateSite, useCreateRoom, useUpdateCompany, useUpdateSite, useUpdateRoom, useDeleteCompany, useDeleteSite, useDeleteRoom } from '../../hooks/inventory';
import type { ConfigurableOption, InventorySettings } from '../../types/inventory';

// ════════════════════════════════════════════════════════════════
// TYPES LOCAUX
// ════════════════════════════════════════════════════════════════

type ListName = keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'missionTypes' | 'conditionStates' | 'documentTypes'>;

interface ListConfig {
  key: ListName;
  title: string;
  description: string;
  showColor: boolean;
  showIcon: boolean;
}

const LISTS: ListConfig[] = [
  { key: 'categories', title: 'Catégories', description: 'Types d\'équipement (micro, caméra, console...)', showColor: true, showIcon: true },
  { key: 'equipmentStatuses', title: 'Statuts', description: 'États possibles d\'un équipement', showColor: true, showIcon: false },
  { key: 'movementTypes', title: 'Types de mouvement', description: 'Types de déplacement ou d\'attribution', showColor: false, showIcon: false },
  { key: 'conditionStates', title: 'États de condition', description: 'État physique de l\'équipement', showColor: true, showIcon: false },
  { key: 'missionTypes', title: 'Types de mission', description: 'Types de mission terrain', showColor: false, showIcon: false },
  { key: 'documentTypes', title: 'Types de document', description: 'Types de fichiers attachés', showColor: false, showIcon: false },
];

// ════════════════════════════════════════════════════════════════
// COMPOSANT OPTION ITEM
// ════════════════════════════════════════════════════════════════

interface OptionItemProps {
  option: ConfigurableOption;
  showColor: boolean;
  showIcon: boolean;
  onEdit: (option: ConfigurableOption) => void;
  onRemove: (id: string) => void;
  onRestore: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const OptionItem: React.FC<OptionItemProps> = ({
  option,
  showColor,
  onEdit,
  onRemove,
  onRestore,
  onSetDefault,
}) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-lg border ${
      option.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
    }`}
  >
    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab flex-shrink-0" />

    {showColor && option.color && (
      <span
        className="h-4 w-4 rounded-full flex-shrink-0 border border-gray-200"
        style={{ backgroundColor: option.color }}
      />
    )}

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={`font-medium text-sm ${!option.isActive ? 'line-through text-gray-400' : ''}`}>
          {option.name}
        </span>
        {option.isDefault && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
            <Star className="h-3 w-3" />
            Par défaut
          </span>
        )}
        {!option.isActive && (
          <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs">Désactivé</span>
        )}
      </div>
      {option.description && (
        <p className="text-xs text-gray-500 truncate">{option.description}</p>
      )}
    </div>

    <div className="flex items-center gap-1 flex-shrink-0">
      {option.isActive && !option.isDefault && (
        <button
          onClick={(e) => { e.stopPropagation(); onSetDefault(option.id); }}
          title="Définir par défaut"
          className="p-1.5 hover:bg-amber-50 rounded text-gray-400 hover:text-amber-600"
        >
          <Star className="h-3.5 w-3.5" />
        </button>
      )}
      {option.isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(option); }}
          title="Modifier"
          className="p-1.5 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      )}
      {option.isActive ? (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(option.id); }}
          title="Désactiver"
          className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); onRestore(option.id); }}
          title="Réactiver"
          className="p-1.5 hover:bg-green-50 rounded text-gray-400 hover:text-green-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// COMPOSANT FORMULAIRE OPTION
// ════════════════════════════════════════════════════════════════

interface OptionFormProps {
  option?: ConfigurableOption | null;
  showColor: boolean;
  showIcon: boolean;
  onSave: (data: Omit<ConfigurableOption, 'id' | 'order'>) => void;
  onCancel: () => void;
}

const OptionForm: React.FC<OptionFormProps> = ({ option, showColor, showIcon, onSave, onCancel }) => {
  const [name, setName] = useState(option?.name || '');
  const [description, setDescription] = useState(option?.description || '');
  const [color, setColor] = useState(option?.color || '#6B7280');
  const [icon, setIcon] = useState(option?.icon || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      color: showColor ? color : null,
      icon: showIcon ? icon || null : null,
      isActive: option?.isActive ?? true,
      isDefault: option?.isDefault ?? false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nom de l'option"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Description optionnelle"
          />
        </div>
      </div>

      <div className="flex gap-3">
        {showColor && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Couleur</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-8 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-24 px-2 py-1 border rounded text-sm font-mono"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
        )}
        {showIcon && (
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Icône (Lucide)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ex: Mic, Monitor, Camera"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
        >
          <Save className="h-3.5 w-3.5" />
          {option ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPOSANT SECTION LISTE
// ════════════════════════════════════════════════════════════════

interface ListSectionProps {
  config: ListConfig;
  items: ConfigurableOption[];
  onAdd: (listName: ListName, data: Omit<ConfigurableOption, 'id' | 'order'>) => Promise<void>;
  onUpdate: (listName: ListName, id: string, data: Partial<ConfigurableOption>) => Promise<void>;
  onRemove: (listName: ListName, id: string) => Promise<void>;
  onRestore: (listName: ListName, id: string) => Promise<void>;
  onSetDefault: (listName: ListName, id: string) => Promise<void>;
}

const ListSection: React.FC<ListSectionProps> = ({
  config,
  items,
  onAdd,
  onUpdate,
  onRemove,
  onRestore,
  onSetDefault,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState<ConfigurableOption | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const activeItems = items.filter(i => i.isActive).sort((a, b) => a.order - b.order);
  const inactiveItems = items.filter(i => !i.isActive);

  const handleSaveNew = async (data: Omit<ConfigurableOption, 'id' | 'order'>) => {
    await onAdd(config.key, data);
    setShowForm(false);
  };

  const handleSaveEdit = async (data: Omit<ConfigurableOption, 'id' | 'order'>) => {
    if (!editingOption) return;
    await onUpdate(config.key, editingOption.id, data);
    setEditingOption(null);
  };

  return (
    <div className="border rounded-lg bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{config.title}</h3>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              {activeItems.length} actif{activeItems.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-gray-500">{config.description}</p>

          {/* Bouton ajouter */}
          {!showForm && !editingOption && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowForm(true); }}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" />
              Ajouter une option
            </button>
          )}

          {/* Formulaire ajout */}
          {showForm && (
            <OptionForm
              showColor={config.showColor}
              showIcon={config.showIcon}
              onSave={handleSaveNew}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Liste des options actives */}
          <div className="space-y-1.5">
            {activeItems.map(option => (
              editingOption?.id === option.id ? (
                <OptionForm
                  key={option.id}
                  option={editingOption}
                  showColor={config.showColor}
                  showIcon={config.showIcon}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingOption(null)}
                />
              ) : (
                <OptionItem
                  key={option.id}
                  option={option}
                  showColor={config.showColor}
                  showIcon={config.showIcon}
                  onEdit={setEditingOption}
                  onRemove={(id) => onRemove(config.key, id)}
                  onRestore={(id) => onRestore(config.key, id)}
                  onSetDefault={(id) => onSetDefault(config.key, id)}
                />
              )
            ))}
          </div>

          {/* Options inactives */}
          {inactiveItems.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setShowInactive(!showInactive)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                {showInactive ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {inactiveItems.length} option{inactiveItems.length > 1 ? 's' : ''} désactivée{inactiveItems.length > 1 ? 's' : ''}
              </button>
              {showInactive && (
                <div className="mt-2 space-y-1.5">
                  {inactiveItems.map(option => (
                    <OptionItem
                      key={option.id}
                      option={option}
                      showColor={config.showColor}
                      showIcon={config.showIcon}
                      onEdit={setEditingOption}
                      onRemove={(id) => onRemove(config.key, id)}
                      onRestore={(id) => onRestore(config.key, id)}
                      onSetDefault={(id) => onSetDefault(config.key, id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════

const InventorySettingsTab: React.FC = () => {
  const {
    settings,
    isLoading,
    error,
    isSaving,
    addOption,
    updateOption,
    removeOption,
    restoreOption,
    setDefaultOption,
    updateGlobalSettings,
  } = useInventorySettings();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [localPrefix, setLocalPrefix] = useState(settings?.referencePrefix || 'INV');
  const [localCounter, setLocalCounter] = useState(settings?.referenceCounter ?? 0);
  const [prefixDirty, setPrefixDirty] = useState(false);
  const [counterDirty, setCounterDirty] = useState(false);

  // Sync local state when settings load/change
  React.useEffect(() => {
    if (settings) {
      setLocalPrefix(settings.referencePrefix || 'INV');
      setLocalCounter(settings.referenceCounter ?? 0);
      setPrefixDirty(false);
      setCounterDirty(false);
    }
  }, [settings?.referencePrefix, settings?.referenceCounter]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdd = async (listName: ListName, data: Omit<ConfigurableOption, 'id' | 'order'>) => {
    try {
      await addOption(listName, data);
      showNotification('success', 'Option ajoutée avec succès');
    } catch {
      showNotification('error', 'Erreur lors de l\'ajout');
    }
  };

  const handleUpdate = async (listName: ListName, id: string, data: Partial<ConfigurableOption>) => {
    try {
      await updateOption(listName, id, data);
      showNotification('success', 'Option modifiée');
    } catch {
      showNotification('error', 'Erreur lors de la modification');
    }
  };

  const handleRemove = async (listName: ListName, id: string) => {
    try {
      await removeOption(listName, id);
      showNotification('success', 'Option désactivée');
    } catch {
      showNotification('error', 'Erreur lors de la désactivation');
    }
  };

  const handleRestore = async (listName: ListName, id: string) => {
    try {
      await restoreOption(listName, id);
      showNotification('success', 'Option réactivée');
    } catch {
      showNotification('error', 'Erreur lors de la réactivation');
    }
  };

  const handleSetDefault = async (listName: ListName, id: string) => {
    try {
      await setDefaultOption(listName, id);
      showNotification('success', 'Option définie par défaut');
    } catch {
      showNotification('error', 'Erreur lors de la modification');
    }
  };

  const handleToggleGlobalSetting = async (key: string, value: boolean) => {
    try {
      await updateGlobalSettings({ [key]: value } as any);
      showNotification('success', 'Paramètre mis à jour');
    } catch {
      showNotification('error', 'Erreur lors de la mise à jour');
    }
  };

  const handleUpdateNumber = async (key: string, value: number) => {
    try {
      await updateGlobalSettings({ [key]: value } as any);
      showNotification('success', 'Paramètre mis à jour');
    } catch {
      showNotification('error', 'Erreur lors de la mise à jour');
    }
  };

  const handleUpdateString = async (key: string, value: string) => {
    try {
      await updateGlobalSettings({ [key]: value } as any);
      showNotification('success', 'Paramètre mis à jour');
    } catch {
      showNotification('error', 'Erreur lors de la mise à jour');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-500">Chargement des paramètres...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {notification.message}
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin ml-auto" />}
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-lg font-semibold">Paramètres Inventaire</h2>
          <p className="text-sm text-gray-500">Gérez les catégories, statuts et types de mouvement</p>
        </div>
      </div>

      {/* Options globales */}
      <div className="bg-white border rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-4 w-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Options générales</h3>
        </div>

        {/* Référencement automatique */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-blue-900 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Référencement automatique
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Préfixe des références
              </label>
              <input
                type="text"
                maxLength={10}
                value={localPrefix}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                  setLocalPrefix(val);
                  setPrefixDirty(val !== (settings.referencePrefix || 'INV'));
                }}
                placeholder="INV"
                className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prochain numéro
              </label>
              <input
                type="number"
                min={0}
                value={localCounter}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setLocalCounter(val);
                  setCounterDirty(val !== (settings.referenceCounter ?? 0));
                }}
                className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Aperçu + bouton sauvegarder */}
          <div className="flex items-center justify-between pt-2 border-t border-blue-200">
            <p className="text-sm text-blue-800">
              Aperçu : <span className="font-mono font-semibold">{localPrefix || 'INV'}-{String((localCounter || 0) + 1).padStart(4, '0')}</span>
            </p>
            <button
              type="button"
              disabled={(!prefixDirty && !counterDirty) || isSaving}
              onClick={async () => {
                try {
                  const updates: Record<string, any> = {};
                  if (prefixDirty) updates.referencePrefix = localPrefix || 'INV';
                  if (counterDirty) updates.referenceCounter = localCounter;
                  await updateGlobalSettings(updates as any);
                  setPrefixDirty(false);
                  setCounterDirty(false);
                  showNotification('success', 'Référencement mis à jour');
                } catch {
                  showNotification('error', 'Erreur lors de la mise à jour');
                }
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                (prefixDirty || counterDirty)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Enregistrer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durée de garantie par défaut (mois)
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={settings.defaultWarrantyMonths}
              onChange={(e) => handleUpdateNumber('defaultWarrantyMonths', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seuil de stock bas
            </label>
            <input
              type="number"
              min={0}
              value={settings.lowStockThreshold}
              onChange={(e) => handleUpdateNumber('lowStockThreshold', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seuil de retard (jours)
            </label>
            <input
              type="number"
              min={1}
              value={settings.overdueThresholdDays}
              onChange={(e) => handleUpdateNumber('overdueThresholdDays', parseInt(e.target.value) || 7)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Approbations & Notifications</h4>
          {[
            { key: 'requireApprovalForTransfer', label: 'Approbation requise pour les transferts inter-sites' },
            { key: 'requireApprovalForCompanyLoan', label: 'Approbation requise pour les prêts inter-entreprises' },
            { key: 'requireApprovalForMission', label: 'Approbation requise pour les sorties en mission' },
            { key: 'notifyOnLowStock', label: 'Notifier quand un consommable est en stock bas' },
            { key: 'notifyOnOverdueReturn', label: 'Notifier quand un retour est en retard' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean((settings as any)[key])}
                onChange={(e) => handleToggleGlobalSetting(key, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Listes configurables */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Listes configurables</h3>
        {LISTS.map(config => (
          <ListSection
            key={config.key}
            config={config}
            items={settings[config.key] || []}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            onRestore={handleRestore}
            onSetDefault={handleSetDefault}
          />
        ))}
      </div>

      {/* Gestion des localisations */}
      <LocationManagement />
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPOSANT GESTION DES LOCALISATIONS
// ════════════════════════════════════════════════════════════════

const LocationManagement: React.FC = () => {
  const { companies, allSites, allRooms, getSitesByCompany, getRoomsBySite } = useLocationSelector();
  const createCompanyMutation = useCreateCompany();
  const createSiteMutation = useCreateSite();
  const createRoomMutation = useCreateRoom();
  const updateCompanyMutation = useUpdateCompany();
  const updateSiteMutation = useUpdateSite();
  const updateRoomMutation = useUpdateRoom();
  const deleteCompanyMutation = useDeleteCompany();
  const deleteSiteMutation = useDeleteSite();
  const deleteRoomMutation = useDeleteRoom();
  
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [expandedSite, setExpandedSite] = useState<string | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddSite, setShowAddSite] = useState<string | null>(null);
  const [showAddRoom, setShowAddRoom] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // État pour l'édition
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editingSite, setEditingSite] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  
  // État pour confirmation de suppression
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'company' | 'site' | 'room'; id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleAddCompany = async () => {
    if (!newName.trim()) return;
    await createCompanyMutation.mutateAsync({
      name: newName.trim(),
      type: 'media',
      isActive: true,
    } as any);
    setNewName('');
    setShowAddCompany(false);
  };

  const handleAddSite = async (companyId: string) => {
    if (!newName.trim()) return;
    await createSiteMutation.mutateAsync({
      companyId,
      name: newName.trim(),
      address: newAddress.trim() || null,
      isActive: true,
    } as any);
    setNewName('');
    setNewAddress('');
    setShowAddSite(null);
  };

  const handleAddRoom = async (siteId: string) => {
    if (!newName.trim()) return;
    await createRoomMutation.mutateAsync({
      siteId,
      name: newName.trim(),
      isActive: true,
    } as any);
    setNewName('');
    setShowAddRoom(null);
  };

  const startEditCompany = (company: { id: string; name: string }) => {
    setEditingCompany(company.id);
    setEditName(company.name);
    setEditingSite(null);
    setEditingRoom(null);
  };

  const startEditSite = (site: { id: string; name: string; address?: any }) => {
    setEditingSite(site.id);
    setEditName(site.name);
    setEditAddress(typeof site.address === 'string' ? site.address : site.address?.street || '');
    setEditingCompany(null);
    setEditingRoom(null);
  };

  const startEditRoom = (room: { id: string; name: string }) => {
    setEditingRoom(room.id);
    setEditName(room.name);
    setEditingCompany(null);
    setEditingSite(null);
  };

  const handleUpdateCompany = async (id: string) => {
    if (!editName.trim()) return;
    await updateCompanyMutation.mutateAsync({ id, data: { name: editName.trim() } });
    setEditingCompany(null);
  };

  const handleUpdateSite = async (id: string) => {
    if (!editName.trim()) return;
    await updateSiteMutation.mutateAsync({
      id,
      data: { name: editName.trim(), address: editAddress.trim() || null },
    } as any);
    setEditingSite(null);
  };

  const handleUpdateRoom = async (id: string) => {
    if (!editName.trim()) return;
    await updateRoomMutation.mutateAsync({ id, data: { name: editName.trim() } });
    setEditingRoom(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteError(null);
    try {
      if (confirmDelete.type === 'company') {
        await deleteCompanyMutation.mutateAsync(confirmDelete.id);
      } else if (confirmDelete.type === 'site') {
        await deleteSiteMutation.mutateAsync(confirmDelete.id);
      } else {
        await deleteRoomMutation.mutateAsync(confirmDelete.id);
      }
      setConfirmDelete(null);
    } catch (err: any) {
      // Afficher l'erreur de dépendance au lieu de fermer
      setDeleteError(err?.message || 'Erreur lors de la suppression');
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
    setDeleteError(null);
  };

  const cancelEdit = () => {
    setEditingCompany(null);
    setEditingSite(null);
    setEditingRoom(null);
    setEditName('');
    setEditAddress('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Localisations
        </h3>
        <button
          onClick={() => { setShowAddCompany(true); setNewName(''); }}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Entreprise
        </button>
      </div>

      {/* Modal de confirmation de suppression */}
      {confirmDelete && (
        <div className={`border rounded-lg p-4 space-y-3 ${deleteError ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-200'}`}>
          {deleteError ? (
            <>
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-medium">Suppression impossible</p>
              </div>
              <p className="text-sm text-amber-800">{deleteError}</p>
              <p className="text-xs text-amber-600">
                Déplacez ou supprimez d'abord les éléments liés avant de pouvoir supprimer {confirmDelete.type === 'company' ? 'cette entreprise' : confirmDelete.type === 'site' ? 'ce site' : 'ce local'}.
              </p>
              <button
                onClick={handleCancelDelete}
                className="px-3 py-1.5 text-sm border border-amber-300 rounded hover:bg-amber-100 text-amber-800"
              >
                Compris
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Supprimer {confirmDelete.type === 'company' ? 'l\'entreprise' : confirmDelete.type === 'site' ? 'le site' : 'le local'} « {confirmDelete.name} » ?
                </p>
              </div>
              <p className="text-xs text-red-600">
                La suppression sera vérifiée : elle ne sera autorisée que s'il n'y a aucun équipement{confirmDelete.type === 'company' ? ' ni site' : confirmDelete.type === 'site' ? ' ni local' : ''} rattaché.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleteCompanyMutation.isPending || deleteSiteMutation.isPending || deleteRoomMutation.isPending}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  {(deleteCompanyMutation.isPending || deleteSiteMutation.isPending || deleteRoomMutation.isPending) ? 'Vérification...' : 'Confirmer'}
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showAddCompany && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Radio Audace"
              className="w-full px-3 py-1.5 border rounded text-sm"
              autoFocus
            />
          </div>
          <button onClick={handleAddCompany} disabled={!newName.trim() || createCompanyMutation.isPending}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {createCompanyMutation.isPending ? '...' : 'Ajouter'}
          </button>
          <button onClick={() => setShowAddCompany(false)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">Annuler</button>
        </div>
      )}

      {companies.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Aucune entreprise configurée</p>
      ) : (
        <div className="space-y-2">
          {companies.map(company => {
            const sites = getSitesByCompany(company.id);
            const isExpanded = expandedCompany === company.id;
            const isEditing = editingCompany === company.id;
            return (
              <div key={company.id} className="border rounded-lg">
                {isEditing ? (
                  <div className="px-4 py-3 flex gap-2 items-center bg-blue-50">
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateCompany(company.id)}
                      disabled={!editName.trim() || updateCompanyMutation.isPending}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateCompanyMutation.isPending ? '...' : 'OK'}
                    </button>
                    <button onClick={cancelEdit} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
                      className="flex-1 px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{company.name}</span>
                        <span className="text-xs text-gray-500">{sites.length} site{sites.length !== 1 ? 's' : ''}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <div className="flex items-center gap-0.5 pr-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditCompany(company); }}
                        title="Modifier"
                        className="p-1.5 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'company', id: company.id, name: company.name }); }}
                        title="Supprimer"
                        className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div className="px-4 pb-3 border-t">
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => { setShowAddSite(company.id); setNewName(''); setNewAddress(''); }}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Ajouter un site
                      </button>
                    </div>

                    {showAddSite === company.id && (
                      <div className="bg-gray-50 rounded p-3 mt-2 space-y-2">
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom du site" className="w-full px-3 py-1.5 border rounded text-sm" autoFocus />
                        <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Adresse (optionnel)" className="w-full px-3 py-1.5 border rounded text-sm" />
                        <div className="flex gap-2">
                          <button onClick={() => handleAddSite(company.id)} disabled={!newName.trim() || createSiteMutation.isPending}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                            {createSiteMutation.isPending ? '...' : 'Ajouter'}
                          </button>
                          <button onClick={() => setShowAddSite(null)} className="px-3 py-1 text-xs border rounded hover:bg-gray-50">Annuler</button>
                        </div>
                      </div>
                    )}

                    {sites.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2 ml-6">Aucun site</p>
                    ) : (
                      <div className="mt-2 ml-4 space-y-1">
                        {sites.map(site => {
                          const rooms = getRoomsBySite(site.id);
                          const isSiteExpanded = expandedSite === site.id;
                          const isSiteEditing = editingSite === site.id;
                          return (
                            <div key={site.id} className="border-l-2 border-gray-200 pl-3">
                              {isSiteEditing ? (
                                <div className="py-2 space-y-2 bg-blue-50 rounded px-2">
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Nom du site"
                                    className="w-full px-2 py-1 border rounded text-sm"
                                    autoFocus
                                  />
                                  <input
                                    type="text"
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    placeholder="Adresse (optionnel)"
                                    className="w-full px-2 py-1 border rounded text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateSite(site.id)}
                                      disabled={!editName.trim() || updateSiteMutation.isPending}
                                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      {updateSiteMutation.isPending ? '...' : 'OK'}
                                    </button>
                                    <button onClick={cancelEdit} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">✕</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <button
                                    onClick={() => setExpandedSite(isSiteExpanded ? null : site.id)}
                                    className="flex-1 py-2 flex items-center justify-between hover:text-blue-600 text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-3 w-3 text-gray-400" />
                                      <span className="font-medium">{site.name}</span>
                                      <span className="text-xs text-gray-400">{rooms.length} local{rooms.length !== 1 ? 'ux' : ''}</span>
                                    </div>
                                    {isSiteExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </button>
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); startEditSite(site); }}
                                      title="Modifier"
                                      className="p-1 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'site', id: site.id, name: site.name }); }}
                                      title="Supprimer"
                                      className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {isSiteExpanded && (
                                <div className="ml-5 pb-2">
                                  <div className="flex justify-end mb-1">
                                    <button
                                      onClick={() => { setShowAddRoom(site.id); setNewName(''); }}
                                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                      <Plus className="h-3 w-3" /> Ajouter un local
                                    </button>
                                  </div>

                                  {showAddRoom === site.id && (
                                    <div className="bg-gray-50 rounded p-2 mb-2 flex gap-2 items-center">
                                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom du local" className="flex-1 px-2 py-1 border rounded text-sm" autoFocus />
                                      <button onClick={() => handleAddRoom(site.id)} disabled={!newName.trim() || createRoomMutation.isPending}
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                                        {createRoomMutation.isPending ? '...' : 'OK'}
                                      </button>
                                      <button onClick={() => setShowAddRoom(null)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">✕</button>
                                    </div>
                                  )}

                                  {rooms.length === 0 ? (
                                    <p className="text-xs text-gray-400 py-1">Aucun local</p>
                                  ) : (
                                    <div className="space-y-1">
                                      {rooms.map(room => {
                                        const isRoomEditing = editingRoom === room.id;
                                        return isRoomEditing ? (
                                          <div key={room.id} className="flex gap-2 items-center bg-blue-50 rounded px-2 py-1">
                                            <input
                                              type="text"
                                              value={editName}
                                              onChange={(e) => setEditName(e.target.value)}
                                              className="flex-1 px-2 py-1 border rounded text-sm"
                                              autoFocus
                                            />
                                            <button
                                              onClick={() => handleUpdateRoom(room.id)}
                                              disabled={!editName.trim() || updateRoomMutation.isPending}
                                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                            >
                                              {updateRoomMutation.isPending ? '...' : 'OK'}
                                            </button>
                                            <button onClick={cancelEdit} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">✕</button>
                                          </div>
                                        ) : (
                                          <div key={room.id} className="flex items-center justify-between text-sm text-gray-600 py-0.5 group">
                                            <div className="flex items-center gap-2">
                                              <DoorOpen className="h-3 w-3 text-gray-300" />
                                              {room.name}
                                            </div>
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button
                                                onClick={() => startEditRoom(room)}
                                                title="Modifier"
                                                className="p-1 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"
                                              >
                                                <Edit2 className="h-3 w-3" />
                                              </button>
                                              <button
                                                onClick={() => setConfirmDelete({ type: 'room', id: room.id, name: room.name })}
                                                title="Supprimer"
                                                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventorySettingsTab;
