import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { authApi } from '../api/authApi';

export const ActivateAccountScreen = ({ navigation }) => {
  const [codeActivation, setCodeActivation] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setError('');

    // Validation
    if (!codeActivation.trim()) {
      setError('Le code d\'activation est requis');
      return;
    }

    if (!nouveauMotDePasse.trim()) {
      setError('Le mot de passe est requis');
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (nouveauMotDePasse !== confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.activateAccount({
        codeActivation: codeActivation.trim(),
        nouveauMotDePasse,
      });

      const successMsg = response.message || 'Compte activé avec succès ! Vous pouvez maintenant vous connecter.';

      if (Platform.OS === 'web') {
        alert(successMsg);
      } else {
        Alert.alert('Succès', successMsg, [
          {
            text: 'Se connecter',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      }

      // Rediriger vers l'écran de connexion
      navigation.navigate('Login');
    } catch (err) {
      console.error('Erreur activation:', err);
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'activation du compte';
      setError(errorMsg);

      if (Platform.OS === 'web') {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="key" size={60} color={COLORS.primary} />
        <Text style={styles.title}>Activer votre compte</Text>
        <Text style={styles.subtitle}>
          Entrez le code d'activation reçu et créez votre mot de passe
        </Text>
      </View>

      <Card style={styles.card}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Code d'activation *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={codeActivation}
              onChangeText={setCodeActivation}
              placeholder="Ex: ABC123"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>
          <Text style={styles.hint}>
            Le code d'activation vous a été communiqué par l'administrateur
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nouveau mot de passe *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={nouveauMotDePasse}
              onChangeText={setNouveauMotDePasse}
              placeholder="Minimum 6 caractères"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirmer le mot de passe *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={confirmMotDePasse}
              onChangeText={setConfirmMotDePasse}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleActivate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Activation en cours...' : 'Activer mon compte'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>
            Retour à la connexion
          </Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          Une fois votre compte activé, vous pourrez vous connecter avec votre login et le mot de passe que vous venez de créer.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  card: {
    padding: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    lineHeight: 20,
  },
});
