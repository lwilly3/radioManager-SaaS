import React, { useState, useEffect } from 'react';
import { usePresenters } from '../../hooks/presenters/usePresenters';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  User, Search, Filter, Edit, Trash, Plus, 
  Mail, Phone, Calendar, Radio, Loader, AlertCircle
} from 'lucide-react';
import { generateKey } from '../../utils/keyGenerator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PresenterFormData {
  name: string;
  email: string;
  phone?: string;
  biography?: string;
  profilePicture?: string;
}

const PresentersList: React.FC = () => {
  const { data: presenters = [], isLoading, error } = usePresenters();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPresenter, setEditingPresenter] = useState<any | null>(null);
  const [formData, setFormData] = useState<PresenterFormData>({
    name: '',
    email: '',
    phone: '',
    biography: '',
    profilePicture: '',
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const token = useAuthStore((state) => state.token);

  // Filtrer les présentateurs
  const filteredPresenters = presenters.filter(presenter => {
    const matchesSearch = presenter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (presenter.contact?.email && presenter.contact.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      biography: '',
      profilePicture: '',
    });
    setEditingPresenter(null);
    setIsEditing(false);
  };

  // Gérer l'édition d'un présentateur
  const handleEditPresenter = (presenter: any) => {
    setEditingPresenter(presenter);
    setFormData({
      name: presenter.name,
      email: presenter.contact?.email || '',
      phone: presenter.contact?.phone || '',
      biography: presenter.biography || '',
      profilePicture: presenter.profilePicture || '',
    });
    setIsEditing(true);
  };

  // Gérer la suppression d'un présentateur
  const handleDeletePresenter = async (presenterId: string) => {
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotification({
        type: 'success',
        message: 'Présentateur supprimé avec succès'
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Erreur lors de la suppression du présentateur'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotification({
        type: 'success',
        message: editingPresenter 
          ? 'Présentateur mis à jour avec succès' 
          : 'Présentateur créé avec succès'
      });
      
      resetForm();
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement du présentateur'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {notification && (
        <div className={`p-4 ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} rounded-t-lg flex items-center gap-2`}>
          {notification.type === 'success' ? (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p>{notification.message}</p>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Gestion des présentateurs</h2>
            <p className="text-gray-600 mt-1">
              Ajoutez, modifiez ou supprimez les présentateurs de votre station radio
            </p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau présentateur
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-4 flex items-center justify-between">
              <span>{editingPresenter ? 'Modifier le présentateur' : 'Nouveau présentateur'}</span>
              <button 
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <Trash className="h-5 w-5" />
              </button>
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet*
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input"
                    placeholder="Ex: Jean Dupont"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="form-input"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la photo de profil
                  </label>
                  <input
                    type="url"
                    value={formData.profilePicture}
                    onChange={(e) => setFormData({...formData, profilePicture: e.target.value})}
                    className="form-input"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biographie
                </label>
                <textarea
                  value={formData.biography}
                  onChange={(e) => setFormData({...formData, biography: e.target.value})}
                  className="form-textarea"
                  rows={3}
                  placeholder="Biographie du présentateur..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingPresenter ? 'Mettre à jour' : 'Créer le présentateur'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* Recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un présentateur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Liste des présentateurs */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            Une erreur est survenue lors du chargement des présentateurs
          </div>
        ) : filteredPresenters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresenters.map(presenter => (
              <div 
                key={generateKey(presenter.id.toString())}
                className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {presenter.profilePicture ? (
                        <img
                          src={presenter.profilePicture}
                          alt={presenter.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{presenter.name}</h3>
                      {presenter.contact?.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span>{presenter.contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {presenter.contact?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{presenter.contact.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Membre depuis {format(new Date(presenter.joinedAt || new Date()), 'MMMM yyyy', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-gray-400" />
                      <span>{presenter.shows?.length || 0} émission(s)</span>
                    </div>
                  </div>
                  
                  {presenter.biography && (
                    <div className="mt-3 text-sm text-gray-600">
                      <p className="line-clamp-2">{presenter.biography}</p>
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-3 bg-gray-50 border-t flex justify-between">
                  <button
                    onClick={() => handleEditPresenter(presenter)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeletePresenter(presenter.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">Aucun présentateur trouvé</p>
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              Ajouter un présentateur
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentersList;