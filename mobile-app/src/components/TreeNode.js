import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';

export const TreeNode = ({ membre, onPress, isRoot, style }) => {
  const getGenderIcon = (sexe) => {
    return sexe === 'M' ? 'male' : 'female';
  };

  const getGenderColor = (sexe) => {
    return sexe === 'M' ? '#2196F3' : '#E91E63';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.getFullYear();
  };

  const isDeceased = membre.date_deces != null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isRoot && styles.rootNode,
        isDeceased && styles.deceasedNode,
        style,
      ]}
      onPress={() => onPress && onPress(membre)}
      activeOpacity={0.7}
    >
      <View style={[styles.genderIndicator, { backgroundColor: getGenderColor(membre.sexe) }]}>
        <Ionicons name={getGenderIcon(membre.sexe)} size={20} color={COLORS.white} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {membre.prenom} {membre.nom}
        </Text>

        {membre.date_naissance && (
          <Text style={styles.info}>
            {formatDate(membre.date_naissance)}
            {isDeceased && ` - ${formatDate(membre.date_deces)}`}
          </Text>
        )}

        {membre.profession && (
          <Text style={styles.profession} numberOfLines={1}>
            {membre.profession}
          </Text>
        )}

        {membre.nom_conjoint && (
          <View style={styles.spouseInfo}>
            <Ionicons name="heart" size={12} color={COLORS.error} />
            <Text style={styles.spouseText} numberOfLines={1}>
              {membre.nom_conjoint}
            </Text>
          </View>
        )}
      </View>

      {isRoot && (
        <View style={styles.rootBadge}>
          <Ionicons name="star" size={12} color={COLORS.warning} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rootNode: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  deceasedNode: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  genderIndicator: {
    padding: SPACING.xs,
    alignItems: 'center',
  },
  content: {
    padding: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  info: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  profession: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.info,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  spouseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 4,
  },
  spouseText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  rootBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.warning + '30',
    borderRadius: 12,
    padding: 4,
  },
});
