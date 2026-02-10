// Page de détail d'un équipement
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  ArrowRightLeft, 
  FileText,
  MapPin,
  User,
  Calendar,
  AlertTriangle,
  MoreHorizontal,
  Archive,
  Download,
  Camera,
  ExternalLink,
  Upload,
  Loader2,
  Wrench,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { StatusBadge } from '../../components/inventory/StatusBadge';
import { CategoryBadge } from '../../components/inventory/CategoryBadge';
import { LocationBreadcrumb } from '../../components/inventory/LocationBreadcrumb';
import { ConditionIndicator } from '../../components/inventory/ConditionIndicator';
import { 
  useEquipment, 
  useEquipmentMovements, 
  useArchiveEquipment, 
  useRestoreEquipment, 
  useDeleteEquipment,
  useEquipmentDocuments,
  useMaintenanceRecords,
  useCreateMaintenance,
  useUpdateMaintenance,
} from '../../hooks/inventory';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { EquipmentMovement, EquipmentDocument, MaintenanceRecord, MaintenanceType, DocumentAccessLevel, DocumentType } from '../../types/inventory';

const EquipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions } = useAuthStore();
  
  const { data: equipment, isLoading, error } = useEquipment(id);
  const { movements, isLoading: isLoadingMovements } = useEquipmentMovements(id);
  const { records: maintenanceRecords, isLoading: isLoadingMaintenance } = useMaintenanceRecords(id);
  const createMaintenanceMutation = useCreateMaintenance();
  const updateMaintenanceMutation = useUpdateMaintenance();
  
  const archiveMutation = useArchiveEquipment();
  const restoreMutation = useRestoreEquipment();
  const deleteMutation = useDeleteEquipment();
  
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'documents' | 'maintenance'>('info');
  const [showMenu, setShowMenu] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [docUploadName, setDocUploadName] = useState('');
  const [docUploadType, setDocUploadType] = useState<DocumentType>('other');
  const [docUploadAccess, setDocUploadAccess] = useState<DocumentAccessLevel>('public');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  // Maintenance form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    type: 'preventive' as MaintenanceType,
    title: '',
    description: '',
    scheduledDate: '',
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-gray-200 rounded"></div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-64 bg-gray-200 rounded lg:col-span-2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Équipement non trouvé</h2>
        <p className="text-gray-500 mb-4">
          L'équipement demandé n'existe pas ou a été supprimé.
        </p>
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  // Document/photo hooks
  const {
    uploadDocument,
    isUploading,
    deleteDocument,
    isDeleting,
    uploadPhoto,
    isUploadingPhoto,
  } = useEquipmentDocuments(equipment);

  // ── Handlers ──

  const handleArchive = async () => {
    if (!id || !archiveReason.trim()) return;
    await archiveMutation.mutateAsync({ id, reason: archiveReason });
    setShowArchiveModal(false);
    setShowMenu(false);
    setArchiveReason('');
  };

  const handleRestore = async () => {
    if (!id) return;
    await restoreMutation.mutateAsync(id);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    setShowDeleteModal(false);
    navigate('/inventory');
  };

  const handleExportPdf = () => {
    window.print();
    setShowMenu(false);
  };

  const handleUploadDocument = () => {
    if (!id || !docFile || !docUploadName.trim()) return;
    uploadDocument({
      equipmentId: id,
      file: docFile,
      metadata: {
        displayName: docUploadName,
        type: docUploadType,
        accessLevel: docUploadAccess,
      },
    });
    setShowUploadDocModal(false);
    setDocFile(null);
    setDocUploadName('');
  };

  const handleDeleteDocument = (doc: EquipmentDocument) => {
    if (!id) return;
    deleteDocument({
      equipmentId: id,
      documentId: doc.id,
      storagePath: doc.storagePath,
    });
    setDeleteDocId(null);
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    uploadPhoto({ equipmentId: id, file });
    e.target.value = '';
  };

  const handleCreateMaintenance = async () => {
    if (!id || !equipment || !maintenanceForm.title.trim()) return;
    await createMaintenanceMutation.mutateAsync({
      equipmentId: id,
      equipmentRef: equipment.reference,
      equipmentName: equipment.name,
      type: maintenanceForm.type,
      title: maintenanceForm.title,
      description: maintenanceForm.description,
      scheduledDate: maintenanceForm.scheduledDate || undefined,
      status: maintenanceForm.scheduledDate ? 'scheduled' : 'in_progress',
    });
    setShowMaintenanceModal(false);
    setMaintenanceForm({ type: 'preventive', title: '', description: '', scheduledDate: '' });
  };

  const handleCompleteMaintenance = async (record: MaintenanceRecord) => {
    await updateMaintenanceMutation.mutateAsync({
      id: record.id,
      data: {
        status: 'completed',
        endDate: new Date().toISOString(),
        result: 'success',
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/inventory')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{equipment.name}</h1>
              {equipment.isArchived && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">Archivé</span>
              )}
            </div>
            <p className="text-gray-500">
              {equipment.reference}
              {equipment.serialNumber && ` • S/N: ${equipment.serialNumber}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge name={equipment.statusName} />
              <CategoryBadge name={equipment.categoryName} />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {permissions?.inventory_move && !equipment.isArchived && (
            <button
              onClick={() => navigate(`/inventory/${id}/move`)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Mouvement
            </button>
          )}
          {permissions?.inventory_edit && !equipment.isArchived && (
            <button
              onClick={() => navigate(`/inventory/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
                <button 
                  onClick={handleExportPdf}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exporter PDF
                </button>
                <hr className="my-1" />
                {equipment.isArchived ? (
                  <button 
                    onClick={handleRestore}
                    disabled={restoreMutation.isPending}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {restoreMutation.isPending ? 'Restauration...' : 'Restaurer'}
                  </button>
                ) : (
                  <button 
                    onClick={() => { setShowArchiveModal(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Archiver
                  </button>
                )}
                {permissions?.inventory_delete && (
                  <button 
                    onClick={() => { setShowDeleteModal(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photos
              </h3>
              {permissions?.inventory_edit && !equipment.isArchived && (
                <>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadPhoto}
                  />
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
                  >
                    {isUploadingPhoto ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    Ajouter
                  </button>
                </>
              )}
            </div>
            {equipment.documentation?.photos && equipment.documentation.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {equipment.documentation.photos.map((photo: string, index: number) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${equipment.name} - Photo ${index + 1}`}
                    className="rounded-lg object-cover aspect-square"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucune photo</p>
            )}
          </div>

          {/* Onglets */}
          <div className="bg-white rounded-lg border">
            {/* Navigation des onglets */}
            <div className="border-b px-4">
              <nav className="flex gap-4">
                {[
                  { id: 'info', label: 'Informations' },
                  { id: 'history', label: 'Historique', count: movements.length },
                  { id: 'documents', label: 'Documents', count: equipment.documents.length },
                  { id: 'maintenance', label: 'Maintenance' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`py-3 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenu des onglets */}
            <div className="p-4">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Identification */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Identification</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-500">Marque</p>
                        <p className="font-medium">{equipment.brand}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Modèle</p>
                        <p className="font-medium">{equipment.model}</p>
                      </div>
                      {equipment.manufacturer && (
                        <div>
                          <p className="text-sm text-gray-500">Fabricant</p>
                          <p className="font-medium">{equipment.manufacturer}</p>
                        </div>
                      )}
                      {equipment.barcode && (
                        <div>
                          <p className="text-sm text-gray-500">Code-barres</p>
                          <p className="font-medium font-mono">{equipment.barcode}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr />

                  {/* Acquisition */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Acquisition</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-500">Date d'acquisition</p>
                        <p className="font-medium">{formatDate(equipment.acquisition.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium capitalize">
                          {equipment.acquisition.type === 'purchase' ? 'Achat' 
                            : equipment.acquisition.type === 'donation' ? 'Don'
                            : equipment.acquisition.type === 'lease' ? 'Location'
                            : equipment.acquisition.type === 'transfer' ? 'Transfert'
                            : 'Autre'}
                        </p>
                      </div>
                      {permissions?.inventory_view_values && equipment.acquisition.purchasePrice && (
                        <div>
                          <p className="text-sm text-gray-500">Prix d'achat</p>
                          <p className="font-medium">
                            {equipment.acquisition.purchasePrice.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                      )}
                      {equipment.acquisition.supplier && (
                        <div>
                          <p className="text-sm text-gray-500">Fournisseur</p>
                          <p className="font-medium">{equipment.acquisition.supplier}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Garantie */}
                  {equipment.warranty && (
                    <>
                      <hr />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Garantie</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-gray-500">Début</p>
                            <p className="font-medium">{formatDate(equipment.warranty.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fin</p>
                            <p className="font-medium">
                              {formatDate(equipment.warranty.endDate)}
                              {new Date(equipment.warranty.endDate) < new Date() && (
                                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Expirée</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Spécifications */}
                  {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
                    <>
                      <hr />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Caractéristiques techniques</h4>
                        <dl className="grid gap-2 sm:grid-cols-2">
                          {Object.entries(equipment.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1 border-b">
                              <dt className="text-gray-500">{key}</dt>
                              <dd className="font-medium">{String(value)}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  {isLoadingMovements ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : movements.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Aucun mouvement enregistré
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {movements.map((movement: EquipmentMovement) => (
                        <div 
                          key={movement.id}
                          className="flex items-start gap-4 p-4 rounded-lg border"
                        >
                          <div className="rounded-full bg-blue-100 p-2">
                            <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{movement.movementTypeName}</p>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                movement.status === 'completed' ? 'bg-green-100 text-green-700'
                                : movement.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                                : movement.status === 'rejected' ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                              }`}>
                                {movement.status === 'completed' ? 'Effectué'
                                  : movement.status === 'pending' ? 'En attente'
                                  : movement.status === 'rejected' ? 'Rejeté'
                                  : movement.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {movement.reason}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>{formatDate(movement.date)}</span>
                              <span>Par {movement.createdByName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  {permissions?.inventory_edit && !equipment.isArchived && (
                    <div className="mb-4 flex justify-end">
                      <button
                        onClick={() => setShowUploadDocModal(true)}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        Ajouter un document
                      </button>
                    </div>
                  )}
                  {equipment.documents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Aucun document attaché
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {equipment.documents.map((doc: EquipmentDocument) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.displayName}</p>
                              <p className="text-sm text-gray-500">
                                {(doc.fileSize / 1024 / 1024).toFixed(2)} Mo
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={doc.storageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-100 rounded"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            {permissions?.inventory_edit && !equipment.isArchived && (
                              deleteDocId === doc.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDeleteDocument(doc)}
                                    disabled={isDeleting}
                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                  >
                                    {isDeleting ? '...' : 'Oui'}
                                  </button>
                                  <button
                                    onClick={() => setDeleteDocId(null)}
                                    className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                                  >
                                    Non
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteDocId(doc.id)}
                                  className="p-2 hover:bg-red-50 rounded text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div>
                  {permissions?.inventory_edit && !equipment.isArchived && (
                    <div className="mb-4 flex justify-end">
                      <button
                        onClick={() => setShowMaintenanceModal(true)}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Nouvelle maintenance
                      </button>
                    </div>
                  )}
                  {isLoadingMaintenance ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : maintenanceRecords.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Aucune maintenance enregistrée
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {maintenanceRecords.map((record: MaintenanceRecord) => (
                        <div key={record.id} className="p-4 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="rounded-full bg-blue-100 p-2">
                                <Wrench className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{record.title}</p>
                                <p className="text-sm text-gray-500 capitalize">{record.type.replace('_', ' ')}</p>
                                {record.description && (
                                  <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                record.status === 'completed' ? 'bg-green-100 text-green-700'
                                : record.status === 'in_progress' ? 'bg-blue-100 text-blue-700'
                                : record.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                              }`}>
                                {record.status === 'completed' ? 'Terminée'
                                  : record.status === 'in_progress' ? 'En cours'
                                  : record.status === 'scheduled' ? 'Planifiée'
                                  : 'Annulée'}
                              </span>
                              {record.status !== 'completed' && record.status !== 'cancelled' && permissions?.inventory_edit && (
                                <button
                                  onClick={() => handleCompleteMaintenance(record)}
                                  disabled={updateMaintenanceMutation.isPending}
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  Terminer
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 ml-11">
                            {record.scheduledDate && <span>Prévue : {formatDate(record.scheduledDate)}</span>}
                            {record.endDate && <span>Terminée : {formatDate(record.endDate)}</span>}
                            <span>Par {record.createdByName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Localisation */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              Localisation
            </h3>
            <LocationBreadcrumb
              companyName={equipment.currentLocation.companyName}
              siteName={equipment.currentLocation.siteName}
              roomName={equipment.currentLocation.roomName}
              specificLocation={equipment.currentLocation.specificLocation}
              size="md"
            />
          </div>

          {/* Assignation */}
          {equipment.currentAssignment && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <User className="h-5 w-5" />
                Attribué à
              </h3>
              <div className="space-y-3">
                <p className="font-medium">{equipment.currentAssignment.userName}</p>
                <p className="text-sm text-gray-500">
                  {equipment.currentAssignment.userEmail}
                </p>
                <hr />
                <div className="text-sm">
                  <p className="text-gray-500">Depuis le</p>
                  <p>{formatDate(equipment.currentAssignment.assignedAt)}</p>
                </div>
                {equipment.currentAssignment.expectedReturnDate && (
                  <div className="text-sm">
                    <p className="text-gray-500">Retour prévu</p>
                    <p>{formatDate(equipment.currentAssignment.expectedReturnDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* État */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-4">État</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Condition</p>
                <ConditionIndicator name={equipment.conditionName} />
              </div>
              
              {equipment.isConsumable && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Stock</p>
                  <p className={`font-medium ${
                    equipment.minQuantity && equipment.quantity !== undefined && 
                    equipment.quantity <= equipment.minQuantity
                      ? 'text-red-600'
                      : ''
                  }`}>
                    {equipment.quantity} {equipment.unit || 'unités'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Métadonnées */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5" />
              Informations
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Créé le</span>
                <span>{formatDate(equipment.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Créé par</span>
                <span>{equipment.createdByName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Modifié le</span>
                <span>{formatDate(equipment.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Archivage */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Archiver l'équipement</h3>
            <p className="text-gray-600 mb-4">
              L'équipement "{equipment.name}" sera archivé et n'apparaîtra plus dans la liste principale.
            </p>
            <label className="block text-sm font-medium mb-1">Raison de l'archivage *</label>
            <input
              type="text"
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              placeholder="Ex: Équipement obsolète..."
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowArchiveModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
              <button
                onClick={handleArchive}
                disabled={!archiveReason.trim() || archiveMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {archiveMutation.isPending ? 'Archivage...' : 'Archiver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Supprimer définitivement</h3>
            <p className="text-gray-600 mb-4">
              Cette action est irréversible. L'équipement "{equipment.name}" et tout son historique seront supprimés.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Document */}
      {showUploadDocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajouter un document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du document *</label>
                <input
                  type="text"
                  value={docUploadName}
                  onChange={(e) => setDocUploadName(e.target.value)}
                  placeholder="Ex: Manuel utilisateur..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={docUploadType}
                  onChange={(e) => setDocUploadType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="manual">Manuel</option>
                  <option value="datasheet">Fiche technique</option>
                  <option value="certificate">Certificat</option>
                  <option value="warranty">Garantie</option>
                  <option value="invoice">Facture</option>
                  <option value="maintenance_report">Rapport de maintenance</option>
                  <option value="configuration">Configuration</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Accès</label>
                <select
                  value={docUploadAccess}
                  onChange={(e) => setDocUploadAccess(e.target.value as DocumentAccessLevel)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="public">Public</option>
                  <option value="company">Entreprise</option>
                  <option value="team">Équipe technique</option>
                  <option value="admin">Administrateurs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fichier *</label>
                <input
                  ref={docInputRef}
                  type="file"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowUploadDocModal(false); setDocFile(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
              <button
                onClick={handleUploadDocument}
                disabled={!docFile || !docUploadName.trim() || isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Maintenance */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Nouvelle maintenance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre *</label>
                <input
                  type="text"
                  value={maintenanceForm.title}
                  onChange={(e) => setMaintenanceForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Révision annuelle..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={maintenanceForm.type}
                  onChange={(e) => setMaintenanceForm(prev => ({ ...prev, type: e.target.value as MaintenanceType }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="preventive">Préventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="inspection">Inspection</option>
                  <option value="calibration">Calibration</option>
                  <option value="cleaning">Nettoyage</option>
                  <option value="upgrade">Mise à niveau</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Détails de l'intervention..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date planifiée</label>
                <input
                  type="date"
                  value={maintenanceForm.scheduledDate}
                  onChange={(e) => setMaintenanceForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Laisser vide pour démarrer immédiatement</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
              <button
                onClick={handleCreateMaintenance}
                disabled={!maintenanceForm.title.trim() || createMaintenanceMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMaintenanceMutation.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetailPage;
