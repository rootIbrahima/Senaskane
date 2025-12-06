import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, Input, ErrorMessage } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/authApi';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';

export const LoginWithCodeScreen = ({ navigation }) => {
  const [codeAcces, setCodeAcces] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();

  const handleLogin = async () => {
    setError('');

    if (!codeAcces.trim()) {
      setError('Veuillez entrer le code d\'accès');
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.loginWithCode(codeAcces.trim());

      // Sauvegarder le token et les infos de famille
      await setUser({
        token: data.token,
        famille: data.famille,
        authMethod: 'code_famille'
      });

      // Navigation automatique vers HomeScreen via AuthContext
    } catch (err) {
      console.error('Erreur connexion par code:', err);
      setError(
        err.response?.data?.error ||
        'Code d\'accès invalide. Veuillez vérifier et réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="key" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Accès Famille</Text>
          <Text style={styles.subtitle}>
            Entrez le code d'accès de votre famille pour vous connecter
          </Text>
        </View>

        <View style={styles.form}>
          <ErrorMessage message={error} />

          <View style={styles.codeInputContainer}>
            <Input
              label="Code d'accès"
              value={codeAcces}
              onChangeText={(text) => setCodeAcces(text.toUpperCase())}
              placeholder="ABCD1234"
              autoCapitalize="characters"
              maxLength={8}
              style={styles.codeInput}
            />
            <Text style={styles.codeHint}>
              8 caractères (lettres et chiffres)
            </Text>
          </View>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Le code d'accès vous a été partagé par un membre de votre famille.
              Si vous ne l'avez pas, contactez l'administrateur de votre famille.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  form: {
    width: '100%',
  },
  codeInputContainer: {
    marginBottom: SPACING.md,
  },
  codeInput: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  codeHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});
