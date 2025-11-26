import React, { useState, useEffect } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { ceremonieApi } from '../api/ceremonieApi';
import { membreApi } from '../api/membreApi';

const CEREMONIE_TYPES = [
  { value: 'mariage', label: 'Mariage', icon: 'heart', color: COLORS.error },
  { value: 'bapteme', label: 'Baptême', icon: 'water', color: COLORS.info },
  { value: 'deces', label: 'Décès', icon: 'flower', color: COLORS.textSecondary },
  { value: 'tour_famille', label: 'Tour de famille', icon: 'people', color: COLORS.success },
  { value: 'autre', label: 'Autre', icon: 'ellipsis-horizontal', color: COLORS.warning },
];

export const AjouterCeremoniesScreen = ({ navigation }) => {
  const [typeCeremonie, setTypeCeremonie] = useState('mariage');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [dateCeremonie, setDateCeremonie] = useState('');
  const [lieu, setLieu] = useState('');
  const [membrePrincipalId, setMembrePrincipalId] = useState('');
  const [homonymeId, setHomonymeId] = useState('');
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMembres();
  }, []);

  const loadMembres = async () => {
    try {
      const data = await membreApi.getMembres();
      setMembres(data);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!titre.trim()) {
      setError('Le titre est requis');
      return;
    }

    if (!dateCeremonie.trim()) {
      setError('La date est requise');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateCeremonie)) {
      setError('Format de date invalide (YYYY-MM-DD)');
      return;
    }

    setLoading(true);

    try {
      const data = {
        typeCeremonie,
        titre: titre.trim(),
        description: description.trim(),
        dateCeremonie,
        lieu: lieu.trim(),
      };

      if (membrePrincipalId) {
        data.membrePrincipalId = parseInt(membrePrincipalId);
      }

      if (typeCeremonie === 'bapteme' && homonymeId) {
        data.homonymeId = parseInt(homonymeId);
      }

      await ceremonieApi.createCeremonie(data);

      const successMsg = 'Cérémonie ajoutée avec succès !';

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
      console.error('Erreur ajout cérémonie:', err);
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'ajout de la cérémonie';
      setError(errorMsg);

      if (Platform.OS === 'web') {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderTitre = () => {
    switch (typeCeremonie) {
      case 'mariage':
        return 'Ex: Mariage de Jean et Marie';
      case 'bapteme':
        return 'Ex: Baptême de Pierre';
      case 'deces':
        return 'Ex: Décès de Paul Dupont';
      case 'tour_famille':
        return 'Ex: Tour de famille 2025';
      default:
        return 'Ex: Réunion familiale';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Section Type de cérémonie */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Type de cérémonie</Text>
          </View>

          <View style={styles.typeGrid}>
            {CEREMONIE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  typeCeremonie === type.value && styles.typeButtonActive,
                  { borderColor: type.color }
                ]}
                onPress={() => setTypeCeremonie(type.value)}
              >
                <View style={[styles.typeIconContainer, { backgroundColor: type.color + '15' }]}>
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={typeCeremonie === type.value ? type.color : COLORS.textSecondary}
                  />
                </View>
                <Text style={[
                  styles.typeLabel,
                  typeCeremonie === type.value && { color: type.color, fontWeight: '700' }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section Informations de base */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Informations de base</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Titre <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <Ionicons name="text-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={titre}
                onChangeText={setTitre}
                placeholder={getPlaceholderTitre()}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.inputContainer, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description de la cérémonie..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Section Détails */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Date et lieu</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de la cérémonie <Text style={styles.required}>*</Text></Text>
            {Platform.OS === 'web' ? (
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <input
                  type="date"
                  value={dateCeremonie}
                  onChange={(e) => setDateCeremonie(e.target.value)}
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
                  value={dateCeremonie}
                  onChangeText={setDateCeremonie}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Lieu</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={lieu}
                onChangeText={setLieu}
                placeholder="Lieu de la cérémonie"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Section Participants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Participants</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Membre principal</Text>
            <View style={styles.pickerContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.pickerIcon} />
              <Picker
                selectedValue={membrePrincipalId}
                onValueChange={setMembrePrincipalId}
                style={styles.picker}
              >
                <Picker.Item label="-- Sélectionner --" value="" />
                {membres.map((membre) => (
                  <Picker.Item
                    key={membre.id}
                    label={`${membre.prenom} ${membre.nom}`}
                    value={membre.id.toString()}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {typeCeremonie === 'bapteme' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Homonyme (parrain/marraine)</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="star-outline" size={20} color={COLORS.textSecondary} style={styles.pickerIcon} />
                <Picker
                  selectedValue={homonymeId}
                  onValueChange={setHomonymeId}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Sélectionner --" value="" />
                  {membres.map((membre) => (
                    <Picker.Item
                      key={membre.id}
                      label={`${membre.prenom} ${membre.nom}`}
                      value={membre.id.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
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
              {loading ? 'Ajout en cours...' : 'Ajouter la cérémonie'}
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

  // Type selection grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  typeButtonActive: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
  },
  typeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
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

  // Text area
  textArea: {
    height: 120,
    paddingTop: SPACING.md,
    textAlignVertical: 'top',
  },

  // Picker
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingLeft: SPACING.md,
    overflow: 'hidden',
  },
  pickerIcon: {
    marginRight: SPACING.sm,
  },
  picker: {
    flex: 1,
    height: 50,
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
