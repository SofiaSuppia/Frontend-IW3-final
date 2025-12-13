<!-- Tabla de Órdenes 1. Ingreso caminio, 2. Pesaje inicial, 3. Inicio carga, 4. Finalización -->
<template>
  <div class="dashboard-layout">
    
    <!-- BARRA LATERAL -->
    <aside class="sidebar">
      <div class="brand">
        <img src="/assets/images/logo.png" alt="FluxGas Logo" class="sidebar-logo" />
      </div>

      <nav class="nav-menu">
        <ul>
          <li class="nav-item active">
            <span class="icon">🏠</span> <span>Inicio</span>
          </li>
          <li class="nav-item" @click="navigateTo('/orders')">
            <span class="icon">🚛</span> <span>Órdenes</span>
          </li>
          <li class="nav-item" @click="navigateTo('/products')">
            <span class="icon">🛢️</span> <span>Productos</span>
          </li>
          <li class="nav-item" @click="navigateTo('/users')">
            <span class="icon">👥</span> <span>Usuarios</span>
          </li>
        </ul>
      </nav>

      <div class="bottom-section">
        <div class="user-profile">
          <div class="avatar-circle">
            {{ username.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ username }}</span>
            <span class="user-role">Gerente</span>
          </div>
        </div>
        <div class="logout-wrapper" @click="handleLogout">
          <span class="icon">↪️</span> <span>Cerrar Sesión</span>
        </div>
      </div>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">
      <div class="dashboard-container">
        
        <header class="dashboard-header">
          <h1>Panel de Control</h1>
          <p>Resumen de operaciones en tiempo real</p>
        </header>

        <!-- KPI CARDS: Ahora muestran LOS 5 ESTADOS -->
        <div class="stats-grid">
          
          <!-- 1. EN ESPERA (Amarillo) -->
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(249, 168, 38, 0.2); color: #F9A826;">
              ⚠️
            </div>
            <div class="stat-info">
              <h3>Espera de Pesaje Inicial</h3>
              <p class="stat-number">{{ waitingCount }}</p>
            </div>
          </div>

          <!-- 2. PESAJE INICIAL Registrado (Azul) -->
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(100, 181, 246, 0.2); color: #64b5f6;">
              ⚡
            </div>
            <div class="stat-info">
              <h3>Pesaje Inicial Registrado</h3>
              <p class="stat-number">{{ loadingCount }}</p>
            </div>
          </div>

          <!-- 3. INICIO CARGA (Rojo/Naranja) -->
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(233, 69, 96, 0.2); color: #E94560;">
              🛑
            </div>
            <div class="stat-info">
              <h3>Inicio Carga</h3>
              <p class="stat-number">{{ filledCount }}</p>
            </div>
          </div>

          <!-- 4. FIN DE CARGA (Verde) -->
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(46, 204, 113, 0.2); color: #2ecc71;">
              ✅
            </div>
            <div class="stat-info">
              <h3>Finalización de Carga</h3>
              <p class="stat-number">{{ authorizedCount }}</p>
            </div>
          </div>

          <!-- 5. FINALIZADA (Gris) -->
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(255, 255, 255, 0.1); color: #aebbc7;">
              🏁
            </div>
            <div class="stat-info">
              <h3>Finalizada</h3>
              <p class="stat-number">{{ finishedCount }}</p>
            </div>
          </div>

        </div>

        <!-- TABLA CON PRIMEVUE -->
        <div class="orders-section glass-panel">
          <div class="section-header">
            <h2>Órdenes Recientes</h2>
            <Button label="Ver Todas" icon="pi pi-arrow-right" iconPos="right" class="p-button-text custom-link-btn" @click="navigateTo('/orders')" />
          </div>

          <!-- DataTable -->
          <DataTable :value="activeOrders" responsiveLayout="scroll" class="custom-datatable">
            
            <Column field="code" header="Orden #"></Column>
            <Column field="client" header="Cliente"></Column>
            <Column field="destination" header="Destino"></Column>
            
            <Column header="Estado">
              <template #body="slotProps">
                <Tag 
                  :value="getStatusLabel(slotProps.data.status)" 
                  :severity="getSeverity(slotProps.data.status)" 
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
                  :class="getProgressBarClass(slotProps.data.status)"
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
import authService from '../services/authService';

