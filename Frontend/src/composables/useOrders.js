import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import { orderService } from '../services/orderService'; 

/**
 * Composable para manejo de órdenes
 * Centraliza toda la lógica de negocio relacionada con órdenes
 */
export function useOrders() {
  const router = useRouter();
  const toast = useToast();

  // Estado reactivo
  const orders = ref([]);
  const loading = ref(false);
  const activeFilter = ref(null);
  
  // Paginación
  const page = ref(0);
  const pageSize = ref(5);
  const totalRecords = ref(0);

  /**
   * Órdenes globales filtradas (CLIENT-SIDE)
   * Se calculan sobre TODAS las órdenes traídas del backend
   */
  // const globalFilteredOrders = computed(() => { ... }); eliminado para evitar confusión con nueva lógica mixta

  /**
   * Órdenes filtradas (que se muestran en tabla)
   * En modo Backend: Es el array tal cual viene (1 pagina).
   * En modo Frontend: Es el array recortado manulamente en loadOrders.
   */
  const filteredOrders = computed(() => {
    return orders.value;
  });

  // Total de registros para el paginador se basa en el total filtrado
  const computedTotalRecords = computed(() => globalFilteredOrders.value.length);

  /**
   * Obtiene las N órdenes más recientes
   * @param {number} limit - Cantidad de órdenes a retornar
   */
  const recentOrders = computed(() => {
    return [...orders.value]
      .sort((a, b) => new Date(b.fechaRecepcion) - new Date(a.fechaRecepcion))
      .slice(0, 6);
  });

  const onPageChange = (event) => {
    page.value = event.page;
    pageSize.value = event.rows;
    loadOrders();
  };

  /**
   * Estadísticas de órdenes por estado
   * NOTA: Al paginar, esto solo calcula estadísticas DE LA PÁGINA ACTUAL.
   * Si necesitas estadísticas globales, deberías tener un endpoint dedicado en el backend.
   */
  const orderStats = computed(() => {
    const stats = orders.value.reduce((acc, order) => {
      acc[order.estado] = (acc[order.estado] || 0) + 1;
      return acc;
    }, {});
    
    return stats;
  });

  /**
   * Maneja errores de API y muestra mensajes apropiados
   * @param {Error} error - Error capturado
   * @param {string} defaultMessage - Mensaje por defecto
   */
  const handleApiError = (error, defaultMessage) => {
    console.error('Error de API:', error);
    
    // Verificar si es error de autenticación
    if (error.response?.status === 401 || error.response?.status === 403) {
      toast.add({
        severity: 'error',
        summary: 'Sesión expirada',
        detail: 'Por favor, inicia sesión nuevamente.',
        life: 5000
      });
      localStorage.removeItem('token');
      router.push('/');
      return;
    }

    // Mostrar error general
    const message = error.response?.data?.message || defaultMessage;
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  };

  /**
   * Carga órdenes:
   * - Si NO hay filtro: Usa paginación del backend.
   * - Si HAY filtro: Usa "Traer Todo" + filtrado y paginación en frontend.
   */
  const loadOrders = async (isPolling = false) => {
    if (!isPolling) loading.value = true;
    try {
      
      if (!activeFilter.value) {
          // --- MODO BACKEND (Sin Filtros) ---
          const response = await orderService.getAllOrders(page.value, pageSize.value);
          
          if (!isPolling) console.log("Datos (Paginado Backend):", response);

          // Si viene en .content (Spring Page)
          if (response && response.content) {
            orders.value = response.content;
            totalRecords.value = response.totalElements;
          } else {
             // Fallback
             orders.value = Array.isArray(response) ? response : [];
             totalRecords.value = orders.value.length;
          }

      } else {
          // --- MODO FRONTEND (Con Filtros) ---
          // Traemos TODO (sin page/size)
          const response = await orderService.getAllOrders(); 
          
          if (!isPolling) console.log("Datos (Full Backend para Filtrado):", response);

          let allData = [];
          if (Array.isArray(response)) allData = response;
          else if (response && response.content) allData = response.content; 
          
          // 1. Filtrar
          const filtered = allData.filter(o => o.estado === activeFilter.value);
          
          // 2. Ordenar (por fecha recepción desc)
          filtered.sort((a, b) => new Date(b.fechaRecepcion) - new Date(a.fechaRecepcion));

          // 3. Actualizar Total
          totalRecords.value = filtered.length;

          // 4. Paginar (Slice local)
          const start = page.value * pageSize.value;
          const end = start + pageSize.value;
          orders.value = filtered.slice(start, end);
      }
      
    } catch (error) {
      console.error(error);
      if (!isPolling) toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las órdenes', life: 3000 });
    } finally {
      if (!isPolling) loading.value = false;
    }
  };

  
  let pollingInterval = null;

  const startPolling = (interval = 5000) => {
      if (pollingInterval) return;
      loadOrders(false); // Primero con loading
      pollingInterval = setInterval(() => {
          loadOrders(true); // Luego silencioso
      }, interval);
  };

  const stopPolling = () => {
      if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
      }
  };

  /**
   * Alterna el filtro de estado activo
   * @param {string} key - Clave del estado
   */
  const toggleFilter = (key) => {
    activeFilter.value = activeFilter.value === key ? null : key;
    page.value = 0; // Reset a primera página al cambiar filtro
    loadOrders();   // Recargar con nueva estrategia
  };

  /**
   * Muestra detalles de una orden
   * @param {Object} order - Orden a visualizar
   */
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

  /**
   * Obtiene y muestra la conciliación de una orden
   * @param {number} idOrden - ID de la orden
   */
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

  return {
    // Estado
    orders,
    loading,
    activeFilter,
    
    // Computed
    filteredOrders,
    recentOrders,
    orderStats,
    
    // Paginación
    page,
    pageSize,
    totalRecords, // Volvemos a usar el ref reactivo manual
    onPageChange,

    // Métodos
    loadOrders,
    startPolling,
    stopPolling,
    toggleFilter,
    viewOrderDetails,
    viewConciliacion
  };
}