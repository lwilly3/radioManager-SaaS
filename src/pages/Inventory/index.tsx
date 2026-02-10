// Page principale de l'inventaire - Gestion complète des équipements
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  BarChart3, 
  AlertTriangle, 
  Settings, 
  Plus, 
  RefreshCw,
  Loader2,
  Grid,
  List,
  Search,
  Filter,
  X,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit,
  ArrowRightLeft,
  Eye,
  CheckSquare,
  Square,
  Wrench,
  TrendingUp,
  MapPin,
  PieChart,
  Download,
} from 'lucide-react';
import { EquipmentCard } from '../../components/inventory/EquipmentCard';
import { StatusBadge } from '../../components/inventory/StatusBadge';
import { CategoryBadge } from '../../components/inventory/CategoryBadge';
import { LocationBreadcrumb } from '../../components/inventory/LocationBreadcrumb';
import { ConditionIndicator } from '../../components/inventory/ConditionIndicator';
import { useEquipmentList, useInventoryStats, useArchiveEquipment, useDeleteEquipment, useRestoreEquipment, useLocationSelector, useInventorySettings } from '../../hooks/inventory';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import type { Equipment, Site } from '../../types/inventory';

type TabView = 'all' | 'archived' | 'maintenance' | 'lowstock' | 'analytics';

