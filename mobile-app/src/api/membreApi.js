import api from './axios';

export const membreApi = {
  // Obtenir tous les membres
  getMembres: async () => {
    const response = await api.get('/membre/liste');
    return response.data.data || [];
  },

  // Obtenir un membre par ID
  getMembreById: async (id) => {
    const response = await api.get(`/membre/${id}`);
    return response.data;
  },

  // Créer un membre
  createMembre: async (data) => {
    const response = await api.post('/membre/ajouter', data);
    return response.data;
  },

  // Mettre à jour un membre
  updateMembre: async (id, data) => {
    const response = await api.put(`/membre/${id}`, data);
    return response.data;
  },

  // Supprimer un membre
  deleteMembre: async (id) => {
    const response = await api.delete(`/membre/${id}`);
    return response.data;
  },

  // Uploader une photo
  uploadPhoto: async (id, formData) => {
    const response = await api.post(`/membre/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtenir l'arbre généalogique
  getArbreGenealogique: async () => {
    const response = await api.get('/membre/arbre');
    return response.data;
  },

  // Ajouter un lien parental
  addLienParental: async (data) => {
    const response = await api.post('/membre/lien-parental', data);
    return response.data;
  },

  // Supprimer un lien parental
  deleteLienParental: async (id) => {
    const response = await api.delete(`/membre/lien-parental/${id}`);
    return response.data;
  },

  // Ajouter un mariage
  addMariage: async (data) => {
    const response = await api.post('/membre/mariage', data);
    return response.data;
  },

  // Supprimer un mariage
  deleteMariage: async (id) => {
    const response = await api.delete(`/membre/mariage/${id}`);
    return response.data;
  },

  // Modifier un mariage
  updateMariage: async (id, data) => {
    const response = await api.put(`/membre/mariage/${id}`, data);
    return response.data;
  },

  // Rechercher par nom/prénom
  rechercherParNom: async (nom) => {
    console.log('🔍 Recherche par nom - Input:', nom);
    console.log('🔍 Recherche par nom - Type:', typeof nom);
    console.log('🔍 Recherche par nom - Encoded:', encodeURIComponent(nom));
    const response = await api.get(`/membre/recherche/nom/${encodeURIComponent(nom)}`);
    console.log('✅ Réponse recherche:', response.data);
    // Extraire le tableau 'data' de la réponse
    return response.data.data || response.data;
  },

  // Rechercher par profession
  rechercherParProfession: async (profession) => {
    const response = await api.get(`/membre/recherche/metier/${encodeURIComponent(profession)}`);
    // Extraire le tableau 'data' de la réponse
    return response.data.data || response.data;
  },

  // Rechercher par lieu de résidence
  rechercherParLieu: async (lieu) => {
    const response = await api.get(`/membre/recherche/lieu/${encodeURIComponent(lieu)}`);
    // Extraire le tableau 'data' de la réponse
    return response.data.data || response.data;
  },

  // Trouver le lien de parenté entre 2 membres
  trouverLienParente: async (membreId1, membreId2) => {
    const response = await api.post('/membre/recherche/lien-parente', {
      membreId1,
      membreId2
    });
    // Extraire l'objet 'data' de la réponse
    return response.data.data || response.data;
  },
};
