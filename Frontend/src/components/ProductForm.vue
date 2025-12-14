<template>
  <div class="form-content">
    <div class="field mb-3 input-wrapper">
      <label class="input-label">{{ isEditing ? 'Nombre' : 'Producto *' }}</label>
      <InputText 
        v-model.trim="localProduct.nombre" 
        class="w-full custom-input"
        :class="{ 'p-invalid': errors.nombre }"
        :readonly="isEditing"
        placeholder="Ej: Gasolina Premium"
      />
      <small v-if="isEditing" class="field-hint">El nombre no puede modificarse</small>
      <small v-if="errors.nombre" class="p-error">{{ errors.nombre }}</small>
    </div>

    <div class="field mb-3 input-wrapper">
      <label class="input-label">Descripción</label>
      <InputText 
        v-model.trim="localProduct.descripcion" 
        class="w-full custom-input"
        placeholder="Descripción del producto"
      />
    </div>

    <div class="field mb-3 input-wrapper">
      <label class="input-label">Temperatura Umbral (°C) *</label>
      <InputNumber 
        v-model="localProduct.thresholdTemp" 
        class="w-full custom-input-number"
        :class="{ 'p-invalid': errors.thresholdTemp }"
        :minFractionDigits="1"
        :maxFractionDigits="2"
        :min="-273.15"
        :max="1000"
        placeholder="0.0"
      />
      <small v-if="errors.thresholdTemp" class="p-error">{{ errors.thresholdTemp }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  isEditing: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const localProduct = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<style scoped>
.form-content { 
  display: flex; 
  flex-direction: column; 
  gap: 0.5rem; 
}

.input-wrapper { 
  background-color: #0F3460;
  border-radius: 6px; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  padding: 12px 16px; 
  transition: all 0.3s ease;
}

.input-wrapper:focus-within { 
  border-color: #4361ee; 
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.input-label { 
  display: block; 
  font-size: 0.75rem; 
  color: #aebbc7; 
  margin-bottom: 6px; 
  text-transform: uppercase; 
  font-weight: 600;
  letter-spacing: 0.5px;
}

:deep(.custom-input), 
:deep(.custom-input-number .p-inputnumber-input) { 
  background: transparent !important; 
  border: none !important; 
  color: #fff !important; 
  padding: 0 !important; 
  font-size: 0.95rem; 
  width: 100%; 
}

:deep(.custom-input::placeholder),
:deep(.custom-input-number .p-inputnumber-input::placeholder) {
  color: rgba(174, 187, 199, 0.4);
}

.field-hint { 
  font-size: 0.7rem; 
  color: #aebbc7; 
  margin-top: 6px; 
  font-style: italic; 
  display: block;
}

:deep(.p-error) { 
  color: #E94560; 
  font-size: 0.75rem; 
  margin-top: 6px; 
  display: block; 
  font-weight: 500;
}

.mb-3 { margin-bottom: 1rem; }
.w-full { width: 100%; }
</style>