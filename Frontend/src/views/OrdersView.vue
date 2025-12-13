<template>
  <div class="dashboard-layout">
    
    <!-- BARRA LATERAL (Idéntica al Home) -->
    <aside class="sidebar">
      <div class="brand">
        <img src="/assets/images/logo.png" alt="FluxGas Logo" class="sidebar-logo" />
      </div>

      <nav class="nav-menu">
        <ul>
          <li class="nav-item" @click="navigateTo('/home')">
            <span class="icon">🏠</span> <span>Inicio</span>
          </li>
          <li class="nav-item active">
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
      <div class="content-container">
        
        <h1 class="page-title">Órdenes</h1>

        <!-- FILTROS SUPERIORES (Estilo Botones) -->
        <div class="filters-row">
          <button 
            v-for="filter in filters" 
            :key="filter.label"
            @click="activeFilter = filter.value"
            :class="['filter-btn', { active: activeFilter === filter.value }]"
            :style="{ '--btn-color': filter.color }"
          >
            <i :class="filter.icon"></i> {{ filter.label }}
          </button>
          
          <!-- Botón para limpiar filtro -->
          <button 
            v-if="activeFilter" 
            class="clear-btn" 
            @click="activeFilter = null"
          >
            Ver Todas
          </button>
        </div>

        <!-- TABLA DE ÓRDENES -->
        <div class="table-wrapper">
          <DataTable 
            :value="filteredOrders" 
            :paginator="true" 
            :rows="8" 
            class="orders-table"
            responsiveLayout="scroll"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} órdenes"
          >
            
            <!-- Columna Camión -->
            <Column field="truck" header="Camión">
              <template #body="slotProps">
                <div class="truck-cell">
                  <i class="pi pi-truck" style="font-size: 1.2rem; margin-right: 10px;"></i>
                  {{ slotProps.data.truck }}
                </div>
              </template>
            </Column>

            <!-- Columna Cliente -->
            <Column field="client" header="Cliente"></Column>

            <!-- Columna Recepción -->
            <Column field="receptionDate" header="Recepción"></Column>

            <!-- Columna Carga -->
            <Column field="loadDate" header="Carga"></Column>

            <!-- Columna Estado -->
            <Column field="status" header="Estado">
              <template #body="slotProps">
                <span :class="['status-text', getStatusClass(slotProps.data.status)]">
                  {{ getStatusLabel(slotProps.data.status) }}
                </span>
              </template>
            </Column>

            <!-- Columna Alarmas -->
            <Column field="alarm" header="Alarmas">
              <template #body="slotProps">
                <span :class="slotProps.data.alarm === 'Problema' ? 'alarm-danger' : 'alarm-safe'">
                  {{ slotProps.data.alarm }}
                </span>
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

// PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const router = useRouter();
const username = localStorage.getItem('username') || 'Administrador';

// --- DATOS DE FILTROS (Nombres actualizados y descriptivos) ---
const activeFilter = ref(null);

const filters = [
  { label: 'Espera Pesaje Inicial', value: 'PENDIENTE_PESAJE_INICIAL', color: '#F9A826', icon: 'pi pi-clock' },
  { label: 'Pesaje Inicial Registrado', value: 'PESAJE_INICIAL_REGISTRADO', color: '#64b5f6', icon: 'pi pi-box' },
  { label: 'Inicio Carga', value: 'CERRADA_PARA_CARGA', color: '#E94560', icon: 'pi pi-exclamation-circle' },
  { label: 'Finalización de Carga', value: 'PESAJE_FINAL_REGISTRADO', color: '#2ecc71', icon: 'pi pi-check-circle' },
  { label: 'Finalizada', value: 'FINALIZADA', color: '#aebbc7', icon: 'pi pi-flag' },
];

