import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api';

export const useCartStore = defineStore('cart', () => {
  const cart   = ref({ items: [], subtotal: 0, discount: 0, total: 0, item_count: 0, coupon: null });
  const isOpen = ref(false);

  const itemCount = computed(() => cart.value.item_count ?? 0);
  const items     = computed(() => cart.value.items ?? []);
  const subtotal  = computed(() => cart.value.subtotal ?? 0);
  const total     = computed(() => cart.value.total ?? 0);
  const coupon    = computed(() => cart.value.coupon ?? null);

  function open()  { isOpen.value = true; }
  function close() { isOpen.value = false; }
  function clear() {
    cart.value = { items: [], subtotal: 0, discount: 0, total: 0, item_count: 0, coupon: null };
    isOpen.value = false;
  }

  async function fetch() {
    const { data } = await api.get('/cart');
    cart.value = data;
  }

  async function add(productId, quantity = 1, variantId = null) {
    const { data } = await api.post('/cart/items', { product_id: productId, variant_id: variantId, quantity });
    cart.value   = data;
    isOpen.value = true;
  }

  async function update(itemId, quantity) {
    const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
    cart.value = data;
  }

  async function remove(itemId) {
    const { data } = await api.delete(`/cart/items/${itemId}`);
    cart.value = data;
  }

  async function applyCoupon(code) {
    const { data } = await api.post('/cart/coupon', { code });
    cart.value = data;
  }

  async function removeCoupon() {
    const { data } = await api.delete('/cart/coupon');
    cart.value = data;
  }

  return { cart, isOpen, itemCount, items, subtotal, total, coupon, open, close, clear, fetch, add, update, remove, applyCoupon, removeCoupon };
});
