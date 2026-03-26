import { create } from 'zustand';

export const useBillStore = create((set, get) => ({
  items: [], // [{ product, quantity }]
  customerName: '',
  discount: 0,

  // ── Actions ──────────────────────────────────────────────────────────────────
  addItem: (product) => {
    const { items } = get();
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      set({
        items: items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter(i => i.product.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      set({ items: get().items.filter(i => i.product.id !== productId) });
    } else {
      set({
        items: get().items.map(i =>
          i.product.id === productId ? { ...i, quantity } : i
        ),
      });
    }
  },

  setCustomerName: (name) => set({ customerName: name }),
  setDiscount: (discount) => set({ discount: Number(discount) || 0 }),

  clearBill: () => set({ items: [], customerName: '', discount: 0 }),

  // ── Computed ─────────────────────────────────────────────────────────────────
  getSubtotal: () => {
    return get().items.reduce(
      (sum, i) => sum + i.product.wholesale_rate * i.quantity,
      0
    );
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    return Math.max(0, subtotal - (get().discount || 0));
  },

  getItemCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  isInCart: (productId) => get().items.some(i => i.product.id === productId),

  getQuantityInCart: (productId) => {
    const item = get().items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  },
}));
