// Composant QuoteCard - Carte d'affichage d'une citation
import React, { useState } from 'react';
import { MessageSquare, User, Calendar, Tag, MoreVertical, CheckCircle, Archive, FileEdit } from 'lucide-react';
import type { Quote } from '../../types/quote';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { updateQuote } from '../../api/firebase/quotes';
import { useAuthStore } from '../../store/useAuthStore';

interface QuoteCardProps {
  quote: Quote;
  onSelect: (quote: Quote) => void;
  onStatusChange?: (quoteId: string, newStatus: Quote['status']) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onSelect, onStatusChange }) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { permissions, user } = useAuthStore();

  // Vérifie si l'utilisateur peut modifier cette citation
  // - Le propriétaire peut toujours modifier sa citation
  // - Les autres utilisateurs ont besoin de la permission quotes_edit
  const isOwner = user?.id === quote.createdBy;
  const canEditStatus = isOwner || permissions?.quotes_edit;

  // Status badge color
  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'validated':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'validated':
        return 'Validée';
      case 'archived':
        return 'Archivée';
      default:
        return status;
    }
  };

  const handleStatusChange = async (newStatus: Quote['status']) => {
    if (newStatus === quote.status || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateQuote(quote.id, { status: newStatus });
      if (onStatusChange) {
        onStatusChange(quote.id, newStatus);
      }
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
    setIsUpdating(false);
    setShowStatusMenu(false);
  };

  // Fermer le menu quand on clique ailleurs
  React.useEffect(() => {
    const handleClickOutside = () => setShowStatusMenu(false);
    if (showStatusMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showStatusMenu]);

  // Format de la date relative
  const formattedDate = quote.createdAt
    ? formatDistanceToNow(new Date(quote.createdAt), {
        addSuffix: true,
        locale: fr,
      })
    : '';

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* En-tête avec auteur et statut */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {quote.author.avatar ? (
              <img
                src={quote.author.avatar}
                alt={quote.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {quote.author.name}
              </h3>
              <p className="text-xs text-gray-600 capitalize">
                {quote.author.role === 'guest'
                  ? 'Invité'
                  : quote.author.role === 'presenter'
                  ? 'Animateur'
                  : 'Autre'}
              </p>
            </div>
          </div>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              quote.status
            )}`}
          >
            {getStatusLabel(quote.status)}
          </span>
        </div>

        {/* Contenu de la citation */}
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <p className="text-gray-800 text-sm line-clamp-3 italic">
              "{quote.content}"
            </p>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>

          {/* Tags */}
          {quote.metadata.tags && quote.metadata.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3 h-3 text-gray-400" />
              {quote.metadata.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {quote.metadata.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{quote.metadata.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Catégorie */}
          <div className="text-xs text-gray-500 capitalize">
            Catégorie : <span className="font-medium">{quote.metadata.category}</span>
          </div>
        </div>
      </div>

      {/* Pied de carte avec actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center justify-between">
        <button
          onClick={() => onSelect(quote)}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Voir les détails
        </button>

        <div className="flex items-center gap-3">
          {/* Menu de changement de statut - visible si propriétaire OU permission quotes_edit */}
          {canEditStatus && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusMenu(!showStatusMenu);
                }}
                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                title="Changer le statut"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {/* Menu déroulant */}
              {showStatusMenu && (
                <div className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-100">
                    Changer le statut
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('draft');
                    }}
                    disabled={quote.status === 'draft' || isUpdating}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                      quote.status === 'draft' ? 'bg-gray-50 text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    <FileEdit className="w-4 h-4" />
                    Brouillon
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('validated');
                    }}
                    disabled={quote.status === 'validated' || isUpdating}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                      quote.status === 'validated' ? 'bg-green-50 text-green-600' : 'text-gray-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Validée
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('archived');
                    }}
                    disabled={quote.status === 'archived' || isUpdating}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                      quote.status === 'archived' ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                    }`}
                  >
                    <Archive className="w-4 h-4" />
                    Archivée
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
