<template>
  <Dialog 
    :visible="visible" 
    modal 
    :header="isEditMode ? 'Editar Usuario' : 'Agregar Usuario'" 
    :style="{ width: '600px' }"
    :contentStyle="{ overflow: 'visible' }"
    class="custom-dialog-dark"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
    :closable="false"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="form-content">
      <!-- Espacio separación superior -->
      <div class="field-checkbox mb-3" style="margin-top: 1rem;">
        <Checkbox v-model="form.isInternal" :binary="true" inputId="isInternal" />
        <label for="isInternal" class="ml-2 label-text">¿Es usuario interno?</label>
      </div>
      
      <!-- Márgenes ajustados (mb-3 para separación estándar) -->
      <div class="field mb-3 input-wrapper">
        <label class="input-label">Email</label>
        <InputText v-model="form.email" class="w-full custom-input" placeholder="prueba@mail.com" />
      </div>
      
      <div class="field mb-3 input-wrapper">
        <label class="input-label">Username</label>
        <InputText v-model="form.username" class="w-full custom-input" :readonly="isEditMode" />
        <small v-if="isEditMode" class="field-hint" style="color: #aebbc7; font-size: 0.8rem;">No modificable</small>
      </div>
      
      <div class="field mb-3 input-wrapper">
        <label class="input-label">{{ isEditMode ? 'Nueva Contraseña (opcional)' : 'Contraseña' }}</label>
        <Password v-model="form.password" class="w-full custom-input-pass" :feedback="false" toggleMask :placeholder="isEditMode ? 'Dejar vacío para mantener' : ''" />
      </div>
      
      <div class="field mb-3 input-wrapper">
        <label class="input-label">Roles</label>
        <Dropdown v-model="form.role" :options="roleOptions" placeholder="Seleccionar" class="w-full custom-dropdown-form" appendTo="body" />
      </div>

      <div v-if="isEditMode" class="field mb-3 input-wrapper">
        <label class="input-label">Estado</label>
        <Dropdown v-model="form.status" :options="statusOptions" placeholder="Seleccionar" class="w-full custom-dropdown-form" appendTo="body" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button label="CANCELAR" icon="pi pi-times" class="p-button-text cancel-btn" @click="close" />
        <Button :label="isEditMode ? 'GUARDAR' : 'AGREGAR USUARIO'" icon="pi pi-check" class="p-button-text save-btn" @click="onSave" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { CONFIG_ROLES, CONFIG_STATUS } from '../composables/useUserManagement';

// Componentes PrimeVue
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Password from 'primevue/password';
import Dropdown from 'primevue/dropdown';

const props = defineProps({
  visible: Boolean,
  userData: Object // Si es null, es modo creación
});

const emit = defineEmits(['update:visible', 'save']);
const toast = useToast();

const roleOptions = Object.keys(CONFIG_ROLES);
const statusOptions = Object.keys(CONFIG_STATUS);

const form = reactive({
  id: null, isInternal: true, email: '', username: '', password: '', role: null, status: 'Habilitada'
});

const isEditMode = computed(() => !!props.userData);

// Resetear o llenar formulario al abrir
watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.userData) {
      // Modo Edición
      Object.assign(form, {
        id: props.userData.id,
        isInternal: props.userData.type === 'Interno',
        email: props.userData.email,
        username: props.userData.username,
        role: props.userData.role,
        status: props.userData.status,
        password: ''
      });
    } else {
      // Modo Creación
      Object.assign(form, { id: null, isInternal: true, email: '', username: '', password: '', role: null, status: 'Habilitada' });
    }
  }
});

const close = () => emit('update:visible', false);

const onSave = () => {
  if (!form.role || !form.username || !form.email) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Faltan datos obligatorios.' });
    return;
  }
  emit('save', { ...form }, isEditMode.value);
};
</script>

