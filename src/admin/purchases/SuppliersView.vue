<template>
  <div class="suppliers">

    <div class="page-header">
      <div>
        <h1 class="page-title">Fournisseurs</h1>
        <p class="page-subtitle">
          Chez qui la boutique s'approvisionne. Un fournisseur rattaché à des
          bons d'achat est désactivé plutôt que supprimé — ses pièces justifient
          les coûts déjà entrés.
        </p>
      </div>
      <button class="btn btn-primary" @click="ouvrirFormulaire()">Nouveau fournisseur</button>
    </div>

    <div class="filters-bar">
      <input
        v-model="recherche"
        type="search"
        class="input input--sm"
        placeholder="Nom, contact, téléphone…"
        @keyup.enter="charger(1)"
      />
      <label class="filtre-actifs">
        <input v-model="actifsSeuls" type="checkbox" @change="charger(1)" />
        Actifs seulement
      </label>
    </div>

    <div class="table-card">
      <div v-if="loading" class="table-empty">Chargement…</div>
      <div v-else-if="fournisseurs.length === 0" class="table-empty">
        Aucun fournisseur enregistré.
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Contact</th>
            <th>Téléphone</th>
            <th class="text-right">Bons d'achat</th>
            <th>État</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in fournisseurs" :key="f.id" class="data-table__row">
            <td class="font-medium">{{ f.name }}</td>
            <td class="text-muted">{{ f.contact_name || '—' }}</td>
            <td class="text-muted">{{ f.phone || '—' }}</td>
            <td class="text-right">{{ f.orders_count ?? 0 }}</td>
            <td>
              <span class="badge" :class="f.is_active ? 'badge--success' : 'badge--muted'">
                {{ f.is_active ? 'Actif' : 'Archivé' }}
              </span>
            </td>
            <td class="text-right">
              <button class="btn btn-ghost btn-sm" @click="ouvrirFormulaire(f)">Modifier</button>
              <button class="btn btn-ghost btn-sm" @click="supprimer(f)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminPagination
      :current-page="page"
      :last-page="meta?.last_page"
      :total="meta?.total"
      :show-per-page="false"
      item-singular="fournisseur"
      item-plural="fournisseurs"
      @update:page="charger"
    />

    <!-- Formulaire -->
    <div v-if="formulaireOuvert" class="modal" @click.self="fermerFormulaire">
      <div class="modal__panel">
        <h2 class="modal__title">{{ form.id ? 'Modifier le fournisseur' : 'Nouveau fournisseur' }}</h2>

        <div class="field">
          <label class="label">Nom *</label>
          <input v-model="form.name" type="text" class="input" maxlength="160" />
        </div>
        <div class="field">
          <label class="label">Personne de contact</label>
          <input v-model="form.contact_name" type="text" class="input" maxlength="160" />
        </div>
        <div class="grid-2">
          <div class="field">
            <label class="label">Téléphone</label>
            <input v-model="form.phone" type="text" class="input" maxlength="40" />
          </div>
          <div class="field">
            <label class="label">E-mail</label>
            <input v-model="form.email" type="email" class="input" maxlength="160" />
          </div>
        </div>
        <div class="field">
          <label class="label">Adresse</label>
          <input v-model="form.address" type="text" class="input" maxlength="255" />
        </div>
        <div class="field">
          <label class="label">Notes</label>
          <textarea v-model="form.notes" class="input" rows="3" maxlength="2000"></textarea>
        </div>
        <label class="case">
          <input v-model="form.is_active" type="checkbox" />
          Fournisseur actif
        </label>

        <p v-if="erreur" class="erreur">{{ erreur }}</p>

        <div class="modal__actions">
          <button class="btn btn-ghost" @click="fermerFormulaire">Annuler</button>
          <button class="btn btn-primary" :disabled="!form.name.trim() || envoi" @click="enregistrer">
            {{ envoi ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/api'
import AdminPagination from '@/admin/components/AdminPagination.vue'

const fournisseurs = ref([])
const meta         = ref(null)
const loading      = ref(false)
const page         = ref(1)
const recherche    = ref('')
const actifsSeuls  = ref(false)

async function charger(p = 1) {
  page.value    = p
  loading.value = true
  try {
    const params = { page: p }
    if (recherche.value)   params.search      = recherche.value
    if (actifsSeuls.value) params.active_only = 1
    const { data } = await api.get('/admin/suppliers', { params })
    fournisseurs.value = data.data
    meta.value         = data.meta
  } finally {
    loading.value = false
  }
}

// ── Formulaire ───────────────────────────────────────────────────────────────

const formulaireOuvert = ref(false)
const envoi            = ref(false)
const erreur           = ref('')

const VIDE = { id: null, name: '', contact_name: '', phone: '', email: '', address: '', notes: '', is_active: true }
const form = ref({ ...VIDE })

function ouvrirFormulaire(fournisseur = null) {
  form.value = fournisseur ? { ...fournisseur } : { ...VIDE }
  erreur.value = ''
  formulaireOuvert.value = true
}

function fermerFormulaire() {
  formulaireOuvert.value = false
}

async function enregistrer() {
  envoi.value  = true
  erreur.value = ''
  try {
    const charge = {
      name: form.value.name,
      contact_name: form.value.contact_name || null,
      phone: form.value.phone || null,
      email: form.value.email || null,
      address: form.value.address || null,
      notes: form.value.notes || null,
      is_active: form.value.is_active,
    }
    if (form.value.id) await api.put(`/admin/suppliers/${form.value.id}`, charge)
    else               await api.post('/admin/suppliers', charge)

    fermerFormulaire()
    charger(page.value)
  } catch (e) {
    erreur.value = e.response?.data?.message ?? "Le fournisseur n'a pas pu être enregistré."
  } finally {
    envoi.value = false
  }
}

async function supprimer(fournisseur) {
  if (!window.confirm(`Supprimer « ${fournisseur.name} » ?`)) return
  try {
    // Le serveur archive au lieu de supprimer si des bons y sont rattachés,
    // et le dit dans sa réponse.
    const { data } = await api.delete(`/admin/suppliers/${fournisseur.id}`)
    if (data.archived) window.alert(data.message)
    charger(page.value)
  } catch (e) {
    window.alert(e.response?.data?.message ?? 'Suppression impossible.')
  }
}

onMounted(() => charger(1))
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.filters-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filtre-actifs {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b5f58;
}

.text-right { text-align: right; }

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.case {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-top: 4px;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(30, 20, 16, .45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 60;
}

.modal__panel {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .2);
}

.modal__title {
  font-size: 19px;
  font-weight: 700;
  margin-bottom: 18px;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.erreur {
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 13px;
}
</style>
