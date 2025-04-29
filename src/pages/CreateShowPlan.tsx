import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { emissionApi } from '../services/api/emissions';
import { showsApi } from '../services/api/shows';
import EmissionSelect from '../components/showPlans/forms/EmissionSelect';
import ShowPlanForm from '../components/showPlans/forms/ShowPlanForm';
import NewSegmentForm from '../components/showPlans/segments/NewSegmentForm';
import SegmentList from '../components/showPlans/segments/SegmentList';
import StatusSelect from '../components/showPlans/StatusSelect';
import type { ShowPlanFormData, ShowSegment, Status, Emission } from '../types';

const CreateShowPlan: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [segments, setSegments] = useState<ShowSegment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [selectedEmission, setSelectedEmission] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ShowPlanFormData>>({});

  useEffect(() => {
    const fetchEmissions = async () => {
      if (!token) return;
      try {
        const data = await emissionApi.getAllEmissions(token);
        setEmissions(data);
      } catch (error) {
        console.error('Failed to fetch emissions:', error);
      }
    };
    fetchEmissions();
  }, [token]);

  // Add segment handlers
  const handleAddSegment = (segment: ShowSegment) => {
    setSegments((prevSegments) => [...prevSegments, segment]);
  };

  const handleReorderSegments = (reorderedSegments: ShowSegment[]) => {
    setSegments(reorderedSegments);
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments((prevSegments) =>
      prevSegments.filter((segment) => segment.id !== segmentId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedEmission || !selectedStatus || !formData.title)
      return;

    setIsLoading(true);
    try {
      const data = {
        title: formData.title,
        type: formData.showType || 'talk-show',
        broadcast_date: `${formData.date}T${formData.time}`,
        duration: segments.reduce((acc, segment) => acc + segment.duration, 0),
        frequency: 'Daily',
        description: formData.description || '',
        status: selectedStatus.id,
        emission_id: selectedEmission,
        presenter_ids: [],
        segments: segments.map((segment, index) => ({
          title: segment.title,
          type: segment.type,
          position: index + 1,
          duration: segment.duration,
          description: segment.description || '',
          guest_ids: segment.guests || [],
        })),
      };
      await showsApi.create(token, data);

      // await emissionApi.createShowPlan(token, payload);

      navigate('/my-show-plans', {
        replace: true,
        state: {
          notification: {
            type: 'success',
            message: 'Le conducteur a été créé avec succès',
          },
        },
      });
    } catch (error) {
      console.error('Failed to create show plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
            Nouveau conducteur
          </h1>
          <p className="mt-1 text-gray-600">
            Créez un nouveau conducteur en remplissant les informations
            ci-dessous
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <EmissionSelect
            emissions={emissions}
            selectedEmission={selectedEmission}
            onSelect={setSelectedEmission}
          />

          <ShowPlanForm defaultValues={formData} onValuesChange={setFormData} />

          <div className="border-t border-gray-200 pt-6">
            <StatusSelect
              selectedStatus={selectedStatus}
              onStatusSelect={setSelectedStatus}
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <NewSegmentForm onAdd={handleAddSegment} />
            {segments.length > 0 && (
              <div className="mt-4">
                <SegmentList
                  segments={segments}
                  onReorder={handleReorderSegments}
                  onDelete={handleDeleteSegment}
                />
              </div>
            )}
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
              className="btn btn-primary"
              disabled={
                isLoading ||
                !selectedEmission ||
                !selectedStatus ||
                segments.length === 0
              }
            >
              {isLoading ? 'Création en cours...' : 'Créer le conducteur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShowPlan;
