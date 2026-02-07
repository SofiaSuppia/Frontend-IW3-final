<!-- Tabla de Órdenes 1. Ingreso caminio, 2. Pesaje inicial, 3. Inicio carga, 4. Finalización -->
<template>
  <div class="dashboard-layout">
    
    <!-- Sidebar -->
    <Sidebar activePage="home" />

    <main class="main-content">
      <div class="dashboard-container">
        
        <!-- Header -->
        <header class="dashboard-header">
          <h1>Panel de Control</h1>
          <p>Resumen de operaciones en tiempo real</p>
        </header>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: #64b5f6;"></i>
          <p style="color: #aebbc7; margin-top: 1rem;">Cargando datos...</p>
        </div>

        <!-- Dashboard Content -->
        <template v-else>
          <!-- KPI Cards -->
          <KpiCards :cards="kpiCards" />

          <!-- Tabla de Órdenes Recientes -->
          <RecentOrdersTable 
            :orders="recentOrders"
            :loading="loading"
            @view-all="navigateTo('/orders')"
            @view-details="handleViewDetails"
          />
        </template>

      </div>
    </main>

    <!-- Toast para notificaciones -->
    <Toast />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue'; 
import KpiCards from '@/components/home/KpiCards.vue';
import RecentOrdersTable from '@/components/home/RecentOrdersTable.vue';
import Toast from 'primevue/toast';

// Composables
import { useOrders } from '@/composables/useOrders';
import { useHomeData } from '@/composables/useHomeData';

/**
 * Vista principal del Dashboard
 * Muestra resumen de órdenes y estadísticas en tiempo real
 */

const router = useRouter();

// Composable de órdenes
const { 
  recentOrders, 
  orderStats, 
  loading, 
  startPolling,
  stopPolling,
  viewOrderDetails,
  loadOrders
} = useOrders();

// Composable específico del home
const { kpiCards } = useHomeData(orderStats);

/**
 * Navega a otra ruta
 * @param {string} route - Ruta de destino
 */
const navigateTo = (route) => {
  router.push(route); 
};

const handleViewDetails = (order) => {
  const orderId = order.id || order; 
  console.log("Navegando a detalle de orden:", orderId);
  router.push(`/orders/${orderId}`);
};

/**
 * Carga datos al montar el componente
 */
onMounted(() => {
  startPolling(10000); // 10s para home dashboard
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
/* --- LAYOUT GENERAL --- */
.dashboard-layout {
  display: flex; 
  height: 100vh; 
  width: 100%; 
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #16213E;
}

/* --- MAIN CONTENT --- */
.main-content {
  flex: 1;
  background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), 
              url('/assets/images/fondo.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  padding: 2rem;
  overflow-y: auto;
}

.dashboard-container { 
  max-width: 1200px; 
  margin: 0 auto; 
}

/* --- LOADING --- */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* --- HEADER --- */
.dashboard-header { 
  margin-bottom: 2rem; 
}

.dashboard-header h1 { 
  font-size: 2.5rem; 
  margin: 0; 
  color: #F1F6F9; 
  font-weight: 700; 
}

.dashboard-header p { 
  color: #aebbc7; 
  margin-top: 5px; 
}
</style>