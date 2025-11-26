import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/config';

import {
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  MembresScreen,
  AjouterMembreScreen,
  ModifierMembreScreen,
  MembreDetailScreen,
  CeremoniesScreen,
  MuseeScreen,
  ArbreGenealogiqueScreen,
  ProfileScreen,
  ChangePasswordScreen,
  FamilleInfoScreen,
  AboutScreen,
  AjouterCeremoniesScreen,
  CeremonieDetailScreen,
  GestionFinanciereScreen,
  AjouterObjetMuseeScreen,
  ObjetMuseeDetailScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Membres') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Ceremonies') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen
        name="Membres"
        component={MembresScreen}
        options={{ title: 'Membres' }}
      />
      <Tab.Screen
        name="Ceremonies"
        component={CeremoniesScreen}
        options={{ title: 'Cérémonies' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Musee"
        component={MuseeScreen}
        options={{ title: 'Musée Familial' }}
      />
      <Stack.Screen
        name="ArbreGenealogique"
        component={ArbreGenealogiqueScreen}
        options={{ title: 'Arbre Généalogique' }}
      />
      <Stack.Screen
        name="AjouterMembre"
        component={AjouterMembreScreen}
        options={{ title: 'Ajouter un membre' }}
      />
      <Stack.Screen
        name="ModifierMembre"
        component={ModifierMembreScreen}
        options={{ title: 'Modifier un membre' }}
      />
      <Stack.Screen
        name="MembreDetail"
        component={MembreDetailScreen}
        options={{ title: 'Détails du membre' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Changer le mot de passe' }}
      />
      <Stack.Screen
        name="FamilleInfo"
        component={FamilleInfoScreen}
        options={{ title: 'Informations de la famille' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'À propos' }}
      />
      <Stack.Screen
        name="AjouterCeremonie"
        component={AjouterCeremoniesScreen}
        options={{ title: 'Ajouter une cérémonie' }}
      />
      <Stack.Screen
        name="CeremonieDetail"
        component={CeremonieDetailScreen}
        options={{ title: 'Détails de la cérémonie' }}
      />
      <Stack.Screen
        name="GestionFinanciere"
        component={GestionFinanciereScreen}
        options={{ title: 'Gestion Financière' }}
      />
      <Stack.Screen
        name="AjouterObjet"
        component={AjouterObjetMuseeScreen}
        options={{ title: 'Ajouter au musée' }}
      />
      <Stack.Screen
        name="ObjetDetail"
        component={ObjetMuseeDetailScreen}
        options={{ title: 'Détails de l\'objet' }}
      />
    </Stack.Navigator>
  );
};
