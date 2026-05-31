import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from './cart.api'
import { useToast } from 'vue-toastification'

export const useCartStore = defineStore('cart', () => {
  const cart   = ref({ items: [], subtotal: 0, discount: 0, total: 0, item_count: 0, coupon: null })
  const isOpen = ref(false)

  const itemCount = computed(() => cart.value.item_count ?? 0)
  const items     = computed(() => cart.value.items ?? [])
  const subtotal  = computed(() => cart.value.subtotal ?? 0)
  const total     = computed(() => cart.value.total ?? 0)
  const coupon    = computed(() => cart.value.coupon ?? null)

  function open()  { isOpen.value = true }
  function close() { isOpen.value = false }
  function clear() {
    cart.value = { items: [], subtotal: 0, discount: 0, total: 0, item_count: 0, coupon: null }
    isOpen.value = false
  }

  async function fetch() {
    const { data } = await cartApi.get()
    cart.value = data
  }

  async function add(productId, quantity = 1, variantId = null, { silent = false } = {}) {
    const { data } = await cartApi.addItem(productId, quantity, variantId)
    cart.value = data
    // Ne pas ouvrir le drawer automatiquement — l'utilisateur choisit quand ouvrir son panier
    if (!silent) {
      const toast = useToast()
      toast.success('✓ Ajouté au panier', { timeout: 2000 })
    }
  }

  async function update(itemId, quantity) {
    const { data } = await cartApi.updateItem(itemId, quantity)
    cart.value = data
  }

  async function remove(itemId) {
    const { data } = await cartApi.removeItem(itemId)
    cart.value = data
  }

  async function applyCoupon(code) {
    const { data } = await cartApi.applyCoupon(code)
    cart.value = data
  }

  async function removeCoupon() {
    const { data } = await cartApi.removeCoupon()
    cart.value = data
  }

  return { cart, isOpen, itemCount, items, subtotal, total, coupon, open, close, clear, fetch, add, update, remove, applyCoupon, removeCoupon }
})
