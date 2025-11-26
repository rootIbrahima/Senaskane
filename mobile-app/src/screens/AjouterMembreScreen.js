import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { membreApi } from '../api/membreApi';

export const AjouterMembreScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    sexe: 'M',
    dateNaissance: '',
    lieuNaissance: '',
    profession: '',
    lieuResidence: '',
    nomConjoint: '',
    email: '',
    telephone: '',
    informationsSupplementaires: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom) {
      setError('Le nom et le prénom sont requis');
      return false;
    }
    if (!formData.sexe) {
      setError('Le sexe est requis');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Préparer les données pour l'API
      const dataToSend = {
        nom: formData.nom,
        prenom: formData.prenom,
        sexe: formData.sexe,
        dateNaissance: formData.dateNaissance || null,
        lieuNaissance: formData.lieuNaissance || null,
        profession: formData.profession || null,
        lieuResidence: formData.lieuResidence || null,
        nomConjoint: formData.nomConjoint || null,
        email: formData.email || null,
        telephone: formData.telephone || null,
        informationsSupplementaires: formData.informationsSupplementaires || null,
      };

      const response = await membreApi.createMembre(dataToSend);

      // Vérifier si un compte utilisateur a été créé
      if (response.data?.compteUtilisateur) {
        const compte = response.data.compteUtilisateur;
        const message = `Membre ajouté avec succès !\n\n` +
          `Un compte utilisateur a été créé :\n` +
          `Login: ${compte.login}\n` +
          `Mot de passe: ${compte.motDePasse}\n` +
          `Code d'activation: ${compte.codeActivation}\n\n` +
          `Communiquez ces identifiants au membre.`;

        if (Platform.OS === 'web') {
          alert(message);
        } else {
          Alert.alert('Succès', message);
        }
      } else {
        if (Platform.OS === 'web') {
          alert('Membre ajouté avec succès !');
        } else {
          Alert.alert('Succès', 'Membre ajouté avec succès !');
        }
      }

      navigation.goBack();
    } catch (err) {
      console.error('Erreur lors de l\'ajout du membre:', err);
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'ajout du membre';
      setError(errorMsg);

      if (Platform.OS === 'web') {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Section Informations essentielles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Informations essentielles</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <Ionicons name="text-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.nom}
                onChangeText={(value) => handleChange('nom', value)}
                placeholder="Nom de famille"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Prénom <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <Ionicons name="text-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.prenom}
                onChangeText={(value) => handleChange('prenom', value)}
                placeholder="Prénom"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sexe <Text style={styles.required}>*</Text></Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, formData.sexe === 'M' && styles.genderButtonActive]}
                onPress={() => handleChange('sexe', 'M')}
              >
                <Ionicons
                  name="male"
                  size={24}
                  color={formData.sexe === 'M' ? COLORS.white : COLORS.primary}
                />
                <Text style={[styles.genderText, formData.sexe === 'M' && styles.genderTextActive]}>
                  Masculin
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, formData.sexe === 'F' && styles.genderButtonActive]}
                onPress={() => handleChange('sexe', 'F')}
              >
                <Ionicons
                  name="female"
                  size={24}
                  color={formData.sexe === 'F' ? COLORS.white : COLORS.error}
                />
                <Text style={[styles.genderText, formData.sexe === 'F' && styles.genderTextActive]}>
                  Féminin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de naissance</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <input
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => handleChange('dateNaissance', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    paddingLeft: '8px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    color: '#1a1a1a',
                    backgroundColor: 'transparent',
                  }}
                />
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.dateNaissance}
                  onChangeText={(value) => handleChange('dateNaissance', value)}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            )}
          </View>
        </View>

        {/* Section Informations personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Lieu de naissance</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.lieuNaissance}
                onChangeText={(value) => handleChange('lieuNaissance', value)}
                placeholder="Ville, Pays"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Profession</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="briefcase-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.profession}
                onChangeText={(value) => handleChange('profession', value)}
                placeholder="Profession"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Lieu de résidence</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="home-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.lieuResidence}
                onChangeText={(value) => handleChange('lieuResidence', value)}
                placeholder="Ville, Pays"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom du conjoint</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="heart-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.nomConjoint}
                onChangeText={(value) => handleChange('nomConjoint', value)}
                placeholder="Nom du conjoint"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Section Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Contact</Text>
          </View>
          <Text style={styles.sectionHint}>
            Un compte utilisateur sera créé automatiquement si email ou téléphone est fourni
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                placeholder="exemple@email.com"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.telephone}
                onChangeText={(value) => handleChange('telephone', value)}
                placeholder="+221 XX XXX XX XX"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Section Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Notes supplémentaires</Text>
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={[styles.inputContainer, styles.textArea]}
              value={formData.informationsSupplementaires}
              onChangeText={(value) => handleChange('informationsSupplementaires', value)}
              placeholder="Notes, anecdotes, histoire familiale..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>
              {loading ? 'Ajout en cours...' : 'Ajouter le membre'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="close-circle-outline" size={20} color={COLORS.text} />
            <Text style={styles.buttonSecondaryText}>Annuler</Text>
          </TouchableOpacity>
        </View>
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
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '20',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  sectionHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.sm,
    borderRadius: 8,
    lineHeight: 20,
  },

  // Form groups
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
  },

  // Input container with icon
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 2,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },

  // Gender selection
  genderContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  genderTextActive: {
    color: COLORS.white,
  },

  // Text area
  textArea: {
    height: 120,
    paddingTop: SPACING.md,
    textAlignVertical: 'top',
  },

  // Action buttons
  actionButtons: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  buttonSecondaryText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
