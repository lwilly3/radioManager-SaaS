// Liste d'équipements
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  ArrowRightLeft, 
  Archive,
  Eye,
  Grid,
  List,
} from 'lucide-react';
import { EquipmentCard } from './EquipmentCard';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { LocationBreadcrumb } from './LocationBreadcrumb';
import type { Equipment } from '../../types/inventory';
import { useAuthStore } from '../../store/useAuthStore';

interface EquipmentListProps {
  equipments: Equipment[];
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
  onMove?: (equipment: Equipment) => void;
  onArchive?: (equipment: Equipment) => void;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  equipments,
  isLoading = false,
  viewMode = 'grid',
  onViewModeChange,
  onEdit,
  onDelete,
  onMove,
  onArchive,
}) => {
  const navigate = useNavigate();
  const { permissions } = useAuthStore();
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg border p-4 animate-pulse flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (equipments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">Aucun équipement trouvé</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {equipments.map((equipment) => (
          <EquipmentCard
            key={equipment.id}
            equipment={equipment}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
            onArchive={onArchive}
          />
        ))}
      </div>
    );
  }

  // Vue liste
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Équipement
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Localisation
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attribution
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {equipments.map((equipment) => (
            <tr 
              key={equipment.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/inventory/${equipment.id}`)}
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {equipment.documentation?.photos?.[0] ? (
                    <img
                      src={equipment.documentation.photos[0]}
                      alt={equipment.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {equipment.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{equipment.name}</div>
                    <div className="text-sm text-gray-500">{equipment.reference}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <CategoryBadge name={equipment.categoryName} />
              </td>
              <td className="px-4 py-4">
                <StatusBadge name={equipment.statusName} />
              </td>
              <td className="px-4 py-4">
                <LocationBreadcrumb
                  companyName={equipment.currentLocation.companyName}
                  siteName={equipment.currentLocation.siteName}
                  roomName={equipment.currentLocation.roomName}
                  showIcons={false}
                />
              </td>
              <td className="px-4 py-4">
                {equipment.currentAssignment ? (
                  <span className="text-sm">{equipment.currentAssignment.userName}</span>
                ) : (
                  <span className="text-sm text-gray-400">Non attribué</span>
                )}
              </td>
              <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="relative inline-block">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === equipment.id ? null : equipment.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {activeMenuId === equipment.id && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border py-1 z-10">
                      <button
                        onClick={() => navigate(`/inventory/${equipment.id}`)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Voir détails
                      </button>
                      
                      {permissions?.inventory_edit && onEdit && (
                        <button
                          onClick={() => onEdit(equipment)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </button>
                      )}
                      
                      {permissions?.inventory_move && onMove && (
                        <button
                          onClick={() => onMove(equipment)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                          Mouvement
                        </button>
                      )}
                      
                      <hr className="my-1" />
                      
                      {onArchive && (
                        <button
                          onClick={() => onArchive(equipment)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Archive className="h-4 w-4" />
                          Archiver
                        </button>
                      )}
                      
                      {permissions?.inventory_delete && onDelete && (
                        <button
                          onClick={() => onDelete(equipment)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentList;
