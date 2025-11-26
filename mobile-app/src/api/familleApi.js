import api from './axios';

export const familleApi = {
  // Obtenir les informations de la famille
  getFamille: async () => {
    const response = await api.get('/famille/info');
    return response.data;
  },

  // Créer une famille
  createFamille: async (data) => {
    const response = await api.post('/famille', data);
    return response.data;
  },

  // Mettre à jour la famille
  updateFamille: async (data) => {
    const response = await api.put('/famille/update', data);
    return response.data;
  },

  // Uploader le logo
  uploadLogo: async (formData) => {
    const response = await api.post('/famille/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtenir les statistiques de la famille
  getStatistiques: async () => {
    const response = await api.get('/famille/statistiques');
    return response.data;
  },
};
