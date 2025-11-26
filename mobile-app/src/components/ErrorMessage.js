import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';

export const ErrorMessage = ({ message, style }) => {
  if (!message) return null;

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="alert-circle" size={20} color={COLORS.error} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  text: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    flex: 1,
  },
});
