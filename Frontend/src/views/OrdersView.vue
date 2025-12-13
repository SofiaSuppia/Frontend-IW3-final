<template>
  <div class="dashboard-layout">
    
    <!-- 1. REUTILIZACIÓN: Usamos el componente Sidebar -->
    <Sidebar activePage="orders" />

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">
      <div class="content-container">
        
        <h1 class="page-title">Órdenes</h1>

        <!-- FILTROS DINÁMICOS -->
        <!-- Generados desde la configuración centralizada -->
        <div class="filters-row">
          <button 
            v-for="(config, key) in STATUS_CONFIG" 
            :key="key"
            @click="toggleFilter(key)"
            :class="['filter-btn', { active: activeFilter === key }]"
            :style="{ '--btn-color': config.color }"
          >
            <i :class="config.icon"></i> {{ config.label }}
          </button>
          
          <!-- Botón Limpiar -->
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
            currentPageReportTemplate="{first} - {last} de {totalRecords}"
          >
            
            <Column field="truck" header="Camión">
              <template #body="slotProps">
                <div class="truck-cell">
                  <i class="pi pi-truck" style="margin-right: 8px; color: #aebbc7;"></i>
                  {{ slotProps.data.truck }}
                </div>
              </template>
            </Column>

            <Column field="client" header="Cliente"></Column>
            <Column field="receptionDate" header="Recepción"></Column>
            <Column field="loadDate" header="Carga"></Column>

            <!-- 3. MEJORA UI: Usamos Tag de PrimeVue en lugar de spans manuales -->
            <Column field="status" header="Estado">
              <template #body="slotProps">
                <Tag 
                  :value="getStatusConfig(slotProps.data.status).label" 
                  :style="{ 
                    backgroundColor: getStatusConfig(slotProps.data.status).bgColor, 
                    color: getStatusConfig(slotProps.data.status).color 
                  }"
                  class="custom-tag"
                />
              </template>
            </Column>

            <Column field="alarm" header="Alarmas">
              <template #body="slotProps">
                <span :class="slotProps.data.alarm === 'Problema' ? 'alarm-danger' : 'alarm-safe'">
                  <i :class="slotProps.data.alarm === 'Problema' ? 'pi pi-exclamation-triangle' : 'pi pi-check'"></i>
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
import Sidebar from '../components/Sidebar.vue'; // Importamos Sidebar

// PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';

const router = useRouter();

// --- 2. CONFIGURACIÓN CENTRALIZADA (Best Practice) ---
// Definimos etiquetas, colores e iconos en un solo lugar.
// Esto alimenta tanto a los botones de filtro como a la tabla.
const STATUS_CONFIG = {
  'PENDIENTE_PESAJE_INICIAL':  { label: 'Espera Pesaje',      color: '#F9A826', bgColor: 'rgba(249, 168, 38, 0.15)', icon: 'pi pi-clock' },
  'PESAJE_INICIAL_REGISTRADO': { label: 'Pesaje Inicial',     color: '#64b5f6', bgColor: 'rgba(100, 181, 246, 0.15)', icon: 'pi pi-box' },
  'CERRADA_PARA_CARGA':        { label: 'Inicio Carga',       color: '#E94560', bgColor: 'rgba(233, 69, 96, 0.15)',  icon: 'pi pi-exclamation-circle' },
  'PESAJE_FINAL_REGISTRADO':   { label: 'Fin Carga',          color: '#2ecc71', bgColor: 'rgba(46, 204, 113, 0.15)', icon: 'pi pi-check-circle' },
  'FINALIZADA':                { label: 'Finalizada',         color: '#aebbc7', bgColor: 'rgba(255, 255, 255, 0.1)',  icon: 'pi pi-flag' },
};

const activeFilter = ref(null);

// Helper para obtener config de forma segura
const getStatusConfig = (status) => STATUS_CONFIG[status] || { label: status, color: '#fff', bgColor: 'transparent' };

const toggleFilter = (key) => {
  activeFilter.value = activeFilter.value === key ? null : key;
};

// --- LÓGICA DE FILTRADO ---
const filteredOrders = computed(() => {
  if (!activeFilter.value) return allOrders.value;
  return allOrders.value.filter(order => order.status === activeFilter.value);
});

