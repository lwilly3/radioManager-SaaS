import { ShowPlan, Status } from '../types';

// Statuts disponibles
const statuses: Record<string, Status> = {
  preparation: {
    id: 'preparation',
    name: 'En préparation',
    color: '#FCD34D',
    priority: 1,
  },
  attenteDiffusion: {
    id: 'attente-diffusion',
    name: 'En attente de diffusion',
    color: '#F97316',
    priority: 2,
  },
  enCours: {
    id: 'en-cours',
    name: 'En cours',
    color: '#EF4444',
    priority: 3,
  },
  termine: {
    id: 'termine',
    name: 'Terminé',
    color: '#34D399',
    priority: 4,
  },
};

// Présentateurs fictifs
const presenters = [
  {
    id: '1',
    name: 'Sarah Martin',
    profilePicture:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    contact: {
      email: 'sarah.martin@radio.fr',
      phone: '+33612345678',
    },
    isMainPresenter: true,
  },
  {
    id: '2',
    name: 'Thomas Dubois',
    profilePicture:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    contact: {
      email: 'thomas.dubois@radio.fr',
      phone: '+33623456789',
    },
  },
];

// Invités fictifs
const guests = [
  {
    id: '1',
    name: 'Marie Lambert',
    role: 'expert',
    biography: 'Experte en économie et développement durable',
    contact: {
      email: 'marie.lambert@email.com',
      phone: '+33634567890',
    },
  },
  {
    id: '2',
    name: 'Pierre Durand',
    role: 'artist',
    biography: 'Artiste contemporain reconnu internationalement',
    contact: {
      email: 'pierre.durand@email.com',
      phone: '+33645678901',
    },
  },
];

