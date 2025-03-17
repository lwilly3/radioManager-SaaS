import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBvH8rMP0WUAgLhab0Xum-S6tqhALOp95A",
  authDomain: "media-manager-23e89.firebaseapp.com",
  projectId: "media-manager-23e89",
  storageBucket: "media-manager-23e89.firebasestorage.app",
  messagingSenderId: "839933182393",
  appId: "1:839933182393:web:7d51e0c9969bd2544ef668",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);