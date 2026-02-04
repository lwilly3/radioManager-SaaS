// Page de détail d'une citation
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Tag,
  MessageSquare,
  FileText,
  Radio,
  Edit,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Volume2,
  PlayCircle,
  ExternalLink,
  Bookmark,
  AlertCircle,
  Hash,
  Quote as QuoteIcon,
  Lightbulb,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuote, useQuotes } from '../../hooks/quotes/useQuotes';
import { deleteQuote, updateQuote } from '../../api/firebase/quotes';
import { useAuthStore } from '../../store/useAuthStore';
import type { Quote, QuoteContentType } from '../../types/quote';

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

const getStatusConfig = (status: Quote['status']) => {
  const configs = {
    draft: {
      label: 'Brouillon',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: Edit,
    },
    validated: {
      label: 'Validée',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle2,
    },
    archived: {
      label: 'Archivée',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: Bookmark,
    },
  };
  return configs[status] || configs.draft;
};

const getContentTypeConfig = (type: QuoteContentType) => {
  const configs = {
    quote: {
      label: 'Citation exacte',
      icon: QuoteIcon,
      color: 'text-indigo-600 bg-indigo-50',
      description: 'Verbatim - Citation mot pour mot',
    },
    key_idea: {
      label: 'Idée clé',
      icon: Lightbulb,
      color: 'text-amber-600 bg-amber-50',
      description: 'Point important à retenir',
    },
    statement: {
      label: 'Déclaration',
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50',
      description: 'Prise de position officielle',
    },
    fact: {
      label: 'Fait',
      icon: Info,
      color: 'text-emerald-600 bg-emerald-50',
      description: 'Information vérifiable',
    },
  };
  return configs[type] || configs.quote;
};

const getRoleLabel = (role?: string) => {
  const roles: Record<string, string> = {
    guest: 'Invité',
    presenter: 'Animateur',
    caller: 'Auditeur',
    other: 'Autre',
  };
  return roles[role || 'other'] || role;
};

const getCategoryLabel = (category?: string) => {
  const categories: Record<string, string> = {
    politique: 'Politique',
    sport: 'Sport',
    culture: 'Culture',
    economie: 'Économie',
    societe: 'Société',
    humour: 'Humour',
    autre: 'Autre',
  };
  return categories[category || 'autre'] || category;
};

// ════════════════════════════════════════════════════════════════
// COMPOSANTS
// ════════════════════════════════════════════════════════════════

/**
 * Section d'information avec icône
 */
