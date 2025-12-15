/**
 * Calcula el progreso de una orden basado en su estado y datos
 * @param {Object} order - Orden a evaluar
 * @returns {number} Porcentaje de progreso (0-100)
 */
export const calculateOrderProgress = (order) => {
  if (!order) return 0;

  switch (order.estado) {
    case 'PENDIENTE_PESAJE_INICIAL':
      return 0;
    
    case 'PESAJE_INICIAL_REGISTRADO':
      return 25;
    
    case 'CERRADA_PARA_CARGA':
      // Si tenemos datos de carga, calculamos el porcentaje real
      if (order.preset && order.ultimaMasaAcumulada) {
        const percentage = (order.ultimaMasaAcumulada / order.preset) * 100;
        // Aseguramos que esté entre 25% y 90%
        return Math.min(90, Math.max(25, percentage));
      }
      return 60; // Valor por defecto si estamos cargando
    
    case 'PESAJE_FINAL_REGISTRADO':
      return 95;
    
    case 'FINALIZADA':
      return 100;
    
    default:
      return 0;
  }
};

/**
 * Obtiene el código SAP formateado o genera uno temporal
 * @param {Object} order - Orden
 * @returns {string} Código de orden
 */
export const getOrderCode = (order) => {
  if (order.codSap) {
    return order.codSap;
  }
  return `ORD-${String(order.id).padStart(6, '0')}`;
};