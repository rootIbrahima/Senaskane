import api from './axios';

export const authApi = {
  // Connexion
  login: async (login, password) => {
    const response = await api.post('/auth/login', { login, motDePasse: password });
    return response.data;
  },

  // Inscription
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Vérifier le token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      ancien_mot_de_passe: oldPassword,
      nouveau_mot_de_passe: newPassword,
    });
    return response.data;
  },

  // Activer un compte
  activateAccount: async (data) => {
    const response = await api.post('/auth/activer-compte', data);
    return response.data;
  },

  // Connexion avec code d'accès famille
  loginWithCode: async (codeAcces) => {
    const response = await api.post('/auth/code-famille', { codeAcces });
    return response.data;
  },

  // Récupérer le code d'accès de ma famille
  getMyCode: async () => {
    const response = await api.get('/auth/mon-code');
    return response.data;
  },

  // Générer un nouveau code pour ma famille
  generateNewCode: async (familleId) => {
    const response = await api.post(`/auth/generer-code/${familleId}`);
    return response.data;
  },
};
