import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Loading } from '../components';
import { cotisationApi } from '../api/cotisationApi';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export const CotisationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [cotisations, setCotisations] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cotisData, statsData] = await Promise.all([
        cotisationApi.getCotisations(),
        cotisationApi.getStatistiques(),
      ]);
      setCotisations(cotisData);
      setStatistiques(statsData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderCotisation = ({ item }) => (
    <Card style={styles.cotisationCard}>
      <View style={styles.cotisationHeader}>
        <View>
          <Text style={styles.cotisationMembre}>{item.membre_nom}</Text>
          <Text style={styles.cotisationDate}>{item.date_cotisation}</Text>
        </View>
        <Text style={styles.cotisationMontant}>{item.montant} FCFA</Text>
      </View>
      {item.description && <Text style={styles.cotisationDescription}>{item.description}</Text>}
    </Card>
  );

  if (loading) return <Loading text="Chargement des cotisations..." />;

  return (
    <View style={styles.container}>
      {statistiques && (
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Résumé</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{statistiques.total_montant || 0} FCFA</Text>
              <Text style={styles.statLabel}>Total collecté</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{statistiques.nombre_cotisations || 0}</Text>
              <Text style={styles.statLabel}>Cotisations</Text>
            </View>
          </View>
        </Card>
      )}
      <FlatList
        data={cotisations}
        renderItem={renderCotisation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cash-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Aucune cotisation enregistrée</Text>
          </View>
        }
      />
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AjouterCotisation')}
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  statsCard: { margin: SPACING.md, backgroundColor: COLORS.primary },
  statsTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.white, marginBottom: SPACING.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.white },
  statLabel: { fontSize: FONT_SIZES.sm, color: COLORS.white, marginTop: SPACING.xs, opacity: 0.9 },
  listContent: { padding: SPACING.md, paddingTop: 0 },
  cotisationCard: { marginBottom: SPACING.sm },
  cotisationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cotisationMembre: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  cotisationDate: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
  cotisationMontant: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primary },
  cotisationDescription: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.md },
  fab: {
    position: 'absolute', right: SPACING.lg, bottom: SPACING.lg, width: 60, height: 60,
    borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },
});
