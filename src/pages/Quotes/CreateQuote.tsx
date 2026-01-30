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
      let audioFileName: string | undefined;
      let audioDuration: number | undefined;

      if (formData.audioFile) {
        const file = formData.audioFile;
        const fileName = `quotes/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        
        // Upload du fichier
        await uploadBytes(storageRef, file);
        
        // Récupération de l'URL
        audioUrl = await getDownloadURL(storageRef);
        audioFileName = file.name;

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

      // Construction de l'objet citation
      const quoteData: CreateQuoteData = {
        content: formData.content,
        author: {
          name: formData.authorName,
          ...(formData.authorRole && { role: formData.authorRole as 'guest' | 'presenter' | 'other' }),
          ...(formData.authorAvatar && { avatar: formData.authorAvatar }),
        },
        context: (formData.showName || formData.date || formData.timestamp || showPlanContext) ? {
          ...(showPlanContext?.id && { showId: showPlanContext.id.toString() }),
          ...(formData.showName || showPlanContext?.title) && { showName: formData.showName || showPlanContext?.title },
          ...(showPlanContext?.id && { showPlanId: showPlanContext.id.toString() }),
          ...(showPlanContext?.emission_id && { emissionId: showPlanContext.emission_id.toString() }),
          ...(formData.date && { date: formData.date }),
          ...(formData.timestamp && { timestamp: formData.timestamp }),
        } : undefined,
        source: {
          type: 'manual',
          ...(audioUrl && { audioUrl }),
          ...(audioFileName && { audioFile: audioFileName }),
          ...(audioDuration && { duration: audioDuration }),
        },
        metadata: {
          ...(formData.category && { category: formData.category as 'statement' | 'position' | 'quote' | 'fact' }),
          tags,
          language: 'fr',
          isVerified: false,
        },
        status: 'draft',
        createdBy: user.id,
      };

      // Nettoyage des valeurs undefined
      const cleanedData = removeUndefined(quoteData) as CreateQuoteData;

      // Création dans Firestore
      await createQuote(cleanedData, user.id);

      // Redirection vers la liste avec succès
      navigate('/quotes', { 
        state: { message: 'Citation créée avec succès !' } 
      });
    } catch (err: any) {
      console.error('Erreur lors de la création:', err);
      setError(err.message || 'Une erreur est survenue lors de la création');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/quotes');
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
