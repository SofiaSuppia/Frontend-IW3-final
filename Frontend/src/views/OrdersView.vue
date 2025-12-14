<template>
  <div class="dashboard-layout">
    
    <Sidebar activePage="orders" />

    <main class="main-content">
      <div class="content-container">
        
        <h1 class="page-title">Órdenes</h1>

        <!-- FILTROS DINÁMICOS -->
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
          <!-- Overlay de carga -->
          <div v-if="loading" class="loading-overlay">
            <i class="pi pi-spin pi-spinner"></i>
          </div>

          <DataTable 
            :value="filteredOrders" 
            :loading="loading"
            :paginator="true" 
            :rows="8" 
            class="orders-table"
            responsiveLayout="scroll"
            :emptyMessage="EMPTY_TABLE_MESSAGE"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="{first} - {last} de {totalRecords}"
          >
            
            <Column field="camion.patente" header="Camión">
              <template #body="{ data }">
                <div class="truck-cell">
                  <i class="pi pi-truck" style="margin-right: 8px; color: #aebbc7;"></i>
                  {{ data.camion?.patente || 'N/A' }}
                </div>
              </template>
            </Column>

            <Column field="cliente.razonSocial" header="Cliente">
              <template #body="{ data }">
                {{ data.cliente?.razonSocial || 'N/A' }}
              </template>
            </Column>

            <Column field="fechaRecepcion" header="Recepción">
              <template #body="{ data }">
                {{ formatDate(data.fechaRecepcion) }}
              </template>
            </Column>

            <Column field="fechaPrevistaCarga" header="Carga">
              <template #body="{ data }">
                {{ formatDate(data.fechaPrevistaCarga) }}
              </template>
            </Column>

            <Column header="Estado">
              <template #body="{ data }">
                <Tag 
                  :value="getStatusConfig(data.estado).label"
                  :style="{ 
                    background: getStatusConfig(data.estado).bgColor,
                    color: getStatusConfig(data.estado).color,
                    border: `1px solid ${getStatusConfig(data.estado).color}`
                  }"
                  class="custom-tag"
                >
                  <i :class="getStatusConfig(data.estado).icon" style="margin-right: 4px;"></i>
                  {{ getStatusConfig(data.estado).label }}
                </Tag>
              </template>
            </Column>

            <Column field="producto.nombre" header="Producto">
              <template #body="{ data }">
                {{ data.producto?.nombre || 'N/A' }}
              </template>
            </Column>

            <Column header="Acciones" style="width: 120px; text-align: center">
              <template #body="{ data }">
                <Button 
                  icon="pi pi-eye" 
                  class="p-button-rounded p-button-text p-button-info" 
                  @click="viewOrderDetails(data)"
                  v-tooltip.top="'Ver detalles'"
                />
                <Button 
                  v-if="data.estado === 'FINALIZADA'"
                  icon="pi pi-file" 
                  class="p-button-rounded p-button-text p-button-success" 
                  @click="viewConciliacion(data.id)"
                  v-tooltip.top="'Ver conciliación'"
                />
              </template>
            </Column>

          </DataTable>
        </div>

      </div>
    </main>

    <!-- Toast para mensajes -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Sidebar from '../components/Sidebar.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import orderService from '../services/orderService';

const router = useRouter();
const toast = useToast();

// Configuración centralizada de estados
const STATUS_CONFIG = {
  'PENDIENTE_PESAJE_INICIAL':  { 
    label: 'Espera Pesaje', 
    color: '#F9A826', 
    bgColor: 'rgba(249, 168, 38, 0.15)', 
    icon: 'pi pi-clock' 
  },
  'PESAJE_INICIAL_REGISTRADO': { 
    label: 'Pesaje Inicial', 
    color: '#64b5f6', 
    bgColor: 'rgba(100, 181, 246, 0.15)', 
    icon: 'pi pi-box' 
  },
  'CERRADA_PARA_CARGA': { 
    label: 'Inicio Carga', 
    color: '#E94560', 
    bgColor: 'rgba(233, 69, 96, 0.15)', 
    icon: 'pi pi-exclamation-circle' 
  },
  'PESAJE_FINAL_REGISTRADO': { 
    label: 'Fin Carga', 
    color: '#2ecc71', 
    bgColor: 'rgba(46, 204, 113, 0.15)', 
    icon: 'pi pi-check-circle' 
  },
  'FINALIZADA': { 
    label: 'Finalizada', 
    color: '#aebbc7', 
    bgColor: 'rgba(255, 255, 255, 0.1)', 
    icon: 'pi pi-flag' 
  }
};

