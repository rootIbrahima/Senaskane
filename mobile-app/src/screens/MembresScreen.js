import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Card, Loading } from '../components';
import { membreApi } from '../api/membreApi';
import { COLORS, SPACING, FONT_SIZES, API_URL } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export const MembresScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMembres();
  }, []);

  // Rafraîchir la liste quand on revient sur cet écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMembres();
    });
    return unsubscribe;
  }, [navigation]);

  const loadMembres = async () => {
    try {
      const data = await membreApi.getMembres();
      setMembres(data);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      Alert.alert('Erreur', 'Impossible de charger les membres');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMembres();
  };

  const renderMembre = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.membreCard}
      onPress={() => navigation.navigate('MembreDetail', { membre: item })}
      activeOpacity={0.7}
    >
      <View style={styles.membreContent}>
        <View style={styles.photoContainer}>
          {item.photo ? (
            <Image
              source={{ uri: `${API_URL.replace('/api', '')}/uploads/photos/${item.photo}` }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: item.sexe === 'M' ? COLORS.info : COLORS.error }]}>
              <Ionicons name="person" size={32} color={COLORS.white} />
            </View>
          )}
        </View>
        <View style={styles.membreInfo}>
          <Text style={styles.membreName}>{item.prenom} {item.nom}</Text>
          <View style={styles.numeroBadge}>
            <Ionicons name="id-card-outline" size={12} color={COLORS.primary} />
            <Text style={styles.membreNumero}>{item.numero_identification}</Text>
          </View>
          <View style={styles.membreDetails}>
            {item.date_naissance && (
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{item.date_naissance}</Text>
              </View>
            )}
            {item.profession && (
              <View style={styles.detailItem}>
                <Ionicons name="briefcase-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{item.profession}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const getItemLayout = useCallback((data, index) => ({
    length: 128, // Approximate height of each item (64px photo + padding)
    offset: 128 * index,
    index,
  }), []);

  if (loading) {
    return <Loading text="Chargement des membres..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={membres}
        renderItem={renderMembre}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Aucun membre trouvé</Text>
          </View>
        }
        // Performance optimizations
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
      />
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AjouterMembre')}
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
  membreCard: {
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
  membreContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoContainer: {
    marginRight: SPACING.md,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  membreInfo: {
    flex: 1,
  },
  membreName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  numeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
    marginBottom: SPACING.xs,
  },
  membreNumero: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  membreDetails: {
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
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
