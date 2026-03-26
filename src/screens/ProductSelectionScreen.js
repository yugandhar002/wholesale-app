import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity, ActivityIndicator, ScrollView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import CategoryChip from '../components/CategoryChip';
import { useBillStore } from '../store/billStore';
import { searchProducts, getCategories } from '../services/productService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';

export default function ProductSelectionScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);
  const { items, addItem, updateQuantity, isInCart, getQuantityInCart } = useBillStore();
  const itemCount = useBillStore(s => s.getItemCount());

  // Load categories once
  useEffect(() => {
    getCategories().then(({ data }) => { if (data) setCategories(data); });
  }, []);

  // Debounced search
  const doSearch = useCallback(async (q, cat) => {
    setLoading(true);
    const { data } = await searchProducts(q, cat);
    setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query, category), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, category, doSearch]);

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      quantityInCart={getQuantityInCart(item.id)}
      onAdd={addItem}
      onRemove={(id) => updateQuantity(id, getQuantityInCart(id) - 1)}
      onUpdateQuantity={updateQuantity}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
          Platform.OS === 'android' && { paddingTop: (StatusBar.currentHeight || 0) + SPACING.md }
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Select Products</Text>
          <Text style={styles.headerSub}>{products.length} products found</Text>
        </View>
      </View>

      {/* ── Search ─────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search 1000+ products..."
        />
      </View>

      {/* ── Categories ─────────────────────────────────────── */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(cat => (
            <CategoryChip
              key={cat}
              label={cat}
              active={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Product Grid ───────────────────────────────────── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Searching...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={52} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubText}>Try a different keyword or category</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* ── Floating Bill Bar ──────────────────────────────── */}
      {itemCount > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Bill')}
          style={styles.floatingBar}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.floatingBarGradient}
          >
            <View style={styles.floatingLeft}>
              <Ionicons name="cart" size={22} color={COLORS.white} />
              <Text style={styles.floatingCount}>{itemCount} item{itemCount > 1 ? 's' : ''} added</Text>
            </View>
            <View style={styles.floatingRight}>
              <Text style={styles.floatingAction}>View Bill</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginRight: SPACING.md,
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.textDark,
    fontWeight: FONTS.weights.bold,
  },
  headerSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  searchRow: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  categoriesWrapper: {
    paddingVertical: SPACING.sm,
    height: 60,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  grid: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 90,
  },
  row: {
    justifyContent: 'space-between',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loaderText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textLight,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textMid,
    fontWeight: FONTS.weights.semibold,
  },
  emptySubText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
  },
  floatingBar: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 76 : 90,
    left: SPACING.xl,
    right: SPACING.xl,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingBarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    height: 64,
  },
  floatingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  floatingCount: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: FONTS.weights.semibold,
  },
  floatingRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  floatingAction: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
});
