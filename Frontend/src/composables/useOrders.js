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
   * Órdenes filtradas según el estado activo
   */
  const filteredOrders = computed(() => {
    if (!activeFilter.value) return orders.value;
    return orders.value.filter(order => order.estado === activeFilter.value);
  });

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
   * Carga todas las órdenes desde el backend
   */
  const loadOrders = async () => {
    loading.value = true;
    try {
      // El servicio ahora acepta page/size
      const response = await orderService.getAllOrders(page.value, pageSize.value);
      
      console.log("Datos recibidos:", response);

      let data = [];

      // Detectar formato de respuesta para Paginación de Spring
      if (response && response.content) {
          data = response.content;
          // Robustez: si totalElements no viene, usar data.length
          totalRecords.value = (response.totalElements !== undefined) ? response.totalElements : data.length;
      } else if (response && response.data && response.data.content) {
          // Caso raro de envoltura extra
          data = response.data.content;
          totalRecords.value = (response.data.totalElements !== undefined) ? response.data.totalElements : data.length;
      } else if (Array.isArray(response)) {
          // Fallback por si el backend no pagina
          data = response;
          totalRecords.value = response.length;
      }

      console.log(`Total procesado: ${data.length}`);
      orders.value = data;
      
    } catch (error) {
      console.error(error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las órdenes', life: 3000 });
    } finally {
      loading.value = false;
    }
  };

  /**
   * Alterna el filtro de estado activo
   * @param {string} key - Clave del estado
   */
  const toggleFilter = (key) => {
    activeFilter.value = activeFilter.value === key ? null : key;
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
    totalRecords,
    onPageChange,

    // Métodos
    loadOrders,
    toggleFilter,
    viewOrderDetails,
    viewConciliacion
  };
}