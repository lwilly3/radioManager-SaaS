import axios from 'axios'; // Importation d'axios pour faire des requêtes HTTP

const api = axios.create({
  baseURL: 'https://api.radio.audace.ovh/', // URL de base pour les requêtes HTTP
});

export default api; // Exportation de l'objet api pour pouvoir l'utiliser dans d'autres fichiers
