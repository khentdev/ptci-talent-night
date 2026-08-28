import './features/shared/styles/style.css';
import { VueQueryPlugin } from '@tanstack/vue-query'

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import { router } from './app/router/index';
import { useAxiosInterceptor } from './core/API/axiosInterceptor';

const pinia = createPinia()
const app = createApp(App)
useAxiosInterceptor()
app.use(VueQueryPlugin)

app.use(pinia)
app.use(router)
app.mount("#app")
