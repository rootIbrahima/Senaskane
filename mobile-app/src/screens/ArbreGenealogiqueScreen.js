import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { membreApi } from '../api/membreApi';
import { Card, Loading, FamilyTreeView, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';

export const ArbreGenealogiqueScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [arbre, setArbre] = useState({ membres: [], liens: [], mariages: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEnfant, setSelectedEnfant] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [typeLien, setTypeLien] = useState('pere');
  const [viewMode, setViewMode] = useState('tree'); // 'list' ou 'tree'

  // États pour la gestion des mariages
  const [modalMariageVisible, setModalMariageVisible] = useState(false);
  const [conjoint1Selected, setConjoint1Selected] = useState(null);
  const [conjoint2Selected, setConjoint2Selected] = useState(null);
  const [dateMariage, setDateMariage] = useState('');
  const [lieuMariage, setLieuMariage] = useState('');

  useEffect(() => {
    loadArbre();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadArbre();
    });
    return unsubscribe;
  }, [navigation]);

  const loadArbre = async () => {
    try {
      const response = await membreApi.getArbreGenealogique();
      setArbre(response.data || { membres: [], liens: [], mariages: [] });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'arbre:', error);
      if (Platform.OS === 'web') {
        alert('Erreur lors du chargement de l\'arbre');
      } else {
        Alert.alert('Erreur', 'Impossible de charger l\'arbre généalogique');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadArbre();
  };

  const getParent = (membreId, typeLien) => {
    const lien = arbre.liens.find(
      l => l.enfant_id === membreId && l.type_lien === typeLien
    );
    if (!lien) return null;
    return arbre.membres.find(m => m.id === lien.parent_id);
  };

  const getEnfants = (membreId) => {
    const liensEnfants = arbre.liens.filter(l => l.parent_id === membreId);
    return liensEnfants.map(lien =>
      arbre.membres.find(m => m.id === lien.enfant_id)
    ).filter(Boolean);
  };

  const getConjoint = (membre) => {
    // Chercher les enfants de ce membre
    const enfants = getEnfants(membre.id);
    if (enfants.length === 0) return null;

    // Prendre le premier enfant et chercher l'autre parent
    const premierEnfant = enfants[0];
    const pere = getParent(premierEnfant.id, 'pere');
    const mere = getParent(premierEnfant.id, 'mere');

    // Retourner l'autre parent (le conjoint)
    if (membre.sexe === 'M' && mere) return mere;
    if (membre.sexe === 'F' && pere) return pere;
    return null;
  };

  // Trouver les racines de l'arbre (membres sans parents)
  const getRootMembers = () => {
    return arbre.membres.filter(membre => {
      const hasParents = arbre.liens.some(lien => lien.enfant_id === membre.id);
      return !hasParents;
    });
  };

  const openAddLienModal = (membre) => {
    setSelectedEnfant(membre);
    setSelectedParent(null);
    setTypeLien('pere');
    setModalVisible(true);
  };

  const handleAddLien = async () => {
    if (!selectedParent) {
      const msg = 'Veuillez sélectionner un parent';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Attention', msg);
      }
      return;
    }

    try {
      await membreApi.addLienParental({
        enfantId: selectedEnfant.id,
        parentId: selectedParent,
        typeLien: typeLien,
      });

      const msg = 'Lien parental ajouté avec succès';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Succès', msg);
      }

      setModalVisible(false);
      loadArbre();
    } catch (error) {
      console.error('Erreur ajout lien:', error);
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'ajout du lien';
      if (Platform.OS === 'web') {
        alert(errorMsg);
      } else {
        Alert.alert('Erreur', errorMsg);
      }
    }
  };

  const handleDeleteLien = async (lienId, typeParent) => {
    const confirmFunc = Platform.OS === 'web'
      ? (message) => window.confirm(message)
      : (message, callback) => {
          Alert.alert(
            'Confirmer la suppression',
            message,
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: callback },
            ]
          );
        };

    const message = `Voulez-vous vraiment supprimer ce lien parental (${typeParent}) ?`;

    if (Platform.OS === 'web') {
      if (!confirmFunc(message)) return;
      try {
        await membreApi.deleteLienParental(lienId);
        alert('Lien parental supprimé');
        loadArbre();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    } else {
      confirmFunc(message, async () => {
        try {
          await membreApi.deleteLienParental(lienId);
          Alert.alert('Succès', 'Lien parental supprimé');
          loadArbre();
        } catch (error) {
          Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de la suppression');
        }
      });
    }
  };

  // Ouvrir le modal pour ajouter un mariage
  const openAddMariageModal = () => {
    setConjoint1Selected(null);
    setConjoint2Selected(null);
    setDateMariage('');
    setLieuMariage('');
    setModalMariageVisible(true);
  };

  // Ajouter un mariage
  const handleAddMariage = async () => {
    if (!conjoint1Selected || !conjoint2Selected) {
      const msg = 'Veuillez sélectionner les deux conjoints';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Attention', msg);
      }
      return;
    }

    if (conjoint1Selected === conjoint2Selected) {
      const msg = 'Un membre ne peut pas se marier avec lui-même';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Attention', msg);
      }
      return;
    }

    try {
      await membreApi.addMariage({
        conjoint1Id: conjoint1Selected,
        conjoint2Id: conjoint2Selected,
        dateMariage: dateMariage || null,
        lieuMariage: lieuMariage || null,
        statut: 'actif'
      });

      const msg = 'Mariage ajouté avec succès';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Succès', msg);
      }

      setModalMariageVisible(false);
      loadArbre();
    } catch (error) {
      console.error('Erreur ajout mariage:', error);
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'ajout du mariage';
      if (Platform.OS === 'web') {
        alert(errorMsg);
      } else {
        Alert.alert('Erreur', errorMsg);
      }
    }
  };

  // Supprimer un mariage
  const handleDeleteMariage = async (mariageId, conjoint1Nom, conjoint2Nom) => {
    const confirmFunc = Platform.OS === 'web'
      ? (message) => window.confirm(message)
      : (message, callback) => {
          Alert.alert(
            'Confirmer la suppression',
            message,
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: callback },
            ]
          );
        };

    const message = `Voulez-vous vraiment supprimer le mariage entre ${conjoint1Nom} et ${conjoint2Nom} ?`;

    if (Platform.OS === 'web') {
      if (!confirmFunc(message)) return;
      try {
        await membreApi.deleteMariage(mariageId);
        alert('Mariage supprimé');
        loadArbre();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    } else {
      confirmFunc(message, async () => {
        try {
          await membreApi.deleteMariage(mariageId);
          Alert.alert('Succès', 'Mariage supprimé');
          loadArbre();
        } catch (error) {
          Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de la suppression');
        }
      });
    }
  };

  // Générer et exporter le PDF de l'arbre généalogique
  const exportToPDF = async () => {
    try {
      // Organiser les membres par génération
      const membreMap = {};
      arbre.membres.forEach(m => {
        membreMap[m.id] = { ...m, children: [], parents: [] };
      });

      arbre.liens.forEach(lien => {
        if (membreMap[lien.enfant_id] && membreMap[lien.parent_id]) {
          membreMap[lien.enfant_id].parents.push(lien.parent_id);
          membreMap[lien.parent_id].children.push(lien.enfant_id);
        }
      });

      // Trouver les racines
      const roots = arbre.membres.filter(m => membreMap[m.id].parents.length === 0);

      // Fonction pour construire l'arbre HTML par génération
      const buildTreeHTML = (membreId, visited = new Set(), level = 0) => {
        if (visited.has(membreId)) return '';
        visited.add(membreId);

        const membre = membreMap[membreId];
        if (!membre) return '';

        const indent = '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(level);
        const sexeIcon = membre.sexe === 'M' ? '♂' : '♀';
        const sexeColor = membre.sexe === 'M' ? '#2196F3' : '#E91E63';

        let html = `
          <div style="margin-left: ${level * 20}px; margin-bottom: 10px; page-break-inside: avoid;">
            <div style="padding: 10px; border: 2px solid ${sexeColor}; border-radius: 8px; background-color: #f9f9f9;">
              <div style="font-weight: bold; color: ${sexeColor}; font-size: 16px;">
                ${sexeIcon} ${membre.prenom} ${membre.nom}
              </div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                N°: ${membre.numero_identification || 'N/A'}
              </div>
              ${membre.dateNaissance ? `<div style="font-size: 11px; color: #888;">Né(e): ${membre.dateNaissance}</div>` : ''}
              ${membre.profession ? `<div style="font-size: 11px; color: #888;">Profession: ${membre.profession}</div>` : ''}
            </div>
          </div>
        `;

        // Ajouter les enfants
        if (membre.children && membre.children.length > 0) {
          membre.children.forEach(childId => {
            html += buildTreeHTML(childId, visited, level + 1);
          });
        }

        return html;
      };

      // Construire le HTML complet
      let treeHTML = '';
      roots.forEach(root => {
        treeHTML += buildTreeHTML(root.id);
      });

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                padding: 20px;
                background-color: white;
              }
              h1 {
                color: #1e3a8a;
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #1e3a8a;
                padding-bottom: 10px;
              }
              .info {
                text-align: center;
                color: #666;
                margin-bottom: 20px;
                font-size: 12px;
              }
              .generation-title {
                font-size: 18px;
                font-weight: bold;
                color: #1e3a8a;
                margin-top: 30px;
                margin-bottom: 15px;
                border-left: 4px solid #1e3a8a;
                padding-left: 10px;
              }
              @media print {
                body { margin: 0; padding: 10px; }
                @page { margin: 1cm; }
              }
            </style>
          </head>
          <body>
            <h1>🌳 Arbre Généalogique - Baïla Généa</h1>
            <div class="info">
              Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
            </div>
            <div class="info">
              <strong>Total: ${arbre.membres.length} membres</strong> |
              <strong>${arbre.liens.length} liens parentaux</strong>
            </div>
            <div style="margin-top: 30px;">
              ${treeHTML}
            </div>
          </body>
        </html>
      `;

      // Sur web, utiliser window.print()
      if (Platform.OS === 'web') {
        // Ouvrir dans une nouvelle fenêtre et imprimer
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();

          // Attendre que le contenu soit chargé avant d'imprimer
          printWindow.onload = () => {
            printWindow.print();
          };

          alert('La fenêtre d\'impression s\'est ouverte. Vous pouvez sauvegarder en PDF depuis la boîte de dialogue d\'impression.');
        } else {
          alert('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les popups pour ce site.');
        }
        return;
      }

      // Sur mobile, utiliser expo-print
      const result = await Print.printToFileAsync({ html });

      if (!result || !result.uri) {
        throw new Error('Échec de la génération du PDF');
      }

      // Partager le PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Arbre Généalogique',
          UTI: 'com.adobe.pdf'
        });

        Alert.alert('Succès', 'L\'arbre généalogique a été exporté en PDF');
      } else {
        Alert.alert('Erreur', 'Le partage n\'est pas disponible sur cet appareil');
      }
    } catch (error) {
      console.error('Erreur export PDF:', error);
      if (Platform.OS === 'web') {
        alert('Erreur lors de l\'export du PDF: ' + error.message);
      } else {
        Alert.alert('Erreur', 'Impossible d\'exporter le PDF');
      }
    }
  };

  // Rendu d'une carte de personne
  const renderPersonCard = (membre, showAddButton = true) => {
    if (!membre) return null;

    const pere = getParent(membre.id, 'pere');
    const mere = getParent(membre.id, 'mere');
    const pereLink = arbre.liens.find(l => l.enfant_id === membre.id && l.type_lien === 'pere');
    const mereLink = arbre.liens.find(l => l.enfant_id === membre.id && l.type_lien === 'mere');

    return (
      <View style={styles.personCard}>
        <TouchableOpacity
          style={[
            styles.personCardInner,
            { borderColor: membre.sexe === 'M' ? '#2196F3' : '#E91E63' }
          ]}
          onPress={() => navigation.navigate('MembreDetail', { membre })}
        >
          <View style={[
            styles.personGenderBadge,
            { backgroundColor: membre.sexe === 'M' ? '#2196F3' : '#E91E63' }
          ]}>
            <Ionicons
              name={membre.sexe === 'M' ? 'male' : 'female'}
              size={14}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.personName} numberOfLines={2}>
            {membre.prenom}
          </Text>
          <Text style={styles.personLastName} numberOfLines={1}>
            {membre.nom}
          </Text>
          {membre.date_naissance && (
            <Text style={styles.personDate}>
              {membre.date_naissance.substring(0, 4)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Parents info */}
        {(pere || mere) && (
          <View style={styles.personParentsInfo}>
            {pere && (
              <View style={styles.parentChipSmall}>
                <Ionicons name="male" size={8} color="#2196F3" />
                <Text style={styles.parentChipSmallText}>{pere.prenom.substring(0, 8)}</Text>
                {user?.role === 'admin' && (
                  <TouchableOpacity onPress={() => handleDeleteLien(pereLink.id, 'père')}>
                    <Ionicons name="close-circle" size={10} color={COLORS.error} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            {mere && (
              <View style={styles.parentChipSmall}>
                <Ionicons name="female" size={8} color="#E91E63" />
                <Text style={styles.parentChipSmallText}>{mere.prenom.substring(0, 8)}</Text>
                {user?.role === 'admin' && (
                  <TouchableOpacity onPress={() => handleDeleteLien(mereLink.id, 'mère')}>
                    <Ionicons name="close-circle" size={10} color={COLORS.error} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Bouton ajouter parent */}
        {user?.role === 'admin' && showAddButton && (
          <TouchableOpacity
            style={styles.addParentIconButton}
            onPress={() => openAddLienModal(membre)}
          >
            <Ionicons name="add-circle" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Rendu d'un couple avec leurs enfants
  const renderFamilyNode = (membre, processedIds = new Set()) => {
    if (processedIds.has(membre.id)) return null;
    processedIds.add(membre.id);

    const conjoint = getConjoint(membre);
    if (conjoint) processedIds.add(conjoint.id);

    const enfants = getEnfants(membre.id);
    const enfantsUniques = [];
    const enfantsProcessedIds = new Set();

    enfants.forEach(enfant => {
      if (!enfantsProcessedIds.has(enfant.id)) {
        enfantsUniques.push(enfant);
        enfantsProcessedIds.add(enfant.id);
      }
    });

    return (
      <View key={membre.id} style={styles.familyNode}>
        {/* Parents (couple) */}
        <View style={styles.coupleContainer}>
          {membre.sexe === 'M' ? (
            <>
              {renderPersonCard(membre)}
              {conjoint && (
                <>
                  <View style={styles.marriageLine} />
                  {renderPersonCard(conjoint)}
                </>
              )}
            </>
          ) : (
            <>
              {conjoint && (
                <>
                  {renderPersonCard(conjoint)}
                  <View style={styles.marriageLine} />
                </>
              )}
              {renderPersonCard(membre)}
            </>
          )}
        </View>

        {/* Ligne verticale vers les enfants */}
        {enfantsUniques.length > 0 && (
          <View style={styles.childrenLinkContainer}>
            <View style={styles.verticalLine} />
            <View style={styles.horizontalLine} />
          </View>
        )}

        {/* Enfants */}
        {enfantsUniques.length > 0 && (
          <View style={styles.childrenRow}>
            {enfantsUniques.map((enfant, index) => (
              <View key={enfant.id} style={styles.childContainer}>
                <View style={styles.childVerticalLine} />
                {renderFamilyNode(enfant, processedIds)}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Rendu de la vue arbre généalogique avec le nouveau composant visuel
  const renderTreeView = () => {
    if (arbre.membres.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="git-network-outline" size={80} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Aucun membre dans l'arbre</Text>
        </View>
      );
    }

    return (
      <FamilyTreeView
        membres={arbre.membres}
        liens={arbre.liens}
        mariages={arbre.mariages || []}
        onNodePress={(membre) => navigation.navigate('MembreDetail', { membre })}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };

  // Rendu vue liste
  const renderMembre = ({ item }) => {
    const pere = getParent(item.id, 'pere');
    const mere = getParent(item.id, 'mere');
    const enfants = getEnfants(item.id);

    const pereLink = arbre.liens.find(l => l.enfant_id === item.id && l.type_lien === 'pere');
    const mereLink = arbre.liens.find(l => l.enfant_id === item.id && l.type_lien === 'mere');

    return (
      <Card style={styles.membreCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MembreDetail', { membre: item })}
        >
          <View style={styles.membreHeader}>
            <View style={[
              styles.genderIcon,
              { backgroundColor: item.sexe === 'M' ? '#2196F3' : '#E91E63' }
            ]}>
              <Ionicons
                name={item.sexe === 'M' ? 'male' : 'female'}
                size={20}
                color={COLORS.white}
              />
            </View>
            <View style={styles.membreInfo}>
              <Text style={styles.membreName}>
                {item.prenom} {item.nom}
              </Text>
              <Text style={styles.membreNumero}>{item.numero_identification}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parents</Text>
          {pere ? (
            <View style={styles.parentRow}>
              <Ionicons name="male" size={16} color="#2196F3" />
              <Text style={styles.parentText}>Père: {pere.prenom} {pere.nom}</Text>
              {user?.role === 'admin' && (
                <TouchableOpacity
                  onPress={() => handleDeleteLien(pereLink.id, 'père')}
                  style={styles.deleteButton}
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          {mere ? (
            <View style={styles.parentRow}>
              <Ionicons name="female" size={16} color="#E91E63" />
              <Text style={styles.parentText}>Mère: {mere.prenom} {mere.nom}</Text>
              {user?.role === 'admin' && (
                <TouchableOpacity
                  onPress={() => handleDeleteLien(mereLink.id, 'mère')}
                  style={styles.deleteButton}
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          {!pere && !mere && (
            <Text style={styles.emptyText}>Aucun parent enregistré</Text>
          )}
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openAddLienModal(item)}
            >
              <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Ajouter un parent</Text>
            </TouchableOpacity>
          )}
        </View>

        {enfants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enfants ({enfants.length})</Text>
            {enfants.map(enfant => (
              <View key={enfant.id} style={styles.enfantRow}>
                <Ionicons
                  name={enfant.sexe === 'M' ? 'male' : 'female'}
                  size={14}
                  color={enfant.sexe === 'M' ? '#2196F3' : '#E91E63'}
                />
                <Text style={styles.enfantText}>
                  {enfant.prenom} {enfant.nom}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return <Loading text="Chargement de l'arbre généalogique..." />;
  }

  const membresDisponibles = arbre.membres.filter(m => {
    if (!selectedEnfant) return true;
    return m.id !== selectedEnfant.id;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Arbre Généalogique</Text>
          <Text style={styles.headerSubtitle}>
            {arbre.membres.length} membres • {arbre.liens.length} liens • {arbre.mariages?.length || 0} mariages
          </Text>
        </View>

        <TouchableOpacity
          style={styles.pdfButton}
          onPress={exportToPDF}
          disabled={arbre.membres.length === 0}
        >
          <Ionicons name="download-outline" size={20} color={COLORS.white} />
          <Text style={styles.pdfButtonText}>PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewToggleRow}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'tree' && styles.toggleButtonActive]}
            onPress={() => setViewMode('tree')}
          >
            <Ionicons
              name="git-network"
              size={20}
              color={viewMode === 'tree' ? COLORS.white : COLORS.primary}
            />
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'tree' && styles.toggleButtonTextActive
            ]}>Arbre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === 'list' ? COLORS.white : COLORS.primary}
            />
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'list' && styles.toggleButtonTextActive
            ]}>Liste</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'tree' ? (
        renderTreeView()
      ) : (
        <FlatList
          data={arbre.membres}
          renderItem={renderMembre}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="git-network-outline" size={80} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Aucun membre dans l'arbre</Text>
            </View>
          }
        />
      )}

      {/* Bouton flottant pour ajouter un mariage */}
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={openAddMariageModal}
        >
          <Ionicons name="heart" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}

      {/* Modal pour ajouter un lien parental */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un parent</Text>
            <Text style={styles.modalSubtitle}>
              Pour: {selectedEnfant?.prenom} {selectedEnfant?.nom}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type de lien</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={typeLien}
                  onValueChange={setTypeLien}
                  style={styles.picker}
                >
                  <Picker.Item label="Père" value="pere" />
                  <Picker.Item label="Mère" value="mere" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Sélectionner le parent</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedParent}
                  onValueChange={setSelectedParent}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Choisir --" value={null} />
                  {membresDisponibles.map(membre => (
                    <Picker.Item
                      key={membre.id}
                      label={`${membre.prenom} ${membre.nom} (${membre.numero_identification})`}
                      value={membre.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddLien}
              >
                <Text style={styles.modalButtonPrimaryText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pour ajouter un mariage */}
      <Modal
        visible={modalMariageVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMariageVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un mariage</Text>
            <Text style={styles.modalSubtitle}>
              Sélectionnez les deux conjoints
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Premier conjoint</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={conjoint1Selected}
                  onValueChange={setConjoint1Selected}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Choisir --" value={null} />
                  {arbre.membres.map(membre => (
                    <Picker.Item
                      key={membre.id}
                      label={`${membre.prenom} ${membre.nom} (${membre.sexe})`}
                      value={membre.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Deuxième conjoint</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={conjoint2Selected}
                  onValueChange={setConjoint2Selected}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Choisir --" value={null} />
                  {arbre.membres.map(membre => (
                    <Picker.Item
                      key={membre.id}
                      label={`${membre.prenom} ${membre.nom} (${membre.sexe})`}
                      value={membre.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date de mariage (optionnel)</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={dateMariage}
                  onChange={(e) => setDateMariage(e.target.value)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    fontSize: '16px',
                    width: '100%',
                  }}
                />
              ) : (
                <Input
                  placeholder="AAAA-MM-JJ"
                  value={dateMariage}
                  onChangeText={setDateMariage}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Lieu de mariage (optionnel)</Text>
              <Input
                placeholder="Ville, Pays"
                value={lieuMariage}
                onChangeText={setLieuMariage}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalMariageVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddMariage}
              >
                <Text style={styles.modalButtonPrimaryText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pdfButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  viewToggleRow: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // Vue arbre généalogique
  treeScrollView: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  treeScrollContent: {
    minWidth: '100%',
    paddingHorizontal: SPACING.lg,
  },
  treeVerticalScroll: {
    flex: 1,
  },
  treeContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  familyNode: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  coupleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  marriageLine: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.error,
    borderRadius: 2,
  },
  personCard: {
    alignItems: 'center',
    position: 'relative',
  },
  personCardInner: {
    width: 110,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  personGenderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  personName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  personLastName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  personDate: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  personParentsInfo: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  parentChipSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  parentChipSmallText: {
    fontSize: 9,
    color: COLORS.text,
  },
  addParentIconButton: {
    marginTop: 4,
  },
  childrenLinkContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  verticalLine: {
    width: 3,
    height: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  horizontalLine: {
    height: 3,
    width: 120,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  childrenRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  childContainer: {
    alignItems: 'center',
  },
  childVerticalLine: {
    width: 3,
    height: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
  },

  // Vue liste
  listContent: {
    padding: SPACING.md,
  },
  membreCard: {
    marginBottom: SPACING.md,
  },
  membreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  genderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  membreInfo: {
    flex: 1,
  },
  membreName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  membreNumero: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  section: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  parentText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  enfantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  enfantText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  addButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  modalButtonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonPrimaryText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  modalButtonSecondaryText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },

  // Bouton flottant (FAB)
  fabButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
