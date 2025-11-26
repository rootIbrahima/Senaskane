import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading } from '../components';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { ceremonieApi } from '../api/ceremonieApi';
import { useAuth } from '../contexts/AuthContext';

const CEREMONIE_ICONS = {
  mariage: 'heart',
  bapteme: 'water',
  deces: 'sad',
  tour_famille: 'people',
  autre: 'calendar',
};

const CEREMONIE_COLORS = {
  mariage: '#E91E63',
  bapteme: '#2196F3',
  deces: '#757575',
  tour_famille: '#4CAF50',
  autre: '#FF9800',
};

export const CeremonieDetailScreen = ({ route, navigation }) => {
  const { ceremonie: initialCeremonie } = route.params;
  const { user } = useAuth();
  const [ceremonie, setCeremonie] = useState(initialCeremonie);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCeremonieDetails();
  }, []);

  const loadCeremonieDetails = async () => {
    try {
      const data = await ceremonieApi.getCeremonieById(initialCeremonie.id);
      setCeremonie(data);
    } catch (error) {
      console.error('Erreur chargement cérémonie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    const confirmDelete = () => {
      setDeleting(true);
      ceremonieApi
        .deleteCeremonie(ceremonie.id)
        .then(() => {
          const successMsg = 'Cérémonie supprimée avec succès';
          if (Platform.OS === 'web') {
            alert(successMsg);
          } else {
            Alert.alert('Succès', successMsg);
          }
          navigation.goBack();
        })
        .catch((err) => {
          console.error('Erreur suppression:', err);
          const errorMsg = err.response?.data?.error || 'Erreur lors de la suppression';
          if (Platform.OS === 'web') {
            alert(errorMsg);
          } else {
            Alert.alert('Erreur', errorMsg);
          }
        })
        .finally(() => {
          setDeleting(false);
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous vraiment supprimer cette cérémonie ?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Confirmation',
        'Voulez-vous vraiment supprimer cette cérémonie ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', onPress: confirmDelete, style: 'destructive' },
        ]
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTypeCeremonieLabel = (type) => {
    const labels = {
      mariage: 'Mariage',
      bapteme: 'Baptême',
      deces: 'Décès',
      tour_famille: 'Tour de famille',
      autre: 'Autre',
    };
    return labels[type] || type;
  };

  if (loading) {
    return <Loading text="Chargement..." />;
  }

  const icon = CEREMONIE_ICONS[ceremonie.type_ceremonie] || 'calendar';
  const color = CEREMONIE_COLORS[ceremonie.type_ceremonie] || COLORS.primary;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={60} color={COLORS.white} />
        </View>
        <Text style={styles.title}>{ceremonie.titre}</Text>
        <View style={[styles.typeBadge, { backgroundColor: COLORS.white }]}>
          <Text style={[styles.typeText, { color }]}>
            {getTypeCeremonieLabel(ceremonie.type_ceremonie)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionHeaderTitle}>Informations générales</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(ceremonie.date_ceremonie)}</Text>
          </View>

          {ceremonie.lieu && (
            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.infoLabel}>Lieu</Text>
              <Text style={styles.infoValue}>{ceremonie.lieu}</Text>
            </View>
          )}
        </View>

        {(ceremonie.membre_nom && ceremonie.membre_prenom) ||
         (ceremonie.type_ceremonie === 'bapteme' && ceremonie.homonyme_nom && ceremonie.homonyme_prenom) ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={20} color={COLORS.primary} />
              <Text style={styles.sectionHeaderTitle}>Participants</Text>
            </View>

            {ceremonie.membre_nom && ceremonie.membre_prenom && (
              <View style={styles.infoRow}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.infoLabel}>Membre principal</Text>
                <Text style={styles.infoValue}>
                  {ceremonie.membre_prenom} {ceremonie.membre_nom}
                </Text>
              </View>
            )}

            {ceremonie.type_ceremonie === 'bapteme' &&
              ceremonie.homonyme_nom &&
              ceremonie.homonyme_prenom && (
                <View style={styles.infoRow}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="ribbon-outline" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.infoLabel}>Homonyme</Text>
                  <Text style={styles.infoValue}>
                    {ceremonie.homonyme_prenom} {ceremonie.homonyme_nom}
                  </Text>
                </View>
              )}
          </View>
        ) : null}

        {ceremonie.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.sectionHeaderTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{ceremonie.description}</Text>
          </View>
        )}

        {ceremonie.parrains && ceremonie.parrains.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
              <Text style={styles.sectionHeaderTitle}>Parrains & Marraines</Text>
            </View>
            {ceremonie.parrains.map((parrain, index) => (
              <View key={index} style={styles.parrainItem}>
                <View style={styles.parrainIcon}>
                  <Ionicons
                    name={parrain.type_role === 'parrain' ? 'male' : 'female'}
                    size={20}
                    color={parrain.type_role === 'parrain' ? COLORS.info : COLORS.error}
                  />
                </View>
                <Text style={styles.parrainText}>
                  {parrain.prenom} {parrain.nom}
                </Text>
                <Text style={styles.parrainRole}>({parrain.type_role})</Text>
              </View>
            ))}
          </View>
        )}

        {ceremonie.type_ceremonie === 'tour_famille' && (
          <TouchableOpacity
            style={styles.financialButton}
            onPress={() => navigation.navigate('GestionFinanciere', { ceremonie })}
          >
            <Ionicons name="cash-outline" size={24} color={COLORS.white} />
            <Text style={styles.financialButtonText}>Gestion Financière</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}

        {user?.role === 'admin' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.deleteButton, deleting && styles.buttonDisabled]}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="trash" size={20} color={COLORS.white} />
                  <Text style={styles.deleteButtonText}>Supprimer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Créée le {formatDate(ceremonie.created_at)}
          </Text>
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
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  typeText: {
    fontSize: FONT_SIZES.sm,
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
  sectionHeaderTitle: {
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
  iconWrapper: {
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
    fontWeight: '600',
    color: COLORS.text,
  },
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  parrainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  parrainIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  parrainText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  parrainRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  financialButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    flex: 1,
  },
  actionsContainer: {
    marginBottom: SPACING.xl,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.info + '15',
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});