// Conducteurs fictifs
export const mockShowPlans: ShowPlan[] = [
  {
    id: 2,
    emission: 'emission 1',
    emission_id: 1,
    title: "train d'audace",
    type: 'Talk bebat',
    broadcast_date: '2024-12-19T20:00:00',
    duration: 120,
    frequency: 'Daily',
    description: 'An engaging evening talk show.',
    status: 'preparation',
    presenters: [
      {
        id: 1,
        name: 'willy happi',
        contact_info: null,
        biography: null,
        isMainPresenter: false,
      },
    ],
    segments: [
      {
        id: 1,
        title: 'Opening Remarks',
        type: 'Introduction',
        duration: 10,
        description: 'Welcome and introduction.',
        startTime: '20:10',
        position: 1,
        technical_notes: null,
        guests: [],
      },
      {
        id: 2,
        title: 'Expert Discussion',
        type: 'Panel',
        duration: 90,
        description: 'Discussion with invited experts.',
        startTime: '20:10',
        position: 2,
        technical_notes: null,
        guests: [
          {
            id: 1,
            name: 'serges Ngola000',
            contact_info: null,
            biography: 'proffesseur  de theatre a yaoundecxjcxcxjcxc,xmcx',
            role: 'Journaliste',
            avatar: null,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    emission: 'emission 2',
    emission_id: 2,
    title: 'midi-info',
    type: 'talk-show',
    broadcast_date: '2025-01-02T19:31:00',
    duration: 10,
    frequency: 'Daily',
    description: 'svfsfgbgdfghsfsf',
    status: 'En attente de diffusion',
    presenters: [],
    segments: [
      {
        id: 3,
        title: 'dsdsdsdvv',
        type: 'other',
        duration: 5,
        description: 'cvxcvxcvxcvxcvxc',
        startTime: '20:10',
        position: 1,
        technical_notes: null,
        guests: [
          {
            id: 4,
            name: 'Happi Willy2',
            contact_info: null,
            biography: 'x zc zc cx cC. C C. ',
            role: 'Athlète',
            avatar: null,
          },
        ],
      },
      {
        id: 4,
        title: '  zxmc zxc zc',
        type: 'music',
        duration: 5,
        description: 'cmxcxcxcxmc',
        startTime: '20:10',
        position: 2,
        technical_notes: null,
        guests: [],
      },
    ],
  },
  {
    id: 4,
    emission: 'emission 2',
    emission_id: 2,
    title: 'midi-info',
    type: 'news',
    broadcast_date: '2025-01-02T22:18:00',
    duration: 10,
    frequency: 'Daily',
    description: 'vdfdfdfdfdfdfdfdfdf',
    status: 'En attente de diffusion',
    presenters: [],
    segments: [
      {
        id: 5,
        title: 'xxxxxxx',
        type: 'intro',
        duration: 5,
        description: '',
        startTime: '20:10',
        position: 1,
        technical_notes: null,
        guests: [
          {
            id: 4,
            name: 'Happi Willy2',
            contact_info: null,
            biography: 'x zc zc cx cC. C C. ',
            role: 'Athlète',
            avatar: null,
          },
          {
            id: 8,
            name: 'test',
            contact_info: null,
            biography: 'cxjvkxvxvxc msdv sv. v',
            role: 'Expert',
            avatar: null,
          },
        ],
      },
      {
        id: 6,
        title: 'vfdfgdgdgd',
        type: 'other',
        duration: 5,
        description: '',
        startTime: '20:10',
        position: 2,
        technical_notes: null,
        guests: [
          {
            id: 5,
            name: 'MARIE CLAIRE',
            contact_info: null,
            biography: ' ccvcpkfdifdoffdfdoi',
            role: 'Écrivain',
            avatar: null,
          },
          {
            id: 8,
            name: 'test',
            contact_info: null,
            biography: 'cxjvkxvxvxc msdv sv. v',
            role: 'Expert',
            avatar: null,
          },
        ],
      },
    ],
  },
];

// // Conducteurs fictifs
// export const mockShowPlans: ShowPlan[] = [
//   {
//     id: '1',
//     title: 'matinale',
//     showType: 'morning-show',
//     date: '2024-03-20T06:00:00.000Z',
//     description: 'La matinale d\'information avec les dernières actualités',
//     status: statuses.enCours,
//     segments: [
//       {
//         id: '1',
//         title: 'Introduction et titres',
//         duration: 5,
//         type: 'intro',
//         description: 'Présentation des titres du jour',
//         startTime: '06:00',
//       },
//       {
//         id: '2',
//         title: 'Journal',
//         duration: 15,
//         type: 'news',
//         description: 'Les principales actualités du jour',
//         startTime: '06:05',
//       },
//       {
//         id: '3',
//         title: 'Interview économie',
//         duration: 20,
//         type: 'interview',
//         description: 'Interview avec Marie Lambert sur la situation économique',
//         startTime: '06:20',
//         guests: ['1'],
//       }
//     ],
//     presenters: [presenters[0], presenters[1]],
//     guests: [guests[0]]
//   },
//   {
//     id: '2',
//     title: 'culture-mag',
//     showType: 'cultural',
//     date: '2024-03-20T14:00:00.000Z',
//     description: 'Magazine culturel avec focus sur l\'art contemporain',
//     status: statuses.attenteDiffusion,
//     segments: [
//       {
//         id: '1',
//         title: 'Introduction',
//         duration: 5,
//         type: 'intro',
//         description: 'Présentation du magazine',
//         startTime: '14:00',
//       },
//       {
//         id: '2',
//         title: 'Interview artiste',
//         duration: 30,
//         type: 'interview',
//         description: 'Rencontre avec Pierre Durand',
//         startTime: '14:05',
//         guests: ['2'],
//       },
//       {
//         id: '3',
//         title: 'Agenda culturel',
//         duration: 10,
//         type: 'other',
//         description: 'Les événements culturels à ne pas manquer',
//         startTime: '14:35',
//       }
//     ],
//     presenters: [presenters[0]],
//     guests: [guests[1]]
//   },
//   {
//     id: '3',
//     title: 'debat-soir',
//     showType: 'debate',
//     date: '2024-03-19T20:00:00.000Z',
//     description: 'Le grand débat du soir sur les enjeux sociétaux',
//     status: statuses.termine,
//     segments: [
//       {
//         id: '1',
//         title: 'Introduction du débat',
//         duration: 10,
//         type: 'intro',
//         description: 'Présentation du thème et des invités',
//         startTime: '20:00',
//       },
//       {
//         id: '2',
//         title: 'Débat principal',
//         duration: 45,
//         type: 'interview',
//         description: 'Discussion avec les invités',
//         startTime: '20:10',
//         guests: ['1', '2'],
//       },
//       {
//         id: '3',
//         title: 'Conclusion',
//         duration: 5,
//         type: 'outro',
//         description: 'Synthèse des échanges',
//         startTime: '20:55',
//       }
//     ],
//     presenters: [presenters[0], presenters[1]],
//     guests: [guests[0], guests[1]]
//   }
// ];
