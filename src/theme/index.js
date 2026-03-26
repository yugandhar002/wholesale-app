import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Primary Palette
  primary: '#6C3FE8',
  primaryLight: '#8B65F0',
  primaryDark: '#4E2AB5',
  accent: '#00D2FF',
  accentLight: '#67E8FF',

  // Gradient pairs
  gradientPrimary: ['#6C3FE8', '#00D2FF'],
  gradientCard: ['#8B65F0', '#5B2ACA'],
  gradientSuccess: ['#11998e', '#38ef7d'],
  gradientDanger: ['#c0392b', '#e74c3c'],
  gradientGold: ['#f7971e', '#ffd200'],
  gradientHome: ['#667eea', '#764ba2'],

  // Background
  background: '#F9FAFB',
  backgroundCard: '#FFFFFF',
  backgroundCardDark: '#F3F4F6',

  // Glass (Now Plain)
  glassBg: '#FFFFFF',
  glassBorder: '#E5E7EB',
  glassButtonBg: '#F3F4F6',
  glassButtonBorder: '#D1D5DB',

  // Text
  textDark: '#1A1033',
  textMid: '#4A3F6B',
  textLight: '#8A80AA',
  textWhite: '#FFFFFF',
  textAccent: '#6C3FE8',

  // Status
  success: '#38ef7d',
  warning: '#ffd200',
  danger: '#e74c3c',

  // Borders & Dividers
  border: 'rgba(108, 63, 232, 0.15)',
  divider: 'rgba(108, 63, 232, 0.08)',

  white: '#FFFFFF',
  black: '#000000',
};

export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    hero: 38,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 100,
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  strong: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const SCREEN = {
  width,
  height,
};

export const GLASS_STYLE = {
  backgroundColor: COLORS.glassBg,
  borderWidth: 1.5,
  borderColor: COLORS.glassBorder,
  borderRadius: RADIUS.lg,
  ...SHADOWS.card,
};
