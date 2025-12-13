<template>
  <div class="dashboard-layout">
    
    <!-- USAMOS EL COMPONENTE SIDEBAR -->
    <!-- Le pasamos 'products' para que sepa que esta es la pagina activa -->
    <Sidebar activePage="products" />

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">
      <div class="content-container">
        
        <!-- BREADCRUMB -->
        <div class="breadcrumb mb-2">
          <span class="back-arrow" @click="navigateTo('/home')">←</span> 
          <span class="breadcrumb-text">Admin / Productos</span>
        </div>

        <!-- ENCABEZADO -->
        <div class="page-header">
          <h1 class="page-title">Productos</h1>
          <div class="header-actions">
            <Button 
              label="AGREGAR PRODUCTO" 
              class="add-btn" 
            />
          </div>
        </div>

        <!-- TABLA DE PRODUCTOS -->
        <div class="table-wrapper">
          <DataTable :value="products" :paginator="true" :rows="10" class="products-table" responsiveLayout="scroll">
            
            <Column field="id" header="ID" style="width: 50px"></Column>
            
            <Column field="description" header="Descripción" style="width: 40%">
              <template #body="slotProps">
                <span class="description-text">{{ slotProps.data.description }}</span>
              </template>
            </Column>
            
            <Column field="name" header="Producto"></Column>
            
            <Column field="stock" header="Stock">
              <template #body="slotProps">
                <span :class="{'text-green': slotProps.data.stock, 'text-red': !slotProps.data.stock}">
                  {{ slotProps.data.stock ? 'true' : 'false' }}
                </span>
              </template>
            </Column>
            
            <Column field="thresholdTemp" header="Temperatura Umbral (°C)"></Column>
            
            <Column field="density" header="Densidad (kg/m³)"></Column>
            
            <Column header="Acciones" style="width: 80px; text-align: center">
              <template #body>
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded action-btn" />
              </template>
            </Column>

          </DataTable>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importamos el componente Sidebar
import Sidebar from '../components/Sidebar.vue';

// PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const router = useRouter();

// Datos simulados
const products = ref([
  { 
    id: 1, 
    name: 'Butano', 
    description: 'Componente del GLP, utilizado para combustibles domésticos y como propelente.', 
    stock: true, 
    thresholdTemp: -0.5, 
    density: 0.58 
  },
  { 
    id: 8, 
    name: 'Metano', 
    description: 'Gas liquido', 
    stock: true, 
    thresholdTemp: -0.6, 
    density: 0 
  },
]);

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

/* NOTA: Ya no necesitamos los estilos de .sidebar aquí porque están en el componente */

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
.content-container { max-width: 1400px; margin: 0 auto; }

