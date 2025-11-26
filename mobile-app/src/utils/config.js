// Configuration de l'application
import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig?.extra?.apiUrl ||
  'http://localhost:3000/api';

export const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  secondary: '#FF6F00',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};
