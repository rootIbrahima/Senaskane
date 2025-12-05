import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Input, Card } from '../components';
import { rechercheApi } from '../api/rechercheApi';
import { membreApi } from '../api/membreApi';
import { COLORS, SPACING, FONT_SIZES, API_URL } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';

export const RechercheScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('nom');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      let data;
      switch (activeTab) {
        case 'nom':
          data = await membreApi.rechercherParNom(query);
          break;
        case 'profession':
          data = await membreApi.rechercherParProfession(query);
          break;
        case 'lieu':
          data = await membreApi.rechercherParLieu(query);
          break;
        default:
          data = [];
      }
      setResults(data);
    } catch (error) {
      console.error('Erreur:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = ({ item }) => (
    <Card
      style={styles.resultCard}
      onPress={() => {
        navigation.navigate('MembreDetail', { membre: item });
      }}
    >
      <View style={styles.resultContent}>
        {item.photo && (
          <Image
            source={{ uri: `${API_URL.replace('/api', '')}/uploads/photos/${item.photo}` }}
            style={styles.resultPhoto}
          />
        )}
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{item.prenom} {item.nom}</Text>
          <Text style={styles.resultNumero}>{item.numero_identification}</Text>
          {item.profession && <Text style={styles.resultDetail}>📋 {item.profession}</Text>}
          {item.lieu_residence && <Text style={styles.resultDetail}>📍 {item.lieu_residence}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </View>
    </Card>
  );

  const renderTab = (tabId, label, icon) => (
    <TouchableOpacity
      key={tabId}
      style={[styles.tab, activeTab === tabId && styles.activeTab]}
      onPress={() => {
        setActiveTab(tabId);
        setResults([]);
        setQuery('');
      }}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tabId ? COLORS.primary : COLORS.textSecondary}
      />
      <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'nom':
        return 'Rechercher par nom ou prénom...';
      case 'profession':
        return 'Rechercher par profession (ex: Médecin)...';
      case 'lieu':
        return 'Rechercher par lieu (naissance ou résidence)...';
      default:
        return 'Rechercher...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {renderTab('nom', 'Nom', 'person-outline')}
        {renderTab('profession', 'Profession', 'briefcase-outline')}
        {renderTab('lieu', 'Lieu', 'location-outline')}
      </View>

      <View style={styles.searchBar}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={getPlaceholder()}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Ionicons name="search" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && query ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={80} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
              <Text style={styles.emptySubtext}>
                Essayez avec d'autres mots-clés
              </Text>
            </View>
          ) : !loading && !query ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="information-circle-outline" size={80} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Recherchez un membre</Text>
              <Text style={styles.emptySubtext}>
                Utilisez les onglets ci-dessus pour choisir le type de recherche
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    alignItems: 'flex-start',
  },
  searchInput: { flex: 1, marginRight: SPACING.sm, marginBottom: 0 },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  listContent: { padding: SPACING.md },
  resultCard: { marginBottom: SPACING.sm },
  resultContent: { flexDirection: 'row', alignItems: 'center' },
  resultPhoto: { width: 50, height: 50, borderRadius: 25, marginRight: SPACING.md },
  resultInfo: { flex: 1 },
  resultName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  resultNumero: { fontSize: FONT_SIZES.sm, color: COLORS.primary, marginTop: SPACING.xs },
  resultDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginTop: SPACING.md, fontWeight: '600' },
  emptySubtext: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: 'center', paddingHorizontal: SPACING.xl },
});
