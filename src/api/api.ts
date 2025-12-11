import axios from 'axios'; // Client HTTP partagé pour toutes les requêtes API

const DEFAULT_API_BASE_URL = 'https://api.cloud.audace.ovh';

// Normalise l'URL (supprime un éventuel slash final) et applique un fallback
const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

export { API_BASE_URL };
export default api; // Instance Axios centralisée
