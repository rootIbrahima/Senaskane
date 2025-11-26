import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card, Loading, AdvertisingBanner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { familleApi } from '../api/familleApi';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistiques, setStatistiques] = useState(null);
  const [famille, setFamille] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, familleResponse] = await Promise.all([
        familleApi.getStatistiques(),
        familleApi.getFamille(),
      ]);
      setStatistiques(statsResponse.data || {});
      setFamille(familleResponse.data || {});
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <Loading text="Chargement..." />;
  }

  const menuItems = [
    {
      id: 'membres',
      title: 'Membres',
      icon: 'people',
      color: COLORS.primary,
      screen: 'Membres',
      count: statistiques?.totalMembres || 0,
    },
    {
      id: 'arbre',
      title: 'Arbre généalogique',
      icon: 'git-network',
      color: COLORS.success,
      screen: 'ArbreGenealogique',
    },
    {
      id: 'ceremonies',
      title: 'Cérémonies',
      icon: 'calendar',
      color: COLORS.secondary,
      screen: 'Ceremonies',
      count: statistiques?.ceremonies?.length || 0,
    },
    {
      id: 'musee',
      title: 'Musée familial',
      icon: 'images',
      color: COLORS.warning,
      screen: 'Musee',
      count: statistiques?.objetsMusee || 0,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.familyCard}>
        <View style={styles.familyHeader}>
          <View>
            <Text style={styles.welcomeText}>Bienvenue</Text>
            <Text style={styles.familyName}>
              {famille?.nom || 'Famille'} {user?.nom}
            </Text>
            <Text style={styles.userRole}>
              {user?.role === 'admin' ? 'Administrateur' : 'Membre'}
            </Text>
          </View>
          <View style={styles.logoPlaceholder}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
        {famille?.slogan && (
          <Text style={styles.slogan}>{famille.slogan}</Text>
        )}
      </Card>

      <AdvertisingBanner />

      <Text style={styles.sectionTitle}>Accès rapide</Text>

      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={30} color={item.color} />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            {item.count !== undefined && (
              <View style={[styles.badge, { backgroundColor: item.color }]}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {statistiques && (
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{statistiques.totalMembres}</Text>
              <Text style={styles.statLabel}>Membres</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {statistiques.parSexe?.find(s => s.sexe === 'M')?.total || 0}
              </Text>
              <Text style={styles.statLabel}>Hommes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {statistiques.parSexe?.find(s => s.sexe === 'F')?.total || 0}
              </Text>
              <Text style={styles.statLabel}>Femmes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {statistiques.ceremonies?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Cérémonies</Text>
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  familyCard: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  welcomeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  familyName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  userRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  slogan: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  menuItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  menuTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  statsCard: {
    marginBottom: SPACING.md,
  },
  statsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