const EMPTY_TABLE_MESSAGE = 'No hay órdenes registradas';

// Estado
const orders = ref([]);
const loading = ref(false);
const activeFilter = ref(null);

// Filtrado de órdenes
const filteredOrders = computed(() => {
  if (!activeFilter.value) return orders.value;
  return orders.value.filter(order => order.estado === activeFilter.value);
});

// Helper para obtener config de forma segura
const getStatusConfig = (estado) => {
  return STATUS_CONFIG[estado] || { 
    label: estado || 'Desconocido', 
    color: '#fff', 
    bgColor: 'transparent',
    icon: 'pi pi-question-circle'
  };
};

// Toggle filtro
const toggleFilter = (key) => {
  activeFilter.value = activeFilter.value === key ? null : key;
};

// Formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Manejo de errores
const handleApiError = (error, defaultMessage) => {
  console.error('Error de API:', error);
  
  if (error.response?.status === 401 || error.response?.status === 403) {
    toast.add({
      severity: 'error',
      summary: 'Sesión expirada',
      detail: 'Por favor, inicia sesión nuevamente.',
      life: 5000
    });
    localStorage.removeItem('token');
    router.push('/');
  } else {
    const message = error.response?.data?.message || defaultMessage;
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }
};

// Cargar todas las órdenes
const loadOrders = async () => {
  loading.value = true;
  try {
    const data = await orderService.getAllOrders();
    orders.value = data;
    console.log('Órdenes cargadas:', data);
  } catch (error) {
    handleApiError(error, 'Error al cargar órdenes');
  } finally {
    loading.value = false;
  }
};

// Ver detalles de orden
const viewOrderDetails = (order) => {
  console.log('Ver detalles de orden:', order);
  toast.add({
    severity: 'info',
    summary: 'Detalles de orden',
    detail: `Orden #${order.id} - ${order.cliente?.razonSocial || 'N/A'}`,
    life: 3000
  });
  // TODO: Implementar modal o navegación a vista de detalles
};

// Ver conciliación
const viewConciliacion = async (idOrden) => {
  loading.value = true;
  try {
    const conciliacion = await orderService.getConciliacion(idOrden);
    console.log('Conciliación:', conciliacion);
    toast.add({
      severity: 'success',
      summary: 'Conciliación obtenida',
      detail: `Conciliación de orden #${idOrden}`,
      life: 3000
    });
    // TODO: Mostrar conciliación en modal o vista separada
  } catch (error) {
    handleApiError(error, 'Error al obtener conciliación');
  } finally {
    loading.value = false;
  }
};

// Cargar datos al montar
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
/* --- LAYOUT GENERAL --- */
.dashboard-layout {
  display: flex; height: 100vh; width: 100%; overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #16213E;
}

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
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px;
}

.filter-btn:hover, .filter-btn.active {
  background: var(--btn-color);
  color: #16213E;
  box-shadow: 0 0 15px var(--btn-color);
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
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(22, 33, 62, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
}

.loading-overlay i {
  font-size: 3rem;
  color: #64b5f6;
}

/* Overrides PrimeVue */
:deep(.orders-table .p-datatable-header),
:deep(.orders-table .p-datatable-thead > tr > th),
:deep(.orders-table .p-datatable-tbody > tr), 
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
  font-size: 0.8rem; 
  padding: 1.5rem 1rem;
}

:deep(.orders-table .p-datatable-tbody > tr:hover) { 
  background: rgba(255, 255, 255, 0.05) !important; 
}

/* Celdas */
.truck-cell { 
  font-weight: bold; 
  display: flex; 
  align-items: center; 
}

.custom-tag { 
  font-size: 0.75rem; 
  font-weight: 700; 
  padding: 4px 10px; 
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Botones de acciones */
:deep(.p-button-rounded) {
  width: 2.5rem;
  height: 2.5rem;
}

:deep(.p-button-text:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}
</style>