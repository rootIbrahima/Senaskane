import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Input, Card } from '../components';
import { rechercheApi } from '../api/rechercheApi';
import { COLORS, SPACING, FONT_SIZES, API_URL } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';

export const RechercheScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await rechercheApi.searchGlobal(query);
      setResults(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = ({ item }) => (
    <Card
      style={styles.resultCard}
      onPress={() => {
        if (item.type === 'membre') {
          navigation.navigate('MembreDetail', { membre: item });
        }
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
          {item.profession && <Text style={styles.resultDetail}>{item.profession}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un membre..."
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
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
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.white, alignItems: 'flex-start' },
  searchInput: { flex: 1, marginRight: SPACING.sm, marginBottom: 0 },
  searchButton: {
    backgroundColor: COLORS.primary, borderRadius: 8, width: 50, height: 50,
    justifyContent: 'center', alignItems: 'center', marginTop: 24,
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
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.md },
});
