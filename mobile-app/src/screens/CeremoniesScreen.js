import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, Loading } from '../components';
import { ceremonieApi } from '../api/ceremonieApi';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';
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

export const CeremoniesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [ceremonies, setCeremonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCeremonies();
  }, []);

  const loadCeremonies = async () => {
    try {
      const data = await ceremonieApi.getCeremonies();
      setCeremonies(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCeremonies();
  };

  const renderCeremonie = ({ item }) => {
    const icon = CEREMONIE_ICONS[item.type_ceremonie] || 'calendar';
    const color = CEREMONIE_COLORS[item.type_ceremonie] || COLORS.primary;

    return (
      <TouchableOpacity
        style={styles.ceremonieCard}
        onPress={() => navigation.navigate('CeremonieDetail', { ceremonie: item })}
        activeOpacity={0.7}
      >
        <View style={styles.ceremonieContent}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={28} color={COLORS.white} />
          </View>
          <View style={styles.ceremonieInfo}>
            <Text style={styles.ceremonieTitre}>{item.titre}</Text>
            <View style={[styles.typeBadge, { backgroundColor: color + '15' }]}>
              <Text style={[styles.ceremonieType, { color }]}>
                {item.type_ceremonie.charAt(0).toUpperCase() + item.type_ceremonie.slice(1).replace('_', ' ')}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.ceremonieDate}>{item.date_ceremonie}</Text>
              </View>
              {item.lieu && (
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.ceremonieLieu}>{item.lieu}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loading text="Chargement des cérémonies..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ceremonies}
        renderItem={renderCeremonie}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Aucune cérémonie enregistrée</Text>
          </View>
        }
      />
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AjouterCeremonie')}
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
  },
  ceremonieCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ceremonieContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ceremonieInfo: {
    flex: 1,
  },
  ceremonieTitre: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  ceremonieType: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ceremonieDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  ceremonieLieu: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  chevronContainer: {
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
