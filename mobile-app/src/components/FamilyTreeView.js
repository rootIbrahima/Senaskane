import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TreeNode } from './TreeNode';
import { COLORS } from '../utils/config';
import Svg, { Line, Path } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Constantes pour le layout
const NODE_WIDTH = 180;
const NODE_HEIGHT = 140;
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 100;

export const FamilyTreeView = ({ membres, liens, mariages, onNodePress }) => {
  const [layout, setLayout] = useState({ nodes: [], connections: [], width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [warning, setWarning] = useState('');
  const scrollViewRef = useRef(null);

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 2)); // Max 2x
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5)); // Min 0.5x
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  useEffect(() => {
    if (membres && membres.length > 0) {
      const treeLayout = calculateTreeLayout(membres, liens, mariages);
      setLayout(treeLayout);
    }
  }, [membres, liens, mariages]);

  const calculateTreeLayout = (membres, liens, mariages) => {
    try {
      // Validation des données d'entrée
      if (!membres || !Array.isArray(membres) || membres.length === 0) {
        return {
          nodes: [],
          connections: [],
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT
        };
      }

      // Limiter le nombre de membres affichables
      const MAX_MEMBERS = 100; // 100 membres pour couvrir plusieurs générations
      if (membres.length > MAX_MEMBERS) {
        setWarning(`Arbre volumineux: seuls les ${MAX_MEMBERS} premiers membres sont affichés sur ${membres.length}`);
        membres = membres.slice(0, MAX_MEMBERS);
      } else {
        setWarning('');
      }

      // Éliminer les doublons
      const uniqueMembres = [];
      const seenIds = new Set();
      membres.forEach(m => {
        if (m && m.id && !seenIds.has(m.id)) {
          seenIds.add(m.id);
          uniqueMembres.push(m);
        }
      });
      membres = uniqueMembres;

      // Valider et nettoyer les liens
      const validLiens = (liens || []).filter(lien =>
        lien &&
        lien.enfant_id &&
        lien.parent_id &&
        lien.enfant_id !== lien.parent_id
      );

      // Valider et nettoyer les mariages
      const validMariages = (mariages || []).filter(mariage =>
        mariage &&
        mariage.conjoint1_id &&
        mariage.conjoint2_id &&
        mariage.conjoint1_id !== mariage.conjoint2_id
      );

      // Créer un map des membres par ID pour un accès rapide
      const membreMap = {};
      membres.forEach(m => {
        membreMap[m.id] = { ...m, children: [], parents: [], spouse: null };
      });

      // Ajouter les relations parent-enfant avec validation
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
      const roots = membres.filter(m => membreMap[m.id] && membreMap[m.id].parents.length === 0);

      if (roots.length === 0 && membres.length > 0) {
        // Si pas de racine identifiée, utiliser le premier membre
        roots.push(membres[0]);
      }

      // Positionner les nœuds par génération
      const positions = {};
      const connections = [];
      const generations = [];
      const MAX_DEPTH = 10; // Limiter la profondeur de l'arbre

      // Fonction pour assigner les niveaux (générations) avec protection contre boucles infinies
      const assignLevel = (membreId, level = 0, visited = new Set()) => {
        // Protection contre boucles infinies
        if (visited.has(membreId) || level > MAX_DEPTH) {
          return;
        }
        visited.add(membreId);

        if (!generations[level]) {
          generations[level] = [];
        }

        // Éviter les doublons dans la même génération
        if (!generations[level].includes(membreId)) {
          generations[level].push(membreId);
        }

        const membre = membreMap[membreId];
        if (membre && membre.children && membre.children.length > 0) {
          membre.children.forEach(childId => {
            if (membreMap[childId]) { // Vérifier que l'enfant existe
              assignLevel(childId, level + 1, visited);
            }
          });
        }
      };

      // Assigner les niveaux à partir des racines
      roots.forEach(root => {
        if (root && root.id) {
          assignLevel(root.id);
        }
      });

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
          // Feuille: largeur = largeur du nœud (+ conjoint si existe)
          if (membre.spouse && membreMap[membre.spouse]) {
            subtreeWidthCache[membreId] = (NODE_WIDTH * 2) + 20;
            return (NODE_WIDTH * 2) + 20; // Deux nœuds côte à côte
          }
          subtreeWidthCache[membreId] = NODE_WIDTH;
          return NODE_WIDTH;
        }

        // Calculer la largeur totale des enfants
        let childrenWidth = 0;
        membre.children.forEach((childId, index) => {
          if (membreMap[childId]) {
            childrenWidth += calculateSubtreeWidth(childId);
            if (index < membre.children.length - 1) {
              childrenWidth += HORIZONTAL_SPACING;
            }
          }
        });

        // La largeur du sous-arbre est le max entre la largeur du parent et celle des enfants
        const parentWidth = membre.spouse && membreMap[membre.spouse] ? (NODE_WIDTH * 2) + 20 : NODE_WIDTH;
        const width = Math.max(parentWidth, childrenWidth);
        subtreeWidthCache[membreId] = width;
        return width;
      };

      // Positionner les nœuds récursivement (top-down)
      let maxX = 0;
      const processedSpouses = new Set();
      const positioned = new Set();
      let positionCallCount = 0;
      const MAX_POSITION_CALLS = 150; // Limite pour 100 membres sur plusieurs générations
      const globalVisited = new Set(); // Visited set global pour tous les appels
      const MAX_DEPTH_PER_NODE = 10; // Profondeur max pour couvrir plusieurs générations

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

        // Calculer la position X centrée pour ce nœud
        let nodeX = startX;
        if (membre.children && membre.children.length > 0) {
          // Si a des enfants, centrer le parent au-dessus des enfants
          const childrenWidth = membre.children.reduce((total, childId, index) => {
            if (membreMap[childId]) {
              total += calculateSubtreeWidth(childId);
              if (index < membre.children.length - 1) {
                total += HORIZONTAL_SPACING;
              }
            }
            return total;
          }, 0);

          // Centrer le parent au-dessus des enfants
          nodeX = startX + (childrenWidth - parentWidth) / 2;
        }

        // Positionner le nœud principal
        positions[membreId] = {
          x: Math.max(50, nodeX), // Minimum 50px du bord
          y: y,
          membre: membre
        };
        positioned.add(membreId);

        let currentX = nodeX + NODE_WIDTH + 20;

        // Positionner le conjoint à côté
        if (hasSpouse) {
          positions[membre.spouse] = {
            x: currentX,
            y: y,
            membre: membreMap[membre.spouse]
          };
          positioned.add(membre.spouse);
          processedSpouses.add(membre.spouse);

          // Connexion mariage
          connections.push({
            type: 'marriage',
            from: positions[membreId],
            to: positions[membre.spouse]
          });
        }

        // Positionner les enfants
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
      let currentRootX = 50;
      const rootsToProcess = roots.slice(0, MAX_ROOTS);
      rootsToProcess.forEach(root => {
        if (root && root.id && !positioned.has(root.id)) {
          const rootWidth = calculateSubtreeWidth(root.id);
          positionNode(root.id, currentRootX, 50);
          currentRootX += rootWidth + HORIZONTAL_SPACING * 2;
        }
      });

      // Créer les connexions parent-enfant (avec limite)
      const MAX_CONNECTIONS = 100; // Limite de connexions pour éviter surcharge SVG
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

      // Calculer les dimensions avec protection
      const positionValues = Object.values(positions);
      const maxY = positionValues.length > 0
        ? Math.max(...positionValues.map(p => p.y)) + NODE_HEIGHT + 50
        : SCREEN_HEIGHT;
      const totalWidth = maxX + 50;
      const totalHeight = Math.max(maxY, SCREEN_HEIGHT);

      return {
        nodes: positionValues,
        connections,
        width: Math.max(totalWidth, SCREEN_WIDTH),
        height: totalHeight
      };
    } catch (error) {
      // Retourner un layout vide en cas d'erreur
      return {
        nodes: [],
        connections: [],
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
      };
    }
  };

  const renderConnections = () => {
    if (!layout.connections || layout.connections.length === 0) return null;

    return (
      <Svg
        height={layout.height}
        width={layout.width}
        style={styles.svg}
      >
        {layout.connections.map((conn, index) => {
          if (conn.type === 'marriage') {
            // Ligne horizontale pour le mariage
            const y = conn.from.y + NODE_HEIGHT / 2;
            return (
              <Line
                key={`marriage-${index}`}
                x1={conn.from.x + NODE_WIDTH}
                y1={y}
                x2={conn.to.x}
                y2={y}
                stroke={COLORS.error}
                strokeWidth="3"
                strokeDasharray="5,5"
              />
            );
          } else if (conn.type === 'parent') {
            // Ligne verticale puis horizontale pour parent-enfant
            const startX = conn.from.x + NODE_WIDTH / 2;
            const startY = conn.from.y + NODE_HEIGHT;
            const endX = conn.to.x + NODE_WIDTH / 2;
            const endY = conn.to.y;
            const midY = (startY + endY) / 2;

            const pathData = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;

            return (
              <Path
                key={`parent-${index}`}
                d={pathData}
                stroke={conn.linkType === 'pere' ? '#2196F3' : '#E91E63'}
                strokeWidth="2"
                fill="none"
              />
            );
          }
          return null;
        })}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {warning ? (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#f59e0b" />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      ) : null}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        horizontal={true}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
        >
          <View
            style={{
              width: layout.width,
              height: layout.height,
              transform: [{ scale }],
              transformOrigin: 'top left',
            }}
          >
            {renderConnections()}

            {layout.nodes.map((node, index) => (
              <View
                key={`node-${node.membre.id}-${index}`}
                style={[
                  styles.nodeContainer,
                  {
                    left: node.x,
                    top: node.y,
                  }
                ]}
              >
                <TreeNode
                  membre={node.membre}
                  onPress={onNodePress}
                  isRoot={node.membre.parents && node.membre.parents.length === 0}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleZoomIn}
          disabled={scale >= 2}
        >
          <Ionicons name="add" size={24} color={scale >= 2 ? COLORS.textSecondary : COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleResetZoom}
        >
          <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleZoomOut}
          disabled={scale <= 0.5}
        >
          <Ionicons name="remove" size={24} color={scale <= 0.5 ? COLORS.textSecondary : COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  warningBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f59e0b',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  nodeContainer: {
    position: 'absolute',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    gap: 10,
    backgroundColor: 'transparent',
  },
  zoomButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
