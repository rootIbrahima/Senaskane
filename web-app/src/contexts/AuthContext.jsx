import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [famille, setFamille] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedFamille = localStorage.getItem('famille');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedFamille) {
        setFamille(JSON.parse(savedFamille));
      }
    }
    setLoading(false);
  }, []);

  const loginWithCode = async (code) => {
    try {
      const response = await authAPI.verifyCode(code);
      const { token, famille: familleData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('famille', JSON.stringify(familleData));

      // Pour connexion par code, on stocke aussi un user simplifié
      const familleUser = {
        familleId: familleData.id,
        familleName: familleData.nom,
        authMethod: 'code_famille'
      };
      localStorage.setItem('user', JSON.stringify(familleUser));

      setFamille(familleData);
      setUser(familleUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Code d\'accès invalide'
      };
    }
  };

  const loginAdmin = async (login, motDePasse) => {
    try {
      const response = await authAPI.login(login, motDePasse);
      const { utilisateur, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(utilisateur));

      setUser(utilisateur);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Identifiants invalides'
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const { utilisateur, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(utilisateur));

      setUser(utilisateur);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Erreur lors de l\'inscription'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('famille');
    setUser(null);
    setFamille(null);
  };

  const value = {
    user,
    famille,
    loading,
    loginWithCode,
    loginAdmin,
    register,
    logout,
    isAuthenticated: !!user || !!famille,
    isAdmin: !!user && user.authMethod !== 'code_famille',
    isReadOnly: !!user && user.authMethod === 'code_famille',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
