import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../theme';

const BillItem = ({
  item,
  onUpdateQuantity,
  onRemove
}) => {
  const { product, quantity } = item;
  const subtotal = product.wholesale_rate * quantity;

  return (
    <View style={styles.container}>
      {/* Left info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.rateRow}>
          {product.mrp > product.wholesale_rate && (
            <Text style={styles.mrp}>MRP: ₹{product.mrp}</Text>
          )}
          <Text style={styles.rate}>₹{product.wholesale_rate} / {product.unit}</Text>
        </View>
      </View>

      {/* Center: qty controls */}
      <View style={styles.qtyRow}>
        <TouchableOpacity
          style={styles.qtyBtnCircular}
          onPress={() => onUpdateQuantity(product.id, quantity - 1)}
        >
          <Ionicons name="remove" size={16} color={COLORS.primary} />
        </TouchableOpacity>

        <TextInput
          style={styles.qtyInput}
          value={String(quantity)}
          onChangeText={(val) => {
            const num = parseInt(val.replace(/[^0-9]/g, '')) || 0;
            onUpdateQuantity(product.id, num);
          }}
          keyboardType="numeric"
          maxLength={4}
          selectTextOnFocus
        />

        <TouchableOpacity
          style={styles.qtyBtnCircular}
          onPress={() => onUpdateQuantity(product.id, quantity + 1)}
        >
          <Ionicons name="add" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Right: subtotal + remove */}
      <View style={styles.right}>
        <Text style={styles.subtotal}>₹{subtotal.toLocaleString('en-IN')}</Text>
        <TouchableOpacity onPress={() => onRemove(product.id)} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(BillItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    padding: 12,
    marginBottom: 10,
    ...SHADOWS.subtle,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textDark,
    fontWeight: FONTS.weights.semibold,
    lineHeight: 17,
    marginBottom: 3,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  mrp: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: FONTS.weights.medium,
  },
  rate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 8,
  },
  qtyBtnCircular: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: '#F0F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAFF',
  },
  qtyInput: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textDark,
    fontWeight: FONTS.weights.bold,
    minWidth: 36,
    textAlign: 'center',
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    marginHorizontal: 4,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 64,
  },
  subtotal: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  removeBtn: {
    padding: 4,
  },
});
