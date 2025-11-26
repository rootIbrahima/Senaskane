import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
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
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (membres && membres.length > 0) {
      const treeLayout = calculateTreeLayout(membres, liens, mariages);
      setLayout(treeLayout);
    }
  }, [membres, liens, mariages]);

  const calculateTreeLayout = (membres, liens, mariages) => {
    // Créer un map des membres par ID pour un accès rapide
    const membreMap = {};
    membres.forEach(m => {
      membreMap[m.id] = { ...m, children: [], parents: [], spouse: null };
    });

    // Ajouter les relations parent-enfant
    liens.forEach(lien => {
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
    if (mariages && mariages.length > 0) {
      mariages.forEach(mariage => {
        if (membreMap[mariage.conjoint1_id] && membreMap[mariage.conjoint2_id]) {
          membreMap[mariage.conjoint1_id].spouse = mariage.conjoint2_id;
          membreMap[mariage.conjoint2_id].spouse = mariage.conjoint1_id;
        }
      });
    }

    // Trouver les racines (personnes sans parents)
    const roots = membres.filter(m => membreMap[m.id].parents.length === 0);

    if (roots.length === 0 && membres.length > 0) {
      // Si pas de racine identifiée, utiliser le premier membre
      roots.push(membres[0]);
    }

    // Positionner les nœuds par génération
    const positions = {};
    const connections = [];
    let currentY = 50;
    const generations = [];

    // Fonction pour assigner les niveaux (générations)
    const assignLevel = (membreId, level = 0, visited = new Set()) => {
      if (visited.has(membreId)) return;
      visited.add(membreId);

      if (!generations[level]) {
        generations[level] = [];
      }
      generations[level].push(membreId);

      const membre = membreMap[membreId];
      if (membre && membre.children) {
        membre.children.forEach(childId => {
          assignLevel(childId, level + 1, visited);
        });
      }
    };

    // Assigner les niveaux à partir des racines
    roots.forEach(root => {
      assignLevel(root.id);
    });

    // Positionner les nœuds
    let maxX = 0;
    const processedSpouses = new Set();

    generations.forEach((generation, level) => {
      const y = 50 + level * (NODE_HEIGHT + VERTICAL_SPACING);
      let currentX = 50;

      generation.forEach((membreId) => {
        // Si déjà positionné comme conjoint, skip
        if (processedSpouses.has(membreId)) return;

        // Positionner le nœud principal
        positions[membreId] = {
          x: currentX,
          y: y,
          membre: membreMap[membreId]
        };
        currentX += NODE_WIDTH + 20;

        // Si a un conjoint, le positionner à côté
        const membre = membreMap[membreId];
        if (membre.spouse && !positions[membre.spouse]) {
          positions[membre.spouse] = {
            x: currentX,
            y: y,
            membre: membreMap[membre.spouse]
          };

          processedSpouses.add(membre.spouse);

          // Connexion mariage
          connections.push({
            type: 'marriage',
            from: positions[membreId],
            to: positions[membre.spouse]
          });

          currentX += NODE_WIDTH + 20;
        }

        currentX += HORIZONTAL_SPACING;
        maxX = Math.max(maxX, currentX);
      });
    });

    // Créer les connexions parent-enfant
    liens.forEach(lien => {
      if (positions[lien.parent_id] && positions[lien.enfant_id]) {
        connections.push({
          type: 'parent',
          from: positions[lien.parent_id],
          to: positions[lien.enfant_id],
          linkType: lien.type_lien
        });
      }
    });

    const maxY = Math.max(...Object.values(positions).map(p => p.y)) + NODE_HEIGHT + 50;
    const totalWidth = maxX + 50;
    const totalHeight = Math.max(maxY, SCREEN_HEIGHT);

    return {
      nodes: Object.values(positions),
      connections,
      width: Math.max(totalWidth, SCREEN_WIDTH),
      height: totalHeight
    };
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
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { width: layout.width, height: layout.height }
        ]}
        horizontal={true}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
        maximumZoomScale={2}
        minimumZoomScale={0.5}
        bouncesZoom={true}
      >
        <View style={{ width: layout.width, height: layout.height }}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
});
