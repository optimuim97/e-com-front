<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal modal--lg">
      <header class="modal__header">
        <h3>{{ promotion ? 'Modifier la promotion' : 'Nouvelle promotion' }}</h3>
        <button class="modal__close" @click="$emit('close')" aria-label="Fermer">✕</button>
      </header>

      <div class="modal__body">
        <!-- Identité -->
        <div class="field">
          <label>Nom de la promotion *</label>
          <input v-model="form.name" class="input" placeholder="Ex. Soldes de fin d'année" />
        </div>

        <div class="field">
          <label>Description</label>
          <textarea v-model="form.description" class="input" rows="2"
                    placeholder="Note interne : à quoi sert cette opération"></textarea>
        </div>

        <!-- Type d'opération -->
        <div class="field">
          <label>Type d'opération</label>
          <div class="choice-grid">
            <label v-for="t in TYPES" :key="t.value" class="choice"
                   :class="{ 'choice--active': form.type === t.value }">
              <input type="radio" :value="t.value" v-model="form.type" />
              <strong>{{ t.label }}</strong>
              <span>{{ t.hint }}</span>
            </label>
          </div>
        </div>

        <!-- Portée -->
        <div class="field">
          <label>Sur quoi s'applique-t-elle ?</label>
          <div class="choice-grid choice-grid--2">
            <label v-for="s in SCOPES" :key="s.value" class="choice"
                   :class="{ 'choice--active': form.scope === s.value }">
              <input type="radio" :value="s.value" v-model="form.scope" />
              <strong>{{ s.label }}</strong>
              <span>{{ s.hint }}</span>
            </label>
          </div>
        </div>

        <!-- Sélection d'articles -->
        <div v-if="form.scope === 'product'" class="field">
          <label>Articles concernés *</label>
          <input v-model="productSearch" class="input" placeholder="Rechercher un article…"
                 @input="debouncedSearch" />
          <div v-if="searchResults.length" class="product-results">
            <button v-for="p in searchResults" :key="p.id" class="product-row"
                    type="button" @click="addProduct(p)">
              {{ p.name }} <span>{{ fmt(p.price) }}</span>
            </button>
          </div>
          <ul v-if="form.products.length" class="product-chips">
            <li v-for="p in form.products" :key="p.id">
              {{ p.name }}
              <button type="button" @click="removeProduct(p.id)" aria-label="Retirer">✕</button>
            </li>
          </ul>
          <p v-else class="hint">Aucun article sélectionné pour l'instant.</p>
        </div>

        <!-- Remise -->
        <div class="field-row">
          <div class="field">
            <label>Type de remise *</label>
            <select v-model="form.discount_type" class="input">
              <option v-for="d in DISCOUNT_TYPES" :key="d.value" :value="d.value">{{ d.label }}</option>
            </select>
          </div>
          <div class="field">
            <label>Valeur *</label>
            <input v-model.number="form.value" type="number" min="0"
                   :max="form.discount_type === 'percent' ? 100 : null" class="input" />
          </div>
          <div v-if="form.discount_type === 'percent'" class="field">
            <label>Plafond de remise</label>
            <input v-model.number="form.max_discount_amount" type="number" min="0"
                   class="input" placeholder="Aucun" />
          </div>
        </div>

        <p v-if="form.discount_type === 'percent'" class="hint">
          Le plafond limite le montant retiré. Sans lui, −{{ form.value || 0 }} % sur
          un coffret à 80 000 F retire {{ fmt((form.value || 0) * 800) }}.
        </p>

        <!-- Période -->
        <div class="field-row">
          <div class="field">
            <label>Date de début</label>
            <input v-model="form.starts_at" type="datetime-local" class="input" />
          </div>
          <div class="field">
            <label>Date de fin</label>
            <input v-model="form.ends_at" type="datetime-local" class="input" />
          </div>
        </div>
        <p class="hint">Laissez vide pour une promotion sans date de début ou de fin.</p>

        <!-- Réglages -->
        <div class="field-row">
          <div class="field">
            <label>Libellé du badge</label>
            <input v-model="form.banner_label" class="input" maxlength="40"
                   :placeholder="defaultBadge" />
          </div>
          <div class="field">
            <label>Priorité</label>
            <input v-model.number="form.priority" type="number" min="0" class="input" />
          </div>
        </div>
        <p class="hint">
          Les promotions ne se cumulent pas : si plusieurs s'appliquent au même
          article, celle de plus haute priorité l'emporte.
        </p>

        <label class="switch">
          <input type="checkbox" v-model="form.is_active" />
          Promotion active
        </label>

        <p v-if="error" class="form-error">{{ error }}</p>
      </div>

      <footer class="modal__footer">
        <button class="btn btn-outline" @click="$emit('close')">Annuler</button>
        <button class="btn btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api'
