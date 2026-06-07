import { defineStore } from 'pinia';
import { ref, computed , nextTick} from 'vue';

import api from '@/api';
import { useCartStore } from '@/features/cart/cart.store';

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null);
  const checked = ref(false);

  const isAdmin    = computed(() => user.value?.roles?.includes('admin'));
  const isStaff    = computed(() => user.value?.roles?.includes('staff') || isAdmin.value);
  const isLoggedIn = computed(() => !!user.value);

  async function fetchUser() {
    try {
      const { data } = await api.get('/auth/me');
      user.value = data;
    } catch {
      user.value = null;
    } finally {
      checked.value = true;
    }
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    user.value    = data.user;
    checked.value = true;
    // Fusionner le panier invité dans le panier utilisateur
    try { await useCartStore().mergeLocalCart() } catch {}
    return data;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('auth_token', data.token);
    user.value    = data.user;
    checked.value = true;
    // Fusionner le panier invité dans le panier utilisateur
    try { await useCartStore().mergeLocalCart() } catch {}
    return data;
  }

  async function logout() {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('auth_token');
    user.value = null;
  }

  /** Mise à jour nom / téléphone */
  async function updateInfo(payload) {
    const { data } = await api.put('/profile/info', payload);
    user.value = data.user;
    return data;
  }

  /** Configurer email + mdp (compte commande rapide) */
  async function setupAccount(payload) {
    const { data } = await api.put('/profile/setup-account', payload);
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
    }
    user.value = data.user;
    return data;
  }

  /** Changer le mot de passe (compte normal) */
  async function changePassword(payload) {
    const { data } = await api.put('/profile/password', payload);
    return data;
  }

  /** Établit la session depuis un token (auth sociale / popup OAuth) */
  async function setSession(token, userData = null) {
    localStorage.setItem('auth_token', token);
    if (userData) {
      user.value = userData;
      checked.value = true;
    }
    // Recharge le profil complet (rôles, is_generated_email, etc.)
    await fetchUser();
  }

  const isQuickOrderUser = computed(() => user.value?.is_generated_email === true);

  // Initialisation : si un token existe, récupérer l'utilisateur ; sinon checked = true immédiatement
  if (localStorage.getItem('auth_token')) {
    fetchUser();
  } else {
    checked.value = true;
  }

  return {
    user, checked, isAdmin, isStaff, isLoggedIn, isQuickOrderUser,
    fetchUser, login, register, logout, setSession,
    updateInfo, setupAccount, changePassword,
  };
});
