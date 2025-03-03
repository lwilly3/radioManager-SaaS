import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Search, Filter, X, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ArchiveSearchForm from '../components/archives/ArchiveSearchForm';
import ArchiveCard from '../components/archives/ArchiveCard';
import ArchiveList from '../components/archives/ArchiveList';
import ArchiveDetailDialog from '../components/archives/ArchiveDetailDialog';
import Pagination from '../components/archives/Pagination';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/api';
import { generateKey } from '../utils/keyGenerator'; // Import de la fonction utilitaire

interface Presenter {
  id: number;
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}

interface Show {
  id: string;
  emission: string;
  title: string;
  broadcast_date: string;
  duration: number;
  presenters: Presenter[];
  status: string;
}

interface ApiResponse {
  total: number;
  data: Show[];
}

interface SearchFilters {
  keywords: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  presenter: number[];
  guest: number[];
}

const Archives: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    presenter: [],
    guest: [],
  });
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const token = useAuthStore((state) => state.token);

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['archives', filters, currentPage],
    queryFn: async () => {
      const skip = (currentPage - 1) * 20;
      const params = {
        keywords: filters.keywords,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        status: filters.status,
        presenter: filters.presenter.length > 0 ? filters.presenter : undefined,
        guest: filters.guest.length > 0 ? filters.guest : undefined,
        skip,
        limit: 20,
      };

      const response = await api.get('search_shows', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return response.data;
    },
    enabled: !!token && isSearchTriggered,
  });

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsSearchTriggered(true);
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/shows/archives/export', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `archives_${format(new Date(), 'yyyy-MM-dd')}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      keywords: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      presenter: [],
      guest: [],
    });
    setCurrentPage(1);
    setIsSearchTriggered(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Archives</h1>
          <p className="text-gray-600">
            Recherchez dans les émissions archivées
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg shadow p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vue en grille"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vue en liste"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Exporter en CSV
          </button>
        </div>
      </header>

      <ArchiveSearchForm
        filters={filters}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

      {isSearchTriggered ? (
        isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : error ? (
          (error as any)?.response?.status === 404 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                Aucune émission trouvée pour ces filtres
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-red-600">
              Une erreur est survenue lors de la recherche:{' '}
              {(error as any)?.message}
            </div>
          )
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data?.data?.map((show) => (
                  <ArchiveCard
                    key={generateKey(show.id)}
                    show={show}
                    onShowDetail={() => setSelectedShow(show)}
                  />
                ))}
              </div>
            ) : (
              <ArchiveList
                shows={data?.data || []}
                onShowDetail={(show) => setSelectedShow(show)}
              />
            )}

            {data?.data?.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Aucune émission trouvée</p>
              </div>
            )}

            {data?.total > 20 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(data.total / 20)}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            Veuillez effectuer une recherche pour voir les résultats
          </p>
        </div>
      )}

      {selectedShow && (
        <ArchiveDetailDialog
          show={selectedShow}
          isOpen={!!selectedShow}
          onClose={() => setSelectedShow(null)}
        />
      )}
    </div>
  );
};

export default Archives;

// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { Download, Search, Filter, X, LayoutGrid, List } from 'lucide-react';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import ArchiveSearchForm from '../components/archives/ArchiveSearchForm';
// import ArchiveCard from '../components/archives/ArchiveCard';
// import ArchiveList from '../components/archives/ArchiveList';
// import ArchiveDetailDialog from '../components/archives/ArchiveDetailDialog';
// import Pagination from '../components/archives/Pagination';
// import { useAuthStore } from '../store/useAuthStore';
// import api from '../api/api';

// interface SearchFilters {
//   keywords: string;
//   dateFrom: string;
//   dateTo: string;
//   status: string;
//   presenter: number[];
//   guest: number[];
// }

// const Archives: React.FC = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [selectedShow, setSelectedShow] = useState<any | null>(null);
//   const [filters, setFilters] = useState<SearchFilters>({
//     keywords: '',
//     dateFrom: '',
//     dateTo: '',
//     status: '',
//     presenter: [],
//     guest: [],
//   });
//   const [isSearchTriggered, setIsSearchTriggered] = useState(false);
//   const token = useAuthStore((state) => state.token);

