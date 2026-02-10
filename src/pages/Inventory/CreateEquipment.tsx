// Page de création / édition d'un équipement — Version simplifiée
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, ChevronDown, ChevronUp, Lock, MapPin } from 'lucide-react';
import { useCreateEquipment, useUpdateEquipment, useEquipment, useNextReference } from '../../hooks/inventory/useEquipment';
import { useInventorySettings, useLocationSelector } from '../../hooks/inventory';
import { usePresenters } from '../../hooks/presenters/usePresenters';
import type { ConfigurableOption, Company, Site, Room } from '../../types/inventory';

const CreateEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const { data: existingEquipment, isLoading: isLoadingEquipment } = useEquipment(id);

  const { getActiveCategories, getActiveStatuses, getActiveConditions, getDefaultOption } = useInventorySettings();
  const { companies, getSitesByCompany, getRoomsBySite, getCompanyById, getSiteById, getRoomById, isLoading: isLoadingLocations } = useLocationSelector();
  const { data: presenters = [] } = usePresenters();
  const nextReferenceMutation = useNextReference();

  const categories = getActiveCategories();
  const statuses = getActiveStatuses();
  const conditions = getActiveConditions();
  const defaultStatus = getDefaultOption('equipmentStatuses');
  const defaultCondition = getDefaultOption('conditionStates');

  // ── État du formulaire ──
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [statusId, setStatusId] = useState(defaultStatus?.id || '');
  const [conditionId, setConditionId] = useState(defaultCondition?.id || '');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [description, setDescription] = useState('');

  // Optionnels (volet dépliable)
  const [purchasePrice, setPurchasePrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);
  const [acquisitionType, setAcquisitionType] = useState<'purchase' | 'donation' | 'lease' | 'transfer' | 'other'>('purchase');
  const [warrantyEnd, setWarrantyEnd] = useState('');
  const [assignToUserId, setAssignToUserId] = useState('');
  const [isConsumable, setIsConsumable] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');

  const [showMore, setShowMore] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Localisation en cascade ──
  const sites = companyId ? getSitesByCompany(companyId) : [];
  const rooms = siteId ? getRoomsBySite(siteId) : [];

  // ── Auto-sélection si une seule entreprise ──
  useEffect(() => {
    if (!isEditMode && !companyId && companies.length === 1) {
      setCompanyId(companies[0].id);
    }
  }, [companies, isEditMode, companyId]);

  // ── Auto-sélection si un seul site ──
  useEffect(() => {
    if (!isEditMode && companyId && !siteId && sites.length === 1) {
      setSiteId(sites[0].id);
    }
  }, [sites, isEditMode, companyId, siteId]);

  // ── Auto-génération de la référence en mode création ──
  useEffect(() => {
    if (!isEditMode && !reference) {
      nextReferenceMutation.mutateAsync().then((ref) => {
        setReference(ref);
      }).catch((err) => {
        console.error('Erreur génération référence:', err);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pré-remplissage en mode édition ──
  useEffect(() => {
    if (isEditMode && existingEquipment) {
      setName(existingEquipment.name);
      setReference(existingEquipment.reference);
      setCategoryId(existingEquipment.categoryId);
      setStatusId(existingEquipment.statusId);
      setConditionId(existingEquipment.conditionId);
      setBrand(existingEquipment.brand);
      setModel(existingEquipment.model);
      setSerialNumber(existingEquipment.serialNumber || '');
      setCompanyId(existingEquipment.currentLocation.companyId);
      setSiteId(existingEquipment.currentLocation.siteId);
      setRoomId(existingEquipment.currentLocation.roomId || '');
      setDescription(existingEquipment.documentation?.description || '');
      setPurchasePrice(existingEquipment.acquisition?.purchasePrice?.toString() || '');
      setSupplier(existingEquipment.acquisition?.supplier || '');
      setAcquisitionDate(existingEquipment.acquisition?.date?.split('T')[0] || '');
      setAcquisitionType(existingEquipment.acquisition?.type || 'purchase');
      setWarrantyEnd(existingEquipment.warranty?.endDate?.split('T')[0] || '');
      setAssignToUserId(existingEquipment.currentAssignment?.userId || '');
      setIsConsumable(existingEquipment.isConsumable || false);
      setQuantity(existingEquipment.quantity?.toString() || '');
      setMinQuantity(existingEquipment.minQuantity?.toString() || '');

      // Ouvrir le volet si des champs optionnels sont remplis
      if (
        existingEquipment.acquisition?.purchasePrice ||
        existingEquipment.acquisition?.supplier ||
        existingEquipment.warranty?.endDate ||
        existingEquipment.currentAssignment?.userId ||
        existingEquipment.isConsumable
      ) {
        setShowMore(true);
      }
    }
  }, [isEditMode, existingEquipment]);

  // ── Validation ──
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Requis';
    if (!reference.trim()) e.reference = 'Référence non générée';
    if (!categoryId) e.categoryId = 'Requis';
    if (!companyId) e.companyId = 'Requis';
    if (!siteId) e.siteId = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Soumission ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const company = getCompanyById(companyId);
      const site = getSiteById(siteId);
      const room = roomId ? getRoomById(roomId) : null;
      const category = categories.find((c: ConfigurableOption) => c.id === categoryId);
      const status = statuses.find((s: ConfigurableOption) => s.id === statusId);
      const condition = conditions.find((c: ConfigurableOption) => c.id === conditionId);

      if (!company || !site || !category) return;

      const selectedPresenter = presenters.find((p: any) => p.id === assignToUserId);

      const equipmentData: any = {
        name,
        reference,
        serialNumber: serialNumber || null,
        categoryId,
        categoryName: category.name,
        brand: brand || null,
        model: model || null,
        statusId: statusId || defaultStatus?.id,
        statusName: status?.name || defaultStatus?.name || '',
        conditionId: conditionId || defaultCondition?.id,
        conditionName: condition?.name || defaultCondition?.name || '',
        currentLocation: {
          companyId,
          companyName: company.name,
          siteId,
          siteName: site.name,
          roomId: roomId || null,
          roomName: room?.name || null,
        },
        acquisition: {
          date: acquisitionDate,
          type: acquisitionType,
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
          supplier: supplier || null,
        },
        warranty: warrantyEnd ? {
          startDate: acquisitionDate,
          endDate: warrantyEnd,
        } : null,
        documentation: {
          description: description || null,
          photos: existingEquipment?.documentation?.photos || [],
        },
        isConsumable,
        quantity: isConsumable && quantity ? parseInt(quantity) : null,
        minQuantity: isConsumable && minQuantity ? parseInt(minQuantity) : null,
      };

      if (assignToUserId && selectedPresenter) {
        equipmentData.currentAssignment = {
          userId: assignToUserId,
          userName: selectedPresenter.name,
          userEmail: selectedPresenter.contact?.email || '',
          assignedAt: new Date().toISOString(),
          assignedBy: 'current_user',
        };
      }

      await (isEditMode && id
        ? updateMutation.mutateAsync({ id, data: equipmentData })
        : createMutation.mutateAsync(equipmentData)
      );
      navigate(isEditMode ? `/inventory/${id}` : '/inventory');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const inputClass = (field?: string) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      field && errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  // ── Rendu ──
  return (
    <div className="p-6 pb-24 max-w-2xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(isEditMode ? `/inventory/${id}` : '/inventory')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">
            {isEditMode ? 'Modifier l\'équipement' : 'Nouvel équipement'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditMode ? 'Modifier les informations' : 'Ajoutez un équipement en quelques secondes'}
          </p>
        </div>
      </div>

      {isEditMode && isLoadingEquipment ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'équipement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              placeholder="Ex: Micro Shure SM7B, Ordinateur Studio A, Câble XLR 5m..."
              className={inputClass('name')}
              autoFocus
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Référence + Catégorie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence interne
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={reference || (nextReferenceMutation.isPending ? 'Génération...' : '')}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed pr-9"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Générée automatiquement</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setErrors(p => ({ ...p, categoryId: '' })); }}
                className={inputClass('categoryId')}
              >
                <option value="">Choisir...</option>
                {categories.map((cat: ConfigurableOption) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>
          </div>

          {/* Marque + Modèle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: Shure, Apple..."
                className={inputClass()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: SM7B, MacBook Pro..."
                className={inputClass()}
              />
            </div>
          </div>

          {/* Statut + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={statusId} onChange={(e) => setStatusId(e.target.value)} className={inputClass()}>
                <option value="">Choisir...</option>
                {statuses.map((s: ConfigurableOption) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
              <select value={conditionId} onChange={(e) => setConditionId(e.target.value)} className={inputClass()}>
                <option value="">Choisir...</option>
                {conditions.map((c: ConfigurableOption) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">
                Localisation <span className="text-red-500">*</span>
              </p>
              {isLoadingLocations && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Entreprise */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Entreprise <span className="text-red-400">*</span></label>
                <select
                  value={companyId}
                  onChange={(e) => { setCompanyId(e.target.value); setSiteId(''); setRoomId(''); setErrors(p => ({ ...p, companyId: '', siteId: '' })); }}
                  className={inputClass('companyId')}
                >
                  <option value="">Sélectionner une entreprise</option>
                  {companies.map((c: Company) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.companyId && <p className="text-red-500 text-xs mt-1">{errors.companyId}</p>}
              </div>

              {/* Site */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Site <span className="text-red-400">*</span></label>
                <select
                  value={siteId}
                  onChange={(e) => { setSiteId(e.target.value); setRoomId(''); setErrors(p => ({ ...p, siteId: '' })); }}
                  disabled={!companyId}
                  className={`${inputClass('siteId')} ${!companyId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">{!companyId ? 'Choisir d\'abord une entreprise' : sites.length === 0 ? 'Aucun site disponible' : 'Sélectionner un site'}</option>
                  {sites.map((s: Site) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.siteId && <p className="text-red-500 text-xs mt-1">{errors.siteId}</p>}
              </div>

              {/* Local / Salle */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Local / Salle <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  disabled={!siteId}
                  className={`${inputClass()} ${!siteId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">{!siteId ? 'Choisir d\'abord un site' : rooms.length === 0 ? 'Aucun local configuré' : 'Sélectionner un local'}</option>
                  {rooms.map((r: Room) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* N° série + Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N° de série</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Optionnel"
              className={inputClass()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informations complémentaires..."
              rows={2}
              className={inputClass()}
            />
          </div>

          {/* ═══ OPTIONNEL ═══ */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showMore ? 'Masquer les détails optionnels' : 'Ajouter des détails (prix, garantie, assignation...)'}
          </button>

          {showMore && (
            <div className="space-y-4 border-l-2 border-blue-200 pl-4 ml-2">
              {/* Acquisition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0"
                      className={inputClass()}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Nom du fournisseur"
                    className={inputClass()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'acquisition</label>
                  <input
                    type="date"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode d'acquisition</label>
                  <select value={acquisitionType} onChange={(e) => setAcquisitionType(e.target.value as any)} className={inputClass()}>
                    <option value="purchase">Achat</option>
                    <option value="donation">Don</option>
                    <option value="lease">Location</option>
                    <option value="transfer">Transfert</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              {/* Garantie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin de garantie</label>
                <input
                  type="date"
                  value={warrantyEnd}
                  onChange={(e) => setWarrantyEnd(e.target.value)}
                  className={inputClass()}
                />
                <p className="text-xs text-gray-400 mt-1">Laissez vide si pas de garantie</p>
              </div>

              {/* Assignation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attribuer à</label>
                <select
                  value={assignToUserId}
                  onChange={(e) => setAssignToUserId(e.target.value)}
                  className={inputClass()}
                >
                  <option value="">Non assigné</option>
                  {presenters.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Consommable */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isConsumable}
                    onChange={(e) => setIsConsumable(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">C'est un consommable (gestion de stock)</span>
                </label>

                {isConsumable && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quantité</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="0"
                        className={inputClass()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Seuil d'alerte</label>
                      <input
                        type="number"
                        value={minQuantity}
                        onChange={(e) => setMinQuantity(e.target.value)}
                        placeholder="5"
                        className={inputClass()}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </form>
      )}

      {/* ═══ BARRE D'ACTIONS FIXE EN BAS ═══ */}
      {!(isEditMode && isLoadingEquipment) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.1)] px-6 py-3 z-50">
          <div className="max-w-2xl mx-auto flex gap-3">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/inventory/${id}` : '/inventory')}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
              }}
              className="flex-[2] px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditMode ? 'Enregistrement...' : 'Création...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? 'Enregistrer' : 'Créer l\'équipement'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEquipmentPage;
