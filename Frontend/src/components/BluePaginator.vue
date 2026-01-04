<template>
  <div class="custom-paginator-container">
    <Paginator 
      :first="first" 
      :rows="rows" 
      :totalRecords="totalRecords" 
      @page="onPageChange"
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      class="blue-paginator"
    />
  </div>
</template>

<script setup>
import Paginator from 'primevue/paginator';

const props = defineProps({
  first: { type: Number, default: 0 },
  rows: { type: Number, default: 6 },
  totalRecords: { type: Number, default: 0 }
});

const emit = defineEmits(['page']);

const onPageChange = (event) => {
  emit('page', event);
};
</script>

<style scoped>
.custom-paginator-container {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

/* Estilos profundos para modificar PrimeVue */
:deep(.blue-paginator) {
  background: transparent !important;
  border: none !important;
  padding: 0.5rem !important;
}

/* Botones de paginación */
:deep(.p-paginator-page),
:deep(.p-paginator-first),
:deep(.p-paginator-prev),
:deep(.p-paginator-next),
:deep(.p-paginator-last) {
  background-color: transparent !important;
  border: 1px solid rgba(67, 97, 238, 0.5) !important;
  color: #F1F6F9 !important;
  min-width: 38px !important;
  height: 38px !important;
  border-radius: 6px !important;
  margin: 0 4px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
}

/* Hover */
:deep(.p-paginator-page:hover),
:deep(.p-paginator-first:hover),
:deep(.p-paginator-prev:hover),
:deep(.p-paginator-next:hover),
:deep(.p-paginator-last:hover) {
  background-color: rgba(67, 97, 238, 0.1) !important;
  border-color: #4361ee !important;
}

/* Botón Activo (Seleccionado) */
:deep(.p-paginator-page.p-highlight) {
  background-color: #4361ee !important;
  border-color: #4361ee !important;
  color: #ffffff !important;
}
</style>