import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Download, User } from 'lucide-react';
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

interface ShowPlanSidebarProps {
  showPlan: ShowPlan;
}

const ShowPlanSidebar: React.FC<ShowPlanSidebarProps> = ({ showPlan }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [isNotesLoading, setIsNotesLoading] = useState(true);
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
          setTechnicalNotes(docSnap.data().content);
        }
      } catch (error) {
        console.error('Error loading technical notes:', error);
      }

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(notesRef, (doc) => {
        if (doc.exists()) {
          setTechnicalNotes(doc.data().content);
        }
        setIsNotesLoading(false);
      });

      return unsubscribe;
    };

    loadAndSubscribeToNotes();
  }, [showPlan.id]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    markMessagesAsRead(showPlan.id.toString());
  };

  const handleNotesChange = async (content: string) => {
    setTechnicalNotes(content);

    try {
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
    } catch (error) {
      console.error('Error saving technical notes:', error);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Actions</h3>
          <div className="space-y-2">
            <button className="w-full btn btn-primary flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Exporter en PDF
            </button>
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
                    {guest.contact && guest.contact.email && (
                      <p className="text-xs text-gray-500 truncate">
                        {guest.contact.email}
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
          <h3 className="text-sm font-medium text-gray-900">
            Notes techniques
          </h3>
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
              className="bg-white rounded-lg border border-gray-200"
              style={{
                height: 'auto',
                minHeight: '300px',
                maxHeight: '400px',
              }}
            />
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

export default ShowPlanSidebar;
