// Page de mouvement d'équipement
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  Loader2, 
  MapPin, 
  User, 
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from '../../components/inventory/StatusBadge';
import { LocationBreadcrumb } from '../../components/inventory/LocationBreadcrumb';
import { useEquipment } from '../../hooks/inventory/useEquipment';
import { useCreateMovement } from '../../hooks/inventory/useEquipmentMovements';
import { useInventorySettings, useLocationSelector } from '../../hooks/inventory';
import { useAuthStore } from '../../store/useAuthStore';
import { usePresenters } from '../../hooks/presenters/usePresenters';
import type { ConfigurableOption, Company, Site, Room } from '../../types/inventory';

interface FormData {
  movementTypeId: string;
  destinationCompanyId: string;
  destinationSiteId: string;
  destinationRoomId: string;
  destinationSpecificLocation: string;
  assignToUserId: string;
  date: string;
  reason: string;
  notes: string;
  expectedReturnDate: string;
}

const EquipmentMovePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: equipment, isLoading, error } = useEquipment(id);
  const createMovementMutation = useCreateMovement();
  
  const { getActiveMovementTypes } = useInventorySettings();
  const { 
    companies, 
    getSitesByCompany, 
    getRoomsBySite,
    getCompanyById,
    getSiteById,
    getRoomById,
  } = useLocationSelector();

  const movementTypes = getActiveMovementTypes();
  const { data: presenters = [] } = usePresenters();

  const [formData, setFormData] = useState<FormData>({
    movementTypeId: '',
    destinationCompanyId: '',
    destinationSiteId: '',
    destinationRoomId: '',
    destinationSpecificLocation: '',
    assignToUserId: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
    expectedReturnDate: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const destSites = formData.destinationCompanyId ? getSitesByCompany(formData.destinationCompanyId) : [];
  const destRooms = formData.destinationSiteId ? getRoomsBySite(formData.destinationSiteId) : [];

  // Déterminer le type de mouvement sélectionné
  const selectedMovementType = movementTypes.find((t: ConfigurableOption) => t.id === formData.movementTypeId);
  const needsDestination = selectedMovementType?.name && [
    'transfert', 'prêt', 'mission', 'external', 'loan'
  ].some(keyword => selectedMovementType.name.toLowerCase().includes(keyword));
  
  const needsUser = selectedMovementType?.name && [
    'attribution', 'prêt', 'assign', 'loan'
  ].some(keyword => selectedMovementType.name.toLowerCase().includes(keyword));

  const needsApproval = selectedMovementType?.name && [
    'external', 'inter-entreprise'
  ].some(keyword => selectedMovementType.name.toLowerCase().includes(keyword));

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Reset cascading selects
    if (field === 'destinationCompanyId') {
      setFormData(prev => ({ ...prev, destinationSiteId: '', destinationRoomId: '' }));
    }
    if (field === 'destinationSiteId') {
      setFormData(prev => ({ ...prev, destinationRoomId: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.movementTypeId) newErrors.movementTypeId = 'Le type de mouvement est requis';
    if (!formData.date) newErrors.date = 'La date est requise';
    if (!formData.reason.trim()) newErrors.reason = 'La raison est requise';

    if (needsDestination) {
      if (!formData.destinationCompanyId) newErrors.destinationCompanyId = "L'entreprise est requise";
      if (!formData.destinationSiteId) newErrors.destinationSiteId = 'Le site est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Équipement non trouvé</h2>
        <button
          onClick={() => navigate('/inventory')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'inventaire
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !user) return;

    const movementType = movementTypes.find((t: ConfigurableOption) => t.id === formData.movementTypeId);
    if (!movementType) return;

    // Construire la destination
    let destination;
    if (formData.destinationCompanyId && formData.destinationSiteId) {
      const company = getCompanyById(formData.destinationCompanyId);
      const site = getSiteById(formData.destinationSiteId);
      const room = formData.destinationRoomId ? getRoomById(formData.destinationRoomId) : null;

      destination = {
        companyId: formData.destinationCompanyId,
        companyName: company?.name || '',
        siteId: formData.destinationSiteId,
        siteName: site?.name || '',
        roomId: formData.destinationRoomId || undefined,
        roomName: room?.name,
        specificLocation: formData.destinationSpecificLocation || undefined,
      };
    }

    // Déterminer la catégorie de mouvement en mappant vers les valeurs exactes de MovementType
    const lowerName = movementType.name.toLowerCase();
    const movementCategory: import('../../types/inventory').MovementType = 
      lowerName.includes('transfert') && lowerName.includes('site') ? 'transfer_site'
      : lowerName.includes('transfert') && lowerName.includes('local') ? 'transfer_room'
      : lowerName.includes('transfert') && lowerName.includes('entreprise') ? 'transfer_company'
      : lowerName.includes('transfert') ? 'transfer_site'
      : lowerName.includes('prêt') && lowerName.includes('retour') ? 'loan_return'
      : lowerName.includes('prêt') && lowerName.includes('inter') ? 'company_loan'
      : lowerName.includes('prêt') ? 'loan'
      : lowerName.includes('attribution') ? 'assignment'
      : lowerName.includes('mission') && lowerName.includes('retour') ? 'mission_checkin'
      : lowerName.includes('mission') ? 'mission_checkout'
      : lowerName.includes('maintenance') && lowerName.includes('retour') ? 'maintenance_in'
      : lowerName.includes('maintenance') ? 'maintenance_out'
      : lowerName.includes('réparation') && lowerName.includes('retour') ? 'repair_in'
      : lowerName.includes('réparation') ? 'repair_out'
      : lowerName.includes('retour') ? 'return'
      : lowerName.includes('entrée') ? 'initial_entry'
      : lowerName.includes('mise au rebut') ? 'disposal'
      : lowerName.includes('perte') ? 'loss'
      : 'other';

    // Résoudre le nom de l'utilisateur assigné
    const assignedPresenter = formData.assignToUserId 
      ? presenters.find(p => (p.user_id || p.id) === formData.assignToUserId)
      : null;

    const movementData = {
      equipmentId: equipment.id,
      equipmentRef: equipment.reference,
      equipmentName: equipment.name,
      movementTypeId: formData.movementTypeId,
      movementTypeName: movementType.name,
      movementCategory,
      date: formData.date,
      from: {
        location: equipment.currentLocation,
        userId: equipment.currentAssignment?.userId,
        userName: equipment.currentAssignment?.userName,
      },
      to: {
        location: destination || equipment.currentLocation,
        userId: formData.assignToUserId || undefined,
        userName: assignedPresenter?.name || undefined,
      },
      reason: formData.reason,
      notes: formData.notes || undefined,
      expectedReturnDate: formData.expectedReturnDate || undefined,
      requiresApproval: needsApproval,
    };

    await createMovementMutation.mutateAsync(movementData);
    navigate(`/inventory/${equipment.id}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/inventory/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Mouvement d'équipement</h1>
          <p className="text-gray-500">
            Enregistrer un transfert, prêt ou attribution
          </p>
        </div>
      </div>

      {/* Résumé équipement */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Équipement concerné</h3>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold">{equipment.name}</h4>
            <p className="text-sm text-gray-500">{equipment.reference}</p>
            <div className="mt-2">
              <StatusBadge name={equipment.statusName} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Localisation actuelle</p>
            <LocationBreadcrumb
              companyName={equipment.currentLocation.companyName}
              siteName={equipment.currentLocation.siteName}
              roomName={equipment.currentLocation.roomName}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de mouvement */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <ArrowRightLeft className="h-5 w-5" />
            Type de mouvement
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.movementTypeId}
                onChange={(e) => updateField('movementTypeId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.movementTypeId ? 'border-red-500' : ''
                }`}
              >
                <option value="">Sélectionner le type</option>
                {movementTypes.map((type: ConfigurableOption) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {errors.movementTypeId && <p className="text-red-500 text-sm mt-1">{errors.movementTypeId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du mouvement *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : ''
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
          </div>
        </div>

        {/* Alerte approbation */}
        {needsApproval && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <p className="text-amber-800">
              Ce type de mouvement nécessite une approbation. Le mouvement sera
              en attente jusqu'à validation par un responsable.
            </p>
          </div>
        )}

        {/* Destination */}
        {needsDestination && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              Destination
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise *</label>
                <select
                  value={formData.destinationCompanyId}
                  onChange={(e) => updateField('destinationCompanyId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.destinationCompanyId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Sélectionner</option>
                  {companies.map((company: Company) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
                {errors.destinationCompanyId && <p className="text-red-500 text-sm mt-1">{errors.destinationCompanyId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
                <select
                  value={formData.destinationSiteId}
                  onChange={(e) => updateField('destinationSiteId', e.target.value)}
                  disabled={!formData.destinationCompanyId}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                    errors.destinationSiteId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Sélectionner</option>
                  {destSites.map((site: Site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
                {errors.destinationSiteId && <p className="text-red-500 text-sm mt-1">{errors.destinationSiteId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <select
                  value={formData.destinationRoomId}
                  onChange={(e) => updateField('destinationRoomId', e.target.value)}
                  disabled={!formData.destinationSiteId || destRooms.length === 0}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Optionnel</option>
                  {destRooms.map((room: Room) => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement précis</label>
                <input
                  type="text"
                  value={formData.destinationSpecificLocation}
                  onChange={(e) => updateField('destinationSpecificLocation', e.target.value)}
                  placeholder="Ex: Bureau 201, Rack A3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Attribution utilisateur */}
        {needsUser && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <User className="h-5 w-5" />
              Attribution
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attribuer à</label>
                <select
                  value={formData.assignToUserId}
                  onChange={(e) => updateField('assignToUserId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {presenters.map((presenter) => (
                    <option key={presenter.id} value={presenter.user_id || presenter.id}>
                      {presenter.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">L'utilisateur responsable de l'équipement</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de retour prévue</label>
                <input
                  type="date"
                  value={formData.expectedReturnDate}
                  onChange={(e) => updateField('expectedReturnDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Pour les prêts temporaires</p>
              </div>
            </div>
          </div>
        )}

        {/* Justification */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Justification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison du mouvement *</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => updateField('reason', e.target.value)}
                placeholder="Ex: Transfert pour projet X, Prêt événement..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.reason ? 'border-red-500' : ''
                }`}
              />
              {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes additionnelles</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Informations supplémentaires..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/inventory/${id}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={createMovementMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {createMovementMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4" />
                {needsApproval ? 'Soumettre pour approbation' : 'Enregistrer le mouvement'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentMovePage;
