// Carte d'équipement
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  ArrowRightLeft, 
  Archive,
  Eye,
  User,
  MapPin,
  Package,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import type { Equipment } from '../../types/inventory';
import { useAuthStore } from '../../store/useAuthStore';

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
  onMove?: (equipment: Equipment) => void;
  onArchive?: (equipment: Equipment) => void;
  compact?: boolean;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onEdit,
  onDelete,
  onMove,
  onArchive,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { permissions } = useAuthStore();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleClick = () => {
    navigate(`/inventory/${equipment.id}`);
  };

  const hasPhoto = !!equipment.documentation?.photos?.[0];
  const brandModel = [equipment.brand, equipment.model].filter(Boolean).join(' • ');

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer relative group ${
        compact ? 'p-3' : ''
      } ${equipment.isArchived ? 'opacity-70' : ''}`}
      onClick={handleClick}
    >
      {/* Badge archivé */}
      {equipment.isArchived && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800/80 text-white text-xs font-medium backdrop-blur-sm">
            <Archive className="h-3 w-3" />
            Archivé
          </span>
        </div>
      )}

      {/* Menu d'actions */}
      <div 
        ref={menuRef}
        className="absolute top-2 right-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`p-1.5 rounded-lg transition-colors ${
            hasPhoto 
              ? 'bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <MoreVertical className="h-4 w-4 text-gray-700" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border py-1 z-20">
            <button
              onClick={() => { navigate(`/inventory/${equipment.id}`); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
            >
              <Eye className="h-4 w-4" />
              Voir détails
            </button>
            
            {permissions?.inventory_edit && onEdit && (
              <button
                onClick={() => { onEdit(equipment); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
            )}
            
            {permissions?.inventory_move && onMove && (
              <button
                onClick={() => { onMove(equipment); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Mouvement
              </button>
            )}
            
            <hr className="my-1" />
            
            {onArchive && !equipment.isArchived && (
              <button
                onClick={() => { onArchive(equipment); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 flex items-center gap-2 text-orange-600"
              >
                <Archive className="h-4 w-4" />
                Archiver
              </button>
            )}
            
            {permissions?.inventory_delete && onDelete && (
              <button
                onClick={() => { onDelete(equipment); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Photo ou placeholder */}
      {hasPhoto ? (
        <img
          src={equipment.documentation!.photos![0]}
          alt={equipment.name}
          className="w-full h-36 object-cover rounded-t-xl"
        />
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex flex-col items-center justify-center gap-1.5">
          <Package className="h-10 w-10 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">{equipment.categoryName || 'Équipement'}</span>
        </div>
      )}

      {/* Contenu */}
      <div className={`space-y-2.5 ${compact ? '' : 'p-4'}`}>
        {/* Nom et référence */}
        <div>
          <h3 className="font-semibold text-gray-900 truncate leading-tight">
            {equipment.name}
          </h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
            {equipment.reference}
            {equipment.serialNumber && ` · S/N: ${equipment.serialNumber}`}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge name={equipment.statusName} />
          <CategoryBadge name={equipment.categoryName} />
        </div>

        {!compact && (
          <>
            {/* Marque / Modèle */}
            {brandModel && (
              <p className="text-sm text-gray-600 truncate">
                {brandModel}
              </p>
            )}

            {/* Localisation */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
              <span className="truncate">
                {[
                  equipment.currentLocation?.siteName,
                  equipment.currentLocation?.roomName,
                ].filter(Boolean).join(' › ') || equipment.currentLocation?.companyName || '—'}
              </span>
            </div>
          </>
        )}

        {/* Attribution */}
        {equipment.currentAssignment && (
          <div className="flex items-center gap-1.5 pt-2 border-t text-xs text-gray-600">
            <User className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span className="truncate">
              {equipment.currentAssignment.userName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentCard;
