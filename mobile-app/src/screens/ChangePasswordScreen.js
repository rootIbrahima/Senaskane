import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { authApi } from '../api/authApi';

export const ChangePasswordScreen = ({ navigation }) => {
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');

    if (!ancienMotDePasse.trim()) {
      setError('L\'ancien mot de passe est requis');
      return;
    }

    if (!nouveauMotDePasse.trim()) {
      setError('Le nouveau mot de passe est requis');
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (nouveauMotDePasse !== confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (ancienMotDePasse === nouveauMotDePasse) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword(ancienMotDePasse, nouveauMotDePasse);

      const successMsg = 'Mot de passe modifié avec succès !';

      if (Platform.OS === 'web') {
        alert(successMsg);
      } else {
        Alert.alert('Succès', successMsg, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }

      navigation.goBack();
    } catch (err) {
      console.error('Erreur changement mot de passe:', err);
      const errorMsg = err.response?.data?.error || 'Erreur lors du changement de mot de passe';
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
        <Ionicons name="lock-closed" size={60} color={COLORS.primary} />
        <Text style={styles.title}>Changer le mot de passe</Text>
        <Text style={styles.subtitle}>Créez un nouveau mot de passe sécurisé</Text>
      </View>

      <Card style={styles.card}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ancien mot de passe *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-open" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={ancienMotDePasse}
              onChangeText={setAncienMotDePasse}
              placeholder="Entrez votre ancien mot de passe"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry={!showOldPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
              <Ionicons
                name={showOldPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
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
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons
                name={showNewPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirmer le nouveau mot de passe *</Text>
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
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          Choisissez un mot de passe fort contenant au moins 6 caractères pour sécuriser votre compte.
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
    marginTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
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
  cancelButton: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
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