// Importamos componentes de PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';

const username = localStorage.getItem('username') || 'Administrador';
const router = useRouter();

// 1. Datos simulados
const activeOrders = ref([
  { id: 1, code: 'ORD-001', client: 'Gas del Sur', destination: 'Planta Córdoba', status: 'PESAJE_INICIAL_REGISTRADO', progress: 45 },
  { id: 2, code: 'ORD-004', client: 'Industrias Metal', destination: 'Rosario', status: 'PENDIENTE_PESAJE_INICIAL', progress: 0 },
  { id: 3, code: 'ORD-008', client: 'Estación Central', destination: 'Buenos Aires', status: 'PESAJE_FINAL_REGISTRADO', progress: 90 },
  { id: 4, code: 'ORD-012', client: 'AgroServices', destination: 'Mendoza', status: 'CERRADA_PARA_CARGA', progress: 75 },
  { id: 5, code: 'ORD-015', client: 'Transportes YPF', destination: 'Neuquén', status: 'FINALIZADA', progress: 100 },
  { id: 6, code: 'ORD-018', client: 'Logística Norte', destination: 'Salta', status: 'PENDIENTE_PESAJE_INICIAL', progress: 0 },
]);

// 2. Cálculos para las tarjetas de arriba (KPIs) - AHORA SON 5
const waitingCount = computed(() => activeOrders.value.filter(o => o.status === 'PENDIENTE_PESAJE_INICIAL').length);
const loadingCount = computed(() => activeOrders.value.filter(o => o.status === 'PESAJE_INICIAL_REGISTRADO').length);
const filledCount = computed(() => activeOrders.value.filter(o => o.status === 'CERRADA_PARA_CARGA').length);
const authorizedCount = computed(() => activeOrders.value.filter(o => o.status === 'PESAJE_FINAL_REGISTRADO').length);
const finishedCount = computed(() => activeOrders.value.filter(o => o.status === 'FINALIZADA').length);

// 3. Helpers de Estado
const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDIENTE_PESAJE_INICIAL': return 'Espera de Pesaje Inicial';
    case 'PESAJE_INICIAL_REGISTRADO': return 'Pesaje Inicial Registrado';
    case 'CERRADA_PARA_CARGA': return 'Inicio Carga';
    case 'PESAJE_FINAL_REGISTRADO': return 'Finalización de Carga';
    case 'FINALIZADA': return 'Finalizada';
    default: return 'Desconocido';
  }
};

const getSeverity = (status) => {
  switch (status) {
    case 'PENDIENTE_PESAJE_INICIAL': return 'warning';
    case 'PESAJE_INICIAL_REGISTRADO': return 'info';
    case 'CERRADA_PARA_CARGA': return 'danger';
    case 'PESAJE_FINAL_REGISTRADO': return 'success';
    case 'FINALIZADA': return 'secondary'; 
    default: return null;
  }
};

const getProgressBarClass = (status) => {
  return status === 'FINALIZADA' ? 'progress-finished' : 'progress-active';
};

const handleLogout = () => {
  authService.logout();
  router.push('/'); 
};

const navigateTo = (route) => {
  router.push(route); 
};
</script>

<style scoped>
/* --- LAYOUT GENERAL --- */
.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 260px;
  background-color: #0F3460; 
  color: #F1F6F9;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  box-shadow: 4px 0 15px rgba(0,0,0,0.4);
  z-index: 20;
  justify-content: space-between;
}

.brand {
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 2rem; padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1); min-height: 60px;
}
.sidebar-logo { max-width: 180px; height: auto; max-height: 60px; object-fit: contain; }

