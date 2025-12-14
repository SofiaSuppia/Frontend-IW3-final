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
  PESAJE_INICIAL_REGISTRADO: { 
    label: 'Pesaje Inicial', 
    color: '#64b5f6', 
    bgColor: 'rgba(100, 181, 246, 0.15)', 
    icon: 'pi pi-box' 
  },
  CERRADA_PARA_CARGA: { 
    label: 'Inicio Carga', 
    color: '#E94560', 
    bgColor: 'rgba(233, 69, 96, 0.15)', 
    icon: 'pi pi-exclamation-circle' 
  },
  PESAJE_FINAL_REGISTRADO: { 
    label: 'Fin Carga', 
    color: '#2ecc71', 
    bgColor: 'rgba(46, 204, 113, 0.15)', 
    icon: 'pi pi-check-circle' 
  },
  FINALIZADA: { 
    label: 'Finalizada', 
    color: '#aebbc7', 
    bgColor: 'rgba(255, 255, 255, 0.1)', 
    icon: 'pi pi-flag' 
  }
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