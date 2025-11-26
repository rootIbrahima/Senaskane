import api from './axios';

export const museeApi = {
  // Obtenir tous les objets du musée
  getObjets: async () => {
    const response = await api.get('/musee/liste');
    return response.data.data || [];
  },

  // Obtenir un objet par ID
  getObjetById: async (id) => {
    const response = await api.get(`/musee/${id}`);
    return response.data.data;
  },

  // Créer un objet (avec FormData pour l'image)
  createObjet: async (formData) => {
    const response = await api.post('/musee/ajouter', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Mettre à jour un objet
  updateObjet: async (id, formData) => {
    const response = await api.put(`/musee/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supprimer un objet
  deleteObjet: async (id) => {
    const response = await api.delete(`/musee/${id}`);
    return response.data;
  },
};
