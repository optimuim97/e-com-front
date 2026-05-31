import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import router from './router';
import i18n from './i18n';
import App from './App.vue';
import AppSelect from '@/components/ui/AppSelect.vue';
import echoPlugin from '@/plugins/echo';
import './assets/css/design-system.css'
import './assets/app.css'

const app = createApp(App);
app.component('AppSelect', AppSelect);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Toast, {
  position:       'bottom-right',
  timeout:        3000,
  maxToasts:      3,
  transition:     'Vue-Toastification__fade',
  closeOnClick:   true,
  pauseOnHover:   true,
  draggable:      false,
  hideProgressBar: false,
  // Empêche les doublons : même contenu → pas de nouveau toast
  filterBeforeCreate: (toast, toasts) => {
    if (toasts.some(t => t.content === toast.content)) return false
    return toast
  },
});
app.use(echoPlugin);

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
