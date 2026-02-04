import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, MessageSquare, User, Check, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ShowChatDialog from '../../chat/ShowChatDialog';
import { useShowChatStore } from '../../../store/useShowChatStore';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../api/firebase/firebase';
import type { ShowPlan } from '../../../types';
import { generateKey } from '../../../utils/keyGenerator';
import PdfGenerator from '../../common/PdfGenerator';

// Templates de notes techniques prédéfinis
const TECHNICAL_TEMPLATES = [
  { id: 'mic', label: '🎤 Micro', content: '<p><strong>Réglage micro:</strong> </p><ul><li>Niveau: </li><li>Égalisation: </li></ul>' },
  { id: 'jingle', label: '🎵 Jingle', content: '<p><strong>Jingle:</strong> Lancer à XX:XX</p>' },
  { id: 'call', label: '📞 Appel', content: '<p><strong>Appel téléphonique:</strong></p><ul><li>Contact: </li><li>Numéro: </li><li>Heure prévue: </li></ul>' },
  { id: 'video', label: '🎥 Vidéo', content: '<p><strong>Diffusion vidéo:</strong></p><ul><li>Source: </li><li>Durée: </li></ul>' },
  { id: 'alert', label: '⚠️ Attention', content: '<p><strong>⚠️ ATTENTION:</strong> </p>' },
];

interface ShowPlanSidebarProps {
  showPlan: ShowPlan;
}

const ShowPlanSidebar: React.FC<ShowPlanSidebarProps> = ({ showPlan }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [isNotesLoading, setIsNotesLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  // Ref pour le debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  
  const { unreadMessages, subscribeToUnreadMessages, markMessagesAsRead } =
    useShowChatStore();

  useEffect(() => {
    const unsubscribe = subscribeToUnreadMessages(showPlan.id.toString());
    return () => unsubscribe();
  }, [showPlan.id, subscribeToUnreadMessages]);

  useEffect(() => {
    const loadAndSubscribeToNotes = async () => {
      const notesRef = doc(db, 'notes_techniques', showPlan.id.toString());

      // Initial load
      try {
        const docSnap = await getDoc(notesRef);
        if (docSnap.exists()) {
          const content = docSnap.data().content;
          setTechnicalNotes(content);
          lastSavedContentRef.current = content;
        }
      } catch (error) {
        console.error('Error loading technical notes:', error);
      }

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(notesRef, (doc) => {
        if (doc.exists()) {
          const content = doc.data().content;
          // Ne pas mettre à jour si c'est notre propre modification
          if (content !== lastSavedContentRef.current) {
            setTechnicalNotes(content);
            lastSavedContentRef.current = content;
          }
        }
        setIsNotesLoading(false);
      });

      return unsubscribe;
    };

    loadAndSubscribeToNotes();
    
    // Cleanup du timeout au démontage
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [showPlan.id]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    markMessagesAsRead(showPlan.id.toString());
  };

  // Fonction de sauvegarde avec debounce
  const saveNotes = useCallback(async (content: string) => {
    try {
      setSaveStatus('saving');
      const notesRef = doc(db, 'notes_techniques', showPlan.id.toString());
      await setDoc(
        notesRef,
        {
          content,
          showId: showPlan.id,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      lastSavedContentRef.current = content;
      setSaveStatus('saved');
      
      // Réinitialiser le statut après 2 secondes
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving technical notes:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [showPlan.id]);

  const handleNotesChange = (content: string) => {
    setTechnicalNotes(content);
    
    // Annuler le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce de 800ms avant sauvegarde
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(content);
    }, 800);
  };

  // Insérer un template
  const handleInsertTemplate = (templateContent: string) => {
    const newContent = technicalNotes + templateContent;
    setTechnicalNotes(newContent);
    saveNotes(newContent);
    setShowTemplates(false);
  };

  const handleExportSuccess = () => {
    setNotification({
      type: 'success',
      message: 'PDF généré avec succès',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportError = (errorMessage: string) => {
    setNotification({
      type: 'error',
      message: `Erreur lors de l'export: ${errorMessage}`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Notification */}
        {notification && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm">{notification.message}</p>
          </div>
        )}
        
        {/* Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Actions</h3>
          <div className="space-y-2">
            <PdfGenerator
              data={showPlan}
              type="showPlan"
              onSuccess={handleExportSuccess}
              onError={handleExportError}
            />
            <div className="space-y-2">
              <button
                onClick={handleOpenChat}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Ouvrir le chat
              </button>

              {/* Unread Messages Preview */}
              {unreadMessages.length > 0 && (
                <div className="space-y-2 mt-2 p-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {unreadMessages.length} message
                    {unreadMessages.length > 1 ? 's' : ''} non lu
                    {unreadMessages.length > 1 ? 's' : ''}
                  </p>
                  {unreadMessages.slice(0, 2).map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-start gap-2 p-2 bg-gray-50 rounded"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        {msg.sender.avatar ? (
                          <img
                            src={msg.sender.avatar}
                            alt={msg.sender.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-3 w-3 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-900">
                            {msg.sender.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(msg.timestamp), 'HH:mm', {
                              locale: fr,
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guests */}
        {showPlan.guests && showPlan.guests.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">
              Invités ({showPlan.guests.length})
            </h3>
            <div className="space-y-2">
              {showPlan.guests.map((guest) => (
                <div
                  key={generateKey(guest.id.toString())}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex-shrink-0">
                    {guest.avatar ? (
                      <img
                        src={guest.avatar}
                        alt={guest.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {guest.name}
                    </p>
                    {guest.email && (
                      <p className="text-xs text-gray-500 truncate">
                        {guest.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
          >
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              Notes techniques
              {/* Indicateur de statut */}
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <Check className="h-3 w-3" />
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs text-red-500">Erreur</span>
              )}
            </h3>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              {isNotesExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {isNotesExpanded && (
            <>
              {/* Templates rapides */}
              <div className="relative">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mb-2"
                >
                  <Sparkles className="h-3 w-3" />
                  Insérer un template
                </button>
                
                {showTemplates && (
                  <div className="absolute z-10 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    {TECHNICAL_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleInsertTemplate(template.content)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {isNotesLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : (
                <ReactQuill
                  theme="snow"
                  value={technicalNotes}
                  onChange={handleNotesChange}
                  placeholder="Ajouter des notes techniques..."
                  modules={modules}
                  className="bg-white rounded-lg border border-gray-200 [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Dialog */}
      <ShowChatDialog
        showId={showPlan.id.toString()}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default ShowPlanSidebar