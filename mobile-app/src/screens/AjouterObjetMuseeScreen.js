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
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { museeApi } from '../api/museeApi';
import { membreApi } from '../api/membreApi';

export const AjouterObjetMuseeScreen = ({ navigation }) => {
  const [nomObjet, setNomObjet] = useState('');
  const [description, setDescription] = useState('');
  const [proprietaireId, setProprietaireId] = useState('');
  const [estCommun, setEstCommun] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

  const handleImagePick = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/jpg';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            setImagePreview(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // Mobile: demander les permissions et ouvrir la galerie
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission requise',
          'Vous devez autoriser l\'accès à la galerie pour sélectionner une image'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];

        // Créer un objet File-like pour mobile
        const uri = asset.uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const imageData = {
          uri,
          name: filename,
          type,
        };

        setImageFile(imageData);
        setImagePreview(uri);
      }
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!nomObjet.trim()) {
      setError('Le nom de l\'objet est requis');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nomObjet', nomObjet.trim());
      formData.append('description', description.trim());
      formData.append('estCommun', estCommun ? '1' : '0');

      if (proprietaireId) {
        formData.append('proprietaireId', proprietaireId);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await museeApi.createObjet(formData);

      const successMsg = 'Objet ajouté au musée avec succès !';

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
      console.error('Erreur ajout objet:', err);
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'ajout de l\'objet';
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

        {/* Section Image */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Photo de l'objet</Text>
          </View>

          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
            {imagePreview ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera" size={24} color={COLORS.white} />
                  <Text style={styles.imageOverlayText}>Changer</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.imagePickerTitle}>Ajouter une photo</Text>
                <Text style={styles.imagePickerSubtitle}>Cliquez pour sélectionner une image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Section Informations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Informations de l'objet</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom de l'objet <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={nomObjet}
                onChangeText={setNomObjet}
                placeholder="Ex: Album photo de famille"
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
              placeholder="Histoire et description de l'objet..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Section Propriété */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Propriété</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Type d'objet</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, !estCommun && styles.typeButtonActive]}
                onPress={() => setEstCommun(false)}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={!estCommun ? COLORS.white : COLORS.textSecondary}
                />
                <Text style={[styles.typeButtonText, !estCommun && styles.typeButtonTextActive]}>
                  Personnel
                </Text>
                <Text style={[styles.typeButtonSubtext, !estCommun && { color: COLORS.white + 'CC' }]}>
                  Appartient à un membre
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, estCommun && styles.typeButtonActive]}
                onPress={() => setEstCommun(true)}
              >
                <Ionicons
                  name="people"
                  size={24}
                  color={estCommun ? COLORS.white : COLORS.textSecondary}
                />
                <Text style={[styles.typeButtonText, estCommun && styles.typeButtonTextActive]}>
                  Commun
                </Text>
                <Text style={[styles.typeButtonSubtext, estCommun && { color: COLORS.white + 'CC' }]}>
                  Bien familial partagé
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {!estCommun && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Propriétaire</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.pickerIcon} />
                <Picker
                  selectedValue={proprietaireId}
                  onValueChange={setProprietaireId}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Sélectionner un membre --" value="" />
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
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>
              {loading ? 'Ajout en cours...' : 'Ajouter au musée'}
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

  // Image picker
  imagePicker: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  cameraIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  imagePickerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  imagePickerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  imageOverlayText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
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

  // Type selection
  typeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  typeButton: {
    flex: 1,
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  typeButtonTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  typeButtonSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
