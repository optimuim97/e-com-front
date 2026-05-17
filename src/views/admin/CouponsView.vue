<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Coupons de rÃ©duction</h1>
      <button @click="openModal" class="btn-primary flex items-center gap-2">
        <PlusIcon class="w-4 h-4" />
        Nouveau coupon
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="coupons.length === 0" class="card p-12 text-center text-gray-400">
      Aucun coupon. CrÃ©ez-en un pour commencer.
    </div>

    <!-- Table -->
    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Valeur</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Min. commande</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Utilisations</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Expiration</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="coupon in coupons" :key="coupon.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-mono font-semibold text-gray-800">{{ coupon.code }}</td>
            <td class="px-4 py-3 text-gray-500">{{ coupon.type === 'percent' ? 'Pourcentage' : 'Montant fixe' }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">
              {{ coupon.type === 'percent' ? coupon.value + '%' : formatPrice(coupon.value) }}
            </td>
            <td class="px-4 py-3 text-gray-500">{{ coupon.min_order ? formatPrice(coupon.min_order) : 'â€”' }}</td>
            <td class="px-4 py-3 text-gray-500">
              {{ coupon.used_count ?? 0 }}
              <span v-if="coupon.max_uses">/ {{ coupon.max_uses }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ coupon.expires_at ? formatDate(coupon.expires_at) : 'â€”' }}</td>
            <td class="px-4 py-3">
              <span :class="coupon.is_active ? 'badge badge-success' : 'badge badge-gray'">
                {{ coupon.is_active ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-2 justify-end">
                <button @click="openEdit(coupon)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="deleteCoupon(coupon)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-900 text-lg">{{ editingId ? 'Modifier le coupon' : 'Nouveau coupon' }}</h2>
          <button @click="closeModal" class="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveCoupon" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="label">Code *</label>
              <input v-model="form.code" type="text" class="input uppercase" required placeholder="PROMO20" style="text-transform:uppercase" />
            </div>

            <div>
              <label class="label">Type *</label>
              <select v-model="form.type" class="input">
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (FCFA)</option>
              </select>
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

            <div class="col-span-2">
              <label class="label">Date d'expiration</label>
              <input v-model="form.expires_at" type="date" class="input" />
            </div>

            <div class="col-span-2 flex items-center justify-between">
              <span class="text-sm text-gray-700">Coupon actif</span>
              <button
                type="button"
                @click="form.is_active = !form.is_active"
                class="relative w-11 h-6 rounded-full transition-colors"
                :class="form.is_active ? 'bg-primary-500' : 'bg-gray-200'"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </div>
          </div>

          <p v-if="formError" class="text-red-500 text-sm">{{ formError }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModal" class="btn-ghost flex-1">Annuler</button>
            <button type="submit" :disabled="saving" class="btn-primary flex-1 disabled:opacity-50">
              {{ saving ? 'â€¦' : (editingId ? 'Mettre Ã  jour' : 'CrÃ©er') }}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  if (!val) return 'â€”'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

onMounted(fetchCoupons)
</script>

