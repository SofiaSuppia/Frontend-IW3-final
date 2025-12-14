import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// PrimeVue

import Button from 'primevue/button'
import InputText from 'primevue/inputtext' 
import Password from 'primevue/password' 
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

// Estilos PrimeVue
import 'primevue/resources/themes/lara-dark-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('Button', Button)
app.component('InputText', InputText) 
app.component('Password', Password) 
app.use(PrimeVue)
app.use(ToastService)
app.directive('tooltip', Tooltip)

app.mount('#app')
