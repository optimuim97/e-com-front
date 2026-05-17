import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api';

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
    return data;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('auth_token', data.token);
    user.value    = data.user;
    checked.value = true;
    return data;
  }

  async function logout() {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('auth_token');
    user.value = null;
  }

  // Initialisation : si un token existe, récupérer l'utilisateur ; sinon checked = true immédiatement
  if (localStorage.getItem('auth_token')) {
    fetchUser();
  } else {
    checked.value = true;
  }

  return { user, checked, isAdmin, isStaff, isLoggedIn, fetchUser, login, register, logout };
});
