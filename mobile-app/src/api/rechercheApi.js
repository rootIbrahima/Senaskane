import api from './axios';

export const rechercheApi = {
  // Recherche globale
  searchGlobal: async (query) => {
    const response = await api.get(`/recherche?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Rechercher des membres
  searchMembres: async (query) => {
    const response = await api.get(`/recherche/membres?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Rechercher par numéro d'identification
  searchByNumero: async (numero) => {
    const response = await api.get(`/recherche/numero/${numero}`);
    return response.data;
  },

  // Recherche avancée
  searchAvancee: async (filters) => {
    const response = await api.post('/recherche/avancee', filters);
    return response.data;
  },
};