import { TYPES, SCOPES, DISCOUNT_TYPES } from './promotion.constants'

const props = defineProps({ promotion: { type: Object, default: null } })
const emit  = defineEmits(['close', 'saved'])

const saving = ref(false)
const error  = ref('')

const form = reactive({
  name: '', description: '', type: 'standard', scope: 'global',
  discount_type: 'percent', value: 10, max_discount_amount: null,
  banner_label: '', starts_at: '', ends_at: '',
  priority: 0, is_active: true, products: [],
})

const defaultBadge = computed(() =>
  form.discount_type === 'percent' ? `−${form.value || 0} %` : 'Promotion'
)

function fmt(value) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(value) || 0)) + ' F'
}

// Les champs datetime-local n'acceptent pas le format ISO complet renvoyé
// par l'API : on tronque aux minutes.
function toLocalInput(iso) {
  return iso ? String(iso).slice(0, 16) : ''
}

onMounted(() => {
  if (!props.promotion) return
  Object.assign(form, {
    ...props.promotion,
    starts_at: toLocalInput(props.promotion.starts_at),
    ends_at:   toLocalInput(props.promotion.ends_at),
    products:  props.promotion.products ?? [],
  })
})

// ── Sélection d'articles ────────────────────────────────────────────────
const productSearch = ref('')
const searchResults = ref([])
let searchTimer

function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (productSearch.value.trim().length < 2) { searchResults.value = []; return }
    const { data } = await api.get('/products', {
      params: { search: productSearch.value, per_page: 8 },
    })
    const items = data.data ?? data
    // On masque ceux déjà retenus : les reproposer prête à confusion.
    const chosen = new Set(form.products.map((p) => p.id))
    searchResults.value = items.filter((p) => !chosen.has(p.id))
  }, 300)
}

function addProduct(product) {
  form.products.push({ id: product.id, name: product.name, price: product.price })
  searchResults.value = searchResults.value.filter((p) => p.id !== product.id)
  productSearch.value = ''
}

function removeProduct(id) {
  form.products = form.products.filter((p) => p.id !== id)
}

// ── Enregistrement ──────────────────────────────────────────────────────
async function save() {
  error.value = ''
  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description || null,
      type: form.type,
      scope: form.scope,
      discount_type: form.discount_type,
      value: form.value,
      // Un plafond n'a de sens que sur un pourcentage — le serveur le refuse
      // sur un montant fixe.
      max_discount_amount: form.discount_type === 'percent'
        ? (form.max_discount_amount || null)
        : null,
      banner_label: form.banner_label || null,
      starts_at: form.starts_at || null,
      ends_at:   form.ends_at || null,
      priority:  form.priority || 0,
      is_active: form.is_active,
      product_ids: form.scope === 'product' ? form.products.map((p) => p.id) : [],
    }

    if (props.promotion) {
      await api.put(`/admin/promotions/${props.promotion.id}`, payload)
    } else {
      await api.post('/admin/promotions', payload)
    }
    emit('saved')
  } catch (e) {
    const data = e.response?.data ?? {}
    error.value = data.message
      || Object.values(data.errors ?? {}).flat()[0]
      || "L'enregistrement a échoué."
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal--lg { max-width: 720px; }
.field { margin-bottom: var(--space-4); }
.field label { display: block; font-size: 0.8125rem; font-weight: 500; margin-bottom: 6px; }
.field-row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.field-row .field { flex: 1; min-width: 150px; }

.choice-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-2);
}
.choice-grid--2 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.choice {
  display: block; padding: var(--space-3); border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm, 6px); cursor: pointer;
}
.choice--active { border-color: var(--rose-500); background: var(--rose-50); }
.choice input { display: none; }
.choice strong { display: block; font-size: 0.875rem; }
.choice span { display: block; font-size: 0.75rem; color: var(--gray-500); margin-top: 2px; }

.product-results {
  border: 1px solid var(--gray-200); border-radius: var(--radius-sm, 6px);
  margin-top: 6px; max-height: 180px; overflow-y: auto;
}
.product-row {
  display: flex; justify-content: space-between; width: 100%;
  padding: 8px 12px; background: none; border: 0; cursor: pointer; text-align: left;
  font-size: 0.8125rem;
}
.product-row:hover { background: var(--rose-50); }
.product-chips { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-wrap: wrap; gap: 6px; }
.product-chips li {
  display: flex; align-items: center; gap: 6px; font-size: 0.75rem;
  background: var(--gray-100); padding: 4px 10px; border-radius: 999px;
}
.product-chips button { background: none; border: 0; cursor: pointer; color: var(--gray-500); }

.hint { font-size: 0.75rem; color: var(--gray-400); margin: -8px 0 var(--space-4); }
.switch { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; }
</style>
