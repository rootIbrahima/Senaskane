import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading } from '../components';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../utils/config';

export const FamilleInfoScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [familleData, setFamilleData] = useState(null);

  useEffect(() => {
    loadFamilleInfo();
  }, []);

  const loadFamilleInfo = async () => {
    try {
      // Pour l'instant, affichons juste les infos de base
      // Vous pourrez créer un endpoint backend plus tard si besoin
      setFamilleData({
        nom: user?.famille || 'N/A',
        familleId: user?.familleId || 'N/A',
      });
    } catch (error) {
      console.error('Erreur chargement famille:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFamilleInfo();
  };

  if (loading) {
    return <Loading text="Chargement..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="home" size={50} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Informations de la famille</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nom de la famille</Text>
              <Text style={styles.infoValue}>{familleData?.nom}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="finger-print" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Identifiant famille</Text>
              <Text style={styles.infoValue}>#{familleData?.familleId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Votre rôle</Text>
              <Text style={styles.infoValue}>
                {user?.role === 'admin' ? 'Administrateur' : 'Membre'}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={30} color={COLORS.primary} />
              <Text style={styles.statLabel}>Membres actifs</Text>
              <Text style={styles.statValue}>-</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="git-network-outline" size={30} color={COLORS.success} />
              <Text style={styles.statLabel}>Générations</Text>
              <Text style={styles.statValue}>-</Text>
            </View>
          </View>
          <Text style={styles.statsNote}>
            Les statistiques détaillées sont disponibles sur l'écran d'accueil
          </Text>
        </Card>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Cette section affiche les informations de votre famille. Contactez votre administrateur pour toute modification.
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
  content: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  statsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  statsNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: SPACING.md,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    lineHeight: 20,
  },
});
