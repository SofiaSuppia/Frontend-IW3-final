/**
 * Configuración de estados de órdenes para la vista Home
 * Define visualización para cada estado posible
 */
export const HOME_STATUS_CONFIG = {
  'PENDIENTE_PESAJE_INICIAL': { 
    label: 'Espera de Pesaje', 
    severity: 'warning', 
    icon: '⚠️', 
    color: '#F9A826', 
    bgColor: 'rgba(249, 168, 38, 0.2)' 
  },
  'PESAJE_INICIAL_REGISTRADO': { 
    label: 'Pesaje Inicial', 
    severity: 'info', 
    icon: '⚡', 
    color: '#64b5f6', 
    bgColor: 'rgba(100, 181, 246, 0.2)' 
  },
  'CERRADA_PARA_CARGA': { 
    label: 'En Carga', 
    severity: 'danger', 
    icon: '🛑', 
    color: '#E94560', 
    bgColor: 'rgba(233, 69, 96, 0.2)' 
  },
  'PESAJE_FINAL_REGISTRADO': { 
    label: 'Fin de Carga', 
    severity: 'success', 
    icon: '✅', 
    color: '#2ecc71', 
    bgColor: 'rgba(46, 204, 113, 0.2)' 
  },
  'FINALIZADA': { 
    label: 'Finalizada', 
    severity: 'secondary', 
    icon: '🏁', 
    color: '#aebbc7', 
    bgColor: 'rgba(255, 255, 255, 0.1)' 
  },
  'DEFAULT': { 
    label: 'Desconocido', 
    severity: 'contrast', 
    icon: '❓', 
    color: '#fff', 
    bgColor: 'rgba(255,255,255,0.1)' 
  }
};

/**
 * Obtiene configuración de estado de forma segura
 * @param {string} status - Estado de la orden
 * @returns {Object} Configuración del estado
 */
export const getHomeStatusConfig = (status) => {
  return HOME_STATUS_CONFIG[status] || HOME_STATUS_CONFIG['DEFAULT'];
};

/**
 * Orden de cards para KPI
 */
export const KPI_ORDER = [
  'PENDIENTE_PESAJE_INICIAL', 
  'PESAJE_INICIAL_REGISTRADO', 
  'CERRADA_PARA_CARGA', 
  'PESAJE_FINAL_REGISTRADO', 
  'FINALIZADA'
];