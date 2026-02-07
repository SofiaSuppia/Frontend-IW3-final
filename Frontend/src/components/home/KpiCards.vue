<template>
  <div class="stats-grid">
    <div 
      v-for="(card, index) in cards" 
      :key="index" 
      class="stat-card"
      :style="{ animationDelay: `${index * 0.1}s` }"
    >
      <div 
        class="stat-icon" 
        :style="{ background: card.bgColor, color: card.color }"
      >
        {{ card.icon }}
      </div>
      <div class="stat-info">
        <h3>{{ card.label }}</h3>
        <p class="stat-number">{{ card.count }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Componente de tarjetas KPI
 * Muestra estadísticas agrupadas por estado de órdenes
 */
defineProps({
  cards: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>
/* --- KPI CARDS --- */
.stats-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem; 
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05); 
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1); 
  padding: 1rem;
  border-radius: 15px; 
  display: flex; 
  align-items: center; 
  gap: 1rem;
  transition: transform 0.3s;
  opacity: 0; 
  transform: translateY(10px);
  animation: slideIn 0.6s forwards;
}

.stat-card:hover { 
  transform: translateY(-5px); 
  background: rgba(255, 255, 255, 0.08); 
}

.stat-icon { 
  width: 50px; 
  height: 50px; 
  border-radius: 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 1.5rem; 
  flex-shrink: 0; 
}

.stat-info h3 { 
  margin: 0; 
  font-size: 0.85rem; 
  color: #aebbc7; 
  font-weight: 500; 
}

.stat-number { 
  margin: 5px 0 0 0; 
  font-size: 1.8rem; 
  font-weight: 700; 
  color: #F1F6F9; 
}

/* --- ANIMACIONES --- */
@keyframes slideIn { 
  to { 
    opacity: 1; 
    transform: translateY(0); 
  } 
}
</style>