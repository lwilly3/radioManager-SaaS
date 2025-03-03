import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, User, Shield, Filter, Search, ArrowDown, ArrowUp, Calendar, Download } from 'lucide-react';
import { generateKey } from '../../utils/keyGenerator';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id: number;
  user_name: string;
  action: 'create' | 'update' | 'delete' | 'apply_template';
  target_user_id: number;
  target_user_name: string;
  permission_key: string;
  old_value: boolean;
  new_value: boolean;
  template_id?: string;
  template_name?: string;
}

// Données fictives pour la démonstration
const mockAuditLogs: AuditLogEntry[] = Array.from({ length: 20 }, (_, i) => ({
  id: `log-${i + 1}`,
  timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  user_id: 1,
  user_name: 'Admin',
  action: ['create', 'update', 'delete', 'apply_template'][Math.floor(Math.random() * 4)] as any,
  target_user_id: Math.floor(Math.random() * 10) + 1,
  target_user_name: ['Sarah', 'Thomas', 'Marie', 'Jean', 'Sophie'][Math.floor(Math.random() * 5)],
  permission_key: ['can_create_showplan', 'can_edit_showplan', 'can_delete_showplan', 'can_viewAll_showplan'][Math.floor(Math.random() * 4)],
  old_value: Math.random() > 0.5,
  new_value: Math.random() > 0.5,
  ...(Math.random() > 0.7 ? {
    template_id: `template-${Math.floor(Math.random() * 4) + 1}`,
    template_name: ['Administrateur', 'Présentateur', 'Technicien', 'Invité'][Math.floor(Math.random() * 4)]
  } : {})
}));

const PermissionAuditLog: React.FC = () => {
  const { token } = useAuthStore((state) => state);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateRange, setDateRange] = useState<{from: string, to: string}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 jours en arrière
    to: new Date().toISOString().split('T')[0] // Aujourd'hui
  });
  const [sortField, setSortField] = useState<'timestamp' | 'user_name' | 'action'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLogs(mockAuditLogs);
      } catch (err) {
        setError("Erreur lors du chargement des journaux d'audit");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, [token]);

  // Filtrer et trier les logs
  const filteredAndSortedLogs = logs
    .filter(log => {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // Inclure toute la journée de fin
      
      const isInDateRange = logDate >= fromDate && logDate <= toDate;
      
      const matchesSearch = 
        log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.permission_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.template_name && log.template_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesAction = filterAction ? log.action === filterAction : true;
      
      return isInDateRange && matchesSearch && matchesAction;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortField === 'user_name') {
        comparison = a.user_name.localeCompare(b.user_name);
      } else if (sortField === 'action') {
        comparison = a.action.localeCompare(b.action);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'timestamp' | 'user_name' | 'action') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'Création';
      case 'update': return 'Modification';
      case 'delete': return 'Suppression';
      case 'apply_template': return 'Application de modèle';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'apply_template': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportCSV = () => {
    // Créer un CSV à partir des logs filtrés
    const headers = ['Date', 'Utilisateur', 'Action', 'Cible', 'Permission', 'Ancienne valeur', 'Nouvelle valeur', 'Modèle'];
    
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedLogs.map(log => [
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr }),
        log.user_name,
        getActionLabel(log.action),
        log.target_user_name,
        log.permission_key.replace('can_', '').replace('_', ' '),
        log.action !== 'apply_template' ? (log.old_value ? 'Oui' : 'Non') : '',
        log.action !== 'apply_template' ? (log.new_value ? 'Oui' : 'Non') : '',
        log.template_name || ''
      ].join(','))
    ].join('\n');
    
    // Créer un blob et télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `journal_audit_permissions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Journal d'audit des permissions</h2>
            <p className="text-gray-600 mt-1">
              Consultez l'historique des modifications de permissions des présentateurs.
            </p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary flex items-center gap-2"
            disabled={filteredAndSortedLogs.length === 0}
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="form-input py-2"
              />
              <span className="text-gray-500">à</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="form-input py-2"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="form-input py-2"
              >
                <option value="">Toutes les actions</option>
                <option value="create">Création</option>
                <option value="update">Modification</option>
                <option value="delete">Suppression</option>
                <option value="apply_template">Application de modèle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des logs */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      {sortField === 'timestamp' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('user_name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Utilisateur</span>
                      {sortField === 'user_name' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('action')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Action</span>
                      {sortField === 'action' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cible
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedLogs.map((log) => (
                  <tr key={generateKey(log.id)} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{log.user_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>{log.target_user_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.action === 'apply_template' ? (
                        <span>
                          Modèle <strong>{log.template_name}</strong> appliqué
                        </span>
                      ) : (
                        <span>
                          Permission <strong>{log.permission_key.replace('can_', '').replace('_', ' ')}</strong> {' '}
                          {log.action === 'update' ? (
                            <>
                              changée de <strong>{log.old_value ? 'Oui' : 'Non'}</strong> à <strong>{log.new_value ? 'Oui' : 'Non'}</strong>
                            </>
                          ) : log.action === 'create' ? (
                            <>définie à <strong>{log.new_value ? 'Oui' : 'Non'}</strong></>
                          ) : (
                            <>supprimée</>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && filteredAndSortedLogs.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aucun journal d'audit trouvé pour les critères sélectionnés</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionAuditLog;