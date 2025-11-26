import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Button, Input, ErrorMessage } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';

export const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nom_famille: '',
    login: '',
    mot_de_passe: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    setError('');

    // Validation
    if (
      !formData.nom_famille ||
      !formData.login ||
      !formData.mot_de_passe ||
      !formData.nom ||
      !formData.prenom
    ) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.mot_de_passe !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...dataToSend } = formData;
    const result = await register(dataToSend);

    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Inscription réussie',
        'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      setError(result.message);
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
        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez Senaskane</Text>
        </View>

        <View style={styles.form}>
          <ErrorMessage message={error} />

          <Text style={styles.sectionTitle}>Informations de la famille</Text>
          <Input
            label="Nom de la famille *"
            value={formData.nom_famille}
            onChangeText={(value) => handleChange('nom_famille', value)}
            placeholder="Ex: Diop"
          />

          <Text style={styles.sectionTitle}>Identifiants de connexion</Text>
          <Input
            label="Identifiant *"
            value={formData.login}
            onChangeText={(value) => handleChange('login', value)}
            placeholder="Choisissez un identifiant"
            autoCapitalize="none"
          />

          <Input
            label="Mot de passe *"
            value={formData.mot_de_passe}
            onChangeText={(value) => handleChange('mot_de_passe', value)}
            placeholder="Minimum 6 caractères"
            secureTextEntry
          />

          <Input
            label="Confirmer le mot de passe *"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            placeholder="Retapez votre mot de passe"
            secureTextEntry
          />

          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <Input
            label="Nom *"
            value={formData.nom}
            onChangeText={(value) => handleChange('nom', value)}
            placeholder="Votre nom"
          />

          <Input
            label="Prénom *"
            value={formData.prenom}
            onChangeText={(value) => handleChange('prenom', value)}
            placeholder="Votre prénom"
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Téléphone"
            value={formData.telephone}
            onChangeText={(value) => handleChange('telephone', value)}
            placeholder="+221 XX XXX XX XX"
            keyboardType="phone-pad"
          />

          <Button
            title="S'inscrire"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <Button
            title="J'ai déjà un compte"
            onPress={() => navigation.navigate('Login')}
            variant="outline"
            style={styles.loginButton}
          />
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  registerButton: {
    marginTop: SPACING.lg,
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
});
