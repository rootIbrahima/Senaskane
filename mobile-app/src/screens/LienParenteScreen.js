import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { Button, Card } from '../components';
import { membreApi } from '../api/membreApi';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';

export const LienParenteScreen = ({ route, navigation }) => {
  const [membres, setMembres] = useState([]);
  const [membre1, setMembre1] = useState(route.params?.membre1 || null);
  const [membre2, setMembre2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectingMembre, setSelectingMembre] = useState(null); // 1 ou 2
  const [searchQuery, setSearchQuery] = useState('');
  const [renderKey, setRenderKey] = useState(0); // Compteur pour forcer le re-render

  useEffect(() => {
    loadMembres();
  }, []);

  // Mettre à jour membre1 si les params changent
  useEffect(() => {
    if (route.params?.membre1) {
      setMembre1({ ...route.params.membre1 });
    }
  }, [route.params?.membre1?.id]);

  const loadMembres = async () => {
    try {
      const data = await membreApi.getMembres();
      setMembres(data);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    }
  };

  const handleSearch = async () => {
    if (!membre1 || !membre2) {
      Alert.alert('Attention', 'Veuillez sélectionner deux membres');
      return;
    }

    if (membre1.id === membre2.id) {
      Alert.alert('Attention', 'Veuillez sélectionner deux membres différents');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await membreApi.trouverLienParente(membre1.id, membre2.id);
      setResult(data);
    } catch (error) {
      console.error('Erreur recherche lien:', error);
      Alert.alert(
        'Aucun lien trouvé',
        'Aucun lien de parenté trouvé entre ces deux membres'
      );
    } finally {
      setLoading(false);
    }
  };

  const openMembreSelector = (membreNumber) => {
    setSelectingMembre(membreNumber);
    setShowModal(true);
    setSearchQuery('');
  };

  const selectMembre = (membre) => {
    // Créer une nouvelle instance pour forcer React à détecter le changement
    const newMembre = { ...membre };

    if (selectingMembre === 1) {
      setMembre1(newMembre);
    } else {
      setMembre2(newMembre);
    }
    setShowModal(false);
    setResult(null);

    // Forcer le re-render complet
    setRenderKey(prev => prev + 1);
  };

  const filteredMembres = membres.filter((m) => {
    const fullName = `${m.prenom} ${m.nom} ${m.numero_identification}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Composant MembreCard pour forcer le re-render
  const MembreCard = ({ membre, title, onPress }) => (
    <Card style={styles.membreCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      {membre ? (
        <TouchableOpacity
          style={styles.selectedMembreContainer}
          onPress={onPress}
        >
          <View style={styles.selectedMembreInfo}>
            <Text style={styles.membreName}>
              {membre.prenom} {membre.nom}
            </Text>
            <Text style={styles.membreNumero}>{membre.numero_identification}</Text>
          </View>
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.selectButton} onPress={onPress}>
          <Ionicons name="person-add-outline" size={24} color={COLORS.primary} />
          <Text style={styles.selectButtonText}>Sélectionner un membre</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderResultCard = () => {
    if (!result) return null;

    return (
      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="git-network-outline" size={32} color={COLORS.success} />
          <Text style={styles.resultTitle}>Lien de parenté trouvé</Text>
        </View>

        <View style={styles.resultContent}>
          <View style={styles.resultRow}>
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
            <Text style={styles.resultLabel}>Relation :</Text>
            <Text style={styles.resultValue}>{result.description}</Text>
          </View>

          {result.degre > 0 && (
            <View style={styles.resultRow}>
              <Ionicons name="layers-outline" size={20} color={COLORS.primary} />
              <Text style={styles.resultLabel}>Degré :</Text>
              <Text style={styles.resultValue}>{result.degre}ème</Text>
            </View>
          )}

          {result.ancetreCommun && (
            <View style={styles.ancestorSection}>
              <Text style={styles.ancestorTitle}>Ancêtre commun :</Text>
              <View style={styles.ancestorCard}>
                <Text style={styles.ancestorName}>
                  {result.ancetreCommun.prenom} {result.ancetreCommun.nom}
                </Text>
                <Text style={styles.ancestorNumero}>
                  {result.ancetreCommun.numero}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="git-network" size={40} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Recherche de lien de parenté</Text>
        <Text style={styles.headerSubtitle}>
          Sélectionnez deux membres pour découvrir leur lien de parenté
        </Text>
      </View>

      <MembreCard
        key={`membre1-${membre1?.id || 'empty'}-${renderKey}`}
        membre={membre1}
        title="Premier membre"
        onPress={() => openMembreSelector(1)}
      />
      <MembreCard
        key={`membre2-${membre2?.id || 'empty'}-${renderKey}`}
        membre={membre2}
        title="Deuxième membre"
        onPress={() => openMembreSelector(2)}
      />

      <Button
        title="Trouver le lien de parenté"
        onPress={handleSearch}
        loading={loading}
        disabled={!membre1 || !membre2 || loading}
        style={styles.searchButton}
      />

      {renderResultCard()}

      {/* Modal de sélection de membre */}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner un membre</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un membre..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredMembres}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.membreItem}
                onPress={() => selectMembre(item)}
              >
                <View style={styles.membreItemInfo}>
                  <Text style={styles.membreItemName}>
                    {item.prenom} {item.nom}
                  </Text>
                  <Text style={styles.membreItemNumero}>
                    {item.numero_identification}
                  </Text>
                  {item.profession && (
                    <Text style={styles.membreItemDetail}>📋 {item.profession}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Ionicons name="search-outline" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>Aucun membre trouvé</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  membreCard: { marginBottom: SPACING.md },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  selectedMembreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  selectedMembreInfo: { flex: 1 },
  membreName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  membreNumero: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  selectButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  searchButton: { marginVertical: SPACING.md },
  resultCard: { marginTop: SPACING.md },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  resultTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.success,
  },
  resultContent: { gap: SPACING.md },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resultLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  ancestorSection: { marginTop: SPACING.sm },
  ancestorTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  ancestorCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  ancestorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  ancestorNumero: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  modalContainer: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONT_SIZES.md,
  },
  membreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  membreItemInfo: { flex: 1 },
  membreItemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  membreItemNumero: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  membreItemDetail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
