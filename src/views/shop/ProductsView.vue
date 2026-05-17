<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <div class="flex flex-col sm:flex-row gap-8">
      <!-- Filtres -->
      <aside class="w-full sm:w-60 shrink-0">
        <div class="card p-5 space-y-6 sticky top-24">
          <h2 class="font-semibold text-gray-800">Filtres</h2>

          <!-- CatÃ©gories -->
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">CatÃ©gorie</p>
            <div class="space-y-1">
              <button @click="filters.category = null"
                class="w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
                :class="!filters.category ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'">
                Toutes
              </button>
              <button v-for="cat in categories" :key="cat.id"
                @click="filters.category = cat.slug"
                class="w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
                :class="filters.category === cat.slug ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'">
                {{ cat.name }}
              </button>
            </div>
          </div>

          <!-- Prix -->
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prix (XOF)</p>
            <div class="flex gap-2">
              <input v-model="filters.min_price" type="number" placeholder="Min" class="input !py-2 text-xs" />
              <input v-model="filters.max_price" type="number" placeholder="Max" class="input !py-2 text-xs" />
            </div>
          </div>

          <button @click="resetFilters" class="btn-ghost w-full text-xs text-gray-400">RÃ©initialiser</button>
        </div>
      </aside>

      <!-- Produits -->
      <div class="flex-1">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <p class="text-sm text-gray-500">
            <span v-if="!loading">{{ meta.total ?? 0 }} produit(s)</span>
          </p>
          <select v-model="filters.sort" class="input !w-auto !py-2 text-sm">
            <option value="">Plus rÃ©cents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix dÃ©croissant</option>
          </select>
        </div>

        <!-- Grid -->
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <div v-for="i in 9" :key="i" class="rounded-2xl bg-gray-100 animate-pulse aspect-[3/4]" />
        </div>
        <div v-else-if="products.length" class="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <ProductCard v-for="p in products" :key="p.id" :product="p" />
        </div>
        <div v-else class="text-center py-20 text-gray-400">
          <p class="text-4xl mb-4">ðŸ”</p>
          <p>Aucun produit trouvÃ©</p>
        </div>

        <!-- Pagination -->
        <div v-if="meta.last_page > 1" class="flex justify-center gap-2 mt-10">
          <button v-for="page in meta.last_page" :key="page"
            @click="filters.page = page"
            class="size-9 rounded-xl text-sm font-medium transition-colors"
            :class="page === filters.page ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'">
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api';
import ProductCard from '@/components/shop/ProductCard.vue';

const route      = useRoute();
const products   = ref([]);
const categories = ref([]);
const meta       = ref({});
const loading    = ref(true);

const filters = reactive({
  category:  route.query.category ?? null,
  search:    route.query.search ?? null,
  min_price: null,
  max_price: null,
  sort:      '',
  page:      1,
  featured:  route.query.featured ?? null,
});

async function loadProducts() {
  loading.value = true;
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ''));
  const { data } = await api.get('/products', { params });
  products.value = data.data;
  meta.value     = data.meta ?? { total: data.total, last_page: data.last_page };
  loading.value  = false;
}

watch(filters, () => { filters.page = 1; loadProducts(); }, { deep: true });

onMounted(async () => {
  const [, cats] = await Promise.all([loadProducts(), api.get('/categories')]);
  categories.value = cats.data.data ?? cats.data;
});

function resetFilters() {
  Object.assign(filters, { category: null, search: null, min_price: null, max_price: null, sort: '', page: 1, featured: null });
}
</script>

