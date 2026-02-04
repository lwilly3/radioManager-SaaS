// Composant SegmentDetailsWithQuotes
// Affiche les détails d'un segment avec ses citations associées

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Users, 
  MessageSquare, 
  Plus,
  ExternalLink,
  Loader2
} from 'lucide-react';
import type { ShowSegment } from '../../../types';
import type { Quote } from '../../../types/quote';
import { getQuotesBySegment } from '../../../api/firebase/quotes';
import { generateKey } from '../../../utils/keyGenerator';
import { useAuthStore } from '../../../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SegmentDetailsWithQuotesProps {
  segment: ShowSegment;
  showPlanId: string;
  showPlanTitle?: string;
  emissionId?: string;
  emissionName?: string;
  broadcastDate?: string;
  isExpanded: boolean;
  onToggle: () => void;
  isActive?: boolean;
}

const SegmentDetailsWithQuotes: React.FC<SegmentDetailsWithQuotesProps> = ({
  segment,
  showPlanId,
  showPlanTitle,
  emissionId,
  emissionName,
  broadcastDate,
  isExpanded,
  onToggle,
  isActive = false,
}) => {
  const navigate = useNavigate();
  const { permissions } = useAuthStore();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [quotesLoaded, setQuotesLoaded] = useState(false);

  // Charger les citations quand le segment est déplié
  useEffect(() => {
    if (isExpanded && segment.id && !quotesLoaded) {
      loadQuotes();
    }
  }, [isExpanded, segment.id]);

  const loadQuotes = async () => {
    if (!segment.id) return;
    
    setIsLoadingQuotes(true);
    try {
      const segmentQuotes = await getQuotesBySegment(segment.id.toString());
      setQuotes(segmentQuotes);
      setQuotesLoaded(true);
    } catch (error) {
      console.error('Erreur chargement citations:', error);
    }
    setIsLoadingQuotes(false);
  };

  const getSegmentTypeColor = (type: ShowSegment['type']) => {
    const colors = {
      intro: 'bg-blue-100 text-blue-700 border-blue-200',
      interview: 'bg-purple-100 text-purple-700 border-purple-200',
      music: 'bg-green-100 text-green-700 border-green-200',
      ad: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      outro: 'bg-red-100 text-red-100 border-red-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[type] || colors.other;
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'validated':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleAddQuote = () => {
    navigate('/quotes/create', {
      state: {
        showPlan: {
          id: showPlanId,
          title: showPlanTitle,
          emission_id: emissionId,
          emission: emissionName,
          broadcast_date: broadcastDate,
        },
        segment: {
          id: segment.id,
          title: segment.title,
          type: segment.type,
          position: segment.position,
        },
      },
    });
  };

  const handleViewQuote = (quoteId: string) => {
    navigate(`/quotes/${quoteId}`);
  };

  const canCreateQuotes = permissions?.quotes_create;

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isActive
          ? 'bg-indigo-50 border-indigo-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* En-tête du segment */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-medium text-gray-900">
              {segment.title || "Sans titre"}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSegmentTypeColor(
                segment.type || 'other'
              )}`}
            >
              {segment.type || "autre"}
            </span>
            {/* Badge nombre de citations */}
            {quotesLoaded && quotes.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {quotes.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{segment.duration || 0} min</span>
            </div>
            {segment.guests && segment.guests.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{segment.guests.length} invité(s)</span>
              </div>
            )}
          </div>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Contenu déplié */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Description et notes */}
          <div className="pt-4 space-y-4">
            {segment.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Description
                </h4>
                <p className="text-sm text-gray-600">{segment.description}</p>
              </div>
            )}

            {segment.technicalNotes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Notes techniques
                </h4>
                <p className="text-sm text-gray-600">{segment.technicalNotes}</p>
              </div>
            )}

            {/* Invités */}
            {segment.guests && segment.guests.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Invités
                </h4>
                <div className="flex flex-wrap gap-2">
                  {segment.guests.map((guestId) => (
                    <div
                      key={generateKey(guestId ? guestId.toString() : `guest-${Math.random()}`)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full"
                    >
                      <Users className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-700">{guestId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section Citations */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Citations ({quotes.length})
              </h4>
              {canCreateQuotes && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddQuote();
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              )}
            </div>

            {/* Liste des citations */}
            {isLoadingQuotes ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : quotes.length > 0 ? (
              <div className="space-y-2">
                {quotes.slice(0, 5).map((quote) => (
                  <div
                    key={quote.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewQuote(quote.id);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 line-clamp-2 italic">
                          "{quote.content}"
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <span className="font-medium">{quote.author.name}</span>
                          <span>•</span>
                          <span>
                            {quote.createdAt
                              ? formatDistanceToNow(new Date(quote.createdAt), {
                                  addSuffix: true,
                                  locale: fr,
                                })
                              : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 text-xs rounded ${getStatusColor(
                            quote.status
                          )}`}
                        >
                          {quote.status === 'draft'
                            ? 'Brouillon'
                            : quote.status === 'validated'
                            ? 'Validée'
                            : 'Archivée'}
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Lien voir plus si > 5 citations */}
                {quotes.length > 5 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/quotes?segmentId=${segment.id}`);
                    }}
                    className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded text-center"
                  >
                    Voir toutes les citations ({quotes.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Aucune citation pour ce segment
                </p>
                {canCreateQuotes && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddQuote();
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Ajouter la première citation
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentDetailsWithQuotes;