// --- DATOS SIMULADOS (MOCK DATA) ---
const allOrders = ref([
// ...existing code...
  { id: 1, truck: 'JKL-3000', client: 'Petrobras', receptionDate: '17/12/2024 03:42:42', loadDate: '20/12/2024 08:00:00', status: 'PESAJE_FINAL_REGISTRADO', alarm: 'Problema' },
  { id: 2, truck: 'YZA-7890', client: 'Occidental', receptionDate: '17/12/2024 03:41:25', loadDate: '09/12/2024 00:00:00', status: 'PENDIENTE_PESAJE_INICIAL', alarm: 'Sin alarmas' },
  { id: 3, truck: 'ABC-9012', client: 'Cabot Oil & Gas', receptionDate: '17/12/2024 03:41:25', loadDate: '14/11/2024 00:00:00', status: 'PENDIENTE_PESAJE_INICIAL', alarm: 'Sin alarmas' },
  { id: 4, truck: 'STU-9012', client: 'Marathon', receptionDate: '17/12/2024 03:41:24', loadDate: '26/11/2024 00:00:00', status: 'PESAJE_INICIAL_REGISTRADO', alarm: 'Sin alarmas' },
  { id: 5, truck: 'VWX-3456', client: 'Southwestern', receptionDate: '17/12/2024 03:41:24', loadDate: '03/11/2024 00:00:00', status: 'CERRADA_PARA_CARGA', alarm: 'Sin alarmas' },
  { id: 6, truck: 'JKL-3458', client: 'Lukoil', receptionDate: '17/12/2024 03:41:23', loadDate: '29/11/2024 00:00:00', status: 'FINALIZADA', alarm: 'Sin alarmas' },
  { id: 7, truck: 'WXY-9012', client: 'Murphy Oil', receptionDate: '17/12/2024 03:41:23', loadDate: '26/11/2024 00:00:00', status: 'PENDIENTE_PESAJE_INICIAL', alarm: 'Sin alarmas' },
  { id: 8, truck: 'HIJ-9012', client: 'BP', receptionDate: '17/12/2024 03:41:22', loadDate: '30/11/2024 00:00:00', status: 'PESAJE_INICIAL_REGISTRADO', alarm: 'Sin alarmas' },
  { id: 9, truck: 'MNO-1234', client: 'EOG Resources', receptionDate: '17/12/2024 03:41:22', loadDate: '03/11/2024 00:00:00', status: 'CERRADA_PARA_CARGA', alarm: 'Sin alarmas' },
  { id: 10, truck: 'JKL-1278', client: 'YPF', receptionDate: '17/12/2024 03:41:22', loadDate: '06/12/2024 00:00:00', status: 'PENDIENTE_PESAJE_INICIAL', alarm: 'Sin alarmas' },
  { id: 11, truck: 'ZZZ-9999', client: 'Shell', receptionDate: '18/12/2024 10:00:00', loadDate: '18/12/2024 12:00:00', status: 'FINALIZADA', alarm: 'Sin alarmas' },
]);

// --- LÓGICA DE FILTRADO ---
const filteredOrders = computed(() => {
  if (!activeFilter.value) return allOrders.value;
  return allOrders.value.filter(order => order.status === activeFilter.value);
});

// --- HELPERS ---
const getStatusLabel = (status) => {
  const labels = {
    'PENDIENTE_PESAJE_INICIAL': 'Espera Pesaje Inicial',
    'PESAJE_INICIAL_REGISTRADO': 'Pesaje Inicial Registrado',
    'CERRADA_PARA_CARGA': 'Inicio Carga',
    'PESAJE_FINAL_REGISTRADO': 'Finalización de Carga',
    'FINALIZADA': 'Finalizada'
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  // Retorna una clase CSS basada en el estado para colorear el texto si se desea
  return 'status-default'; 
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
/* --- LAYOUT GENERAL (Igual al Home) --- */
.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #16213E; /* Fondo oscuro general */
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


/* --- CONTENIDO PRINCIPAL --- */
.main-content {
  flex: 1;
  /* Fondo idéntico al HomeView */
  background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), 
              url('/assets/images/fondoCompleto.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  padding: 2rem;
  overflow-y: auto;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  color: #F1F6F9;
  font-size: 2rem;
  margin-bottom: 2rem;
}

/* --- FILTROS (BOTONES) --- */
.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-btn {
  background: transparent;
  border: 1px solid var(--btn-color);
  color: var(--btn-color);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.filter-btn:hover, .filter-btn.active {
  background: var(--btn-color);
  color: #16213E; /* Texto oscuro sobre fondo de color */
  box-shadow: 0 0 10px var(--btn-color);
}

.clear-btn {
  background: transparent;
  border: none;
  color: #aebbc7;
  cursor: pointer;
  text-decoration: underline;
  margin-left: auto;
}

/* --- TABLA --- */
.table-wrapper {
  background-color: #0F3460; /* Fondo azul oscuro para la tabla */
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

/* Personalización de PrimeVue DataTable para tema oscuro */
:deep(.orders-table .p-datatable-header),
:deep(.orders-table .p-datatable-thead > tr > th),
:deep(.orders-table .p-datatable-tbody > tr > td),
:deep(.orders-table .p-datatable-footer),
:deep(.orders-table .p-paginator) {
  background: transparent !important;
  color: #F1F6F9 !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.orders-table .p-datatable-thead > tr > th) {
  color: #aebbc7 !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  padding: 1.5rem 1rem;
}

:deep(.orders-table .p-datatable-tbody > tr) {
  background: transparent !important;
  transition: background 0.2s;
}

:deep(.orders-table .p-datatable-tbody > tr:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
}

/* Paginador */
:deep(.p-paginator .p-paginator-pages .p-paginator-page),
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  color: #aebbc7;
  background: transparent;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background: #E94560;
  color: white;
  border-radius: 50%;
}

/* Celdas Específicas */
.truck-cell {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.status-text {
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 600;
}

.alarm-danger {
  color: #ff4d4d;
  font-weight: bold;
}

.alarm-safe {
  color: #2ecc71;
}
</style>