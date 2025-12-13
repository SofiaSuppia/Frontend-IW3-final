<!-- Tabla de Órdenes 1. Ingreso caminio, 2. Pesaje inicial, 3. Inicio carga, 4. Finalización -->
<template>
  <div class="dashboard-layout">
    
    <!-- 1. REUTILIZACIÓN: Usamos el componente Sidebar -->
    <Sidebar activePage="home" />

    <main class="main-content">
      <div class="dashboard-container">
        
        <header class="dashboard-header">
          <h1>Panel de Control</h1>
          <p>Resumen de operaciones en tiempo real</p>
        </header>

        <!-- 2. DRY: Generamos las tarjetas con un bucle v-for -->
        <div class="stats-grid">
          <div 
            v-for="(card, index) in kpiCards" 
            :key="index" 
            class="stat-card"
          >
            <div 
              class="stat-icon" 
              :style="{ background: card.bgColor, color: card.color }"
            >
              {{ card.icon }}
            </div>
            <div class="stat-info">
              <h3>{{ card.label }}</h3>
              <p class="stat-number">{{ card.count }}</p>
            </div>
          </div>
        </div>

        <!-- TABLA DE ÓRDENES -->
        <div class="orders-section glass-panel">
          <div class="section-header">
            <h2>Órdenes Recientes</h2>
            <Button 
              label="Ver Todas" 
              icon="pi pi-arrow-right" 
              iconPos="right" 
              class="p-button-text custom-link-btn" 
              @click="navigateTo('/orders')" 
            />
          </div>

          <DataTable :value="activeOrders" responsiveLayout="scroll" class="custom-datatable">
            <Column field="code" header="Orden #"></Column>
            <Column field="client" header="Cliente"></Column>
            <Column field="destination" header="Destino"></Column>
            
            <Column header="Estado">
              <template #body="slotProps">
                <Tag 
                  :value="getStatusConfig(slotProps.data.status).label" 
                  :severity="getStatusConfig(slotProps.data.status).severity" 
                  class="custom-tag"
                />
              </template>
            </Column>

            <Column header="Progreso">
              <template #body="slotProps">
                <ProgressBar 
                  :value="slotProps.data.progress" 
                  :showValue="true" 
                  style="height: 10px"
                  :class="slotProps.data.status === 'FINALIZADA' ? 'progress-finished' : 'progress-active'"
                />
              </template>
            </Column>
          </DataTable>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue'; 

// PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';

const router = useRouter();

// --- 3. CONFIGURACIÓN CENTRALIZADA (Best Practice) ---
// Definimos todo lo visual y lógico de los estados en un solo lugar.
const STATUS_CONFIG = {
  'PENDIENTE_PESAJE_INICIAL': { label: 'Espera de Pesaje', severity: 'warning', icon: '⚠️', color: '#F9A826', bgColor: 'rgba(249, 168, 38, 0.2)' },
  'PESAJE_INICIAL_REGISTRADO': { label: 'Pesaje Inicial Reg.', severity: 'info', icon: '⚡', color: '#64b5f6', bgColor: 'rgba(100, 181, 246, 0.2)' },
  'CERRADA_PARA_CARGA':        { label: 'Inicio Carga', severity: 'danger', icon: '🛑', color: '#E94560', bgColor: 'rgba(233, 69, 96, 0.2)' },
  'PESAJE_FINAL_REGISTRADO':   { label: 'Fin de Carga', severity: 'success', icon: '✅', color: '#2ecc71', bgColor: 'rgba(46, 204, 113, 0.2)' },
  'FINALIZADA':                { label: 'Finalizada', severity: 'secondary', icon: '🏁', color: '#aebbc7', bgColor: 'rgba(255, 255, 255, 0.1)' },
  'DEFAULT':                   { label: 'Desconocido', severity: 'contrast', icon: '❓', color: '#fff', bgColor: 'rgba(255,255,255,0.1)' }
};

// Helper para obtener config de forma segura
const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG['DEFAULT'];

// --- DATOS ---
const activeOrders = ref([
  { id: 1, code: 'ORD-001', client: 'Gas del Sur', destination: 'Planta Córdoba', status: 'PESAJE_INICIAL_REGISTRADO', progress: 45 },
  { id: 2, code: 'ORD-004', client: 'Industrias Metal', destination: 'Rosario', status: 'PENDIENTE_PESAJE_INICIAL', progress: 0 },
  { id: 3, code: 'ORD-008', client: 'Estación Central', destination: 'Buenos Aires', status: 'PESAJE_FINAL_REGISTRADO', progress: 90 },
  { id: 4, code: 'ORD-012', client: 'AgroServices', destination: 'Mendoza', status: 'CERRADA_PARA_CARGA', progress: 75 },
  { id: 5, code: 'ORD-015', client: 'Transportes YPF', destination: 'Neuquén', status: 'FINALIZADA', progress: 100 },
  { id: 6, code: 'ORD-018', client: 'Logística Norte', destination: 'Salta', status: 'PENDIENTE_PESAJE_INICIAL', progress: 0 },
]);

