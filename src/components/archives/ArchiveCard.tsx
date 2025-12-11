import React from 'react';
import { Clock, Users, Calendar, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Presenter {
  id: number;
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}

interface ArchiveCardProps {
  show: {
    id: string;
    title: string;
    emission: string;
    broadcast_date: string;
    duration: number;
    presenters: Presenter[]; // Changement ici : tableau d’objets
    status: string;
  };
  onShowDetail: () => void;
}

const ArchiveCard: React.FC<ArchiveCardProps> = ({ show, onShowDetail }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {show.title}
              </h3>
              <p className="text-sm text-indigo-600 font-medium">
                {show.emission}
              </p>
            </div>
            <span className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              {show.status}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(show.broadcast_date), 'dd MMMM yyyy à HH:mm', {
                locale: fr,
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{show.duration} minutes</span>
          </div>

          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            <span>
              {show.presenters.length > 0
                ? show.presenters.map((p) => p.name).join(', ')
                : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <button
          onClick={onShowDetail}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Voir les détails
        </button>
      </div>
    </div>
  );
};

export default ArchiveCard;

// import React from 'react';
// import { Clock, Users, Calendar, Radio } from 'lucide-react';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';

// interface ArchiveCardProps {
//   show: {
//     id: string;
//     title: string;
//     emission: string;
//     broadcast_date: string;
//     duration: number;
//     presenters: string;
//     status: string;
//   };
//   onShowDetail: () => void;
// }

// const ArchiveCard: React.FC<ArchiveCardProps> = ({ show, onShowDetail }) => {
//   return (
//     <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
//       <div className="p-4">
//         <div className="flex justify-between items-start mb-4">
//           <div>
//             <div className="flex flex-col gap-1">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {show.title}
//               </h3>
//               <p className="text-sm text-indigo-600 font-medium">
//                 {show.emission}
//               </p>
//             </div>
//             <span className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
//               {show.status}
//             </span>
//           </div>
//         </div>

//         <div className="space-y-2 text-sm text-gray-600">
//           <div className="flex items-center gap-2">
//             <Calendar className="h-4 w-4" />
//             <span>
//               {format(new Date(show.broadcast_date), 'dd MMMM yyyy à HH:mm', {
//                 locale: fr,
//               })}
//             </span>
//           </div>

//           <div className="flex items-center gap-2">
//             <Clock className="h-4 w-4" />
//             <span>{show.duration} minutes</span>
//           </div>

//           <div className="flex items-center gap-2">
//             <Radio className="h-4 w-4" />
//             {/* <span>{show.presenters}</span> */}
//           </div>
//         </div>
//       </div>

//       <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
//         <button
//           onClick={onShowDetail}
//           className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
//         >
//           Voir les détails
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ArchiveCard;