<style scoped>
/* Estilos específicos */
.input-wrapper {
  background-color: #0F3460;
  border-radius: 6px; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  padding: 12px 16px; 
  transition: all 0.3s ease;
}
.input-wrapper:focus-within { border-color: #4361ee; box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1); }

.input-label { display: block; font-size: 0.75rem; color: #aebbc7; margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }

:deep(.custom-input), :deep(.custom-input-pass .p-inputtext), :deep(.custom-dropdown-form) {
  background: transparent !important; border: none !important; color: #fff !important; padding: 0 !important; font-size: 0.95rem; box-shadow: none !important; width: 100%;
}

:deep(.custom-input-pass) { width: 100%; position: relative; display: block; }
:deep(.custom-input-pass .p-inputtext) { width: 100%; padding-right: 5px !important; }

:deep(.custom-input-pass .p-password-show-icon),
:deep(.custom-input-pass .p-password-hide-icon),
:deep(.custom-input-pass .p-icon),
:deep(.custom-input-pass svg) {
  color: #aebbc7 !important; cursor: pointer; position: absolute !important; top: 50% !important; right: 2px !important; transform: translateY(-50%) !important;
  left: auto !important; margin-top: 2 !important; width: 1.1rem !important; height: 1.1rem !important; z-index: 10 !important;
}

:deep(.custom-dropdown-form .p-dropdown-trigger) { color: #aebbc7; }

/* --- CHECKBOX ESTILO IMAGEN --- */
/* Estado Normal: Cuadrado vacío, borde GRUESO y redondeado */
:deep(.p-checkbox .p-checkbox-box) { 
  background: transparent !important;   
  border: 2px solid #aebbc7 !important; /* <--- Borde grueso (2px) para que se vea bien el cuadrado vacío */
  border-radius: 6px !important;        /* <--- Bordes redondeados */
  width: 24px !important;               
  height: 24px !important;
}

/* Estado Seleccionado: Se pinta de azul pero mantiene la estética */
:deep(.p-checkbox.p-checkbox-checked .p-checkbox-box) { 
  background: #4361ee !important;       
  border-color: #4361ee !important;     
  color: #ffffff !important;            
}

/* Check interior más grueso */
:deep(.p-checkbox .p-checkbox-icon) {
  font-weight: 800 !important;          /* Icono bold */
  font-size: 14px !important;
  color: #ffffff !important;            /* Asegurar tilde blanca */
}

.field-checkbox { 
  display: flex; 
  align-items: center; 
  gap: 15px;
  /* margin-bottom eliminado aqui porque se controla en template con mb-2 */
  padding: 12px 16px; 
  background-color: #0F3460; 
  border-radius: 6px; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
}

/* FOOTER Y BOTONES (Arreglado el espacio) */
/* gap aumentado a 1.5rem par separar mas los botones */
.dialog-footer { display: flex; justify-content: flex-end; gap: 1.5rem; padding: 0.5rem 0; }

.cancel-btn { color: #aebbc7 !important; font-weight: 600; letter-spacing: 0.5px; font-size: 0.85rem; }
.cancel-btn:hover { color: #fff !important; background: rgba(255, 255, 255, 0.05) !important; }

.save-btn { color: #7e73f0 !important; font-weight: 700; letter-spacing: 0.5px; font-size: 0.85rem; }
.save-btn:hover { background: rgba(126, 115, 240, 0.1) !important; }

/* SOLUCIÓN ESPACIO BOTONES: Usamos flexbox directo en el botón */
:deep(.cancel-btn),
:deep(.save-btn) {
  display: flex !important;
  gap: 12px !important; /* 12px de espacio entre icono y texto */
  align-items: center !important;
}

/* Quitamos márgenes antiguos de los íconos para que no sumen espacio extra */
:deep(.cancel-btn .p-button-icon),
:deep(.save-btn .p-button-icon) {
  margin-right: 0 !important;
}

.mb-3 { margin-bottom: 1rem; } 
.mb-4 { margin-bottom: 1rem; } .w-full { width: 100%; }
.label-text { color: #F1F6F9; font-size: 0.9rem; font-weight: 500; cursor: pointer; user-select: none; }
</style>