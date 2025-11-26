import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { Loading } from './src/components';

const Navigation = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading text="Chargement..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Navigation />
    </AuthProvider>
  );
}
