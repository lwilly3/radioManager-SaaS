import axios from 'axios'; // Importation d'axios pour faire des requêtes HTTP

// En développement, utiliser le proxy Vite pour éviter les problèmes CORS
// En production, utiliser l'URL directe
const baseURL = import.meta.env.DEV 
  ? '/api/' 
  : 'https://api.radio.audace.ovh/';

const api = axios.create({
  baseURL, // URL de base pour les requêtes HTTP
});

export default api; // Exportation de l'objet api pour pouvoir l'utiliser dans d'autres fichiers
