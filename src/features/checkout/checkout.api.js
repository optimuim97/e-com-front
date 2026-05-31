import api from '@/api'

export const checkoutApi = {
  /** Soumet la commande complète */
  placeOrder: (payload) => api.post('/orders', payload),

  /** Valide un code promo et retourne { discount, type, value } */
  validateCoupon: (code) => api.post('/coupons/validate', { code }),
}
