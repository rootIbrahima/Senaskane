import api from './axios';

export const bandePassanteApi = {
  // Obtenir tous les messages
  getMessages: async () => {
    const response = await api.get('/bande-passante');
    return response.data;
  },

  // Obtenir un message par ID
  getMessageById: async (id) => {
    const response = await api.get(`/bande-passante/${id}`);
    return response.data;
  },

  // Créer un message (admin uniquement)
  createMessage: async (data) => {
    const response = await api.post('/bande-passante', data);
    return response.data;
  },

  // Mettre à jour un message
  updateMessage: async (id, data) => {
    const response = await api.put(`/bande-passante/${id}`, data);
    return response.data;
  },

  // Supprimer un message
  deleteMessage: async (id) => {
    const response = await api.delete(`/bande-passante/${id}`);
    return response.data;
  },
};
