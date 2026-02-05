<template>
  <div class="table-wrapper">
    
    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
      <i class="pi pi-spin pi-spinner"></i>
    </div>

    <!-- Tabla de datos -->
    <DataTable 
      :value="orders" 
      :loading="loading"
      class="orders-table"
      responsiveLayout="scroll"
      scrollable
      scrollHeight="600px" 
      emptyMessage="No hay órdenes registradas"
    >
      <!-- NUEVO: Columna ID -->
      <Column field="id" header="ID" :sortable="true" style="width: 80px">
        <template #body="{ data }">
          <span class="id-cell">#{{ data.id }}</span>
        </template>
      </Column>

      <!-- Columna: Camión -->
      <Column field="camion.patente" header="Camión">
        <template #body="{ data }">
          <div class="truck-cell">
            <i class="pi pi-truck"></i>
            {{ data.camion?.patente || 'N/A' }}
          </div>
        </template>
      </Column>

      <!-- Columna: Cliente -->
      <Column field="cliente.razonSocial" header="Cliente">
        <template #body="{ data }">
          {{ data.cliente?.razonSocial || 'N/A' }}
        </template>
      </Column>

      <!-- Columna: Fecha de recepción -->
      <Column field="fechaRecepcion" header="Recepción">
        <template #body="{ data }">
          {{ formatDate(data.fechaRecepcion) }}
        </template>
      </Column>

      <!-- Columna: Fecha prevista de carga -->
      <Column field="fechaPrevistaCarga" header="Carga">
        <template #body="{ data }">
          {{ formatDate(data.fechaPrevistaCarga) }}
        </template>
      </Column>

      <!-- Columna: Estado -->
      <Column header="Estado">
        <template #body="{ data }">
          <Tag 
            :value="getStatusConfig(data.estado).label"
            :style="getTagStyle(data.estado)"
            class="custom-tag"
          >
            <i :class="getStatusConfig(data.estado).icon"></i>
            {{ getStatusConfig(data.estado).label }}
          </Tag>
        </template>
      </Column>

      <!-- Columna: Producto -->
      <Column field="producto.nombre" header="Producto">
        <template #body="{ data }">
          {{ data.producto?.nombre || 'N/A' }}
        </template>
      </Column>

      <!-- Columna: Acciones -->
      <Column header="Acciones" style="width: 120px; text-align: center">
        <template #body="{ data }">
          <Button 
            icon="pi pi-eye" 
            class="p-button-rounded p-button-text p-button-info" 
            @click="$emit('view-details', data)"
            v-tooltip.top="'Ver detalles'"
          />
          <Button 
            v-if="data.estado === 'FINALIZADA'"
            icon="pi pi-file" 
            class="p-button-rounded p-button-text p-button-success" 
            @click="$emit('view-conciliacion', data.id)"
            v-tooltip.top="'Ver conciliación'"
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
import { formatDate } from '@/utils/dateFormatter';

/**
 * Componente de tabla de órdenes
 * Muestra las órdenes en formato tabular con paginación
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

defineEmits(['view-details', 'view-conciliacion']);

/**
 * Obtiene los estilos para el tag de estado
 * @param {string} estado - Estado de la orden
 * @returns {Object} Estilos CSS
 */
const getTagStyle = (estado) => {
  const config = getStatusConfig(estado);
  return {
    background: config.bgColor,
    color: config.color,
    border: `1px solid ${config.color}`
  };
};
</script>

<style scoped>
/* Contenedor de tabla - Fondo transparente con efecto glass */
.table-wrapper {
  background: rgba(255, 255, 255, 0.05); 
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px; 
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  position: relative;
}

/* Overlay de carga */
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
  border-radius: 15px;
}

.loading-overlay i {
  font-size: 3rem;
  color: #64b5f6;
}

.id-cell {
  font-family: 'Courier New', Courier, monospace; /* Fuente monoespaciada para números */
  font-weight: 700;
  color: #64b5f6; /* Un color azul suave para resaltar el ID */
  letter-spacing: -0.5px;
}

/* Celda de camión */
.truck-cell { 
  font-weight: bold; 
  display: flex; 
  align-items: center;
  gap: 8px;
}

.truck-cell i {
  color: #aebbc7;
}

/* Tag personalizado */
.custom-tag { 
  font-size: 0.75rem; 
  font-weight: 700; 
  padding: 4px 10px; 
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Overrides de PrimeVue */
:deep(.orders-table .p-datatable-header),
:deep(.orders-table .p-datatable-thead > tr > th),
:deep(.orders-table .p-datatable-tbody > tr), 
:deep(.orders-table .p-datatable-tbody > tr > td),
:deep(.orders-table .p-datatable-footer),
:deep(.orders-table .p-paginator) {
  background: transparent !important; 
  color: #F1F6F9 !important; 
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.orders-table .p-datatable-thead > tr > th) {
  color: #aebbc7 !important; 
  font-weight: 600; 
  text-transform: uppercase; 
  font-size: 0.8rem; 
  padding: 1.5rem 1rem;
}

:deep(.orders-table .p-datatable-tbody > tr:hover) { 
  background: rgba(255, 255, 255, 0.1) !important; 
}

:deep(.p-button-rounded) {
  width: 2.5rem;
  height: 2.5rem;
}

:deep(.p-button-text:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}
</style>