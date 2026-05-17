<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Produits</h1>
        <p class="text-sm text-gray-500">{{ meta.total ?? 0 }} produit(s) au total</p>
      </div>
      <RouterLink to="/admin/products/create" class="btn-primary">
        <PlusIcon class="size-4" /> Nouveau produit
      </RouterLink>
    </div>

    <!-- Filtres -->
    <div class="card p-4 flex flex-wrap gap-3">
      <input v-model="search" class="input !py-2 max-w-xs text-sm" placeholder="Rechercher…" />
      <select v-model="statusFilter" class="input !py-2 !w-auto text-sm">
        <option value="">Tous les statuts</option>
        <option value="1">Actifs</option>
        <option value="0">Inactifs</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="i in 6" :key="i" class="h-14 rounded-xl bg-gray-100 animate-pulse" />
      </div>
      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr class="text-left text-xs text-gray-500">
            <th class="px-5 py-3 font-medium">Produit</th>
            <th class="px-5 py-3 font-medium">Catégorie</th>
            <th class="px-5 py-3 font-medium">Prix</th>
            <th class="px-5 py-3 font-medium">Stock</th>
            <th class="px-5 py-3 font-medium">Statut</th>
            <th class="px-5 py-3 font-medium w-20"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="p in products" :key="p.id" class="hover:bg-gray-50">
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img v-if="p.images?.[0]?.url" :src="p.images[0].url" :alt="p.name" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <PhotoIcon class="size-5" />
                  </div>
                </div>
                <span class="font-medium text-gray-800 line-clamp-1">{{ p.name }}</span>
              </div>
            </td>
            <td class="px-5 py-4 text-gray-500">{{ p.category?.name ?? '—' }}</td>
            <td class="px-5 py-4 font-semibold text-primary-500">{{ formatPrice(p.price) }}</td>
            <td class="px-5 py-4">
              <span :class="p.stock <= 5 ? 'badge-danger' : 'badge-success'">{{ p.stock }}</span>
            </td>
            <td class="px-5 py-4">
              <span :class="p.is_active ? 'badge-success' : 'badge-gray'">
                {{ p.is_active ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="px-5 py-4">
              <div class="flex items-center gap-1">
                <RouterLink :to="`/admin/products/${p.id}/edit`" class="btn-ghost !p-1.5 !rounded-lg">
                  <PencilIcon class="size-4" />
                </RouterLink>
                <button @click="deleteProduct(p)" class="btn-ghost !p-1.5 !rounded-lg text-red-400 hover:text-red-600">
                  <TrashIcon class="size-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button v-for="page in meta.last_page" :key="page"
          @click="currentPage = page"
          class="size-8 rounded-lg text-sm font-medium transition-colors"
          :class="page === currentPage ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import api from '@/api'

const products     = ref([])
const meta         = ref({})
const loading      = ref(true)
const search       = ref('')
const statusFilter = ref('')
const currentPage  = ref(1)

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price)
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/products', {
      params: { search: search.value || null, is_active: statusFilter.value || null, page: currentPage.value },
    })
    products.value = data.data
    meta.value     = data.meta ?? {}
  } catch {
    // Keep existing data on error
  } finally {
    loading.value = false
  }
}

async function deleteProduct(p) {
  if (!confirm(`Archiver "${p.name}" ?`)) return
  try {
    await api.delete(`/admin/products/${p.id}`)
    load()
  } catch (e) {
    alert(e.response?.data?.message ?? 'Impossible de supprimer ce produit.')
  }
}

watch([search, statusFilter], () => { currentPage.value = 1; load() })
watch(currentPage, load)
onMounted(load)
</script>