const InfoSection: React.FC<{
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ icon: Icon, title, children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-indigo-600" />
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

/**
 * Carte citation liée (même conducteur)
 */
const RelatedQuoteCard: React.FC<{
  quote: Quote;
  isCurrentQuote: boolean;
}> = ({ quote, isCurrentQuote }) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => !isCurrentQuote && navigate(`/quotes/${quote.id}`)}
      disabled={isCurrentQuote}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isCurrentQuote
          ? 'bg-indigo-50 border-indigo-200 cursor-default'
          : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCurrentQuote ? 'bg-indigo-100' : 'bg-gray-100'
        }`}>
          {quote.author.avatar ? (
            <img
              src={quote.author.avatar}
              alt={quote.author.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className={`w-4 h-4 ${isCurrentQuote ? 'text-indigo-600' : 'text-gray-500'}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900 truncate">
              {quote.author.name}
            </span>
            {isCurrentQuote && (
              <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                Actuelle
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 italic">
            "{quote.content.slice(0, 100)}{quote.content.length > 100 ? '...' : ''}"
          </p>
          {quote.segment && (
            <p className="text-xs text-gray-500 mt-1">
              Segment : {quote.segment.title}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

/**
 * Lecteur audio simple
 */
const AudioPlayer: React.FC<{ url: string; duration?: number }> = ({ url, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} />
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
      >
        {isPlaying ? (
          <span className="w-3 h-3 bg-white rounded-sm" />
        ) : (
          <PlayCircle className="w-5 h-5" />
        )}
      </button>
      <div className="flex-1">
        <div className="h-1 bg-gray-200 rounded-full">
          <div className="h-full w-0 bg-indigo-600 rounded-full transition-all" />
        </div>
      </div>
      <span className="text-sm text-gray-500">{formatDuration(duration)}</span>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions, user } = useAuthStore();
  
  const { quote, isLoading, error } = useQuote(id);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Récupérer les citations du même conducteur
  const { quotes: relatedQuotes } = useQuotes(
    quote?.context.showPlanId ? { showPlanId: quote.context.showPlanId } : {}
  );

  // Filtrer pour n'avoir que les citations liées (excluant potentiellement la citation actuelle pour la liste)
  const sameShowPlanQuotes = useMemo(() => {
    if (!quote?.context.showPlanId || !relatedQuotes.length) return [];
    return relatedQuotes.filter(q => q.context.showPlanId === quote.context.showPlanId);
  }, [quote, relatedQuotes]);

  // Vérifie si l'utilisateur peut modifier cette citation
  // - Le propriétaire peut toujours modifier sa citation
  // - Les autres utilisateurs ont besoin de permissions spécifiques
  const isOwner = quote && user?.id === quote.createdBy;
  const canEditStatus = isOwner || permissions?.quotes_edit;
  const canDelete = isOwner || permissions?.quotes_delete;

  // Copier la citation
  const handleCopy = async () => {
    if (quote) {
      await navigator.clipboard.writeText(`"${quote.content}" — ${quote.author.name}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Supprimer la citation
  const handleDelete = async () => {
    if (!quote || !canDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteQuote(quote.id);
      navigate('/quotes', { state: { message: 'Citation supprimée avec succès' } });
    } catch (err) {
      console.error('Erreur suppression:', err);
      setIsDeleting(false);
    }
  };

  // Changer le statut
  const handleStatusChange = async (newStatus: Quote['status']) => {
    if (!quote || !canEditStatus) return;
    
    setStatusUpdating(true);
    try {
      await updateQuote(quote.id, { status: newStatus });
      // Le hook va se rafraîchir automatiquement
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
    setStatusUpdating(false);
  };

  // ────────────────────────────────────────────────────────────────
  // ÉTATS DE CHARGEMENT ET ERREUR
  // ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la citation...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Citation introuvable</h2>
          <p className="text-gray-600 mb-6">
            {error || "Cette citation n'existe pas ou a été supprimée."}
          </p>
          <button
            onClick={() => navigate('/quotes')}
            className="btn btn-primary"
          >
            Retour aux citations
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // RENDU PRINCIPAL
  // ────────────────────────────────────────────────────────────────

  const statusConfig = getStatusConfig(quote.status);
  const contentTypeConfig = getContentTypeConfig(quote.contentType);
  const StatusIcon = statusConfig.icon;
  const ContentTypeIcon = contentTypeConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/quotes')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Détail de la citation</h1>
                <p className="text-sm text-gray-500">
                  Créée {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true, locale: fr })}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copier la citation"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
              
              {canEditStatus && (
                <Link
                  to={`/quotes/${quote.id}/edit`}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-5 h-5" />
                </Link>
              )}

              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Citation principale */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Badges en haut */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${contentTypeConfig.color}`}>
                  <ContentTypeIcon className="w-4 h-4" />
                  {contentTypeConfig.label}
                </span>
                {quote.metadata.importance === 'high' && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                    Importante
                  </span>
                )}
              </div>

              {/* Contenu de la citation */}
              <blockquote className="text-xl md:text-2xl text-gray-800 font-serif italic leading-relaxed mb-6 pl-4 border-l-4 border-indigo-500">
                "{quote.content}"
              </blockquote>

              {/* Auteur */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                {quote.author.avatar ? (
                  <img
                    src={quote.author.avatar}
                    alt={quote.author.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow">
                    <User className="w-7 h-7 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{quote.author.name}</p>
                  <p className="text-gray-600">{getRoleLabel(quote.author.role)}</p>
                </div>
              </div>
            </div>

            {/* Audio (si présent) */}
            {quote.source.audioUrl && (
              <InfoSection icon={Volume2} title="Extrait audio">
                <AudioPlayer url={quote.source.audioUrl} duration={quote.source.duration} />
              </InfoSection>
            )}

            {/* Contexte & Conducteur */}
            {(quote.context.showPlanId || quote.context.emissionName) && (
              <InfoSection icon={Radio} title="Contexte de diffusion">
                <div className="space-y-4">
                  {/* Émission */}
                  {quote.context.emissionName && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Radio className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Émission</p>
                        <p className="font-medium text-gray-900">{quote.context.emissionName}</p>
                      </div>
                    </div>
                  )}

                  {/* Conducteur lié */}
                  {quote.context.showPlanId && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Conducteur source</p>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">
                            {quote.context.showPlanTitle || 'Conducteur #' + quote.context.showPlanId}
                          </p>
                          <Link
                            to={`/show-plans/${quote.context.showPlanId}`}
                            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            Voir le conducteur
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date de diffusion */}
                  {quote.context.broadcastDate && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de diffusion</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(quote.context.broadcastDate), 'EEEE d MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Segment */}
                  {quote.segment && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Hash className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Segment</p>
                        <p className="font-medium text-gray-900">{quote.segment.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Position #{quote.segment.position + 1} • Type: {quote.segment.type}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Horodatage */}
                  {quote.timing && (quote.timing.timestamp || quote.timing.approximateTime) && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Moment dans l'émission</p>
                        <p className="font-medium text-gray-900">
                          {quote.timing.timestamp || (
                            quote.timing.approximateTime === 'start' ? 'Début du segment' :
                            quote.timing.approximateTime === 'middle' ? 'Milieu du segment' :
                            'Fin du segment'
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </InfoSection>
            )}

            {/* Tags et métadonnées */}
            <InfoSection icon={Tag} title="Métadonnées">
              <div className="space-y-4">
                {/* Catégorie */}
                {quote.metadata.category && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Catégorie</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                      {getCategoryLabel(quote.metadata.category)}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {quote.metadata.tags && quote.metadata.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {quote.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                        >
                          <Hash className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mots-clés extraits */}
                {quote.metadata.keywords && quote.metadata.keywords.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Mots-clés (extraction automatique)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {quote.metadata.keywords.slice(0, 10).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Importance */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Niveau d'importance</p>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <span
                        key={level}
                        className={`px-3 py-1 rounded-full text-sm ${
                          quote.metadata.importance === level
                            ? level === 'high'
                              ? 'bg-red-100 text-red-700 font-medium'
                              : level === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 font-medium'
                              : 'bg-gray-100 text-gray-700 font-medium'
                            : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {level === 'high' ? 'Haute' : level === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </InfoSection>
          </div>

          {/* Colonne latérale (1/3) */}
          <div className="space-y-6">
            {/* Statut actuel avec actions rapides */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* En-tête avec statut actuel */}
              <div className={`px-5 py-4 ${
                quote.status === 'draft' ? 'bg-gray-50' :
                quote.status === 'validated' ? 'bg-green-50' : 'bg-orange-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = getStatusConfig(quote.status);
                      const Icon = config.icon;
                      return (
                        <>
                          <div className={`p-2 rounded-full ${
                            quote.status === 'draft' ? 'bg-gray-200' :
                            quote.status === 'validated' ? 'bg-green-200' : 'bg-orange-200'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              quote.status === 'draft' ? 'text-gray-700' :
                              quote.status === 'validated' ? 'text-green-700' : 'text-orange-700'
                            }`} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Statut actuel</p>
                            <p className={`font-semibold ${
                              quote.status === 'draft' ? 'text-gray-700' :
                              quote.status === 'validated' ? 'text-green-700' : 'text-orange-700'
                            }`}>
                              {config.label}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {statusUpdating && (
                    <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                  )}
                </div>
              </div>

              {/* Actions de changement de statut */}
              {canEditStatus && (
                <div className="p-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">Changer vers :</p>
                  <div className="flex gap-2">
                    {(['draft', 'validated', 'archived'] as const)
                      .filter(status => status !== quote.status)
                      .map((status) => {
                        const config = getStatusConfig(status);
                        const Icon = config.icon;
                        
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={statusUpdating}
                            className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 border-dashed transition-all hover:border-solid disabled:opacity-50 ${
                              status === 'draft' 
                                ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600' 
                                : status === 'validated'
                                ? 'border-green-300 hover:border-green-500 hover:bg-green-50 text-green-600'
                                : 'border-orange-300 hover:border-orange-500 hover:bg-orange-50 text-orange-600'
                            }`}
                            title={`Passer en ${config.label}`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{config.label}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Citations du même conducteur */}
            {sameShowPlanQuotes.length > 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Même conducteur
                  </h3>
                  <span className="text-sm text-gray-500">
                    {sameShowPlanQuotes.length} citations
                  </span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sameShowPlanQuotes.map((relatedQuote) => (
                    <RelatedQuoteCard
                      key={relatedQuote.id}
                      quote={relatedQuote}
                      isCurrentQuote={relatedQuote.id === quote.id}
                    />
                  ))}
                </div>
                {quote.context.showPlanId && (
                  <Link
                    to={`/show-plans/${quote.context.showPlanId}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Voir le conducteur complet
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}

            {/* Informations système */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID</span>
                  <span className="font-mono text-gray-700 text-xs">{quote.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Créée le</span>
                  <span className="text-gray-700">
                    {format(new Date(quote.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modifiée le</span>
                  <span className="text-gray-700">
                    {format(new Date(quote.updatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
                {quote.createdByName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Créée par</span>
                    <span className="text-gray-700">{quote.createdByName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Source</span>
                  <span className="text-gray-700 capitalize">
                    {quote.source.type === 'manual' ? 'Saisie manuelle' : quote.source.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Langue</span>
                  <span className="text-gray-700">
                    {quote.metadata.language === 'fr' ? 'Français' : 'Anglais'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lien vers le conducteur si pas affiché dans related */}
            {quote.context.showPlanId && sameShowPlanQuotes.length <= 1 && (
              <Link
                to={`/show-plans/${quote.context.showPlanId}`}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  <div>
                    <p className="font-medium">Voir le conducteur</p>
                    <p className="text-sm text-white/80">
                      {quote.context.showPlanTitle || 'Accéder au conducteur source'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Supprimer la citation ?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Cette action est irréversible. La citation sera définitivement supprimée.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
