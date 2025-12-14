<template>
  <div class="filters-row">
    <!-- Filtros de estado -->
    <button 
      v-for="(config, key) in ORDER_STATUS_CONFIG" 
      :key="key"
      @click="$emit('toggle-filter', key)"
      :class="['filter-btn', { active: activeFilter === key }]"
      :style="{ '--btn-color': config.color }"
    >
      <i :class="config.icon"></i> 
      {{ config.label }}
    </button>
    
    <!-- Botón para limpiar filtro -->
    <button 
      v-if="activeFilter" 
      class="clear-btn" 
      @click="$emit('clear-filter')"
    >
      Ver Todas
    </button>
  </div>
</template>

<script setup>
import { ORDER_STATUS_CONFIG } from '@/config/orderStatusConfig';

/**
 * Componente de filtros para órdenes
 */
defineProps({
  activeFilter: {
    type: String,
    default: null
  }
});

defineEmits(['toggle-filter', 'clear-filter']);
</script>

<style scoped>
.filters-row { 
  display: flex; 
  gap: 1rem; 
  margin-bottom: 2rem; 
  flex-wrap: wrap; 
}

.filter-btn {
  background: transparent;
  border: 1px solid var(--btn-color);
  color: var(--btn-color);
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  display: flex; 
  align-items: center; 
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase; 
  font-size: 0.75rem; 
  letter-spacing: 0.5px;
}

.filter-btn:hover, 
.filter-btn.active {
  background: var(--btn-color);
  color: #16213E;
  box-shadow: 0 0 15px var(--btn-color);
  transform: translateY(-2px);
}

.clear-btn {
  background: transparent; 
  border: none; 
  color: #aebbc7;
  cursor: pointer; 
  text-decoration: underline; 
  margin-left: auto; 
  font-size: 0.9rem;
}

.clear-btn:hover { 
  color: #fff; 
}
</style>