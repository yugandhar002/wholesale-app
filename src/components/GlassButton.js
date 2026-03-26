import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator, View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../theme';

export default function GlassButton({
  title,
  onPress,
  variant = 'primary',   // 'primary' | 'glass' | 'danger' | 'success' | 'outline'
  size = 'md',           // 'sm' | 'md' | 'lg'
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: RADIUS.md, fontSize: FONTS.sizes.sm, iconSize: 14 },
    md: { paddingVertical: 13, paddingHorizontal: 22, borderRadius: RADIUS.lg, fontSize: FONTS.sizes.md, iconSize: 16 },
    lg: { paddingVertical: 17, paddingHorizontal: 30, borderRadius: RADIUS.xl, fontSize: FONTS.sizes.xl, iconSize: 20 },
  }[size];

  const content = (
    <View style={styles.inner}>
      {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
      {loading
        ? <ActivityIndicator color={variant === 'glass' || variant === 'outline' ? COLORS.primary : COLORS.white} size="small" />
        : <Text style={[
            styles.text,
            { fontSize: sizeStyles.fontSize },
            (variant === 'glass' || variant === 'outline') && styles.textDark,
            variant === 'danger' && styles.textWhite,
            variant === 'success' && styles.textWhite,
            disabled && styles.textDisabled,
            textStyle,
          ]}>
            {title}
          </Text>
      }
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { width: '100%' }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[fullWidth && { width: '100%' }]}
      >
        {variant === 'primary' && (
          <LinearGradient
            colors={disabled ? ['#C0B8E0', '#A8B8D0'] : COLORS.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.base, { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal, borderRadius: sizeStyles.borderRadius }, SHADOWS.card]}
          >
            {content}
          </LinearGradient>
        )}
        {variant === 'success' && (
          <LinearGradient
            colors={COLORS.gradientSuccess}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.base, { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal, borderRadius: sizeStyles.borderRadius }, SHADOWS.card]}
          >
            {content}
          </LinearGradient>
        )}
        {variant === 'danger' && (
          <LinearGradient
            colors={COLORS.gradientDanger}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.base, { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal, borderRadius: sizeStyles.borderRadius }, SHADOWS.card]}
          >
            {content}
          </LinearGradient>
        )}
        {variant === 'glass' && (
          <View style={[
            styles.base, styles.glass,
            { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal, borderRadius: sizeStyles.borderRadius },
          ]}>
            {content}
          </View>
        )}
        {variant === 'outline' && (
          <View style={[
            styles.base, styles.outline,
            { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal, borderRadius: sizeStyles.borderRadius },
          ]}>
            {content}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    backgroundColor: COLORS.glassButtonBg,
    borderWidth: 1.5,
    borderColor: COLORS.glassButtonBorder,
    ...SHADOWS.subtle,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  text: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.3,
  },
  textDark: {
    color: COLORS.primary,
  },
  textWhite: {
    color: COLORS.white,
  },
  textDisabled: {
    color: COLORS.textLight,
  },
});
