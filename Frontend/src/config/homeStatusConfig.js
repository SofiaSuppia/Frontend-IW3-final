/**
 * Configuración de estados de órdenes para la vista Home
 * Define visualización para cada estado posible
 */
export const HOME_STATUS_CONFIG = {
  'PENDIENTE_PESAJE_INICIAL': { 
    label: 'Espera Pesaje', 
    severity: 'warning', 
    icon: 'pi pi-clock', 
    color: '#F9A826', 
    bgColor: 'rgba(249, 168, 38, 0.15)' 
  },
  'PESAJE_INICIAL_REGISTRADO': { 
    label: 'Pesaje Inicial', 
    severity: 'info', 
    icon: 'pi pi-box', 
    color: '#64b5f6', 
    bgColor: 'rgba(100, 181, 246, 0.15)' 
  },
  'CERRADA_PARA_CARGA': { 
    label: 'Cerrada', 
    severity: 'danger', 
    icon: 'pi pi-exclamation-circle', 
    color: '#E94560', 
    bgColor: 'rgba(233, 69, 96, 0.15)' 
  },
  'FINALIZADA': { 
    label: 'Finalizada', 
    severity: 'secondary', 
    icon: 'pi pi-flag', 
    color: '#aebbc7', 
    bgColor: 'rgba(255, 255, 255, 0.1)' 
  },
  'DEFAULT': { 
    label: 'Desconocido', 
    severity: 'contrast', 
    icon: 'pi pi-question-circle', 
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
  'FINALIZADA'
];