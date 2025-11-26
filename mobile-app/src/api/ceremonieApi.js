import api from './axios';

export const ceremonieApi = {
  // Obtenir toutes les cérémonies
  getCeremonies: async (params = {}) => {
    const response = await api.get('/ceremonie/liste', { params });
    return response.data.data || [];
  },

  // Obtenir une cérémonie par ID
  getCeremonieById: async (id) => {
    const response = await api.get(`/ceremonie/${id}`);
    return response.data.data;
  },

  // Créer une cérémonie
  createCeremonie: async (data) => {
    const response = await api.post('/ceremonie/ajouter', data);
    return response.data;
  },

  // Mettre à jour une cérémonie
  updateCeremonie: async (id, data) => {
    const response = await api.put(`/ceremonie/${id}`, data);
    return response.data;
  },

  // Supprimer une cérémonie
  deleteCeremonie: async (id) => {
    const response = await api.delete(`/ceremonie/${id}`);
    return response.data;
  },

  // ==================== Gestion financière ====================

  // Ajouter une recette
  addRecette: async (ceremonieId, data) => {
    const response = await api.post(`/ceremonie/${ceremonieId}/recette`, data);
    return response.data;
  },

  // Obtenir toutes les recettes
  getRecettes: async (ceremonieId) => {
    const response = await api.get(`/ceremonie/${ceremonieId}/recettes`);
    return response.data.data || [];
  },

  // Supprimer une recette
  deleteRecette: async (ceremonieId, recetteId) => {
    const response = await api.delete(`/ceremonie/${ceremonieId}/recette/${recetteId}`);
    return response.data;
  },

  // Ajouter une dépense
  addDepense: async (ceremonieId, data) => {
    const response = await api.post(`/ceremonie/${ceremonieId}/depense`, data);
    return response.data;
  },

  // Obtenir toutes les dépenses
  getDepenses: async (ceremonieId) => {
    const response = await api.get(`/ceremonie/${ceremonieId}/depenses`);
    return response.data.data || [];
  },

  // Supprimer une dépense
  deleteDepense: async (ceremonieId, depenseId) => {
    const response = await api.delete(`/ceremonie/${ceremonieId}/depense/${depenseId}`);
    return response.data;
  },

  // Obtenir le bilan financier
  getBilan: async (ceremonieId) => {
    const response = await api.get(`/ceremonie/${ceremonieId}/bilan`);
    return response.data.data;
  },

  // Ajouter un organisateur
  addOrganisateur: async (ceremonieId, membreId) => {
    const response = await api.post(`/ceremonie/${ceremonieId}/organisateur`, { membreId });
    return response.data;
  },
};