// --- 4. LÓGICA DE KPIs OPTIMIZADA ---
const kpiCards = computed(() => {
  // Paso 1: Contar ocurrencias (O(n) - una sola pasada)
  const counts = activeOrders.value.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // Paso 2: Mapear la configuración a un array para el v-for
  // El orden de las keys aquí define el orden en pantalla
  const orderOfCards = [
    'PENDIENTE_PESAJE_INICIAL', 
    'PESAJE_INICIAL_REGISTRADO', 
    'CERRADA_PARA_CARGA', 
    'PESAJE_FINAL_REGISTRADO', 
    'FINALIZADA'
  ];

  return orderOfCards.map(key => ({
    ...STATUS_CONFIG[key],
    count: counts[key] || 0
  }));
});

const navigateTo = (route) => {
  router.push(route); 
};
</script>

<style scoped>
/* --- LAYOUT GENERAL --- */
.dashboard-layout {
  display: flex; height: 100vh; width: 100%; overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #16213E;
}

/* NOTA: Estilos de Sidebar eliminados porque ahora es un componente */

/* --- MAIN CONTENT --- */
.main-content {
  flex: 1;
  background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), 
              url('/assets/images/fondoCompleto.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  padding: 2rem;
  overflow-y: auto;
}

.dashboard-container { max-width: 1200px; margin: 0 auto; }
.dashboard-header { margin-bottom: 2rem; }
.dashboard-header h1 { font-size: 2.5rem; margin: 0; color: #F1F6F9; font-weight: 700; }
.dashboard-header p { color: #aebbc7; margin-top: 5px; }

/* --- KPI CARDS (GRID) --- */
.stats-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem; margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1); padding: 1.5rem;
  border-radius: 15px; display: flex; align-items: center; gap: 1rem;
  transition: transform 0.3s;
  /* Animación de entrada */
  opacity: 0; transform: translateY(10px);
  animation: slideIn 0.6s forwards;
}
.stat-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.08); }

.stat-icon { 
  width: 50px; height: 50px; border-radius: 12px; 
  display: flex; align-items: center; justify-content: center; 
  font-size: 1.5rem; flex-shrink: 0; 
}

.stat-info h3 { margin: 0; font-size: 0.85rem; color: #aebbc7; font-weight: 500; }
.stat-number { margin: 5px 0 0 0; font-size: 1.8rem; font-weight: 700; color: #F1F6F9; }

/* --- TABLA Y PANELES --- */
.orders-section {
  background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 1.5rem;
  opacity: 0; animation: fadeIn 0.6s forwards 0.2s; /* Delay para efecto cascada */
}

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-header h2 { margin: 0; color: #F1F6F9; font-size: 1.5rem; }

.custom-link-btn { color: #E94560 !important; font-weight: bold; }
.custom-link-btn:hover { color: #ff5773 !important; background: rgba(233, 69, 96, 0.1) !important; }

/* --- OVERRIDES DE PRIMEVUE --- */
:deep(.p-datatable .p-datatable-tbody > tr) { background: transparent !important; color: #F1F6F9 !important; }
:deep(.p-datatable .p-datatable-tbody > tr:hover) { background: rgba(255, 255, 255, 0.1) !important; }
:deep(.p-datatable .p-datatable-tbody > tr > td) { color: #F1F6F9 !important; border-color: rgba(255, 255, 255, 0.1) !important; }
:deep(.p-datatable .p-datatable-thead > tr > th) { background: transparent !important; color: #aebbc7 !important; border-color: rgba(255, 255, 255, 0.1) !important; font-weight: 600; }

.custom-tag { font-size: 0.8rem; padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.5px; }

:deep(.p-progressbar) { background: rgba(255, 255, 255, 0.1); }
:deep(.p-progressbar .p-progressbar-value) { background: #E94560; }
:deep(.progress-finished .p-progressbar-value) { background: #2ecc71; }

/* --- ANIMACIONES --- */
@keyframes slideIn { to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { to { opacity: 1; } }
</style>