// --- DATOS SIMULADOS ---
const allOrders = ref([
  { id: 1, truck: 'JKL-3000', client: 'Petrobras', receptionDate: '17/12/2024 03:42', loadDate: '20/12/2024 08:00', status: 'PESAJE_FINAL_REGISTRADO', alarm: 'Problema' },
  { id: 2, truck: 'YZA-7890', client: 'Occidental', receptionDate: '17/12/2024 03:41', loadDate: '09/12/2024 00:00', status: 'PENDIENTE_PESAJE_INICIAL', alarm: 'Sin alarmas' },
  { id: 3, truck: 'ABC-9012', client: 'Cabot Oil', receptionDate: '17/12/2024 03:41', loadDate: '14/11/2024 00:00', status: 'PENDIENTE_PESAJE_INICIAL', alarm: 'Sin alarmas' },
  { id: 4, truck: 'STU-9012', client: 'Marathon', receptionDate: '17/12/2024 03:41', loadDate: '26/11/2024 00:00', status: 'PESAJE_INICIAL_REGISTRADO', alarm: 'Sin alarmas' },
  { id: 5, truck: 'VWX-3456', client: 'Southwestern', receptionDate: '17/12/2024 03:41', loadDate: '03/11/2024 00:00', status: 'CERRADA_PARA_CARGA', alarm: 'Sin alarmas' },
  { id: 6, truck: 'JKL-3458', client: 'Lukoil', receptionDate: '17/12/2024 03:41', loadDate: '29/11/2024 00:00', status: 'FINALIZADA', alarm: 'Sin alarmas' },
  { id: 7, truck: 'WXY-9012', client: 'Murphy Oil', receptionDate: '17/12/2024 03:41', loadDate: '26/11/2024 00:00', status: 'PENDIENTE_PESAJE_INICIAL', alarm: 'Sin alarmas' },
  { id: 8, truck: 'HIJ-9012', client: 'BP', receptionDate: '17/12/2024 03:41', loadDate: '30/11/2024 00:00', status: 'PESAJE_INICIAL_REGISTRADO', alarm: 'Sin alarmas' },
  { id: 11, truck: 'ZZZ-9999', client: 'Shell', receptionDate: '18/12/2024 10:00', loadDate: '18/12/2024 12:00', status: 'FINALIZADA', alarm: 'Sin alarmas' },
]);
</script>

<style scoped>
/* --- LAYOUT GENERAL --- */
.dashboard-layout {
  display: flex; height: 100vh; width: 100%; overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #16213E;
}

/* NOTA: Estilos de Sidebar eliminados (ahora en componente) */

/* --- CONTENIDO PRINCIPAL --- */
.main-content {
  flex: 1;
  background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), 
              url('/assets/images/fondoCompleto.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  padding: 2rem;
  overflow-y: auto;
}

.content-container { max-width: 1400px; margin: 0 auto; }
.page-title { color: #F1F6F9; font-size: 2rem; margin-bottom: 2rem; font-weight: 600; }

/* --- FILTROS (BOTONES) --- */
.filters-row { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }

.filter-btn {
  background: transparent;
  border: 1px solid var(--btn-color);
  color: var(--btn-color);
  padding: 8px 16px;
  border-radius: 50px; /* Estilo píldora más moderno */
  cursor: pointer;
  font-weight: 600;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px;
}

.filter-btn:hover, .filter-btn.active {
  background: var(--btn-color);
  color: #16213E; /* Texto oscuro para contraste */
  box-shadow: 0 0 15px var(--btn-color); /* Efecto glow */
  transform: translateY(-2px);
}

.clear-btn {
  background: transparent; border: none; color: #aebbc7;
  cursor: pointer; text-decoration: underline; margin-left: auto; font-size: 0.9rem;
}
.clear-btn:hover { color: #fff; }

/* --- TABLA --- */
.table-wrapper {
  background-color: #0F3460;
  border-radius: 12px; padding: 1rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

/* Overrides PrimeVue */
:deep(.orders-table .p-datatable-header),
:deep(.orders-table .p-datatable-thead > tr > th),
:deep(.orders-table .p-datatable-tbody > tr), 
:deep(.orders-table .p-datatable-tbody > tr > td),
:deep(.orders-table .p-datatable-footer),
:deep(.orders-table .p-paginator) {
  background: transparent !important; color: #F1F6F9 !important; border-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.orders-table .p-datatable-thead > tr > th) {
  color: #aebbc7 !important; font-weight: 600; text-transform: uppercase; font-size: 0.8rem; padding: 1.5rem 1rem;
}

:deep(.orders-table .p-datatable-tbody > tr:hover) { background: rgba(255, 255, 255, 0.05) !important; }

/* Celdas */
.truck-cell { font-weight: bold; display: flex; align-items: center; }
.custom-tag { font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 4px; }

.alarm-danger { color: #ff4d4d; font-weight: bold; display: flex; align-items: center; gap: 5px; }
.alarm-safe { color: #2ecc71; display: flex; align-items: center; gap: 5px; }
</style>