import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity, Alert, Share, Platform, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import GlassButton from '../components/GlassButton';
import { useBillStore } from '../store/billStore';
import { saveBill, generateBillNumber } from '../services/billService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';

export default function BillPreviewScreen({ navigation, route }) {
  const pastBill = route.params?.bill;

  const storeItems = useBillStore(s => s.items);
  const storeCustomer = useBillStore(s => s.customerName);
  const storePhone = useBillStore(s => s.customerPhone);
  const storeDiscount = useBillStore(s => s.discount);
  const storeSubtotal = useBillStore(s => s.getSubtotal());
  const storeTotal = useBillStore(s => s.getTotal());
  const clearBill = useBillStore(s => s.clearBill);
  const setIsSaved = useBillStore(s => s.setIsSaved);

  // Snapshot data when screen opens so it persists even if store is cleared
  // If we're viewing a past bill, use its data instead of the store
  const [billItems, setBillItems] = useState(pastBill ? (pastBill.bill_items || pastBill.items || []) : [...storeItems]);
  const [custName, setCustName] = useState(pastBill ? pastBill.customer_name : storeCustomer);
  const [custPhone, setCustPhone] = useState(pastBill ? pastBill.customer_phone : storePhone);
  const [billDiscount, setBillDiscount] = useState(pastBill ? (pastBill.discount || 0) : storeDiscount);
  const [subtotal, setSubtotal] = useState(pastBill ? (pastBill.subtotal || pastBill.total_amount) : storeSubtotal);
  const [total, setTotal] = useState(pastBill ? pastBill.total_amount : storeTotal);

  const totalSavings = useMemo(() => {
    return billItems.reduce((sum, i) => {
      const mrp = i.product?.mrp || i.mrp || i.product?.wholesale_rate || i.rate || 0;
      const rate = i.product?.wholesale_rate || i.rate || 0;
      return sum + (mrp - rate) * i.quantity;
    }, 0);
  }, [billItems]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!pastBill);
  const [billNo, setBillNo] = useState(() => pastBill ? pastBill.bill_number : generateBillNumber());

  // Keep screen in sync when pastBill changes via navigation
  useEffect(() => {
    if (pastBill) {
      setBillItems(pastBill.bill_items || pastBill.items || []);
      setCustName(pastBill.customer_name);
      setCustPhone(pastBill.customer_phone);
      setBillDiscount(pastBill.discount || 0);
      setSubtotal(pastBill.subtotal || pastBill.total_amount);
      setTotal(pastBill.total_amount);
      setSaved(true);
      setBillNo(pastBill.bill_number);
    }
  }, [pastBill?.id, pastBill?.bill_number]);

  const dateStr = pastBill
    ? new Date(pastBill.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const timeStr = pastBill
    ? new Date(pastBill.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // ── PDF HTML Template ────────────────────────────────────────────────────────
  const buildHtml = () => {
    const rows = billItems.map(i => {
      const name = i.product_name || i.product?.name;
      const unit = (i.product?.unit) || '';
      const mrp = i.mrp || i.product?.mrp || i.rate || i.product?.wholesale_rate || 0;
      const rate = i.rate || i.product?.wholesale_rate || 0;

      return `
      <tr>
        <td>
          <div style="font-weight:600">${name}</div>
        </td>
        <td style="text-align:center">${unit}</td>
        <td style="text-align:center">${i.quantity}</td>
        <td style="text-align:right">₹${mrp.toLocaleString('en-IN')}</td>
        <td style="text-align:right">₹${rate.toLocaleString('en-IN')}</td>
        <td style="text-align:right;font-weight:700">₹${(rate * i.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: Arial, sans-serif; margin: 30px; color: #1e293b; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #1e293b; padding-bottom: 15px; }
  .shop-info { flex: 1; }
  .shop-name { font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: -1px; text-transform: uppercase; margin: 0; }
  .shop-sub { color: #64748b; font-size: 11px; margin-top: 4px; font-weight: 500; line-height: 1.5; }
  .address-info { text-align: right; max-width: 250px; }
  .address-text { color: #475569; font-size: 11px; line-height: 1.4; font-weight: 500; }
  .meta { display:flex; justify-content:space-between; margin-bottom: 20px; background: #f8fafc; padding: 12px 16px; border-radius: 8px; }
  .meta-col .label { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; }
  .meta-col .value { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 3px; }
  table { width:100%; border-collapse: collapse; margin-top: 4px; }
  th { background: #1e293b; color: white; padding: 9px 12px; text-align: left; font-size: 12px; }
  td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) { background: #f8fafc; }
  .totals { margin-top: 16px; float: right; width: 240px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .totals-divider { border-top: 2px solid #1e293b; margin: 8px 0; }
  .total-final { font-size: 18px; font-weight: 800; color: #0f172a; }
  .footer { clear:both; margin-top: 40px; text-align:center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
</style>
</head>
<body>
  <div class="header">
    <div class="shop-info">
      <div class="shop-name">Rajeshwari Wholesale</div>
      <div class="shop-sub">
        Ph: 7873574186, 9437067428<br/>
        Email: gkrishna0744@gmail.com
      </div>
    </div>
    <div class="address-info">
      <div class="address-text">
        Infront of kanha xerox, beside Utkal grameen bank,<br/>
        Main road Muniguda, Dist Rayagada
      </div>
    </div>
  </div>
  <div class="meta">
    <div class="meta-col">
      <div class="label">Bill Number</div>
      <div class="value">${billNo}</div>
    </div>
    <div class="meta-col">
      <div class="label">Date & Time</div>
      <div class="value">${dateStr}, ${timeStr}</div>
    </div>
    <div class="meta-col">
      <div class="label">Customer</div>
      <div class="value">${custName || 'Walk-in Customer'}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:35%">Product</th>
        <th style="text-align:center;width:10%">Unit</th>
        <th style="text-align:center;width:8%">Qty</th>
        <th style="text-align:right;width:15%">MRP</th>
        <th style="text-align:right;width:15%">WS Rate</th>
        <th style="text-align:right;width:17%">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
    ${totalSavings > 0 ? `<div class="totals-row"><span style="color:#475569">Wholesale Savings</span><span style="color:#475569">₹${totalSavings.toLocaleString('en-IN')}</span></div>` : ''}
    ${Number(billDiscount) > 0 ? `<div class="totals-row"><span style="color:#0f172a">Additional Discount</span><span style="color:#0f172a">- ₹${Number(billDiscount).toLocaleString('en-IN')}</span></div>` : ''}
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
      customerName: custName || 'Walk-in Customer',
      customerPhone: custPhone || '',
      items: billItems,
      subtotal,
      discount: billDiscount,
      total,
      billNumber: billNo,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Save Failed', error.message);
    } else {
      setSaved(true);
      setIsSaved(true);
      clearBill(); // Clear global store for next bill
    }
  };

  const handleWhatsAppShare = () => {
    if (!custPhone) {
      Alert.alert('Phone Number Missing', 'Please provide a customer phone number to use direct WhatsApp sharing.');
      return;
    }

    // Clean phone number (remove non-digits, add country code if missing)
    let cleaned = custPhone.replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = '91' + cleaned; // Assume India if 10 digits

    // Build detailed items list in requested format
    const itemsSection = billItems.map(item => {
      const name = (item.product?.name || item.product_name || '').trim();
      const qty = item.quantity;
      const rate = item.product?.wholesale_rate || item.rate || 0;
      const mrp = item.product?.mrp || item.mrp || 0;
      const amt = rate * qty;

      return `*${name}*\nQty: ${qty}   Mrp: ₹${mrp}   WS: ₹${rate}   Amt: ₹${amt.toLocaleString('en-IN')}`;
    }).join('\n\n');

    const message = ` *RAJESHWARI WHOLESALE* (7873574186)\n\n` +
      `${itemsSection}\n` +
      `---------------------------------------------\n` +
      `*Total Amount: ₹${total.toLocaleString('en-IN')}*\n` +
      `---------------------------------------------\n` +
      `Thank you for shopping!\n` +
      `Visit Again`;

    const url = `whatsapp://send?phone=${cleaned}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp Error', 'WhatsApp is not installed on this device.');
      }
    });
  };

  const handleNewBill = () => {
    if (saved) {
      navigation.navigate('NewBillTab', { screen: 'SelectProducts' });
      return;
    }

    Alert.alert('New Bill', 'Start a new bill? This will clear the current one.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'New Bill', onPress: () => {
          clearBill();
          navigation.navigate('NewBillTab', { screen: 'SelectProducts' });
        },
      },
    ]);
  };

  const handleBack = () => {
    if (saved && !pastBill) {
      // If we just saved a new bill, go back to Product Selection instead of empty Review page
      navigation.navigate('NewBillTab', { screen: 'SelectProducts' });
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[
        styles.header,
        Platform.OS === 'android' && { paddingTop: (StatusBar.currentHeight || 0) + SPACING.md }
      ]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pastBill ? 'Bill Detail' : 'Review Bill'}</Text>
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
            <Text style={styles.docShopName}>Rajeshwari Wholesale</Text>
          </LinearGradient>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>BILL NUMBER</Text>
              <Text style={styles.metaValue}>{billNo}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>DATE</Text>
              <Text style={styles.metaValue}>{dateStr}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>TIME</Text>
              <Text style={styles.metaValue}>{timeStr}</Text>
            </View>
          </View>

          {/* Customer */}
          <View style={styles.customerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.customerName}>{custName || 'Walk-in Customer'}</Text>
            </View>
            {custPhone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call-outline" size={16} color={COLORS.textLight} style={{ marginRight: 4 }} />
                <Text style={[styles.metaValue, { fontSize: 13 }]}>{custPhone}</Text>
              </View>
            ) : null}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2.5 }]}>PRODUCT</Text>
            <Text style={[styles.th, styles.thCenter, { flex: 0.7 }]}>QTY</Text>
            <Text style={[styles.th, styles.thRight, { flex: 1.1 }]}>MRP</Text>
            <Text style={[styles.th, styles.thRight, { flex: 1.1 }]}>WS RATE</Text>
            <Text style={[styles.th, styles.thRight, { flex: 1.3 }]}>AMOUNT</Text>
          </View>

          {/* Items */}
          {billItems.map((item, idx) => {
            const name = item.product_name || item.product?.name;
            const unit = item.product?.unit || '';
            const mrp = item.mrp || item.product?.mrp || item.rate || item.product?.wholesale_rate || 0;
            const rate = item.rate || item.product?.wholesale_rate || 0;

            return (
              <View key={item.id || item.product?.id || idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                <View style={{ flex: 2.5 }}>
                  <Text style={styles.td} numberOfLines={2}>{name}</Text>
                  <Text style={styles.tdSub}>{unit}</Text>
                </View>
                <Text style={[styles.td, styles.tdCenter, { flex: 0.7 }]}>{item.quantity}</Text>
                <Text style={[styles.td, styles.tdRight, { flex: 1.1 }]}>₹{mrp}</Text>
                <Text style={[styles.td, styles.tdRight, { flex: 1.1 }]}>₹{rate}</Text>
                <Text style={[styles.td, styles.tdRight, { flex: 1.3, color: COLORS.primary, fontWeight: FONTS.weights.bold }]}>
                  ₹{(rate * item.quantity).toLocaleString('en-IN')}
                </Text>
              </View>
            );
          })}

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
            {billDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: COLORS.success }]}>Extra Discount</Text>
                <Text style={[styles.totalValue, { color: COLORS.success }]}>- ₹{Number(billDiscount).toLocaleString('en-IN')}</Text>
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
          {!pastBill && (
            <GlassButton
              title={saved ? '✓ Bill Saved' : saving ? 'Finalizing...' : 'Save Bill'}
              variant={saved ? 'success' : 'glass'}
              size="lg"
              fullWidth
              loading={saving}
              disabled={saved}
              onPress={handleSaveBill}
              style={{ marginBottom: SPACING.md }}
            />
          )}
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
            title="Send to WhatsApp"
            variant="glass"
            size="lg"
            fullWidth
            icon={<Ionicons name="logo-whatsapp" size={18} color="#25D366" />}
            onPress={handleWhatsAppShare}
            style={{ marginBottom: SPACING.md, borderColor: '#25D366' }}
          />
          {/* <GlassButton
            title={saved ? "Back to Dashboard" : "New Bill"}
            variant="outline"
            size="md"
            fullWidth
            icon={<Ionicons name={saved ? "home-outline" : "add-circle-outline"} size={18} color={COLORS.primary} />}
            onPress={handleNewBill}
          /> */}
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
