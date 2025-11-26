import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, API_URL } from '../utils/config';
import { membreApi } from '../api/membreApi';
import { Loading } from '../components';
import { useAuth } from '../contexts/AuthContext';

export const MembreDetailScreen = ({ route, navigation }) => {
  const { membre: initialMembre } = route.params;
  const { user } = useAuth();
  const [membre, setMembre] = useState(initialMembre);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembreDetails();
  }, []);

  const loadMembreDetails = async () => {
    try {
      setLoading(true);
      const response = await membreApi.getMembreById(initialMembre.id);
      setMembre(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    const alertFunc = Platform.OS === 'web' ?
      (title, message, buttons) => {
        if (window.confirm(message)) {
          buttons[1].onPress();
        }
      } : Alert.alert;

    alertFunc(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${membre.prenom} ${membre.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await membreApi.deleteMembre(membre.id);
              if (Platform.OS === 'web') {
                alert('Membre supprimé avec succès');
              } else {
                Alert.alert('Succès', 'Membre supprimé avec succès');
              }
              navigation.goBack();
            } catch (error) {
              const errorMsg = error.response?.data?.error || 'Erreur lors de la suppression';
              if (Platform.OS === 'web') {
                alert(errorMsg);
              } else {
                Alert.alert('Erreur', errorMsg);
              }
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <Loading text="Chargement..." />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {membre.photo ? (
          <Image
            source={{ uri: `${API_URL.replace('/api', '')}/uploads/photos/${membre.photo}` }}
            style={styles.photo}
          />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: membre.sexe === 'M' ? '#2196F3' : '#E91E63' }]}>
            <Ionicons name="person" size={80} color={COLORS.white} />
          </View>
        )}
        <Text style={styles.name}>{membre.prenom} {membre.nom}</Text>
        <View style={styles.numeroBadge}>
          <Ionicons name="id-card-outline" size={16} color={COLORS.primary} />
          <Text style={styles.numero}>{membre.numero_identification}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name={membre.sexe === 'M' ? 'male' : 'female'} size={20} color={membre.sexe === 'M' ? COLORS.info : COLORS.error} />
            </View>
            <Text style={styles.infoLabel}>Sexe</Text>
            <Text style={styles.infoValue}>{membre.sexe === 'M' ? 'Masculin' : 'Féminin'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.infoLabel}>Date de naissance</Text>
            <Text style={styles.infoValue}>{formatDate(membre.date_naissance)}</Text>
          </View>

          {membre.lieu_naissance && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.infoLabel}>Lieu de naissance</Text>
              <Text style={styles.infoValue}>{membre.lieu_naissance}</Text>
            </View>
          )}

          {membre.profession && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.infoLabel}>Profession</Text>
              <Text style={styles.infoValue}>{membre.profession}</Text>
            </View>
          )}

          {membre.lieu_residence && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="home-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.infoLabel}>Lieu de résidence</Text>
              <Text style={styles.infoValue}>{membre.lieu_residence}</Text>
            </View>
          )}
        </View>

        {membre.nom_conjoint && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={20} color={COLORS.error} />
              <Text style={styles.sectionTitle}>Situation matrimoniale</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="people-outline" size={20} color={COLORS.error} />
              </View>
              <Text style={styles.infoLabel}>Conjoint</Text>
              <Text style={styles.infoValue}>{membre.nom_conjoint}</Text>
            </View>
          </View>
        )}

        {membre.date_deces && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flower-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.sectionTitle}>Informations de décès</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.infoLabel}>Date de décès</Text>
              <Text style={styles.infoValue}>{formatDate(membre.date_deces)}</Text>
            </View>
            {membre.lieu_deces && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.infoLabel}>Lieu de décès</Text>
                <Text style={styles.infoValue}>{membre.lieu_deces}</Text>
              </View>
            )}
          </View>
        )}

        {membre.informations_supplementaires && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Informations supplémentaires</Text>
            </View>
            <Text style={styles.description}>{membre.informations_supplementaires}</Text>
          </View>
        )}

        {user?.role === 'admin' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('ModifierMembre', { membre })}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: SPACING.md,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  name: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  numeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  numero: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.lg,
  },
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  infoLabel: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
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
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.error,
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
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
