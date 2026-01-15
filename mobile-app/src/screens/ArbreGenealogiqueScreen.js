import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

export const ArbreGenealogiqueScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [arbre, setArbre] = useState({ membres: [], liens: [], mariages: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEnfant, setSelectedEnfant] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [typeLien, setTypeLien] = useState('pere');
  const [viewMode, setViewMode] = useState('tree'); // 'list' ou 'tree'
  const [focusMembreId, setFocusMembreId] = useState(null); // Pour l'arbre individuel
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  // Handle navigation params for individual tree
  useEffect(() => {
    if (route.params?.focusMembreId) {
      setFocusMembreId(route.params.focusMembreId);
      setViewMode('tree'); // Switch to tree view when showing individual tree
    }
  }, [route.params?.focusMembreId]);

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

  // Memoized helper functions to prevent recalculation
  const getParent = useCallback((membreId, typeLien) => {
    const lien = arbre.liens.find(
      l => l.enfant_id === membreId && l.type_lien === typeLien
    );
    if (!lien) return null;
    return arbre.membres.find(m => m.id === lien.parent_id);
  }, [arbre.liens, arbre.membres]);

  const getEnfants = useCallback((membreId) => {
    const liensEnfants = arbre.liens.filter(l => l.parent_id === membreId);
    return liensEnfants.map(lien =>
      arbre.membres.find(m => m.id === lien.enfant_id)
    ).filter(Boolean);
  }, [arbre.liens, arbre.membres]);

  const getConjoint = useCallback((membre) => {
    // Chercher les enfants de ce membre
    const liensEnfants = arbre.liens.filter(l => l.parent_id === membre.id);
    const enfants = liensEnfants.map(lien =>
      arbre.membres.find(m => m.id === lien.enfant_id)
    ).filter(Boolean);

    if (enfants.length === 0) return null;

    // Prendre le premier enfant et chercher l'autre parent
    const premierEnfant = enfants[0];
    const lienPere = arbre.liens.find(
      l => l.enfant_id === premierEnfant.id && l.type_lien === 'pere'
    );
    const lienMere = arbre.liens.find(
      l => l.enfant_id === premierEnfant.id && l.type_lien === 'mere'
    );

    const pere = lienPere ? arbre.membres.find(m => m.id === lienPere.parent_id) : null;
    const mere = lienMere ? arbre.membres.find(m => m.id === lienMere.parent_id) : null;

    // Retourner l'autre parent (le conjoint)
    if (membre.sexe === 'M' && mere) return mere;
    if (membre.sexe === 'F' && pere) return pere;
    return null;
  }, [arbre.liens, arbre.membres]);

  // Fonction pour obtenir l'arbre individuel d'un membre
  const getIndividualTree = useCallback((membreId) => {
    // Validation des données
    if (!arbre || !arbre.membres || !arbre.liens) {
      return { membres: [], liens: [], mariages: [] };
    }

    if (!membreId) return { membres: arbre.membres, liens: arbre.liens, mariages: arbre.mariages || [] };

    const includedMembres = new Set();
    const includedLiens = [];
    let recursionCount = 0;
    const MAX_RECURSION = 200; // Limite de sécurité globale

    // Fonction récursive pour remonter les ancêtres avec protection renforcée
    const addAncestors = (id, depth = 0) => {
      recursionCount++;
      if (recursionCount > MAX_RECURSION) return; // Protection globale
      if (depth > 5) return; // Max 5 générations d'ancêtres
      if (includedMembres.has(id)) return; // Éviter les cycles AVANT d'ajouter
      if (!id) return; // Validation ID

      includedMembres.add(id);

      (arbre.liens || []).forEach(lien => {
        if (lien && lien.enfant_id === id && lien.parent_id && lien.parent_id !== id) {
          if (!includedLiens.some(l => l.id === lien.id)) {
            includedLiens.push(lien);
          }
          addAncestors(lien.parent_id, depth + 1);
        }
      });
    };

    // Fonction récursive pour descendre les descendants avec protection renforcée
    const addDescendants = (id, depth = 0) => {
      recursionCount++;
      if (recursionCount > MAX_RECURSION) return; // Protection globale
      if (depth > 3) return; // Max 3 générations de descendants
      if (includedMembres.has(id) && depth > 0) return; // Éviter les cycles après premier niveau
      if (!id) return; // Validation ID

      if (depth === 0) includedMembres.add(id); // N'ajouter qu'au premier niveau

      (arbre.liens || []).forEach(lien => {
        if (lien && lien.parent_id === id && lien.enfant_id && lien.enfant_id !== id) {
          if (!includedLiens.some(l => l.id === lien.id)) {
            includedLiens.push(lien);
          }
          addDescendants(lien.enfant_id, depth + 1);
        }
      });
    };

    // Ajouter ancêtres et descendants de la personne principale
    try {
      addAncestors(membreId, 0);
      recursionCount = 0; // Reset pour descendants
      addDescendants(membreId, 0);
    } catch (error) {
      console.error('Erreur getIndividualTree:', error);
      return { membres: [], liens: [], mariages: [] };
    }

    // Filtrer les membres et liens
    const filteredMembres = (arbre.membres || []).filter(m => m && m.id && includedMembres.has(m.id));

    return {
      membres: filteredMembres,
      liens: includedLiens,
      mariages: arbre.mariages || []
    };
  }, [arbre]);

  // Trouver les racines de l'arbre (membres sans parents) - Memoized
  const rootMembers = useMemo(() => {
    if (!arbre || !arbre.membres || !Array.isArray(arbre.membres)) {
      return [];
    }
    return arbre.membres.filter(membre => {
      if (!membre || !membre.id) return false;
      const hasParents = (arbre.liens || []).some(lien => lien && lien.enfant_id === membre.id);
      return !hasParents;
    });
  }, [arbre]);

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

  // Générer et exporter le PDF de l'arbre généalogique
  const exportToPDF = async () => {
    try {
      // Validation et limitation des membres
      if (!arbre.membres || !Array.isArray(arbre.membres) || arbre.membres.length === 0) {
        Alert.alert('Erreur', 'Aucun membre à exporter');
        return;
      }

      const MAX_MEMBERS = 100; // 100 membres pour couvrir plusieurs générations
      let membresForPDF = arbre.membres;
      if (membresForPDF.length > MAX_MEMBERS) {
        Alert.alert(
          'Arbre volumineux',
          `L'arbre contient ${membresForPDF.length} membres. Seuls les ${MAX_MEMBERS} premiers seront exportés dans le PDF.`,
          [{ text: 'OK' }]
        );
        membresForPDF = membresForPDF.slice(0, MAX_MEMBERS);
      }

      // Éliminer les doublons
      const uniqueMembres = [];
      const seenIds = new Set();
      membresForPDF.forEach(m => {
        if (m && m.id && !seenIds.has(m.id)) {
          seenIds.add(m.id);
          uniqueMembres.push(m);
        }
      });
      membresForPDF = uniqueMembres;

      // Valider et nettoyer les liens
      const validLiens = (arbre.liens || []).filter(lien =>
        lien &&
        lien.enfant_id &&
        lien.parent_id &&
        lien.enfant_id !== lien.parent_id
      );

      // Valider et nettoyer les mariages
      const validMariages = (arbre.mariages || []).filter(mariage =>
        mariage &&
        mariage.conjoint1_id &&
        mariage.conjoint2_id &&
        mariage.conjoint1_id !== mariage.conjoint2_id
      );

      // Utiliser la même logique de layout que FamilyTreeView
      const membreMap = {};
      membresForPDF.forEach(m => {
        membreMap[m.id] = { ...m, children: [], parents: [], spouse: null };
      });

      // Ajouter les relations parent-enfant
      validLiens.forEach(lien => {
        if (membreMap[lien.enfant_id] && membreMap[lien.parent_id]) {
          membreMap[lien.enfant_id].parents.push({
            id: lien.parent_id,
            type: lien.type_lien
          });
          if (!membreMap[lien.parent_id].children.includes(lien.enfant_id)) {
            membreMap[lien.parent_id].children.push(lien.enfant_id);
          }
        }
      });

      // Ajouter les relations de mariage
      validMariages.forEach(mariage => {
        if (membreMap[mariage.conjoint1_id] && membreMap[mariage.conjoint2_id]) {
          membreMap[mariage.conjoint1_id].spouse = mariage.conjoint2_id;
          membreMap[mariage.conjoint2_id].spouse = mariage.conjoint1_id;
        }
      });

      // Trouver les racines (personnes sans parents)
      const roots = membresForPDF.filter(m => membreMap[m.id] && membreMap[m.id].parents.length === 0);

      if (roots.length === 0 && membresForPDF.length > 0) {
        roots.push(membresForPDF[0]);
      }

      // Calculer les positions des nœuds (même logique que FamilyTreeView)
      const NODE_WIDTH = 160;
      const NODE_HEIGHT = 120;
      const HORIZONTAL_SPACING = 50;
      const VERTICAL_SPACING = 90;

      const positions = {};
      const connections = [];
      const processedSpouses = new Set();

      // Calculer la largeur de sous-arbre pour chaque nœud (bottom-up) avec mémoïsation
      const subtreeWidthCache = {};
      const calculateSubtreeWidth = (membreId) => {
        // Utiliser le cache pour éviter les recalculs
        if (subtreeWidthCache[membreId] !== undefined) {
          return subtreeWidthCache[membreId];
        }

        const membre = membreMap[membreId];
        if (!membre) {
          subtreeWidthCache[membreId] = NODE_WIDTH;
          return NODE_WIDTH;
        }

        if (!membre.children || membre.children.length === 0) {
          if (membre.spouse && membreMap[membre.spouse]) {
            subtreeWidthCache[membreId] = (NODE_WIDTH * 2) + 20;
            return (NODE_WIDTH * 2) + 20;
          }
          subtreeWidthCache[membreId] = NODE_WIDTH;
          return NODE_WIDTH;
        }

        let childrenWidth = 0;
        membre.children.forEach((childId, index) => {
          if (membreMap[childId]) {
            childrenWidth += calculateSubtreeWidth(childId);
            if (index < membre.children.length - 1) {
              childrenWidth += HORIZONTAL_SPACING;
            }
          }
        });

        const parentWidth = membre.spouse && membreMap[membre.spouse] ? (NODE_WIDTH * 2) + 20 : NODE_WIDTH;
        const width = Math.max(parentWidth, childrenWidth);
        subtreeWidthCache[membreId] = width;
        return width;
      };

      // Positionner les nœuds récursivement (top-down)
      let maxX = 0;
      const positioned = new Set();
      let positionCallCount = 0;
      const MAX_POSITION_CALLS = 150; // Limite pour 100 membres sur plusieurs générations
      const MAX_DEPTH_PER_NODE = 10; // Profondeur max pour couvrir plusieurs générations
      const globalVisited = new Set(); // Visited set global pour tous les appels

      const positionNode = (membreId, startX, y, depth = 0) => {
        // Protection contre trop d'appels
        positionCallCount++;
        if (positionCallCount > MAX_POSITION_CALLS) {
          return startX;
        }

        // Protection contre profondeur excessive
        if (depth > MAX_DEPTH_PER_NODE) {
          return startX;
        }

        if (globalVisited.has(membreId) || positioned.has(membreId)) return startX;
        globalVisited.add(membreId);

        const membre = membreMap[membreId];
        if (!membre) return startX;

        const subtreeWidth = calculateSubtreeWidth(membreId);
        const hasSpouse = membre.spouse && membreMap[membre.spouse] && !positioned.has(membre.spouse);
        const parentWidth = hasSpouse ? (NODE_WIDTH * 2) + 20 : NODE_WIDTH;

        let nodeX = startX;
        if (membre.children && membre.children.length > 0) {
          const childrenWidth = membre.children.reduce((total, childId, index) => {
            if (membreMap[childId]) {
              total += calculateSubtreeWidth(childId);
              if (index < membre.children.length - 1) {
                total += HORIZONTAL_SPACING;
              }
            }
            return total;
          }, 0);

          nodeX = startX + (childrenWidth - parentWidth) / 2;
        }

        positions[membreId] = {
          x: Math.max(40, nodeX),
          y: y,
          membre: membre
        };
        positioned.add(membreId);

        let currentX = nodeX + NODE_WIDTH + 20;

        if (hasSpouse) {
          positions[membre.spouse] = {
            x: currentX,
            y: y,
            membre: membreMap[membre.spouse]
          };
          positioned.add(membre.spouse);
          processedSpouses.add(membre.spouse);

          connections.push({
            type: 'marriage',
            from: positions[membreId],
            to: positions[membre.spouse]
          });
        }

        if (membre.children && membre.children.length > 0) {
          let childX = startX;
          const childY = y + NODE_HEIGHT + VERTICAL_SPACING;

          membre.children.forEach((childId, index) => {
            if (membreMap[childId] && !positioned.has(childId)) {
              positionNode(childId, childX, childY, depth + 1);
              childX += calculateSubtreeWidth(childId);
              if (index < membre.children.length - 1) {
                childX += HORIZONTAL_SPACING;
              }
            }
          });
        }

        maxX = Math.max(maxX, startX + subtreeWidth);
        return startX + subtreeWidth + HORIZONTAL_SPACING;
      };

      // Positionner à partir des racines (limité à MAX_ROOTS)
      const MAX_ROOTS = 5; // Max 5 racines
      let currentRootX = 40;
      const rootsToProcess = roots.slice(0, MAX_ROOTS);
      rootsToProcess.forEach(root => {
        if (root && root.id && !positioned.has(root.id)) {
          const rootWidth = calculateSubtreeWidth(root.id);
          positionNode(root.id, currentRootX, 40);
          currentRootX += rootWidth + HORIZONTAL_SPACING * 2;
        }
      });

      // Créer les connexions parent-enfant (avec limite)
      const MAX_CONNECTIONS = 100; // Limite de connexions pour éviter surcharge
      validLiens.forEach(lien => {
        if (connections.length >= MAX_CONNECTIONS) return; // Stop si limite atteinte
        if (positions[lien.parent_id] && positions[lien.enfant_id]) {
          connections.push({
            type: 'parent',
            from: positions[lien.parent_id],
            to: positions[lien.enfant_id],
            linkType: lien.type_lien
          });
        }
      });

      const maxY = Math.max(...Object.values(positions).map(p => p.y)) + NODE_HEIGHT + 40;
      const totalWidth = maxX + 40;

      // Construire les cartes de personnes avec positions absolues
      let nodesHTML = '';
      Object.values(positions).forEach(node => {
        const membre = node.membre;
        const sexeIcon = membre.sexe === 'M' ? '♂' : '♀';
        const sexeColor = membre.sexe === 'M' ? '#2196F3' : '#E91E63';

        nodesHTML += `
          <div class="person-card" style="left: ${node.x}px; top: ${node.y}px; border-color: ${sexeColor};">
            <div class="person-icon" style="background-color: ${sexeColor};">
              ${sexeIcon}
            </div>
            <div class="person-name">${membre.prenom} ${membre.nom}</div>
            ${membre.date_naissance ? `<div class="person-info">${membre.date_naissance.substring(0, 4)}</div>` : ''}
          </div>
        `;
      });

      // Construire les connexions SVG
      let connectionsHTML = '';
      connections.forEach((conn, index) => {
        if (conn.type === 'marriage') {
          const y = conn.from.y + NODE_HEIGHT / 2;
          connectionsHTML += `
            <line x1="${conn.from.x + NODE_WIDTH}" y1="${y}"
                  x2="${conn.to.x}" y2="${y}"
                  stroke="#dc2626" stroke-width="3" stroke-dasharray="5,5"/>
          `;
        } else if (conn.type === 'parent') {
          const startX = conn.from.x + NODE_WIDTH / 2;
          const startY = conn.from.y + NODE_HEIGHT;
          const endX = conn.to.x + NODE_WIDTH / 2;
          const endY = conn.to.y;
          const midY = (startY + endY) / 2;

          const color = conn.linkType === 'pere' ? '#2196F3' : '#E91E63';
          connectionsHTML += `
            <path d="M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}"
                  stroke="${color}" stroke-width="2" fill="none"/>
          `;
        }
      });

      const treeHTML = `
        <div class="tree-container" style="width: ${totalWidth}px; height: ${maxY}px;">
          <svg width="${totalWidth}" height="${maxY}" style="position: absolute; top: 0; left: 0;">
            ${connectionsHTML}
          </svg>
          ${nodesHTML}
        </div>
      `;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                padding: 15px;
                background-color: #f8f9fa;
                overflow-x: auto;
              }

              h1 {
                color: #2E7D32;
                text-align: center;
                margin-bottom: 15px;
                border-bottom: 3px solid #2E7D32;
                padding-bottom: 8px;
                font-size: 22px;
              }

              .info {
                text-align: center;
                color: #666;
                margin-bottom: 25px;
                font-size: 10px;
              }

              .tree-container {
                position: relative;
                background-color: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
                min-width: fit-content;
              }

              .person-card {
                position: absolute;
                background: white;
                border: 3px solid;
                border-radius: 12px;
                padding: 12px;
                width: 160px;
                text-align: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                page-break-inside: avoid;
              }

              .person-icon {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 6px;
                color: white;
                font-size: 16px;
                font-weight: bold;
              }

              .person-name {
                font-weight: bold;
                font-size: 13px;
                color: #333;
                margin-bottom: 4px;
                word-wrap: break-word;
                line-height: 1.3;
              }

              .person-info {
                font-size: 10px;
                color: #2E7D32;
                margin-top: 4px;
                font-weight: 600;
              }

              @media print {
                body {
                  margin: 0;
                  padding: 10px;
                  background-color: white;
                }
                @page {
                  size: landscape;
                  margin: 0.8cm;
                }
                h1 {
                  font-size: 20px;
                  margin-bottom: 10px;
                  padding-bottom: 6px;
                }
                .info {
                  margin-bottom: 15px;
                  font-size: 9px;
                }
                .tree-container {
                  border: none;
                  padding: 10px;
                }
                .person-card {
                  border-width: 2px;
                  padding: 10px;
                }
              }
            </style>
          </head>
          <body>
            <h1>🌳 Arbre Généalogique - Baïla Généa</h1>
            <div class="info">
              Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
              <strong>Total: ${arbre.membres.length} membres</strong> |
              <strong>${arbre.liens.length} liens parentaux</strong>
            </div>
            ${treeHTML}
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

    // Utiliser l'arbre filtré si un membre est sélectionné
    const treeData = focusMembreId ? getIndividualTree(focusMembreId) : arbre;

    return (
      <FamilyTreeView
        membres={treeData.membres}
        liens={treeData.liens}
        mariages={treeData.mariages || []}
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
          {focusMembreId ? (
            <Text style={styles.headerSubtitle}>
              Arbre individuel • {arbre.membres.find(m => m.id === focusMembreId)?.prenom}
            </Text>
          ) : (
            <Text style={styles.headerSubtitle}>
              {arbre.membres.length} membres • {arbre.liens.length} liens parentaux
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.iconButton, focusMembreId && styles.iconButtonActive]}
          onPress={() => setShowMemberPicker(true)}
        >
          <Ionicons name="person-outline" size={20} color={focusMembreId ? COLORS.white : COLORS.primary} />
        </TouchableOpacity>

        {focusMembreId && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFocusMembreId(null)}
          >
            <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}

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

      {/* Modal pour sélectionner un membre pour l'arbre individuel */}
      <Modal
        visible={showMemberPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMemberPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Arbre individuel</Text>
            <Text style={styles.modalSubtitle}>
              Sélectionnez un membre pour voir son arbre (ancêtres et descendants)
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Membre</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={focusMembreId}
                  onValueChange={(value) => {
                    setFocusMembreId(value);
                    setShowMemberPicker(false);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Arbre complet --" value={null} />
                  {arbre.membres
                    .sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`))
                    .map(membre => (
                      <Picker.Item
                        key={membre.id}
                        label={`${membre.prenom} ${membre.nom}`}
                        value={membre.id}
                      />
                    ))}
                </Picker>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowMemberPicker(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Annuler</Text>
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  iconButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
