<template>
  <div class="admin-page">
    <!-- Header -->
    <header class="page-header">
      <div>
        <span class="eyebrow">Promotions</span>
        <h1 class="page-header__title">Coupons de réduction</h1>
      </div>
      <button @click="openModal" class="btn btn-primary">
        <PlusIcon class="w-4 h-4" />
        Nouveau coupon
      </button>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="loader-wrap">
      <div class="loader"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="coupons.length === 0" class="card empty-state">
      <div class="empty-state__icon">🌸</div>
      <p>Aucun coupon. Créez-en un pour commencer.</p>
    </div>

    <!-- Table -->
    <div v-else class="card">
      <div class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Valeur</th>
              <th>Min. commande</th>
              <th>Utilisations</th>
              <th>Expiration</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in coupons" :key="coupon.id">
              <td class="admin-table__mono coupon-code">{{ coupon.code }}</td>
              <td>{{ coupon.type === 'percent' ? 'Pourcentage' : 'Montant fixe' }}</td>
              <td class="admin-table__client">
                {{ coupon.type === 'percent' ? coupon.value + '%' : formatPrice(coupon.value) }}
              </td>
              <td>{{ coupon.min_order ? formatPrice(coupon.min_order) : '—' }}</td>
              <td>
                {{ coupon.used_count ?? 0 }}
                <span v-if="coupon.max_uses" class="coupon-max">/ {{ coupon.max_uses }}</span>
              </td>
              <td>{{ coupon.expires_at ? formatDate(coupon.expires_at) : '—' }}</td>
              <td>
                <span :class="coupon.is_active ? 'badge badge-success' : 'badge badge-gray'">
                  {{ coupon.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="admin-table__action-cell">
                <button @click="openEdit(coupon)" class="icon-btn icon-btn--edit" aria-label="Modifier">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="deleteCoupon(coupon)" class="icon-btn icon-btn--delete" aria-label="Supprimer">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <header class="modal__header">
            <h2>{{ editingId ? 'Modifier le coupon' : 'Nouveau coupon' }}</h2>
            <button @click="closeModal" class="modal__close" aria-label="Fermer">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </header>

          <form @submit.prevent="saveCoupon" class="modal__body">
            <div class="modal__grid">
              <div class="modal__full">
                <label class="label">Code *</label>
                <input v-model="form.code" type="text" class="input modal__uppercase" required placeholder="PROMO20" />
              </div>

              <div>
                <label class="label">Type *</label>
                <AppSelect v-model="form.type" :options="couponTypeOptions" />
              </div>

              <div>
                <label class="label">Valeur *</label>
                <input v-model.number="form.value" type="number" min="0" class="input" required placeholder="20" />
              </div>

              <div>
                <label class="label">Min. commande</label>
                <input v-model.number="form.min_order" type="number" min="0" class="input" placeholder="5000" />
              </div>

              <div>
                <label class="label">Utilisations max</label>
                <input v-model.number="form.max_uses" type="number" min="0" class="input" placeholder="100" />
              </div>

              <div class="modal__full">
                <label class="label">Date d'expiration</label>
                <input v-model="form.expires_at" type="date" class="input" />
              </div>

              <div class="modal__full modal__toggle-row">
                <span>Coupon actif</span>
                <button
                  type="button"
                  @click="form.is_active = !form.is_active"
                  class="toggle"
                  :class="{ 'toggle--on': form.is_active }"
                >
                  <span class="toggle__dot"></span>
                </button>
              </div>
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>

            <div class="modal__actions">
              <button type="button" @click="closeModal" class="btn btn-ghost">Annuler</button>
              <button type="submit" :disabled="saving" class="btn btn-primary">
                {{ saving ? '…' : (editingId ? 'Mettre à jour' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const coupons = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)
const formError = ref('')

const couponTypeOptions = [
  { value: 'percentage', label: 'Pourcentage (%)' },
  { value: 'fixed',      label: 'Montant fixe (FCFA)' },
]

const form = reactive({
  code: '',
  type: 'percent',
  value: '',
  min_order: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
})

function resetForm() {
  form.code = ''
  form.type = 'percent'
  form.value = ''
  form.min_order = ''
  form.max_uses = ''
  form.expires_at = ''
  form.is_active = true
  formError.value = ''
}

function openModal() {
  editingId.value = null
  resetForm()
  showModal.value = true
}

function openEdit(coupon) {
  editingId.value = coupon.id
  form.code = coupon.code
  form.type = coupon.type
  form.value = coupon.value
  form.min_order = coupon.min_order ?? ''
  form.max_uses = coupon.max_uses ?? ''
  form.expires_at = coupon.expires_at ? coupon.expires_at.substring(0, 10) : ''
  form.is_active = coupon.is_active
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

async function fetchCoupons() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/coupons')
    coupons.value = data.data ?? data
  } finally {
    loading.value = false
  }
}

async function saveCoupon() {
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.value,
      min_order: form.min_order || null,
      max_uses: form.max_uses || null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    }
    if (editingId.value) {
      await api.patch(`/admin/coupons/${editingId.value}`, payload)
    } else {
      await api.post('/admin/coupons', payload)
    }
    closeModal()
    await fetchCoupons()
  } catch (e) {
    formError.value = e.response?.data?.message ?? 'Erreur.'
  } finally {
    saving.value = false
  }
}

async function deleteCoupon(coupon) {
  if (!confirm(`Supprimer le coupon "${coupon.code}" ?`)) return
  try {
    await api.delete(`/admin/coupons/${coupon.id}`)
    await fetchCoupons()
  } catch {
    alert('Impossible de supprimer ce coupon.')
  }
}

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

onMounted(fetchCoupons)
</script>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: var(--space-5); }

.table-scroll { overflow-x: auto; }

/* ── Table modifiers ── */
.coupon-code { font-weight: 600 !important; color: var(--rose-700) !important; letter-spacing: 0.06em; }
.coupon-max { color: var(--gray-300); }
.admin-table__client { font-weight: 500; color: var(--gray-800); }
.admin-table__action-cell { display: flex; gap: var(--space-2); justify-content: flex-end; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  backdrop-filter: blur(4px);
}
.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: var(--shadow-lg);
}
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--cream-200);
}
.modal__header h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--gray-800);
}
.modal__close {
  width: 32px; height: 32px;
  border-radius: 50%;
  color: var(--gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.modal__close:hover { background: var(--cream-200); color: var(--gray-700); }

.modal__body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.modal__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.modal__full { grid-column: 1 / -1; }
.modal__uppercase { text-transform: uppercase; letter-spacing: 0.05em; }

.modal__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) 0;
}
.modal__toggle-row span {
  font-size: 0.875rem;
  color: var(--gray-700);
  font-weight: 500;
}

.modal__actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}
.modal__actions .btn { flex: 1; justify-content: center; }
</style>
