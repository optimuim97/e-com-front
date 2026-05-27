import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import router from './router';
import i18n from './i18n';
import App from './App.vue';
import AppSelect from '@/components/ui/AppSelect.vue';
import './assets/css/design-system.css'
import './assets/app.css'

const app = createApp(App);
app.component('AppSelect', AppSelect);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Toast, { position: 'top-right', timeout: 3000 });

app.mount('#app');

app.directive('img-fallback', {
    mounted(el, binding) {
        const defaultImage = binding.value || '/images/default.png'

        el.addEventListener('error', () => {
            if (!el.src.includes(defaultImage)) {
                el.src = defaultImage
            }
        })
    }
})
