import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useShowPlanStore } from '../store/useShowPlanStore';
import FormField from '../components/common/FormField';
import NewSegmentForm from '../components/showPlans/segments/NewSegmentForm';
import SegmentList from '../components/showPlans/segments/SegmentList';
import StatusSelect from '../components/showPlans/StatusSelect';
import PresenterSelect from '../components/showPlans/forms/PresenterSelect';
import { emissionApi } from '../services/api/emissions';
import { showsApi } from '../services/api/shows';
import { useAuthStore } from '../store/useAuthStore';
import type {
  ShowPlanFormData,
  ShowSegment,
  Status,
  Presenter,
  Emission
} from '../types';

const EditShowPlan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { show: locationShowPlan } = location.state || {};
  const navigate = useNavigate();
  const showPlans = useShowPlanStore((state) => state.showPlans);
  const setShowPlans = useShowPlanStore((state) => state.setShowPlans);
  const token = useAuthStore((state) => state.token);

  const [segments, setSegments] = useState<ShowSegment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [selectedPresenters, setSelectedPresenters] = useState<Presenter[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [selectedEmission, setSelectedEmission] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShowPlanFormData>({
    title: '',
    showType: '',
    date: '',
    time: '',
    description: ''
  });

  useEffect(() => {
    const fetchEmissions = async () => {
      if (!token) return;
      try {
        const data = await emissionApi.getAllEmissions(token);
        setEmissions(data);
      } catch (error) {
        console.error('Failed to fetch emissions:', error);
        setError('Failed to load emissions data');
      }
    };
    fetchEmissions();
  }, [token]);

  useEffect(() => {
    const loadShowPlan = async () => {
      if (!id || !token) return;
      
      try {
        setIsLoading(true);
        
        if (locationShowPlan) {
          console.log('Initialisation avec locationShowPlan:', locationShowPlan);
          initializeFormWithShowPlan(locationShowPlan);
        } else {
          const fetchedShowPlan = await showsApi.getById(token, id);
          if (fetchedShowPlan) {
            console.log('Initialisation avec fetchedShowPlan:', fetchedShowPlan);
            initializeFormWithShowPlan(fetchedShowPlan);
          } else {
            navigate('/show-plans');
          }
        }
      } catch (error) {
        console.error('Failed to load show plan:', error);
        setError('Failed to load show plan data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadShowPlan();
  }, [id, token, navigate, locationShowPlan]);

  const initializeFormWithShowPlan = (showPlan: any) => {
    console.log('Valeur de showPlan.emission_id:', showPlan.emission_id);
    
    const date = new Date(showPlan.date || showPlan.broadcast_date);
    
    setFormData({
      title: showPlan.title || '',
      showType: showPlan.showType || showPlan.type || '',
      date: date.toISOString().split('T')[0],
      time: date.toISOString().split('T')[1].substring(0, 5),
      description: showPlan.description || ''
    });
    
    const initialSegments = Array.isArray(showPlan.segments) ? showPlan.segments : [];
    setSegments(initialSegments.map((segment: any) => ({
      ...segment,
      id: String(segment.id),
      guests: Array.isArray(segment.guests) ? segment.guests : [],
      isNew: false // Marquer comme segment existant
    })));
    
    setSelectedStatus(typeof showPlan.status === 'object' ? showPlan.status : { 
      id: showPlan.status,
      name: showPlan.status,
      color: '#000000',
      priority: 0
    });
    
    setSelectedPresenters(Array.isArray(showPlan.presenters) ? showPlan.presenters : []);
    
    const emissionId = showPlan.emission_id || showPlan.emission?.id;
    if (emissionId) {
      const parsedEmissionId = parseInt(String(emissionId));
      if (!isNaN(parsedEmissionId)) {
        setSelectedEmission(parsedEmissionId);
      } else {
        console.warn('emission_id non valide:', emissionId);
        setSelectedEmission(null);
      }
    } else {
      console.warn('emission_id non défini dans showPlan');
      setSelectedEmission(null);
    }
  };

  useEffect(() => {
    const hasRequiredFields = Boolean(
      formData.title && formData.date && formData.time
    );
    const hasSegments = segments.length > 0;
    const hasStatus = selectedStatus !== null;
    const hasEmission = selectedEmission !== null;

    setIsFormValid(hasRequiredFields && hasSegments && hasStatus && hasEmission);
  }, [formData, segments, selectedStatus, selectedEmission]);

  const handleAddSegment = (segment: ShowSegment) => {
    setSegments((prevSegments) => [
      ...prevSegments,
      {
        ...segment,
        id: `temp-${Date.now()}`, // ID temporaire pour l'affichage local
        guests: segment.guests || [],
        isNew: true // Marquer comme nouveau segment
      }
    ]);
  };

  const handleReorderSegments = (reorderedSegments: ShowSegment[]) => {
    setSegments(reorderedSegments);
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(segments.filter((segment) => segment.id !== segmentId));
  };

  const handleSelectPresenter = (presenter: Presenter) => {
    setSelectedPresenters([...selectedPresenters, { ...presenter, isMainPresenter: selectedPresenters.length === 0 }]);
  };

  const handleRemovePresenter = (presenterId: string) => {
    setSelectedPresenters(selectedPresenters.filter(p => p.id !== presenterId));
  };

  const handleSetMainPresenter = (presenterId: string) => {
    setSelectedPresenters(selectedPresenters.map(p => ({
      ...p,
      isMainPresenter: p.id === presenterId
    })));
  };

  const handleFormChange = (field: keyof ShowPlanFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !selectedStatus || !id || !selectedEmission || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const safeSegments = Array.isArray(segments) ? segments : [];
      const safePresenters = Array.isArray(selectedPresenters) ? selectedPresenters : [];

      const updateData = {
        title: formData.title,
        type: formData.showType || 'talk-show',
        broadcast_date: `${formData.date}T${formData.time}`,
        duration: safeSegments.reduce((acc, segment) => acc + (segment.duration || 0), 0),
        frequency: 'Daily',
        description: formData.description || '',
        status: selectedStatus.id,
        emission_id: selectedEmission,
        presenter_ids: safePresenters
          .filter(p => p.id && !isNaN(parseInt(p.id)))
          .map(p => parseInt(p.id)),
        segments: safeSegments.map((segment, index) => ({
          id: segment.isNew ? undefined : (segment.id && !isNaN(parseInt(segment.id)) ? parseInt(segment.id) : undefined),
          title: segment.title,
          type: segment.type,
          position: index + 1,
          duration: segment.duration || 0,
          description: segment.description || null,
          guest_ids: Array.isArray(segment.guests)
            ? segment.guests
                .filter(g => g && !isNaN(parseInt(typeof g === 'object' ? g.id : g)))
                .map(g => parseInt(typeof g === 'object' ? g.id : g))
            : [],
        })),
      };

      console.log('Payload envoyée :', JSON.stringify(updateData, null, 2));
      const response = await showsApi.update(token, id, updateData);
      console.log('Réponse de l\'API :', JSON.stringify(response, null, 2));

      const updatedShowPlan = {
        ...locationShowPlan,
        title: formData.title,
        emission_id: selectedEmission,
        emission: emissions.find(e => e.id === selectedEmission)?.title || '',
        date: `${formData.date}T${formData.time}`,
        description: formData.description?.trim() || '',
        status: selectedStatus.id,
        segments: safeSegments.map(s => ({
          ...s,
          id: s.isNew ? String(response.segments?.find(seg => seg.title === s.title)?.id || s.id) : s.id
        })),
        presenters: safePresenters,
      };

      setShowPlans(showPlans.map((sp) => (sp.id === id ? updatedShowPlan : sp)));

      navigate('/show-plans', {
        replace: true,
        state: {
          notification: {
            type: 'success',
            message: 'Le conducteur a été modifié avec succès',
          },
        },
      });
    } catch (err) {
      console.error('Échec de la mise à jour du conducteur :', err.response?.data || err.message);
      setError(
        err.response?.data?.detail
          ? JSON.stringify(err.response.data.detail)
          : 'Une erreur est survenue lors de la mise à jour du conducteur'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/show-plans')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Retour aux conducteurs</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier le conducteur
          </h1>
          <p className="mt-1 text-gray-600">
            Modifiez les informations du conducteur ci-dessous
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Émission"
                error={!selectedEmission ? "Veuillez sélectionner une émission" : undefined}
                required
              >
                <select
                  value={selectedEmission ?? ''}
                  onChange={(e) => setSelectedEmission(e.target.value ? Number(e.target.value) : null)}
                  className="form-input"
                >
                  <option value="">Sélectionner une émission</option>
                  {emissions.map((emission) => (
                    <option key={emission.id} value={emission.id}>
                      {emission.title}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Titre de l'émission"
                error={!formData.title ? "Le titre est requis" : undefined}
                required
              >
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="form-input"
                  placeholder="Titre du conducteur"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField 
                label="Date" 
                error={!formData.date ? "La date est requise" : undefined} 
                required
              >
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField 
                label="Heure" 
                error={!formData.time ? "L'heure est requise" : undefined} 
                required
              >
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleFormChange('time', e.target.value)}
                  className="form-input"
                />
              </FormField>
            </div>

            <FormField
              label="Description (optionnelle)"
              error={undefined}
            >
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={3}
                className="form-textarea"
                placeholder="Description de l'émission..."
              />
            </FormField>

            <FormField
              label="Statut"
              required
              error={!selectedStatus ? 'Le statut est requis' : undefined}
            >
              <StatusSelect
                selectedStatus={selectedStatus}
                onStatusSelect={setSelectedStatus}
              />
            </FormField>

            <div className="border-t border-gray-200 pt-6">
              <PresenterSelect
                selectedPresenters={selectedPresenters}
                onSelectPresenter={handleSelectPresenter}
                onRemovePresenter={handleRemovePresenter}
                onSetMainPresenter={handleSetMainPresenter}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Segments de l'émission
              </h2>
              {segments.length === 0 && (
                <p className="text-sm text-amber-600">
                  Ajoutez au moins un segment pour créer le conducteur
                </p>
              )}
            </div>
            <div className="space-y-6">
              <NewSegmentForm onAdd={handleAddSegment} />

              {segments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Segments ajoutés ({segments.length})
                  </h3>
                  <SegmentList
                    segments={segments}
                    onReorder={handleReorderSegments}
                    onDelete={handleDeleteSegment}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/show-plans')}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`btn ${
                isFormValid
                  ? 'btn-primary'
                  : 'btn-primary opacity-50 cursor-not-allowed'
              }`}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShowPlan;