import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// PrimeVue Core
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext' 
import Password from 'primevue/password'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Card from 'primevue/card'

// --- IMPORTANTE: AQUÍ BORRAMOS LAS IMPORTACIONES DE CSS DE PRIMEVUE ---
// Solo dejamos tus estilos personalizados
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Configuración de PrimeVue
app.use(PrimeVue, { ripple: true, inputStyle: 'filled' }) 
app.use(ToastService)

app.directive('tooltip', Tooltip)

// Registrar componentes
app.component('Button', Button)
app.component('InputText', InputText) 
app.component('Password', Password)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Tag', Tag)
app.component('Toast', Toast)
app.component('Card', Card)

app.mount('#app')
