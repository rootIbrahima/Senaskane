import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'authentification:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginUsername, password) => {
    try {
      const response = await authApi.login(loginUsername, password);

      if (response.token && response.utilisateur) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.utilisateur));

        setUser(response.utilisateur);
        setIsAuthenticated(true);

        return { success: true };
      }

      return { success: false, message: 'Réponse invalide du serveur' };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Erreur de connexion',
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await authApi.register(data);
      return { success: true, data: response };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Erreur d\'inscription',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
