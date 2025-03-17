import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { presenterApi, PresenterResponse } from '../../../services/api/presenters';

interface EditPresenterDialogProps {
  isOpen: boolean;
  presenter: PresenterResponse;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPresenterDialog: React.FC<EditPresenterDialogProps> = ({
  isOpen,
  presenter,
  onClose,
  onSuccess,
}) => {
  const token = useAuthStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: presenter.name,
    biography: presenter.biography || '',
    contact_info: presenter.contact_info || '',
    profilePicture: presenter.profilePicture || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setIsLoading(true);
      await presenterApi.update(token, presenter.id, formData);
      onSuccess();
    } catch (err) {
      setError('Erreur lors de la mise à jour du présentateur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Modifier le présentateur
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biographie
              </label>
              <textarea
                value={formData.biography}
                onChange={(e) =>
                  setFormData({ ...formData, biography: e.target.value })
                }
                rows={3}
                className="form-textarea"
                placeholder="Biographie du présentateur..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Informations de contact
              </label>
              <input
                type="text"
                value={formData.contact_info}
                onChange={(e) =>
                  setFormData({ ...formData, contact_info: e.target.value })
                }
                className="form-input"
                placeholder="Informations de contact supplémentaires..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo de profil (URL)
              </label>
              <input
                type="url"
                value={formData.profilePicture}
                onChange={(e) =>
                  setFormData({ ...formData, profilePicture: e.target.value })
                }
                className="form-input"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditPresenterDialog;