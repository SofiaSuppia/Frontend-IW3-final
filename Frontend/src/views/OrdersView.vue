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
        <div class="table-wrapper">
          <OrdersTable 
            :orders="filteredOrders"
            :loading="loading"
            @view-details="openOrderDetails"
            @view-conciliacion="navigateToConciliacion"
          />

          <!-- Paginador -->
          <BluePaginator
              :first="page * pageSize"
              :rows="pageSize"
              :totalRecords="totalRecords"
              @page="onPageChange"
          />
        </div>

      </div>
    </main>

    <!-- Notificaciones -->
    <Toast />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import OrderFilters from '@/components/orders/OrderFilters.vue';
import OrdersTable from '@/components/orders/OrdersTable.vue';
import BluePaginator from '@/components/BluePaginator.vue';
import Toast from 'primevue/toast';
import { useOrders } from '@/composables/useOrders';
import { useRouter } from 'vue-router'; 

/**
 * Vista principal de órdenes
 * Orquesta los componentes de filtros y tabla
 */

// Composable con toda la lógica de órdenes
const {
  filteredOrders,
  loading,
  activeFilter,
  page,
  pageSize,
  totalRecords,
  onPageChange,
  startPolling,
  stopPolling,
  toggleFilter,
} = useOrders();

const router = useRouter();
const openOrderDetails = (orderData) => {
  router.push(`/orders/${orderData.id}`);
};

const navigateToConciliacion = (id) => {
  // Asumiendo que tu ruta está configurada como /conciliacion/:id
  router.push(`/conciliacion/${id}`);
};

// Cargar órdenes al montar el componente
onMounted(() => {
  startPolling(10000); // 10s para listado general
});

onUnmounted(() => {
  stopPolling();
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
              url('/assets/images/fondo.png') no-repeat center center;
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

/* Contenedor tipo glass para la tabla y el paginador */
.table-wrapper {
  background: rgba(255, 255, 255, 0.05); 
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px; 
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
</style>