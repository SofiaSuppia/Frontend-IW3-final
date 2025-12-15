<template>
  <div class="orders-section glass-panel">
    <div class="section-header">
      <h2>Órdenes Recientes</h2>
      <Button 
        label="Ver Todas" 
        icon="pi pi-arrow-right" 
        iconPos="right" 
        class="p-button-text custom-link-btn" 
        @click="$emit('view-all')" 
      />
    </div>

    <!-- Tabla con datos reales -->
    <DataTable 
      :value="orders" 
      responsiveLayout="scroll" 
      class="custom-datatable"
      :emptyMessage="emptyMessage"
    >
      <!-- Código de Orden -->
      <Column header="Orden #">
        <template #body="{ data }">
          <span class="order-code">{{ getOrderCode(data) }}</span>
        </template>
      </Column>

      <!-- Cliente -->
      <Column header="Cliente">
        <template #body="{ data }">
          {{ data.cliente?.razonSocial || 'N/A' }}
        </template>
      </Column>

      <!-- Camión -->
      <Column header="Camión">
        <template #body="{ data }">
          <div class="truck-info">
            <i class="pi pi-truck"></i>
            {{ data.camion?.patente || 'N/A' }}
          </div>
        </template>
      </Column>
      
      <!-- Estado -->
      <Column header="Estado">
        <template #body="{ data }">
          <Tag 
            :value="getStatusConfig(data.estado).label" 
            class="custom-tag"
            :style="{ 
              background: getStatusConfig(data.estado).bgColor,
              color: getStatusConfig(data.estado).color 
            }"
          />
        </template>
      </Column>

      <!-- Acciones -->
      <Column header="Acciones" style="width: 100px; text-align: center">
        <template #body="{ data }">
          <Button 
            icon="pi pi-eye" 
            class="p-button-rounded p-button-text p-button-info action-btn" 
            @click="$emit('view-details', data)"
            v-tooltip.top="'Ver detalles'"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { getStatusConfig } from '@/config/orderStatusConfig';
import { getOrderCode } from '@/utils/orderProgress';

/**
 * Componente de tabla de órdenes recientes
 * Muestra las últimas órdenes registradas en el sistema
 */
defineProps({
  orders: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['view-all', 'view-details']);

/**
 * Mensaje cuando no hay órdenes
 */
const emptyMessage = 'No hay órdenes recientes';
</script>

<style scoped>
/* --- TABLA Y PANELES --- */
.orders-section {
  background: rgba(255, 255, 255, 0.05); 
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 15px; 
  padding: 1.5rem;
  opacity: 0; 
  animation: fadeIn 0.6s forwards 0.2s;
}

.section-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 1.5rem; 
}

.section-header h2 { 
  margin: 0; 
  color: #F1F6F9; 
  font-size: 1.5rem; 
}

.custom-link-btn { 
  color: #E94560 !important; 
  font-weight: bold; 
}

.custom-link-btn:hover { 
  color: #ff5773 !important; 
  background: rgba(233, 69, 96, 0.1) !important; 
}

/* --- ESTILOS DE TABLA --- */
.order-code {
  font-weight: 700;
  color: #64b5f6;
}

.truck-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.truck-info i {
  color: #aebbc7;
}

/* Botón de acción */
.action-btn {
  width: 2.5rem;
  height: 2.5rem;
}

.action-btn:hover {
  background: rgba(100, 181, 246, 0.15) !important;
}

/* --- OVERRIDES DE PRIMEVUE --- */
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

.custom-tag { 
  font-size: 0.8rem; 
  padding: 4px 10px; 
  text-transform: uppercase; 
  letter-spacing: 0.5px;
  border: none;
}

:deep(.p-button-rounded) {
  width: 2.5rem;
  height: 2.5rem;
}

:deep(.p-button-text:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* --- ANIMACIONES --- */
@keyframes fadeIn { 
  to { 
    opacity: 1; 
  } 
}
</style>