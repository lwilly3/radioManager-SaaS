// Script pour insérer des citations de test dans Firestore
// Usage: node scripts/seed-quotes.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBvH8rMP0WUAgLhab0Xum-S6tqhALOp95A",
  authDomain: "media-manager-23e89.firebaseapp.com",
  projectId: "media-manager-23e89",
  storageBucket: "media-manager-23e89.firebasestorage.app",
  messagingSenderId: "839933182393",
  appId: "1:839933182393:web:7d51e0c9969bd2544ef668",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testQuotes = [
  {
    content: "La radio est le théâtre de l'esprit",
    author: {
      id: "author-1",
      name: "Jean Dupont",
      role: "guest",
    },
    context: {
      date: new Date('2026-01-12T10:00:00Z'),
      timestamp: "00:15:30"
    },
    source: {
      type: "manual",
    },
    metadata: {
      category: "quote",
      tags: ["radio", "média", "culture"],
      language: "fr",
      isVerified: true,
    },
    publications: [],
    status: "draft",
    createdBy: "test-user",
  },
  {
    content: "L'information est le pouvoir du XXIe siècle",
    author: {
      id: "author-2",
      name: "Marie Martin",
      role: "presenter",
    },
    context: {
      date: new Date('2026-01-11T14:30:00Z'),
      timestamp: "00:45:00"
    },
    source: {
      type: "manual",
    },
    metadata: {
      category: "statement",
      tags: ["information", "actualité", "société"],
      language: "fr",
      isVerified: true,
    },
    publications: [],
    status: "approved",
    createdBy: "test-user",
  },
  {
    content: "Le journalisme, c'est publier ce que quelqu'un ne veut pas que vous publiiez. Tout le reste, c'est de la communication.",
    author: {
      id: "author-3",
      name: "Sophie Bernard",
      role: "guest",
    },
    context: {
      date: new Date('2026-01-10T09:15:00Z'),
      timestamp: "01:20:15"
    },
    source: {
      type: "manual",
    },
    metadata: {
      category: "position",
      tags: ["journalisme", "médias", "liberté de presse"],
      language: "fr",
      isVerified: true,
    },
    publications: [
      {
        id: "pub-1",
        platform: "twitter",
        publishedAt: new Date('2026-01-10T15:00:00Z').toISOString(),
        postUrl: "https://twitter.com/radio/status/123456",
        status: "published",
        template: "default",
        generatedContent: "Le journalisme, c'est publier ce que quelqu'un ne veut pas que vous publiiez... #Journalisme #LibertéDePresse",
      }
    ],
    status: "published",
    createdBy: "test-user",
  },
  {
    content: "La musique est une langue universelle qui transcende les frontières",
    author: {
      id: "author-4",
      name: "Pierre Dubois",
      role: "presenter",
    },
    context: {
      date: new Date('2026-01-09T16:00:00Z'),
      timestamp: "00:30:00"
    },
    source: {
      type: "manual",
    },
    metadata: {
      category: "quote",
      tags: ["musique", "culture", "art"],
      language: "fr",
      isVerified: true,
    },
    publications: [],
    status: "approved",
    createdBy: "test-user",
  },
  {
    content: "Les réseaux sociaux ont changé la façon dont nous communiquons, mais pas toujours en bien",
    author: {
      id: "author-5",
      name: "Claire Lefebvre",
      role: "guest",
    },
    context: {
      date: new Date('2026-01-08T11:30:00Z'),
      timestamp: "00:52:00"
    },
    source: {
      type: "manual",
    },
    metadata: {
      category: "position",
      tags: ["réseaux sociaux", "communication", "société"],
      language: "fr",
      isVerified: false,
    },
    publications: [],
    status: "draft",
    createdBy: "test-user",
  },
];

async function seedQuotes() {
  console.log('🌱 Insertion des citations de test...\n');

  try {
    for (const quote of testQuotes) {
      const docRef = await addDoc(collection(db, 'quotes'), {
        ...quote,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Citation ajoutée: ${docRef.id} - "${quote.content.substring(0, 50)}..."`);
    }

    console.log(`\n✨ ${testQuotes.length} citations ajoutées avec succès!`);
    console.log('\n📍 Accédez à http://localhost:5173/quotes pour les voir\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion:', error);
    process.exit(1);
  }
}

seedQuotes();
