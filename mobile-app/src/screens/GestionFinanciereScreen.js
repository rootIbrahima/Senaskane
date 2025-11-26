import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { ceremonieApi } from '../api/ceremonieApi';
import { Card, Loading, Button, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';

export const GestionFinanciereScreen = ({ route, navigation }) => {
  const { ceremonie } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bilan, setBilan] = useState(null);
  const [recettes, setRecettes] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [activeTab, setActiveTab] = useState('bilan'); // 'bilan', 'recettes', 'depenses'

  // Modals
  const [showAddRecette, setShowAddRecette] = useState(false);
  const [showAddDepense, setShowAddDepense] = useState(false);

  // Form states pour recette
  const [typeRecette, setTypeRecette] = useState('cotisation');
  const [montantRecette, setMontantRecette] = useState('');
  const [descriptionRecette, setDescriptionRecette] = useState('');
  const [contributeurNom, setContributeurNom] = useState('');
  const [dateRecette, setDateRecette] = useState(new Date().toISOString().split('T')[0]);

  // Form states pour dépense
  const [rubrique, setRubrique] = useState('repas');
  const [montantDepense, setMontantDepense] = useState('');
  const [descriptionDepense, setDescriptionDepense] = useState('');
  const [beneficiaire, setBeneficiaire] = useState('');
  const [dateDepense, setDateDepense] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bilanData, recettesData, depensesData] = await Promise.all([
        ceremonieApi.getBilan(ceremonie.id),
        ceremonieApi.getRecettes(ceremonie.id),
        ceremonieApi.getDepenses(ceremonie.id),
      ]);

      setBilan(bilanData);
      setRecettes(recettesData);
      setDepenses(depensesData);
    } catch (error) {
      console.error('Erreur chargement données financières:', error);
      if (Platform.OS === 'web') {
        alert('Erreur lors du chargement des données financières');
      } else {
        Alert.alert('Erreur', 'Impossible de charger les données financières');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecette = async () => {
    if (!montantRecette || parseFloat(montantRecette) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    try {
      await ceremonieApi.addRecette(ceremonie.id, {
        typeRecette,
        montant: parseFloat(montantRecette),
        description: descriptionRecette,
        contributeurNom,
        dateRecette,
      });

      setShowAddRecette(false);
      resetRecetteForm();
      loadData();

      if (Platform.OS === 'web') {
        alert('Recette ajoutée avec succès');
      } else {
        Alert.alert('Succès', 'Recette ajoutée avec succès');
      }
    } catch (error) {
      console.error('Erreur ajout recette:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la recette');
    }
  };

  const handleAddDepense = async () => {
    if (!montantDepense || parseFloat(montantDepense) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    try {
      await ceremonieApi.addDepense(ceremonie.id, {
        rubrique,
        montant: parseFloat(montantDepense),
        description: descriptionDepense,
        beneficiaire,
        dateDepense,
      });

      setShowAddDepense(false);
      resetDepenseForm();
      loadData();

      if (Platform.OS === 'web') {
        alert('Dépense ajoutée avec succès');
      } else {
        Alert.alert('Succès', 'Dépense ajoutée avec succès');
      }
    } catch (error) {
      console.error('Erreur ajout dépense:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la dépense');
    }
  };

  const handleDeleteRecette = async (recetteId) => {
    const confirmDelete = Platform.OS === 'web'
      ? window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Confirmer',
            'Êtes-vous sûr de vouloir supprimer cette recette ?',
            [
              { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Supprimer', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmDelete) return;

    try {
      await ceremonieApi.deleteRecette(ceremonie.id, recetteId);
      loadData();
    } catch (error) {
      console.error('Erreur suppression recette:', error);
      Alert.alert('Erreur', 'Impossible de supprimer la recette');
    }
  };

  const handleDeleteDepense = async (depenseId) => {
    const confirmDelete = Platform.OS === 'web'
      ? window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Confirmer',
            'Êtes-vous sûr de vouloir supprimer cette dépense ?',
            [
              { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Supprimer', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmDelete) return;

    try {
      await ceremonieApi.deleteDepense(ceremonie.id, depenseId);
      loadData();
    } catch (error) {
      console.error('Erreur suppression dépense:', error);
      Alert.alert('Erreur', 'Impossible de supprimer la dépense');
    }
  };

  const resetRecetteForm = () => {
    setTypeRecette('cotisation');
    setMontantRecette('');
    setDescriptionRecette('');
    setContributeurNom('');
    setDateRecette(new Date().toISOString().split('T')[0]);
  };

  const resetDepenseForm = () => {
    setRubrique('repas');
    setMontantDepense('');
    setDescriptionDepense('');
    setBeneficiaire('');
    setDateDepense(new Date().toISOString().split('T')[0]);
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(montant);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <Loading text="Chargement..." />;
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bilan' && styles.activeTab]}
          onPress={() => setActiveTab('bilan')}
        >
          <Text style={[styles.tabText, activeTab === 'bilan' && styles.activeTabText]}>
            Bilan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recettes' && styles.activeTab]}
          onPress={() => setActiveTab('recettes')}
        >
          <Text style={[styles.tabText, activeTab === 'recettes' && styles.activeTabText]}>
            Recettes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'depenses' && styles.activeTab]}
          onPress={() => setActiveTab('depenses')}
        >
          <Text style={[styles.tabText, activeTab === 'depenses' && styles.activeTabText]}>
            Dépenses
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Bilan Tab */}
        {activeTab === 'bilan' && bilan && (
          <View>
            <Card style={[styles.summaryCard, { backgroundColor: COLORS.success + '20' }]}>
              <Text style={styles.summaryLabel}>Total Recettes</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                {formatMontant(bilan.totalRecettes)}
              </Text>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: COLORS.error + '20' }]}>
              <Text style={styles.summaryLabel}>Total Dépenses</Text>
              <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                {formatMontant(bilan.totalDepenses)}
              </Text>
            </Card>

            <Card style={[
              styles.summaryCard,
              { backgroundColor: bilan.solde >= 0 ? COLORS.primary + '20' : COLORS.warning + '20' }
            ]}>
              <Text style={styles.summaryLabel}>Solde</Text>
              <Text style={[
                styles.summaryValue,
                { color: bilan.solde >= 0 ? COLORS.primary : COLORS.warning }
              ]}>
                {formatMontant(bilan.solde)}
              </Text>
            </Card>

            {bilan.recettesParType && bilan.recettesParType.length > 0 && (
              <Card style={styles.detailCard}>
                <Text style={styles.detailTitle}>Détail des Recettes</Text>
                {bilan.recettesParType.map((item, index) => (
                  <View key={index} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{item.type_recette}</Text>
                    <Text style={styles.detailValue}>{formatMontant(item.total)}</Text>
                  </View>
                ))}
              </Card>
            )}

            {bilan.depensesParRubrique && bilan.depensesParRubrique.length > 0 && (
              <Card style={styles.detailCard}>
                <Text style={styles.detailTitle}>Détail des Dépenses</Text>
                {bilan.depensesParRubrique.map((item, index) => (
                  <View key={index} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{item.rubrique}</Text>
                    <Text style={styles.detailValue}>{formatMontant(item.total)}</Text>
                  </View>
                ))}
              </Card>
            )}
          </View>
        )}

        {/* Recettes Tab */}
        {activeTab === 'recettes' && (
          <View>
            {user?.role === 'admin' && (
              <Button
                title="Ajouter une recette"
                onPress={() => setShowAddRecette(true)}
                style={styles.addButton}
                icon="add-circle-outline"
              />
            )}

            {recettes.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>Aucune recette enregistrée</Text>
              </Card>
            ) : (
              recettes.map((recette) => (
                <Card key={recette.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemType}>{recette.type_recette}</Text>
                      <Text style={styles.itemDate}>{formatDate(recette.date_recette)}</Text>
                    </View>
                    <Text style={[styles.itemMontant, { color: COLORS.success }]}>
                      +{formatMontant(recette.montant)}
                    </Text>
                  </View>
                  {recette.contributeur_nom && (
                    <Text style={styles.itemDetail}>De: {recette.contributeur_nom}</Text>
                  )}
                  {recette.description && (
                    <Text style={styles.itemDescription}>{recette.description}</Text>
                  )}
                  {user?.role === 'admin' && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRecette(recette.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </Card>
              ))
            )}
          </View>
        )}

        {/* Dépenses Tab */}
        {activeTab === 'depenses' && (
          <View>
            {user?.role === 'admin' && (
              <Button
                title="Ajouter une dépense"
                onPress={() => setShowAddDepense(true)}
                style={styles.addButton}
                icon="add-circle-outline"
              />
            )}

            {depenses.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>Aucune dépense enregistrée</Text>
              </Card>
            ) : (
              depenses.map((depense) => (
                <Card key={depense.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemType}>{depense.rubrique}</Text>
                      <Text style={styles.itemDate}>{formatDate(depense.date_depense)}</Text>
                    </View>
                    <Text style={[styles.itemMontant, { color: COLORS.error }]}>
                      -{formatMontant(depense.montant)}
                    </Text>
                  </View>
                  {depense.beneficiaire && (
                    <Text style={styles.itemDetail}>À: {depense.beneficiaire}</Text>
                  )}
                  {depense.description && (
                    <Text style={styles.itemDescription}>{depense.description}</Text>
                  )}
                  {user?.role === 'admin' && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteDepense(depense.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Ajouter Recette */}
      <Modal
        visible={showAddRecette}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddRecette(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter une recette</Text>
              <TouchableOpacity onPress={() => setShowAddRecette(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Type de recette</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={typeRecette}
                  onValueChange={setTypeRecette}
                  style={styles.picker}
                >
                  <Picker.Item label="Cotisation" value="cotisation" />
                  <Picker.Item label="Don" value="don" />
                  <Picker.Item label="Autre" value="autre" />
                </Picker>
              </View>

              <Input
                label="Montant (FCFA)"
                value={montantRecette}
                onChangeText={setMontantRecette}
                keyboardType="numeric"
                placeholder="0"
              />

              <Input
                label="Contributeur"
                value={contributeurNom}
                onChangeText={setContributeurNom}
                placeholder="Nom du contributeur"
              />

              <Input
                label="Description (optionnel)"
                value={descriptionRecette}
                onChangeText={setDescriptionRecette}
                placeholder="Description"
                multiline
              />

              <Input
                label="Date"
                value={dateRecette}
                onChangeText={setDateRecette}
                placeholder="YYYY-MM-DD"
              />

              <View style={styles.modalButtons}>
                <Button
                  title="Annuler"
                  onPress={() => setShowAddRecette(false)}
                  variant="outline"
                  style={{ flex: 1, marginRight: SPACING.sm }}
                />
                <Button
                  title="Ajouter"
                  onPress={handleAddRecette}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Ajouter Dépense */}
      <Modal
        visible={showAddDepense}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddDepense(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter une dépense</Text>
              <TouchableOpacity onPress={() => setShowAddDepense(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Rubrique</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={rubrique}
                  onValueChange={setRubrique}
                  style={styles.picker}
                >
                  <Picker.Item label="Bache" value="bache" />
                  <Picker.Item label="Chaises" value="chaises" />
                  <Picker.Item label="Sonorisation" value="sonorisation" />
                  <Picker.Item label="Repas" value="repas" />
                  <Picker.Item label="Honoraires" value="honoraires" />
                  <Picker.Item label="Transport" value="transport" />
                  <Picker.Item label="Habillement" value="habillement" />
                  <Picker.Item label="Autre" value="autre" />
                </Picker>
              </View>

              <Input
                label="Montant (FCFA)"
                value={montantDepense}
                onChangeText={setMontantDepense}
                keyboardType="numeric"
                placeholder="0"
              />

              <Input
                label="Bénéficiaire"
                value={beneficiaire}
                onChangeText={setBeneficiaire}
                placeholder="Nom du bénéficiaire/fournisseur"
              />

              <Input
                label="Description (optionnel)"
                value={descriptionDepense}
                onChangeText={setDescriptionDepense}
                placeholder="Description"
                multiline
              />

              <Input
                label="Date"
                value={dateDepense}
                onChangeText={setDateDepense}
                placeholder="YYYY-MM-DD"
              />

              <View style={styles.modalButtons}>
                <Button
                  title="Annuler"
                  onPress={() => setShowAddDepense(false)}
                  variant="outline"
                  style={{ flex: 1, marginRight: SPACING.sm }}
                />
                <Button
                  title="Ajouter"
                  onPress={handleAddDepense}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  summaryCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
  },
  detailCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  addButton: {
    marginBottom: SPACING.md,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  itemCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  itemInfo: {
    flex: 1,
  },
  itemType: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  itemMontant: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  itemDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  deleteButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalForm: {
    padding: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
});
