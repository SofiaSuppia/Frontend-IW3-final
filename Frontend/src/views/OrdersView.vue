<template>
  <div class="dashboard-layout">
    <!-- Barra lateral -->
    <Sidebar activePage="orders" />

    <!-- Contenido principal -->
    <main class="main-content">
      <div class="content-container">
        
        <!-- Título -->
        <h1 class="page-title">Órdenes</h1>

        <!-- Filtros -->
        <OrderFilters 
          :activeFilter="activeFilter"
          @toggle-filter="toggleFilter"
          @clear-filter="activeFilter = null"
        />

        <!-- Tabla de órdenes -->
        <OrdersTable 
          :orders="filteredOrders"
          :loading="loading"
          @view-details="viewOrderDetails"
          @view-conciliacion="viewConciliacion"
        />

      </div>
    </main>

    <!-- Notificaciones -->
    <Toast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import OrderFilters from '@/components/orders/OrderFilters.vue';
import OrdersTable from '@/components/orders/OrdersTable.vue';
import Toast from 'primevue/toast';
import { useOrders } from '@/composables/useOrders';

/**
 * Vista principal de órdenes
 * Orquesta los componentes de filtros y tabla
 */

// Composable con toda la lógica de órdenes
const {
  filteredOrders,
  loading,
  activeFilter,
  loadOrders,
  toggleFilter,
  viewOrderDetails,
  viewConciliacion
} = useOrders();

// Cargar órdenes al montar el componente
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
/* Layout principal */
.dashboard-layout {
  display: flex; 
  height: 100vh; 
  width: 100%; 
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #16213E;
}

/* Contenido principal */
.main-content {
  flex: 1;
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
  font-weight: 600; 
}
</style>