//   const { data, isLoading, error } = useQuery({
//     queryKey: ['archives', filters, currentPage],
//     queryFn: async () => {
//       const skip = (currentPage - 1) * 20;
//       const params = {
//         keywords: filters.keywords,
//         dateFrom: filters.dateFrom,
//         dateTo: filters.dateTo,
//         status: filters.status,
//         presenter: filters.presenter.length > 0 ? filters.presenter : undefined, // Correction ici
//         guest: filters.guest.length > 0 ? filters.guest : undefined,
//         skip,
//         limit: 20,
//       };

//       try {
//         const response = await api.get('search_shows', {
//           headers: { Authorization: `Bearer ${token}` },
//           params,
//         });
//         return response.data;
//       } catch (err) {
//         console.error('Erreur lors de la requête API:', err);
//         throw err;
//       }
//     },
//     enabled: !!token && isSearchTriggered,
//   });

//   const handleSearch = (newFilters: SearchFilters) => {
//     setFilters(newFilters);
//     setCurrentPage(1);
//     setIsSearchTriggered(true);
//   };

//   const handleExportCSV = async () => {
//     try {
//       const response = await api.get('/shows/archives/export', {
//         headers: { Authorization: `Bearer ${token}` },
//         params: filters,
//         responseType: 'blob',
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute(
//         'download',
//         `archives_${format(new Date(), 'yyyy-MM-dd')}.csv`
//       );
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       console.error("Erreur lors de l'export:", error);
//     }
//   };

//   const handleResetFilters = () => {
//     setFilters({
//       keywords: '',
//       dateFrom: '',
//       dateTo: '',
//       status: '',
//       presenter: [],
//       guest: [],
//     });
//     setCurrentPage(1);
//     setIsSearchTriggered(false);
//   };

//   return (
//     <div className="space-y-6">
//       <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Archives</h1>
//           <p className="text-gray-600">
//             Recherchez dans les émissions archivées
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="flex items-center bg-white rounded-lg shadow p-1">
//             <button
//               onClick={() => setViewMode('grid')}
//               className={`p-2 rounded ${
//                 viewMode === 'grid'
//                   ? 'bg-indigo-100 text-indigo-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//               title="Vue en grille"
//             >
//               <LayoutGrid className="h-5 w-5" />
//             </button>
//             <button
//               onClick={() => setViewMode('list')}
//               className={`p-2 rounded ${
//                 viewMode === 'list'
//                   ? 'bg-indigo-100 text-indigo-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//               title="Vue en liste"
//             >
//               <List className="h-5 w-5" />
//             </button>
//           </div>
//           <button
//             onClick={handleExportCSV}
//             className="btn btn-secondary flex items-center gap-2"
//           >
//             <Download className="h-5 w-5" />
//             Exporter en CSV
//           </button>
//         </div>
//       </header>

//       <ArchiveSearchForm
//         filters={filters}
//         onSearch={handleSearch}
//         onReset={handleResetFilters}
//       />

//       {isSearchTriggered ? (
//         isLoading ? (
//           <div className="flex justify-center py-12">
//             <div className="spinner" />
//           </div>
//         ) : error ? (
//           error.response?.status === 404 ? (
//             <div className="text-center py-12 bg-white rounded-lg shadow">
//               <p className="text-gray-500">
//                 Aucune émission trouvée pour ces filtres
//               </p>
//             </div>
//           ) : (
//             <div className="text-center py-12 text-red-600">
//               Une erreur est survenue lors de la recherche: {error.message}
//             </div>
//           )
//         ) : (
//           <>
//             {viewMode === 'grid' ? (
//               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                 {data?.data?.map((show) => (
//                   <ArchiveCard
//                     key={show.id}
//                     show={show}
//                     onShowDetail={() => setSelectedShow(show)}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <ArchiveList
//                 shows={data?.data || []}
//                 onShowDetail={(show) => setSelectedShow(show)}
//               />
//             )}

//             {data?.data?.length === 0 && (
//               <div className="text-center py-12 bg-white rounded-lg shadow">
//                 <p className="text-gray-500">Aucune émission trouvée</p>
//               </div>
//             )}

//             {data?.total > 20 && (
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={Math.ceil(data.total / 20)}
//                 onPageChange={setCurrentPage}
//               />
//             )}
//           </>
//         )
//       ) : (
//         <div className="text-center py-12 bg-white rounded-lg shadow">
//           <p className="text-gray-500">
//             Veuillez effectuer une recherche pour voir les résultats
//           </p>
//         </div>
//       )}

//       {selectedShow && (
//         <ArchiveDetailDialog
//           show={selectedShow}
//           isOpen={!!selectedShow}
//           onClose={() => setSelectedShow(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default Archives;