/* --- HEADER & BREADCRUMB --- */
.breadcrumb { color: #aebbc7; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; }
.back-arrow { cursor: pointer; font-size: 1.2rem; transition: color 0.2s; }
.back-arrow:hover { color: white; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { color: #F1F6F9; font-size: 2rem; margin: 0; font-weight: 600; }

.add-btn {
  background-color: #4361ee !important; border: none !important; font-weight: 700 !important; font-size: 0.85rem !important;
  padding: 0.7rem 1.5rem !important; border-radius: 4px !important; letter-spacing: 0.5px;
  text-transform: uppercase;
}
.add-btn:hover { background-color: #3a56d4 !important; }

/* --- TABLE STYLES --- */
.table-wrapper { 
  background-color: #0F3460; 
  border-radius: 4px; 
  padding: 0; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
  overflow: hidden;
}

:deep(.products-table .p-datatable-thead > tr > th) {
  background-color: #0F3460 !important;
  color: #aebbc7 !important;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  padding: 1.5rem 1rem;
}

:deep(.products-table .p-datatable-tbody > tr) { 
  background: #0F3460 !important; 
  color: #F1F6F9 !important; 
}

:deep(.products-table .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  padding: 1.5rem 1rem;
  font-size: 0.9rem;
}

:deep(.products-table .p-datatable-tbody > tr:hover) {
  background: rgba(255, 255, 255, 0.02) !important;
}

/* Paginador transparente */
:deep(.p-paginator) {
  background: #0F3460 !important;
  border-top: 1px solid rgba(255,255,255,0.05);
}
:deep(.p-paginator .p-paginator-element) {
  color: #aebbc7 !important;
}

/* Utilidades de texto */
.description-text { color: #aebbc7; font-size: 0.85rem; }
.text-green { color: #aebbc7; } /* En la imagen se ve blanco/gris, no verde brillante */
.action-btn { color: #F1F6F9 !important; }

/* Utilidades */
.mb-2 { margin-bottom: 0.5rem !important; }
.ms-auto { margin-left: auto !important; }
.me-auto { margin-right: auto !important; }

/* --- ANIMACIONES --- */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounceIn {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* --- ESTILOS ADICIONALES --- */
.hidden { display: none !important; }
.visible { display: block !important; }

.text-center { text-align: center !important; }
.text-right { text-align: right !important; }
.text-left { text-align: left !important; }

.cursor-pointer { cursor: pointer; }
.pointer-events-none { pointer-events: none !important; }

.rounded-full { border-radius: 9999px !important; }
.rounded-lg { border-radius: 8px !important; }
.rounded-md { border-radius: 4px !important; }
.rounded-sm { border-radius: 2px !important; }

.shadow-md {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
}

.transition-all {
  transition: all 0.3s ease !important;
}

/* Estilos específicos para la tabla de productos */
.products-table {
  /* Se eliminó el fondo para que coincida con el contenedor */
}

.products-table .p-datatable-thead > tr > th {
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.products-table .p-datatable-tbody > tr {
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.products-table .p-datatable-tbody > tr:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.products-table .p-datatable-tbody > tr > td {
  position: relative;
  z-index: 1;
}

/* Efecto de sombra en las filas de la tabla al hacer hover */
.products-table .p-datatable-tbody > tr:hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(233, 69, 96, 0.1);
  z-index: 0;
}

/* Estilo para el botón de acciones en la tabla */
.products-table .action-btn {
  transition: transform 0.3s ease;
}

.products-table .action-btn:hover {
  transform: scale(1.1);
}

/* Estilo para el botón de agregar producto */
.add-btn {
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.add-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(233, 69, 96, 0.2), rgba(233, 69, 96, 0.1));
  z-index: -1;
  transition: opacity 0.3s ease;
}

.add-btn:hover::before {
  opacity: 1;
}

/* Estilo para el encabezado de la tabla */
.products-table .p-datatable-thead > tr > th {
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.products-table .p-datatable-thead > tr > th::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  z-index: 0;
  pointer-events: none;
}

/* Efecto de enfoque en los elementos de la tabla */
.products-table .p-datatable-tbody > tr:focus-within {
  outline: 2px solid #E94560;
  outline-offset: -2px;
}

/* Estilo para el texto de descripción en la tabla */
.description-text {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Estilo para el texto de estado (stock) */
.text-green {
  color: #4CAF50;
  font-weight: 500;
}

.text-red {
  color: #F44336;
  font-weight: 500;
}

/* Estilo para los íconos en la tabla */
.products-table .p-button-icon {
  font-size: 1.2rem;
  line-height: 1;
}

/* Estilo para el ícono de acciones */
.products-table .action-btn {
  font-size: 1.2rem;
  line-height: 1;
  color: #F1F6F9;
}

/* Estilo para el ícono de agregar producto */
.add-btn .pi {
  font-size: 1rem;
  margin-right: 0.5rem;
}

/* Estilo para el contenedor de la tabla en pantallas pequeñas */
@media (max-width: 768px) {
  .table-wrapper {
    padding: 0 1rem;
  }

  .products-table .p-datatable-thead > tr > th,
  .products-table .p-datatable-tbody > tr > td {
    padding: 1rem;
    font-size: 0.9rem;
  }

  .products-table .p-datatable-tbody > tr:hover {
    background: rgba(255, 255, 255, 0.03) !important;
  }
}
</style>