const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { permissions } = useAuthStore();
  const { data: stats, isLoading: isLoadingStats } = useInventoryStats();
  
  const {
    equipments,
    allEquipments,
    isLoading,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    resetFilters,
  } = useEquipmentList();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const archiveMutation = useArchiveEquipment();
  const deleteMutation = useDeleteEquipment();
  const restoreMutation = useRestoreEquipment();
  const { allSites } = useLocationSelector();
  const { getActiveCategories, getActiveStatuses } = useInventorySettings();

  // ── Filtrage par onglet ──
  const displayedEquipments = useMemo(() => {
    switch (activeTab) {
      case 'archived':
        return allEquipments.filter(eq => eq.isArchived);
      case 'maintenance':
        return equipments.filter(eq => 
          eq.statusName?.toLowerCase().includes('maintenance')
        );
      case 'lowstock':
        return equipments.filter(eq => 
          eq.isConsumable && eq.minQuantity && eq.quantity !== undefined && eq.quantity <= eq.minQuantity
        );
      default:
        return equipments;
    }
  }, [activeTab, equipments, allEquipments]);

  // ── Analytics ──
  const analytics = useMemo(() => {
    if (!allEquipments.length) return null;
    
    const active = allEquipments.filter(eq => !eq.isArchived);
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const bySite: Record<string, number> = {};
    const byCondition: Record<string, number> = {};
    let totalValue = 0;
    let withWarranty = 0;
    let warrantyExpired = 0;

    active.forEach(eq => {
      byCategory[eq.categoryName || 'Non catégorisé'] = (byCategory[eq.categoryName || 'Non catégorisé'] || 0) + 1;
      byStatus[eq.statusName || 'Inconnu'] = (byStatus[eq.statusName || 'Inconnu'] || 0) + 1;
      bySite[eq.currentLocation?.siteName || 'Non localisé'] = (bySite[eq.currentLocation?.siteName || 'Non localisé'] || 0) + 1;
      byCondition[eq.conditionName || 'Non évalué'] = (byCondition[eq.conditionName || 'Non évalué'] || 0) + 1;
      
      if (eq.acquisition?.purchasePrice) totalValue += eq.acquisition.purchasePrice;
      if (eq.warranty) {
        withWarranty++;
        if (new Date(eq.warranty.endDate) < new Date()) warrantyExpired++;
      }
    });

    return { byCategory, byStatus, bySite, byCondition, totalValue, withWarranty, warrantyExpired, activeCount: active.length };
  }, [allEquipments]);

  // ── Handlers ──
  const handleEdit = (equipment: Equipment) => navigate(`/inventory/${equipment.id}/edit`);
  const handleView = (equipment: Equipment) => navigate(`/inventory/${equipment.id}`);
  const handleMove = (equipment: Equipment) => navigate(`/inventory/${equipment.id}/move`);

  const handleArchive = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setArchiveReason('');
    setShowArchiveModal(true);
  };

  const handleDelete = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowDeleteModal(true);
  };

  const handleRestore = async (equipment: Equipment) => {
    await restoreMutation.mutateAsync(equipment.id);
  };

  const confirmArchive = async () => {
    if (selectedEquipment && archiveReason) {
      await archiveMutation.mutateAsync({ id: selectedEquipment.id, reason: archiveReason });
      setShowArchiveModal(false);
      setSelectedEquipment(null);
    }
  };

  const confirmDelete = async () => {
    if (selectedEquipment) {
      await deleteMutation.mutateAsync(selectedEquipment.id);
      setShowDeleteModal(false);
      setSelectedEquipment(null);
    }
  };

  // ── Sélection en lot ──
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === displayedEquipments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedEquipments.map(eq => eq.id)));
    }
  };

  const bulkArchive = async () => {
    for (const id of selectedIds) {
      await archiveMutation.mutateAsync({ id, reason: 'Archivage en lot' });
    }
    setSelectedIds(new Set());
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const headers = ['Nom', 'Référence', 'N° Série', 'Catégorie', 'Statut', 'Condition', 'Marque', 'Modèle', 'Site', 'Local', 'Attribué à', 'Date acquisition', 'Prix achat'];
    const rows = displayedEquipments.map(eq => [
      eq.name, eq.reference, eq.serialNumber || '', eq.categoryName || '', eq.statusName || '',
      eq.conditionName || '', eq.brand || '', eq.model || '',
      eq.currentLocation?.siteName || '', eq.currentLocation?.roomName || '',
      eq.currentAssignment?.userName || '', eq.acquisition?.date || '',
      eq.acquisition?.purchasePrice?.toString() || '',
    ]);
    const csvContent = [headers.join(';'), ...rows.map(row => row.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventaire_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ── Analytics bar renderer ──
  const renderAnalyticsBar = (data: Record<string, number>, total: number) => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#22C55E', '#06B6D4', '#EF4444', '#6366F1'];
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    return (
      <div className="space-y-2">
        {entries.map(([name, count], i) => (
          <div key={name} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-32 truncate" title={name}>{name}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.max((count / total) * 100, 2)}%`, backgroundColor: colors[i % colors.length] }} />
            </div>
            <span className="text-sm font-medium w-12 text-right">{count}</span>
            <span className="text-xs text-gray-400 w-10 text-right">{total > 0 ? ((count / total) * 100).toFixed(0) : 0}%</span>
          </div>
        ))}
      </div>
    );
  };

  // ── Tabs ──
  const archivedCount = allEquipments.filter(eq => eq.isArchived).length;
  const maintenanceCount = equipments.filter(eq => eq.statusName?.toLowerCase().includes('maintenance')).length;
  const lowStockCount = equipments.filter(eq => eq.isConsumable && eq.minQuantity && eq.quantity !== undefined && eq.quantity <= eq.minQuantity).length;

  const tabs: { id: TabView; label: string; count?: number; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'Tous', count: equipments.length },
    { id: 'archived', label: 'Archivés', count: archivedCount },
    { id: 'maintenance', label: 'En maintenance', count: maintenanceCount },
    { id: 'lowstock', label: 'Stock bas', count: lowStockCount },
    { id: 'analytics', label: 'Analyse', icon: <PieChart className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-7 w-7 text-blue-600" />
            Inventaire
          </h1>
          <p className="text-gray-500 mt-1">Gestion complète des équipements et du matériel</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          {permissions?.inventory_manage_settings && (
            <button
              onClick={() => navigate('/settings?tab=inventory')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <Settings className="h-4 w-4" />
              Configuration
            </button>
          )}
          {permissions?.inventory_create && (
            <button
              onClick={() => navigate('/inventory/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvel équipement
            </button>
          )}
        </div>
      </div>

      {/* ── Statistiques rapides ── */}
      {!isLoadingStats && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total</span>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">{stats.assigned} attribués</p>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Maintenance</span>
              <Wrench className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stats.inMaintenance}</div>
            <p className="text-xs text-gray-500">En cours</p>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Stock bas</span>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-500">{stats.lowStock}</div>
            <p className="text-xs text-gray-500">À réapprovisionner</p>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Catégories</span>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
            <p className="text-xs text-gray-500">Types d'équipements</p>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Valeur totale</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {analytics ? analytics.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : '—'}
            </div>
            <p className="text-xs text-gray-500">Valeur d'acquisition</p>
          </div>
        </div>
      )}

      {/* ── Onglets ── */}
      <div className="flex gap-1 overflow-x-auto bg-white rounded-lg border p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedIds(new Set()); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Onglet Analytics ── */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg border p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Par catégorie
              </h3>
              {renderAnalyticsBar(analytics.byCategory, analytics.activeCount)}
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-purple-600" />
                Par statut
              </h3>
              {renderAnalyticsBar(analytics.byStatus, analytics.activeCount)}
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Par site
              </h3>
              {renderAnalyticsBar(analytics.bySite, analytics.activeCount)}
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                Par condition
              </h3>
              {renderAnalyticsBar(analytics.byCondition, analytics.activeCount)}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Résumé</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{analytics.activeCount}</div>
                <div className="text-sm text-gray-500">Actifs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-500">{archivedCount}</div>
                <div className="text-sm text-gray-500">Archivés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{analytics.withWarranty}</div>
                <div className="text-sm text-gray-500">Sous garantie</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{analytics.warrantyExpired}</div>
                <div className="text-sm text-gray-500">Garantie expirée</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Contenu principal (hors analytics) ── */}
      {activeTab !== 'analytics' && (
        <>
          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, référence, marque..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${
                    showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                </button>

                <button
                  onClick={() => refetch()}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={filters.statusIds?.[0] || ''}
                    onChange={(e) => updateFilters({ statusIds: e.target.value ? [e.target.value] : undefined })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous</option>
                    {getActiveStatuses().map((status) => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={filters.categoryIds?.[0] || ''}
                    onChange={(e) => updateFilters({ categoryIds: e.target.value ? [e.target.value] : undefined })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes</option>
                    {getActiveCategories().map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
                  <select
                    value={filters.siteIds?.[0] || ''}
                    onChange={(e) => updateFilters({ siteIds: e.target.value ? [e.target.value] : undefined })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous</option>
                    {allSites.map((site: Site) => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Barre d'actions en lot */}
          {selectedIds.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                {selectedIds.size} élément{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={bulkArchive}
                  className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archiver
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Désélectionner
                </button>
              </div>
            </div>
          )}

          {/* Liste des équipements */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Erreur lors du chargement des équipements</p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </div>
            ) : displayedEquipments.length === 0 ? (
              <div className="bg-white rounded-lg border">
                <div className="text-center py-10">
                  <Package className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {activeTab === 'archived' ? 'Aucun équipement archivé' :
                     activeTab === 'maintenance' ? 'Aucun équipement en maintenance' :
                     activeTab === 'lowstock' ? 'Tous les stocks sont suffisants' :
                     'Votre inventaire est vide'}
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    {activeTab === 'all' ? 'Commencez par ajouter votre premier équipement pour gérer votre parc matériel.' : ''}
                  </p>
                </div>

                {activeTab === 'all' && (
                  <div className="border-t px-6 py-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Actions rapides</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {permissions?.inventory_create && (
                        <button
                          onClick={() => navigate('/inventory/create')}
                          className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                        >
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <Plus className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-700">Créer un équipement</p>
                            <p className="text-xs text-blue-600">Ajouter du matériel à l'inventaire</p>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={exportCSV}
                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Download className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Exporter CSV</p>
                          <p className="text-xs text-gray-500">Télécharger la liste complète</p>
                        </div>
                      </button>

                      {permissions?.inventory_manage_settings && (
                        <button
                          onClick={() => navigate('/settings?tab=inventory')}
                          className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Settings className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Configuration</p>
                            <p className="text-xs text-gray-500">Catégories, statuts, conditions</p>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <PieChart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Analyse</p>
                          <p className="text-xs text-gray-500">Statistiques et graphiques</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'all' && (
                  <div className="border-t px-6 py-5 bg-gray-50 rounded-b-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Comment utiliser l'inventaire</h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0 mt-0.5">1</span>
                        <p><strong>Créez</strong> vos équipements avec le bouton « Nouvel équipement »</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0 mt-0.5">2</span>
                        <p><strong>Attribuez</strong> du matériel via le bouton « Mouvement » sur chaque fiche</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0 mt-0.5">3</span>
                        <p><strong>Suivez</strong> les maintenances, documents et historique dans les détails</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedEquipments.map((equipment: Equipment) => (
                  <div key={equipment.id} className="relative group">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(equipment.id); }}
                      className={`absolute top-2 left-2 z-10 transition-opacity ${
                        selectedIds.has(equipment.id) ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'
                      }`}
                    >
                      {selectedIds.has(equipment.id) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600 drop-shadow-sm" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-500 bg-white/70 rounded" />
                      )}
                    </button>

                    {equipment.isArchived && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRestore(equipment); }}
                        className="absolute top-2 right-10 z-10 bg-white/90 p-1.5 rounded-lg shadow-sm hover:bg-white opacity-50 group-hover:opacity-100 transition-opacity"
                        title="Restaurer"
                      >
                        <ArchiveRestore className="h-4 w-4 text-green-600" />
                      </button>
                    )}

                    <EquipmentCard
                      equipment={equipment}
                      onEdit={handleEdit}
                      onMove={handleMove}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 w-10">
                        <button onClick={toggleSelectAll}>
                          {selectedIds.size === displayedEquipments.length && displayedEquipments.length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Équipement</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Catégorie</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Condition</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Localisation</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {displayedEquipments.map((equipment: Equipment) => (
                      <tr
                        key={equipment.id}
                        className={`hover:bg-gray-50 cursor-pointer ${equipment.isArchived ? 'opacity-60' : ''} ${selectedIds.has(equipment.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => handleView(equipment)}
                      >
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => toggleSelect(equipment.id)}>
                            {selectedIds.has(equipment.id) ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{equipment.name}</p>
                            <p className="text-xs text-gray-500">{equipment.reference} {equipment.serialNumber ? `· S/N: ${equipment.serialNumber}` : ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <CategoryBadge name={equipment.categoryName} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge name={equipment.statusName} />
                        </td>
                        <td className="px-4 py-3">
                          <ConditionIndicator name={equipment.conditionName} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <LocationBreadcrumb
                            companyName={equipment.currentLocation?.companyName || ''}
                            siteName={equipment.currentLocation?.siteName}
                            roomName={equipment.currentLocation?.roomName}
                          />
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => handleView(equipment)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100" title="Voir">
                              <Eye className="h-4 w-4" />
                            </button>
                            {!equipment.isArchived && (
                              <>
                                <button onClick={() => handleEdit(equipment)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100" title="Modifier">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleMove(equipment)} className="p-1.5 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-gray-100" title="Déplacer">
                                  <ArrowRightLeft className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleArchive(equipment)} className="p-1.5 text-gray-500 hover:text-orange-600 rounded-lg hover:bg-gray-100" title="Archiver">
                                  <Archive className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {equipment.isArchived && (
                              <button onClick={() => handleRestore(equipment)} className="p-1.5 text-gray-500 hover:text-green-600 rounded-lg hover:bg-gray-100" title="Restaurer">
                                <ArchiveRestore className="h-4 w-4" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(equipment)} className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100" title="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500 text-center">
              {displayedEquipments.length} équipement{displayedEquipments.length > 1 ? 's' : ''}
              {activeTab === 'all' && allEquipments.length !== equipments.length && ` sur ${allEquipments.length} au total`}
            </div>
          </div>
        </>
      )}

      {/* ── Modal d'archivage ── */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Archiver l'équipement</h3>
            <p className="text-gray-600 mb-4">
              L'équipement « {selectedEquipment?.name} » sera archivé et n'apparaîtra plus dans la liste principale.
            </p>
            <label className="block text-sm font-medium mb-1">Raison de l'archivage</label>
            <input
              type="text"
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              placeholder="Ex: Équipement obsolète..."
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowArchiveModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={confirmArchive}
                disabled={!archiveReason || archiveMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {archiveMutation.isPending ? 'Archivage...' : 'Archiver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de suppression ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Supprimer définitivement</h3>
            <p className="text-gray-600 mb-4">
              Cette action est irréversible. L'équipement « {selectedEquipment?.name} » et tout son historique seront supprimés définitivement.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
