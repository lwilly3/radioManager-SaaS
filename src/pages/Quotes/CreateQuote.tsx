import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Radio } from 'lucide-react';
import QuoteForm from '../../components/quotes/QuoteForm';
import { QuoteFormData } from '../../schemas/quoteSchema';
import { createQuote } from '../../api/firebase/quotes';
import { CreateQuoteData } from '../../types/quote';
import { useAuthStore } from '../../store/useAuthStore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../api/firebase/firebase';
import { format } from 'date-fns';

/**
 * Supprime récursivement les propriétés undefined d'un objet
 * pour éviter les erreurs Firestore
 */
const removeUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: any = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        const nested = removeUndefined(obj[key]);
        if (Object.keys(nested).length > 0) {
          cleaned[key] = nested;
        }
      } else {
        cleaned[key] = obj[key];
      }
    }
  }
  
  return cleaned;
};

/**
 * Page de création d'une citation manuelle
 * Peut être pré-remplie avec les données d'un conducteur
 */
export default function CreateQuote() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Récupération des données du conducteur si présentes
  const showPlanContext = location.state?.showPlan;
  const segmentContext = location.state?.segment;
  const [defaultValues, setDefaultValues] = useState<Partial<QuoteFormData> | undefined>();

  // Pré-remplir le formulaire avec les données du conducteur
  useEffect(() => {
    if (showPlanContext) {
      const showDate = showPlanContext.broadcast_date || showPlanContext.date;
      setDefaultValues({
        showName: showPlanContext.emission || showPlanContext.title,
        date: showDate ? format(new Date(showDate), 'yyyy-MM-dd') : undefined,
        // Les invités seront sélectionnables dans le formulaire
      });
    }
  }, [showPlanContext]);

  const handleSubmit = async (formData: QuoteFormData) => {
    if (!user) {
      setError('Vous devez être connecté pour créer une citation');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload du fichier audio si présent
      let audioUrl: string | undefined;
      let audioDuration: number | undefined;

      if (formData.audioFile) {
        const file = formData.audioFile;
        const fileName = `quotes/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        
        // Upload du fichier
        await uploadBytes(storageRef, file);
        
        // Récupération de l'URL
        audioUrl = await getDownloadURL(storageRef);

        // Récupération de la durée (si possible via l'élément audio)
        try {
          const audio = new Audio(URL.createObjectURL(file));
          await new Promise((resolve) => {
            audio.onloadedmetadata = () => {
              audioDuration = audio.duration;
              resolve(null);
            };
          });
          URL.revokeObjectURL(audio.src);
        } catch (err) {
          console.warn('Impossible de récupérer la durée audio:', err);
        }
      }

      // Transformation des tags (chaîne → tableau)
      const tags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      // Construction de l'objet citation avec le nouveau format
      const quoteData: CreateQuoteData = {
        // Champs requis
        content: formData.content,
        authorName: formData.authorName,
        
        // Auteur optionnel
        authorRole: formData.authorRole as 'guest' | 'presenter' | 'caller' | 'other' | undefined,
        authorAvatar: formData.authorAvatar || undefined,
        
        // Liaison segment si présent
        segmentId: segmentContext?.id?.toString(),
        segmentTitle: segmentContext?.title,
        segmentType: segmentContext?.type,
        segmentPosition: segmentContext?.position,
        
        // Contexte depuis le conducteur si présent
        showPlanId: showPlanContext?.id?.toString(),
        showPlanTitle: showPlanContext?.title,
        emissionId: showPlanContext?.emission_id?.toString(),
        emissionName: formData.showName || showPlanContext?.emission,
        broadcastDate: formData.date,
        
        // Horodatage optionnel
        timestamp: formData.timestamp,
        
        // Métadonnées
        contentType: 'quote',
        category: formData.category as CreateQuoteData['category'],
        tags,
        importance: 'medium',
        
        // Source
        sourceType: 'manual',
        audioUrl: audioUrl,
        audioDuration: audioDuration,
      };

      // Création dans Firestore
      await createQuote(quoteData, user.id, user.name);

      // Redirection : vers le conducteur si on vient d'un segment, sinon vers la liste
      if (showPlanContext?.id) {
        navigate(`/show-plans/${showPlanContext.id}`, { 
          state: { message: 'Citation créée avec succès !' } 
        });
      } else {
        navigate('/quotes', { 
          state: { message: 'Citation créée avec succès !' } 
        });
      }
    } catch (err: any) {
      console.error('Erreur lors de la création:', err);
      setError(err.message || 'Une erreur est survenue lors de la création');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Retourner au conducteur si on vient d'un segment, sinon à la liste des citations
    if (showPlanContext?.id) {
      navigate(`/show-plans/${showPlanContext.id}`);
    } else {
      navigate('/quotes');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Nouvelle citation</h1>
              {showPlanContext && (
                <div className="flex items-center gap-2 mt-1">
                  <Radio className="w-4 h-4 text-indigo-600" />
                  <p className="text-sm text-gray-500">
                    Depuis le conducteur : <span className="font-medium">{showPlanContext.title}</span>
                    {segmentContext && (
                      <span className="text-indigo-600"> → {segmentContext.title}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <QuoteForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            defaultValues={defaultValues}
            showPlanGuests={showPlanContext?.guests}
          />
        </div>
      </div>
    </div>
  );
}
