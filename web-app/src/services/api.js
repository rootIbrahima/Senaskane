import axios from 'axios';

// URL de l'API - Utilise la variable d'environnement en production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth
export const authAPI = {
  verifyCode: (code) => api.post('/auth/code-famille', { codeAcces: code }),
  login: (login, motDePasse) => api.post('/auth/login', { login, motDePasse }),
  register: (data) => api.post('/auth/register', data),
  getMyCode: () => api.get('/auth/mon-code'),
};

// Membres
export const membresAPI = {
  getAll: () => api.get('/membre'),
  getById: (id) => api.get(`/membre/${id}`),
  create: (data) => api.post('/membre', data),
  update: (id, data) => api.put(`/membre/${id}`, data),
  delete: (id) => api.delete(`/membre/${id}`),
  search: (query) => api.get(`/membre/search?q=${query}`),
  uploadPhoto: (id, formData) => api.post(`/membre/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Arbre généalogique
export const arbreAPI = {
  getArbre: () => api.get('/arbre/genealogique'),
  addLien: (data) => api.post('/arbre/liens', data),
  deleteLien: (id) => api.delete(`/arbre/liens/${id}`),
};

// Musée
export const museeAPI = {
  getAll: () => api.get('/musee'),
  getById: (id) => api.get(`/musee/${id}`),
  create: (data) => api.post('/musee', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/musee/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/musee/${id}`),
};

// Cérémonies
export const ceremoniesAPI = {
  getAll: () => api.get('/ceremonie'),
  getById: (id) => api.get(`/ceremonie/${id}`),
  create: (data) => api.post('/ceremonie', data),
  update: (id, data) => api.put(`/ceremonie/${id}`, data),
  delete: (id) => api.delete(`/ceremonie/${id}`),
  // Recettes
  getRecettes: (ceremonieId) => api.get(`/ceremonie/${ceremonieId}/recettes`),
  addRecette: (ceremonieId, data) => api.post(`/ceremonie/${ceremonieId}/recette`, data),
  deleteRecette: (ceremonieId, recetteId) => api.delete(`/ceremonie/${ceremonieId}/recette/${recetteId}`),
  // Dépenses
  getDepenses: (ceremonieId) => api.get(`/ceremonie/${ceremonieId}/depenses`),
  addDepense: (ceremonieId, data) => api.post(`/ceremonie/${ceremonieId}/depense`, data),
  deleteDepense: (ceremonieId, depenseId) => api.delete(`/ceremonie/${ceremonieId}/depense/${depenseId}`),
  // Bilan
  getBilan: (ceremonieId) => api.get(`/ceremonie/${ceremonieId}/bilan`),
};

// Cotisations
export const cotisationAPI = {
  activer: (data) => api.post('/cotisation/activer', data),
  premierConnexion: (data) => api.post('/cotisation/premier-connexion', data),
  getListe: (ceremonieId) => api.get(`/cotisation/liste/${ceremonieId}`),
  enregistrer: (data) => api.post('/cotisation/enregistrer', data),
  annuler: (data) => api.post('/cotisation/annuler', data),
  ajouterDepense: (data) => api.post('/cotisation/depense/ajouter', data),
  getDepenses: (ceremonieId) => api.get(`/cotisation/depenses/${ceremonieId}`),
  getResume: (ceremonieId) => api.get(`/cotisation/resume/${ceremonieId}`),
  exportCotisations: (ceremonieId) => api.get(`/cotisation/export/cotisations/${ceremonieId}`, { responseType: 'blob' }),
  exportDepenses: (ceremonieId) => api.get(`/cotisation/export/depenses/${ceremonieId}`, { responseType: 'blob' }),
};

// Famille
export const familleAPI = {
  getInfo: () => api.get('/famille/info'),
  update: (data) => api.put('/famille/update', data),
  uploadLogo: (formData) => api.post('/famille/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStatistiques: () => api.get('/famille/statistiques'),
};

// Recherche
export const rechercheAPI = {
  lienParente: (membreId1, membreId2) => api.get(`/recherche/lien-parente/${membreId1}/${membreId2}`),
  parLieu: (params) => api.get('/recherche/lieu', { params }),
  parMetier: (params) => api.get('/recherche/metier', { params }),
  parNom: (params) => api.get('/recherche/nom', { params }),
  parNumero: (numero) => api.get(`/recherche/numero/${numero}`),
  avancee: (params) => api.get('/recherche/avancee', { params }),
  descendants: (membreId) => api.get(`/recherche/descendants/${membreId}`),
  ascendants: (membreId) => api.get(`/recherche/ascendants/${membreId}`),
  statistiques: () => api.get('/recherche/statistiques'),
};

// Admin
export const adminAPI = {
  migrateCodeAcces: () => api.post('/admin/migrate-code-acces'),
  checkMigration: () => api.get('/admin/check-migration'),
};

export default api;
