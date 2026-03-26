import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity, Alert, Share, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import GlassButton from '../components/GlassButton';
import { useBillStore } from '../store/billStore';
import { saveBill, generateBillNumber } from '../services/billService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';

export default function BillPreviewScreen({ navigation }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [billNo] = useState(() => generateBillNumber());

  const items = useBillStore(s => s.items);
  const customerName = useBillStore(s => s.customerName);
  const discount = useBillStore(s => s.discount);
  const getSubtotal = useBillStore(s => s.getSubtotal);
  const getTotal = useBillStore(s => s.getTotal);
  const clearBill = useBillStore(s => s.clearBill);

  const subtotal = getSubtotal();
  const totalSavings = items.reduce((sum, i) => {
    const mrp = i.product.mrp || i.product.wholesale_rate;
    return sum + (mrp - i.product.wholesale_rate) * i.quantity;
  }, 0);
  const total = getTotal();
  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // ── PDF HTML Template ────────────────────────────────────────────────────────
  const buildHtml = () => {
    const rows = items.map(i => `
      <tr>
        <td>
          <div style="font-weight:600">${i.product.name}</div>
          ${i.product.mrp > i.product.wholesale_rate ? `<div style="font-size:10px;color:#8A80AA">MRP: ₹${i.product.mrp}</div>` : ''}
        </td>
        <td style="text-align:center">${i.product.unit}</td>
        <td style="text-align:center">${i.quantity}</td>
        <td style="text-align:right">₹${i.product.wholesale_rate.toLocaleString('en-IN')}</td>
        <td style="text-align:right;font-weight:700">₹${(i.product.wholesale_rate * i.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: Arial, sans-serif; margin: 30px; color: #1A1033; font-size: 13px; }
  .header { text-align:center; margin-bottom: 24px; }
  .shop-name { font-size: 28px; font-weight: 800; color: #6C3FE8; letter-spacing: -0.5px; }
  .sub { color: #8A80AA; font-size: 12px; margin-top: 4px; }
  .meta { display:flex; justify-content:space-between; margin-bottom: 20px; background: #F0F2FF; padding: 12px 16px; border-radius: 8px; }
  .meta-col .label { color: #8A80AA; font-size: 11px; text-transform: uppercase; font-weight: 600; }
  .meta-col .value { font-size: 13px; font-weight: 700; color: #1A1033; margin-top: 3px; }
  table { width:100%; border-collapse: collapse; margin-top: 4px; }
  th { background: #6C3FE8; color: white; padding: 9px 12px; text-align: left; font-size: 12px; }
  td { padding: 9px 12px; border-bottom: 1px solid #E8EAFF; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) { background: #F8F9FF; }
  .totals { margin-top: 16px; float: right; width: 240px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .totals-divider { border-top: 2px solid #6C3FE8; margin: 8px 0; }
  .total-final { font-size: 18px; font-weight: 800; color: #6C3FE8; }
  .footer { clear:both; margin-top: 40px; text-align:center; color: #8A80AA; font-size: 11px; border-top: 1px solid #E8EAFF; padding-top: 16px; }
</style>
</head>
<body>
  <div class="header">
    <div class="shop-name">🏪 Rajeshwari Wholesale</div>
    <div class="sub">Wholesale Billing System</div>
  </div>
  <div class="meta">
    <div class="meta-col">
      <div class="label">Bill Number</div>
      <div class="value">${billNo}</div>
    </div>
    <div class="meta-col">
      <div class="label">Date & Time</div>
      <div class="value">${date}, ${time}</div>
    </div>
    <div class="meta-col">
      <div class="label">Customer</div>
      <div class="value">${customerName || 'Walk-in Customer'}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Product</th><th style="text-align:center">Unit</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Rate</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
    ${totalSavings > 0 ? `<div class="totals-row"><span style="color:#6C3FE8">Wholesale Savings</span><span style="color:#6C3FE8">₹${totalSavings.toLocaleString('en-IN')}</span></div>` : ''}
    ${discount > 0 ? `<div class="totals-row"><span style="color:#38ef7d">Additional Discount</span><span style="color:#38ef7d">- ₹${Number(discount).toLocaleString('en-IN')}</span></div>` : ''}
    <div class="totals-divider"></div>
    <div class="totals-row"><span class="total-final">Total</span><span class="total-final">₹${total.toLocaleString('en-IN')}</span></div>
  </div>
  <div class="footer">
    This bill is computer generated.<br/>
    Created and owned by <b>Yugandhar Ganteda</b> | Contact: 7205938316
  </div>
</body>
</html>`;
  };

  const handleExportPDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: buildHtml() });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Bill PDF' });
      } else {
        Alert.alert('PDF Saved', `Bill saved to: ${uri}`);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    }
  };

  const handleSaveBill = async () => {
    if (saved) return;
    setSaving(true);
    const { error } = await saveBill({
      customerName: customerName || 'Walk-in Customer',
      items,
      subtotal,
      discount,
      total,
      billNumber: billNo,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Save Failed', error.message);
    } else {
      setSaved(true);
    }
  };

  const handleNewBill = () => {
    Alert.alert('New Bill', 'Start a new bill? This will clear the current one.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'New Bill', onPress: () => {
          clearBill();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[
        styles.header,
        Platform.OS === 'android' && { paddingTop: (StatusBar.currentHeight || 0) + SPACING.md }
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Preview</Text>
        <TouchableOpacity onPress={handleExportPDF} style={styles.pdfBtn}>
          <Ionicons name="share-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Bill Document */}
        <View style={styles.billDoc}>
          {/* Bill header */}
          <LinearGradient
            colors={['#6C3FE8', '#00D2FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.docHeader}
          >
            <Text style={styles.docShopName}>🏪 Rajeshwari Wholesale</Text>
            <Text style={styles.docTagline}>Wholesale Billing System</Text>
          </LinearGradient>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>BILL NUMBER</Text>
              <Text style={styles.metaValue}>{billNo}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>DATE</Text>
              <Text style={styles.metaValue}>{date}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>TIME</Text>
              <Text style={styles.metaValue}>{time}</Text>
            </View>
          </View>

          {/* Customer */}
          <View style={styles.customerRow}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.customerName}>{customerName || 'Walk-in Customer'}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 3 }]}>PRODUCT</Text>
            <Text style={[styles.th, styles.thCenter, { flex: 1 }]}>QTY</Text>
            <Text style={[styles.th, styles.thRight, { flex: 1.2 }]}>RATE</Text>
            <Text style={[styles.th, styles.thRight, { flex: 1.5 }]}>AMOUNT</Text>
          </View>

          {/* Items */}
          {items.map((item, idx) => (
            <View key={item.product.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
              <View style={{ flex: 3 }}>
                <Text style={styles.td} numberOfLines={2}>{item.product.name}</Text>
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                  {item.product.mrp > item.product.wholesale_rate && (
                    <Text style={styles.tdSub}>MRP: ₹{item.product.mrp}</Text>
                  )}
                  <Text style={styles.tdSub}>{item.product.unit}</Text>
                </View>
              </View>
              <Text style={[styles.td, styles.tdCenter, { flex: 1 }]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.tdRight, { flex: 1.2 }]}>₹{item.product.wholesale_rate}</Text>
              <Text style={[styles.td, styles.tdRight, { flex: 1.5, color: COLORS.primary, fontWeight: FONTS.weights.bold }]}>
                ₹{(item.product.wholesale_rate * item.quantity).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>
            {totalSavings > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: COLORS.primary }]}>Wholesale Savings</Text>
                <Text style={[styles.totalValue, { color: COLORS.primary }]}>₹{totalSavings.toLocaleString('en-IN')}</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: COLORS.success }]}>Extra Discount</Text>
                <Text style={[styles.totalValue, { color: COLORS.success }]}>- ₹{Number(discount).toLocaleString('en-IN')}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandLabel}>TOTAL PAYABLE</Text>
              <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.grandBadge}>
                <Text style={styles.grandAmount}>₹{total.toLocaleString('en-IN')}</Text>
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.thankYou}>Thank you for your business! 🙏</Text>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditText}>This bill is computer generated</Text>
            <Text style={styles.creditText}>Created and owned by Yugandhar Ganteda</Text>
            <Text style={styles.creditText}>Contact: 7205938316</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GlassButton
            title={saved ? '✓ Bill Saved' : saving ? 'Saving...' : 'Save Bill'}
            variant={saved ? 'success' : 'glass'}
            size="lg"
            fullWidth
            loading={saving}
            disabled={saved}
            onPress={handleSaveBill}
            style={{ marginBottom: SPACING.md }}
          />
          <GlassButton
            title="Export PDF / Share"
            variant="primary"
            size="lg"
            fullWidth
            icon={<Ionicons name="share-outline" size={18} color={COLORS.white} />}
            onPress={handleExportPDF}
            style={{ marginBottom: SPACING.md }}
          />
          <GlassButton
            title="New Bill"
            variant="outline"
            size="md"
            fullWidth
            icon={<Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />}
            onPress={handleNewBill}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.glassBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.glassBorder, marginRight: SPACING.md,
  },
  headerTitle: { flex: 1, fontSize: FONTS.sizes.xl, color: COLORS.textDark, fontWeight: FONTS.weights.bold },
  pdfBtn: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.glassButtonBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.glassButtonBorder,
  },
  billDoc: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.strong,
    marginBottom: SPACING.xxl,
  },
  docHeader: { alignItems: 'center', paddingVertical: SPACING.xxl },
  docShopName: { fontSize: FONTS.sizes.xxl, color: COLORS.white, fontWeight: FONTS.weights.heavy },
  docTagline: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCardDark,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  metaValue: { fontSize: FONTS.sizes.sm, color: COLORS.textDark, fontWeight: FONTS.weights.bold, marginTop: 3 },
  customerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm,
  },
  customerName: { fontSize: FONTS.sizes.md, color: COLORS.textDark, fontWeight: FONTS.weights.semibold },
  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: SPACING.lg },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  th: { fontSize: FONTS.sizes.xs, color: COLORS.white, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  thCenter: { textAlign: 'center' },
  thRight: { textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, alignItems: 'center' },
  tableRowAlt: { backgroundColor: COLORS.background },
  td: { fontSize: FONTS.sizes.sm, color: COLORS.textDark, fontWeight: FONTS.weights.medium },
  tdSub: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 1 },
  tdCenter: { textAlign: 'center' },
  tdRight: { textAlign: 'right' },
  totalsSection: {
    borderTopWidth: 1, borderTopColor: COLORS.divider,
    marginTop: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  totalLabel: { fontSize: FONTS.sizes.md, color: COLORS.textMid, fontWeight: FONTS.weights.medium },
  totalValue: { fontSize: FONTS.sizes.md, color: COLORS.textDark, fontWeight: FONTS.weights.semibold },
  grandTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: SPACING.sm,
    borderTopWidth: 1.5, borderTopColor: COLORS.primary, paddingTop: SPACING.md,
  },
  grandLabel: { fontSize: FONTS.sizes.md, color: COLORS.textDark, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  grandBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  grandAmount: { fontSize: FONTS.sizes.xl, color: COLORS.white, fontWeight: FONTS.weights.heavy },
  thankYou: {
    textAlign: 'center', fontSize: FONTS.sizes.sm, color: COLORS.textLight,
    paddingTop: SPACING.lg, fontStyle: 'italic',
  },
  creditsContainer: {
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  creditText: {
    fontSize: 10,
    color: COLORS.textLight,
    opacity: 0.8,
    marginTop: 2,
  },
  actions: { paddingHorizontal: SPACING.xl },
});
