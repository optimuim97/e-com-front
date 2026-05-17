<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900">CatÃ©gories</h1>
      <button @click="openCreate" class="btn-primary flex items-center gap-2">
        <PlusIcon class="w-4 h-4" />
        Nouvelle catÃ©gorie
      </button>
    </div>

    <!-- Form inline create/edit -->
    <div v-if="showForm" class="card p-5 border-2 border-primary-500/30">
      <h2 class="font-semibold text-gray-800 mb-4">
        {{ editingId ? 'Modifier la catÃ©gorie' : 'Nouvelle catÃ©gorie' }}
      </h2>
      <form @submit.prevent="saveCategory" class="flex flex-col sm:flex-row gap-3">
        <input v-model="formName" type="text" class="input flex-1" required placeholder="Nom de la catÃ©gorie" />
        <input v-model="formSlug" type="text" class="input flex-1" placeholder="slug-auto (optionnel)" />
        <div class="flex gap-2">
          <button type="submit" :disabled="saving" class="btn-primary px-5 disabled:opacity-50">
            {{ saving ? 'â€¦' : (editingId ? 'Mettre Ã  jour' : 'CrÃ©er') }}
          </button>
          <button type="button" @click="cancelForm" class="btn-ghost px-4">Annuler</button>
        </div>
      </form>
      <p v-if="formError" class="text-red-500 text-sm mt-2">{{ formError }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- List -->
    <div v-else-if="categories.length === 0" class="card p-12 text-center text-gray-400">
      Aucune catÃ©gorie. Commencez par en crÃ©er une.
    </div>

    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Slug</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Produits</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="cat in categories" :key="cat.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-800">{{ cat.name }}</td>
            <td class="px-4 py-3 text-gray-400 font-mono text-xs">{{ cat.slug }}</td>
            <td class="px-4 py-3 text-gray-500">{{ cat.products_count ?? 0 }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 justify-end">
                <button @click="openEdit(cat)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="deleteCategory(cat)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/api'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const categories = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref(null)
const formName = ref('')
const formSlug = ref('')
const formError = ref('')
const saving = ref(false)

// auto-slug
watch(formName, (val) => {
  if (!editingId.value) {
    formSlug.value = val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
})

function openCreate() {
  editingId.value = null
  formName.value = ''
  formSlug.value = ''
  formError.value = ''
  showForm.value = true
}

function openEdit(cat) {
  editingId.value = cat.id
  formName.value = cat.name
  formSlug.value = cat.slug
  formError.value = ''
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
}

async function fetchCategories() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/categories')
    categories.value = data.data ?? data
  } finally {
    loading.value = false
  }
}

async function saveCategory() {
  saving.value = true
  formError.value = ''
  try {
    const payload = { name: formName.value, slug: formSlug.value || undefined }
    if (editingId.value) {
      await api.patch(`/admin/categories/${editingId.value}`, payload)
    } else {
      await api.post('/admin/categories', payload)
    }
    showForm.value = false
    editingId.value = null
    await fetchCategories()
  } catch (e) {
    formError.value = e.response?.data?.message ?? 'Erreur.'
  } finally {
    saving.value = false
  }
}

async function deleteCategory(cat) {
  if (!confirm(`Supprimer la catÃ©gorie "${cat.name}" ?`)) return
  try {
    await api.delete(`/admin/categories/${cat.id}`)
    await fetchCategories()
  } catch (e) {
    alert(e.response?.data?.message ?? 'Impossible de supprimer cette catÃ©gorie.')
  }
}

onMounted(fetchCategories)
</script>

