import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card, Loading } from '../components';
import { museeApi } from '../api/museeApi';
import { COLORS, SPACING, FONT_SIZES, API_URL } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export const MuseeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [objets, setObjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadObjets();
  }, []);

  const loadObjets = async () => {
    try {
      const data = await museeApi.getObjets();
      setObjets(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadObjets();
  };

  const renderObjet = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.objetCard}
      onPress={() => navigation.navigate('ObjetDetail', { objet: item })}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: `${API_URL.replace('/api', '')}/uploads/musee/${item.image_url}` }}
            style={styles.objetImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
            </View>
          </View>
        )}
        <View style={styles.badgeContainer}>
          {item.est_commun ? (
            <View style={styles.communBadge}>
              <Ionicons name="people" size={12} color={COLORS.white} />
              <Text style={styles.badgeText}>Commun</Text>
            </View>
          ) : (
            <View style={styles.personnelBadge}>
              <Ionicons name="person" size={12} color={COLORS.white} />
              <Text style={styles.badgeText}>Personnel</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.objetInfo}>
        <Text style={styles.objetNom} numberOfLines={2}>{item.nom_objet}</Text>
        {item.description && (
          <Text style={styles.objetDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const getItemLayout = useCallback((data, index) => ({
    length: 240, // Image height (160) + info section (~80)
    offset: 240 * Math.floor(index / 2), // Grid layout with 2 columns
    index,
  }), []);

  if (loading) {
    return <Loading text="Chargement du musée..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={objets}
        renderItem={renderObjet}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Aucun objet dans le musée</Text>
          </View>
        }
        // Performance optimizations
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
      />
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AjouterObjet')}
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
    padding: SPACING.sm,
  },
  objetCard: {
    flex: 1,
    margin: SPACING.xs,
    maxWidth: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  objetImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: SPACING.md,
  },
  badgeContainer: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  communBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  personnelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  objetInfo: {
    padding: SPACING.md,
  },
  objetNom: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    minHeight: 40,
  },
  objetDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    width: '100%',
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
