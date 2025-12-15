import { computed } from 'vue';
import { HOME_STATUS_CONFIG, KPI_ORDER } from '@/config/homeStatusConfig';

/**
 * Composable para la vista Home
 * Procesa datos de órdenes para KPIs y tabla
 */
export function useHomeData(orderStats) {
  /**
   * Genera las tarjetas KPI basadas en estadísticas
   */
  const kpiCards = computed(() => {
    const stats = orderStats.value;
    
    return KPI_ORDER.map(key => ({
      ...HOME_STATUS_CONFIG[key],
      count: stats[key] || 0
    }));
  });

  return {
    kpiCards
  };
}