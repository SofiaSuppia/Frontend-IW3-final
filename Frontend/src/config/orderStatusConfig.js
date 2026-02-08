/**
 * Configuración de estados de órdenes
 * Define los colores, iconos y etiquetas para cada estado posible
 */
export const ORDER_STATUS_CONFIG = {
  PENDIENTE_PESAJE_INICIAL: { 
    label: 'Espera Pesaje', 
    color: '#F9A826', 
    bgColor: 'rgba(249, 168, 38, 0.15)', 
    icon: 'pi pi-clock' 
  },
  /**
   * ESTADO 2: (ANTES/DURANTE CARGA)
   * Según documentación: "Con pesaje inicial registrado".
   * Este estado incluye todo el proceso de carga activa.
   */
  PESAJE_INICIAL_REGISTRADO: { 
    label: 'Pesaje Inicial', 
    color: '#64b5f6', 
    bgColor: 'rgba(100, 181, 246, 0.15)', 
    icon: 'pi pi-box' 
  },
  
  /**
   * ESTADO 3: (FIN CARGA)
   * Según documentación: "Cerrada para carga".
   * El camión terminó de cargar pero aún no se pesa la salida.
   */
  CERRADA_PARA_CARGA: { 
    label: 'Cerrada', 
    color: '#E94560', 
    bgColor: 'rgba(233, 69, 96, 0.15)', 
    icon: 'pi pi-exclamation-circle' 
  },
  
  /**
   * ESTADO 4: (FINAL)
   * Facturada/Conciliada.
   */
  FINALIZADA: { 
    label: 'Finalizada', 
    color: '#aebbc7', 
    bgColor: 'rgba(255, 255, 255, 0.1)', 
    icon: 'pi pi-flag' 
  },

  // ESTADO REMANENTE (ELIMINADO DE VISTA)
  // PESAJE_FINAL_REGISTRADO no se usa en el flujo principal según requerimientos
};

/**
 * Obtiene la configuración de un estado de forma segura
 * @param {string} estado - Estado de la orden
 * @returns {Object} Configuración del estado
 */
export const getStatusConfig = (estado) => {
  return ORDER_STATUS_CONFIG[estado] || { 
    label: estado || 'Desconocido', 
    color: '#fff', 
    bgColor: 'transparent',
    icon: 'pi pi-question-circle'
  };
};