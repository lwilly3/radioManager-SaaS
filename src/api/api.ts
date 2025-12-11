import axios from 'axios'; // Importation d'axios pour faire des requêtes HTTP

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.cloud.audace.ovh', // URL de base pour les requêtes HTTPS (sans slash final)
});

export default api; // Exportation de l'objet api pour pouvoir l'utiliser dans d'autres fichiers