.nav-menu ul { list-style: none; padding: 0; margin: 0; }
.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 12px 15px;
  margin-bottom: 8px; border-radius: 8px; cursor: pointer;
  transition: all 0.3s ease; color: #aebbc7; font-weight: 500;
}
.nav-item:hover { background-color: rgba(255, 255, 255, 0.05); color: #F1F6F9; }
.nav-item.active { background-color: #E94560; color: white; box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3); }
.icon { font-size: 1.1rem; }

.bottom-section { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; }
.user-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 10px; }
.avatar-circle { width: 40px; height: 40px; background-color: #F1F6F9; color: #0F3460; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.95rem; font-weight: bold; color: #F1F6F9; }
.user-role { font-size: 0.75rem; color: #aebbc7; }
.logout-wrapper { display: flex; align-items: center; gap: 10px; padding: 10px; color: #aebbc7; cursor: pointer; transition: 0.3s; border-radius: 6px; }
.logout-wrapper:hover { color: #E94560; background-color: rgba(233, 69, 96, 0.1); }

/* --- MAIN CONTENT --- */
.main-content {
  flex: 1;
  /* Ajusté la opacidad a 0.6/0.75 para que el camión sea más visible pero el texto siga siendo legible */
  background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), 
              url('/assets/images/fondoCompleto.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed; /* Esto hace que el fondo se quede quieto al hacer scroll */
  padding: 2rem;
  overflow-y: auto;
}

.dashboard-container { max-width: 1200px; margin: 0 auto; }
.dashboard-header { margin-bottom: 2rem; }
.dashboard-header h1 { font-size: 2.5rem; margin: 0; color: #F1F6F9; font-weight: 700; }
.dashboard-header p { color: #aebbc7; margin-top: 5px; }

/* --- KPI CARDS --- */
.stats-grid {
  display: grid; 
  /* Ajustamos el minmax para que quepan mejor 5 tarjetas */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem; margin-bottom: 2rem;
}
.stat-card {
  background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1); padding: 1.5rem;
  border-radius: 15px; display: flex; align-items: center; gap: 1rem;
  transition: transform 0.3s;
}
.stat-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.08); }
.stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
.stat-info h3 { margin: 0; font-size: 0.85rem; color: #aebbc7; font-weight: 500; }
.stat-number { margin: 5px 0 0 0; font-size: 1.8rem; font-weight: 700; color: #F1F6F9; }

/* --- PRIMEVUE CUSTOMIZATION (GLASS EFFECT) --- */
.orders-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
}

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-header h2 { margin: 0; color: #F1F6F9; font-size: 1.5rem; }

.custom-link-btn { color: #E94560 !important; font-weight: bold; }
.custom-link-btn:hover { color: #ff5773 !important; background: rgba(233, 69, 96, 0.1) !important; }

/* --- CORRECCIÓN DE VISIBILIDAD DE LA TABLA --- */
:deep(.p-datatable .p-datatable-tbody > tr) {
  background: transparent !important;
  color: #F1F6F9 !important;
}
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  color: #F1F6F9 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: transparent !important;
  color: #aebbc7 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  font-weight: 600;
}

/* Estilos para Tags */
.custom-tag {
  font-size: 0.8rem;
  padding: 4px 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Estilos para ProgressBar */
:deep(.p-progressbar) {
  background: rgba(255, 255, 255, 0.1);
}
:deep(.p-progressbar .p-progressbar-value) {
  background: #E94560; 
}
:deep(.progress-finished .p-progressbar-value) {
  background: #2ecc71; 
}

/* --- ANIMACIONES --- */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.stat-card, .orders-section {
  opacity: 0;
  animation: fadeIn 0.6s forwards;
}
.stat-card {
  transform: translateY(10px);
  animation: slideIn 0.6s forwards;
}
.orders-section {
  animation-delay: 0.2s;
}
</style>