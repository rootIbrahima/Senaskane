import api from './axios';

export const cotisationApi = {
  // Obtenir toutes les cotisations
  getCotisations: async () => {
    const response = await api.get('/cotisation');
    return response.data;
  },

  // Obtenir une cotisation par ID
  getCotisationById: async (id) => {
    const response = await api.get(`/cotisation/${id}`);
    return response.data;
  },

  // Créer une cotisation
  createCotisation: async (data) => {
    const response = await api.post('/cotisation', data);
    return response.data;
  },

  // Mettre à jour une cotisation
  updateCotisation: async (id, data) => {
    const response = await api.put(`/cotisation/${id}`, data);
    return response.data;
  },

  // Supprimer une cotisation
  deleteCotisation: async (id) => {
    const response = await api.delete(`/cotisation/${id}`);
    return response.data;
  },

  // Générer un rapport PDF
  generateRapport: async () => {
    const response = await api.get('/cotisation/rapport', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Obtenir les statistiques
  getStatistiques: async () => {
    const response = await api.get('/cotisation/statistiques');
    return response.data;
  },
};
