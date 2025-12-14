/**
 * Formatea una fecha en formato argentino
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada o 'N/A' si no existe
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  return date.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};