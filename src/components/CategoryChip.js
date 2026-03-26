import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../theme';

export default function CategoryChip({ label, active = false, onPress }) {
  if (active) {
    return (
      <LinearGradient
        colors={COLORS.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.chip, styles.activeChip]}
      >
        <TouchableOpacity onPress={onPress} style={styles.inner}>
          <Text style={styles.activeText}>{label}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <TouchableOpacity style={[styles.chip, styles.inactiveChip]} onPress={onPress}>
      <Text style={styles.inactiveText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: RADIUS.full,
    marginRight: 8,
    ...SHADOWS.subtle,
  },
  activeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inactiveChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.2,
  },
  inactiveText: {
    color: COLORS.textMid,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
});
