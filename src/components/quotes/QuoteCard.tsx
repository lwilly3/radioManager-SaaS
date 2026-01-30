// Composant QuoteCard - Carte d'affichage d'une citation
import React from 'react';
import { MessageSquare, User, Calendar, Tag } from 'lucide-react';
import type { Quote } from '../../types/quote';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuoteCardProps {
  quote: Quote;
  onSelect: (quote: Quote) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onSelect }) => {
  // Status badge color
  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'approved':
        return 'Approuvée';
      case 'published':
        return 'Publiée';
      case 'archived':
        return 'Archivée';
      default:
        return status;
    }
  };

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

        {/* Indicateur de publications */}
        {quote.publications && quote.publications.length > 0 && (
          <span className="text-xs text-gray-500">
            {quote.publications.length} publication(s)
          </span>
        )}
      </div>
    </div>
  );
};

export default QuoteCard;
