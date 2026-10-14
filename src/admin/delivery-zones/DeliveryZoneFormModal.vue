<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>{{ form.id ? 'Modifier la zone' : 'Nouvelle zone' }}</h3>

      <!--
        Origine du pré-remplissage. Sans elle, une modale qui s'ouvre déjà
        remplie laisse l'agent se demander d'où sortent ces valeurs.
      -->
      <p v-if="origin" class="modal-origin">{{ origin }}</p>

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
        <!--
          Les quartiers que cette zone ne couvre pas, parce qu'ils ont leur
          propre tarif. La boutique les affiche sous le nom de la zone pour que
          la cliente aille chercher le sien, au lieu de découvrir l'écart
          devant sa porte.
        -->
        <label class="span-2">Quartiers exclus (séparés par virgule)
          <input v-model="exclusionsText" type="text" placeholder="N'Dotré, Anador" />
          <small class="field-hint">
            Affiché à la cliente : « Abobo (hors N'Dotré, Anador) ». N'exclure
            qu'un quartier livré par une autre zone, sinon elle n'a nulle part
            où aller.
          </small>
        </label>
        <label class="span-2 checkbox">
          <input v-model="form.active" type="checkbox" />
          <span>Zone active</span>
        </label>
      </div>

      <div class="modal-actions">
        <button class="btn btn-outline" @click="$emit('close')">Annuler</button>
        <button class="btn btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/api';

/*
 * Formulaire de zone, partagé entre l'écran des zones et celui des expéditions.
 *
 * Il vivait dans DeliveryZonesView, ce qui obligeait l'agent qui venait de
 * tarifer une commande hors zone à changer d'écran, retrouver le bouton, puis
 * ressaisir la commune et le montant qu'il avait sous les yeux — trois
 * occasions de se tromper, pour une saisie qui évite justement de refaire le
 * travail à la commande suivante.
 */
const props = defineProps({
  /** Zone existante à modifier, ou valeurs de départ pour une création. */
  zone:   { type: Object, default: null },
  /** Phrase expliquant d'où vient le pré-remplissage. */
  origin: { type: String, default: '' },
});

const emit = defineEmits(['close', 'saved']);

function emptyForm() {
  return {
    id: null, group: '', name: '', country: 'CI',
    price: 0, price_unit: 'flat', free_threshold: null,
    sort_order: 0, active: true, cities: [], excluded_areas: [],
  };
}

const form        = ref({ ...emptyForm(), ...(props.zone ?? {}) });
const aliasesText     = ref((props.zone?.cities ?? []).join(', '));
const exclusionsText  = ref((props.zone?.excluded_areas ?? []).join(', '));
const saving          = ref(false);
const error           = ref('');
/** « a, b ,, c » -> ['a','b','c'] : la saisie est libre, le tableau ne l'est pas. */
const enListe = (texte) => texte.split(',').map(s => s.trim()).filter(Boolean);

async function save() {
  saving.value = true;
  error.value  = '';
  try {
    const payload = {
      ...form.value,
      cities:         enListe(aliasesText.value),
      excluded_areas: enListe(exclusionsText.value),
    };

    const { data } = form.value.id
      ? await api.patch(`/admin/delivery-zones/${form.value.id}`, payload)
      : await api.post('/admin/delivery-zones', payload);

    // Les avertissements remontent au parent : la modale se ferme dès
    // l'enregistrement, personne ne les y lirait.
    emit('saved', data?.data ?? null, data?.warnings ?? []);
  } catch (e) {
    // Le serveur refuse les doublons avec le nom de la zone qui couvre déjà la
    // destination : son message est plus utile qu'un « erreur » générique.
    error.value = e.response?.data?.message ?? "Erreur lors de l'enregistrement.";
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}
.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal h3 { font-family: var(--font-display); font-size: 1.25rem; margin-bottom: var(--space-2); }

.modal-origin {
  margin: 0 0 var(--space-4);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--cream-100);
  font-size: 0.8125rem;
  color: var(--gray-600);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-600);
}
.form-grid input,
.form-grid select {
  padding: 8px 12px;
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--gray-800);
}
.form-grid input:focus,
.form-grid select:focus { outline: none; border-color: var(--rose-400); }
.span-2 { grid-column: span 2; }
.checkbox { flex-direction: row !important; align-items: center; gap: var(--space-2) !important; }
.checkbox input { width: auto; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-5);
}

.field-hint {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--gray-500);
}

.form-error {
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: #fee2e2;
  color: #991b1b;
  font-size: 0.8125rem;
}

@media (max-width: 540px) {
  .form-grid { grid-template-columns: 1fr; }
  .span-2 { grid-column: span 1; }
}
</style>
