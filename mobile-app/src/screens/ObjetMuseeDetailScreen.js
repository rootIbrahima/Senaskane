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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading } from '../components';
import { COLORS, SPACING, FONT_SIZES, API_URL } from '../utils/config';
import { museeApi } from '../api/museeApi';
import { useAuth } from '../contexts/AuthContext';

export const ObjetMuseeDetailScreen = ({ route, navigation }) => {
  const { objet: initialObjet } = route.params;
  const { user } = useAuth();
  const [objet, setObjet] = useState(initialObjet);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadObjetDetails();
  }, []);

  const loadObjetDetails = async () => {
    try {
      const data = await museeApi.getObjetById(initialObjet.id);
      setObjet(data);
    } catch (error) {
      console.error('Erreur chargement objet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    const confirmDelete = () => {
      setDeleting(true);
      museeApi
        .deleteObjet(objet.id)
        .then(() => {
          const successMsg = 'Objet supprimé avec succès';
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
      if (window.confirm('Voulez-vous vraiment supprimer cet objet du musée ?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Confirmation',
        'Voulez-vous vraiment supprimer cet objet du musée ?',
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

  if (loading) {
    return <Loading text="Chargement..." />;
  }

  const imageUrl = objet.image_url
    ? `${API_URL.replace('/api', '')}/uploads/musee/${objet.image_url}`
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="image-outline" size={80} color={COLORS.textSecondary} />
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{objet.nom_objet}</Text>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: objet.est_commun ? COLORS.primary : COLORS.info },
          ]}
        >
          <Ionicons
            name={objet.est_commun ? 'people' : 'person'}
            size={16}
            color={COLORS.white}
          />
          <Text style={styles.typeText}>{objet.est_commun ? 'Commun' : 'Personnel'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {objet.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.sectionHeaderTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{objet.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionHeaderTitle}>Informations</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.infoLabel}>Date d'ajout</Text>
            <Text style={styles.infoValue}>{formatDate(objet.date_ajout)}</Text>
          </View>

          {!objet.est_commun && objet.proprietaire_nom && objet.proprietaire_prenom && (
            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.infoLabel}>Propriétaire</Text>
              <Text style={styles.infoValue}>
                {objet.proprietaire_prenom} {objet.proprietaire_nom}
              </Text>
            </View>
          )}
        </View>

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

        
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
    height: 300,
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    backgroundColor: COLORS.white,
    borderRadius: 50,
    padding: SPACING.xl,
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  typeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
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
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
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
