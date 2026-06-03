<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <span class="eyebrow">Logistique</span>
        <h1 class="page-header__title">Zones de livraison</h1>
        <p class="page-header__sub">Tarifs par ville / quartier — utilisés lors du checkout.</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Nouvelle zone</button>
    </header>

    <div v-if="loading" class="loader-wrap"><div class="loader"></div></div>

    <div v-else>
      <div v-for="(group, gName) in grouped" :key="gName" class="card group-card">
        <h2 class="group-card__title">{{ gName }} <span>({{ group.length }})</span></h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Alias</th>
              <th>Pays</th>
              <th>Tarif</th>
              <th>Franco</th>
              <th>Actif</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="z in group" :key="z.id">
              <td><strong>{{ z.name }}</strong></td>
              <td class="cell-aliases">{{ (z.cities || []).join(', ') || '—' }}</td>
              <td>{{ z.country }}</td>
              <td>
                {{ fmt(z.price) }}
                <span v-if="z.price_unit === 'per_kg'" class="badge badge-gold">/ kg</span>
              </td>
              <td>{{ z.free_threshold ? fmt(z.free_threshold) : '—' }}</td>
              <td>
                <span :class="['pill', z.active ? 'pill--ok' : 'pill--off']">
                  {{ z.active ? 'Oui' : 'Non' }}
                </span>
              </td>
              <td class="cell-actions">
                <button class="btn btn-sm btn-outline" @click="openEdit(z)">Modifier</button>
                <button class="btn btn-sm btn-danger" @click="destroy(z)">Suppr.</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!zones.length" class="card empty-state">
        <p>Aucune zone configurée. Lance le seeder ou créé-en une.</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="modal-overlay" @click.self="modal = null">
      <div class="modal">
        <h3>{{ form.id ? 'Modifier la zone' : 'Nouvelle zone' }}</h3>
        <div class="form-grid">
          <label>Groupe
            <input v-model="form.group" type="text" placeholder="Ex. Grand Abidjan" />
          </label>
          <label>Nom de la zone
            <input v-model="form.name" type="text" placeholder="Ex. Cocody Centre" />
          </label>
          <label>Pays (ISO-2)
            <input v-model="form.country" type="text" maxlength="2" />
          </label>
          <label>Tarif (FCFA)
            <input v-model.number="form.price" type="number" min="0" />
          </label>
          <label>Unité
            <select v-model="form.price_unit">
              <option value="flat">Forfait</option>
              <option value="per_kg">Par kg</option>
            </select>
          </label>
          <label>Seuil franco (optionnel)
            <input v-model.number="form.free_threshold" type="number" min="0" />
          </label>
          <label class="span-2">Alias / synonymes (séparés par virgule)
            <input v-model="aliasesText" type="text" placeholder="cocody, cocody centre, cocody 2 plateaux" />
          </label>
          <label class="span-2 checkbox">
            <input v-model="form.active" type="checkbox" />
            <span>Zone active</span>
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="modal = null">Annuler</button>
          <button class="btn btn-primary" :disabled="saving" @click="save">
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api';

const zones    = ref([]);
const loading  = ref(true);
const modal    = ref(null);
const saving   = ref(false);
const error    = ref('');
const form     = ref(emptyForm());
const aliasesText = ref('');

function emptyForm() {
  return {
    id: null, group: '', name: '', country: 'CI',
    price: 0, price_unit: 'flat', free_threshold: null,
    sort_order: 0, active: true, cities: [],
  };
}

const grouped = computed(() => {
  const map = {};
  for (const z of zones.value) {
    (map[z.group] ||= []).push(z);
  }
  return map;
});

async function load() {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/delivery-zones');
    zones.value = data.data ?? [];
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.value = emptyForm();
  aliasesText.value = '';
  error.value = '';
  modal.value = 'create';
}

function openEdit(z) {
  form.value = { ...z };
  aliasesText.value = (z.cities || []).join(', ');
  error.value = '';
  modal.value = 'edit';
}

async function save() {
  saving.value = true;
  error.value = '';
  try {
    const payload = {
      ...form.value,
      cities: aliasesText.value
        .split(',').map(s => s.trim()).filter(Boolean),
    };
    if (form.value.id) {
      await api.patch(`/admin/delivery-zones/${form.value.id}`, payload);
    } else {
      await api.post('/admin/delivery-zones', payload);
    }
    modal.value = null;
    await load();
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Erreur lors de l\'enregistrement.';
  } finally {
    saving.value = false;
  }
}

async function destroy(z) {
  if (!confirm(`Supprimer la zone "${z.name}" ?`)) return;
  await api.delete(`/admin/delivery-zones/${z.id}`);
  await load();
}

function fmt(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(Number(v ?? 0));
}

onMounted(load);
</script>

<style scoped>
.page-header__sub {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-top: 4px;
}
.group-card { margin-bottom: var(--space-4); }
.group-card__title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  padding: var(--space-3) var(--space-4);
  color: var(--gray-800);
  border-bottom: 1px solid var(--cream-200);
}
.group-card__title span { color: var(--gray-400); font-weight: 400; font-size: 0.875rem; }
.cell-aliases { color: var(--gray-500); font-size: 0.8125rem; }
.cell-actions { display: flex; gap: var(--space-2); }
.pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
}
.pill--ok  { background: #dcfce7; color: #15803d; }
.pill--off { background: var(--cream-200); color: var(--gray-500); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 60;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-4);
}
.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal h3 { font-family: var(--font-display); font-size: 1.25rem; margin-bottom: var(--space-4); }
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.form-grid label { display: flex; flex-direction: column; gap: 4px; font-size: 0.8125rem; color: var(--gray-600); }
.form-grid input, .form-grid select {
  border: 1px solid var(--cream-300);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 0.875rem;
}
.span-2 { grid-column: span 2; }
.checkbox { flex-direction: row !important; align-items: center; }
.modal-actions {
  display: flex; gap: var(--space-2);
  justify-content: flex-end;
  margin-top: var(--space-4);
}
.form-error { color: #ef4444; font-size: 0.8125rem; margin-top: var(--space-2); }
</style>
