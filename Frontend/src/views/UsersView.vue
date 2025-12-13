<template>
  <div class="dashboard-layout">
    
    <Sidebar activePage="users" />

    <main class="main-content">
      <div class="content-container">
        
        <!-- ENCABEZADO -->
        <div class="page-header">
          <h1 class="page-title">Usuarios</h1>
          <div class="header-actions">
            <Button 
              label="AGREGAR USUARIO" 
              icon="pi pi-plus" 
              class="add-user-btn" 
              @click="openNewUserDialog"
            />
          </div>
        </div>

        <!-- BARRA DE FILTROS -->
        <div class="filters-panel glass-panel">
          <div class="filter-group">
            <label>Rol</label>
            <Dropdown v-model="filters.role" :options="Object.keys(ROLE_CONFIG)" placeholder="Todos" class="custom-dropdown" showClear />
          </div>
          <div class="filter-group">
            <label>Tipo</label>
            <Dropdown v-model="filters.type" :options="Object.keys(TYPE_CONFIG)" placeholder="Todos" class="custom-dropdown" showClear />
          </div>
          <div class="filter-group">
            <label>Estado</label>
            <Dropdown v-model="filters.status" :options="Object.keys(STATUS_CONFIG)" placeholder="Todos" class="custom-dropdown" showClear />
          </div>
        </div>

        <!-- TABLA DE USUARIOS -->
        <div class="table-wrapper">
          <DataTable :value="filteredUsers" :paginator="true" :rows="6" class="users-table" responsiveLayout="scroll">
            
            <Column field="id" header="ID" style="width: 50px"></Column>
            
            <Column field="username" header="Usuario">
              <template #body="slotProps">
                <div class="user-cell">
                  <div class="user-avatar-small" :style="{ backgroundColor: getRoleConfig(slotProps.data.role).color }">
                    {{ slotProps.data.username.charAt(0).toUpperCase() }}
                  </div>
                  <span>{{ slotProps.data.username }}</span>
                </div>
              </template>
            </Column>
            
            <Column field="email" header="Email"></Column>
            
            <Column field="role" header="Rol">
              <template #body="slotProps">
                <Tag 
                  :value="slotProps.data.role" 
                  :severity="getRoleConfig(slotProps.data.role).severity"
                  :icon="getRoleConfig(slotProps.data.role).icon"
                />
              </template>
            </Column>
            
            <!-- MEJORA: Usamos Tag en lugar de span manual -->
            <Column field="type" header="Tipo">
              <template #body="slotProps">
                <Tag 
                  :value="slotProps.data.type" 
                  :severity="getTypeConfig(slotProps.data.type).severity"
                  style="background: transparent; border: 1px solid currentColor;"
                />
              </template>
            </Column>
            
            <Column field="status" header="Estado">
              <template #body="slotProps">
                <Tag 
                  :value="slotProps.data.status" 
                  :severity="getStatusConfig(slotProps.data.status).severity" 
                  rounded 
                />
              </template>
            </Column>
            
            <Column header="Acciones" style="width: 100px; text-align: center">
              <template #body>
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded action-btn" />
              </template>
            </Column>
          </DataTable>
        </div>

      </div>
    </main>

    <!-- DIALOGO AGREGAR USUARIO -->
    <Dialog 
      v-model:visible="showAddUserDialog" 
      modal 
      header="Agregar Usuario" 
      :style="{ width: '400px' }"
      class="custom-dialog-dark"
      :draggable="false"
      :closeOnEscape="true"
      :dismissableMask="true"
    >
      <div class="form-content">
        <div class="field-checkbox mb-4">
          <Checkbox v-model="newUser.isInternal" :binary="true" inputId="binary" />
          <label for="binary" class="ml-2 label-text">¿Es usuario interno?</label>
        </div>
        <div class="field mb-3 input-wrapper">
          <label for="email" class="input-label">Email</label>
          <InputText id="email" v-model="newUser.email" class="w-full custom-input" placeholder="prueba@mail.com" />
        </div>
        <div class="field mb-3 input-wrapper">
          <label for="username" class="input-label">Username</label>
          <InputText id="username" v-model="newUser.username" class="w-full custom-input" />
        </div>
        <div class="field mb-3 input-wrapper">
          <label for="password" class="input-label">Contraseña</label>
          <Password id="password" v-model="newUser.password" class="w-full custom-input-pass" :feedback="false" toggleMask />
        </div>
        <div class="field mb-4 input-wrapper">
          <label for="role" class="input-label">Roles</label>
          <Dropdown id="role" v-model="newUser.role" :options="Object.keys(ROLE_CONFIG)" placeholder="Seleccionar" class="w-full custom-dropdown-form" />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <Button label="CANCELAR" class="p-button-text cancel-btn" @click="showAddUserDialog = false" />
          <Button label="AGREGAR USUARIO" class="p-button-text save-btn" @click="saveUser" />
        </div>
      </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';

// PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Password from 'primevue/password';

const router = useRouter();

// --- 1. CONFIGURACIÓN CENTRALIZADA (Best Practice) ---
const ROLE_CONFIG = {
  'Admin':    { severity: 'danger',  icon: 'pi pi-shield', color: '#E94560' },
  'Operador': { severity: 'info',    icon: 'pi pi-cog',    color: '#64b5f6' },
  'Cliente':  { severity: 'warning', icon: 'pi pi-user',   color: '#F9A826' }
};

const TYPE_CONFIG = {
  'Interno': { severity: 'info' },
  'Externo': { severity: 'secondary' }
};

const STATUS_CONFIG = {
  'Habilitada':    { severity: 'success' },
  'Deshabilitada': { severity: 'danger' }
};

// Helpers seguros
const getRoleConfig = (role) => ROLE_CONFIG[role] || { severity: 'secondary', color: '#ccc' };
const getTypeConfig = (type) => TYPE_CONFIG[type] || { severity: 'secondary' };
const getStatusConfig = (status) => STATUS_CONFIG[status] || { severity: 'secondary' };

// --- ESTADO ---
const showAddUserDialog = ref(false);
const newUser = ref({ isInternal: true, email: '', username: '', password: '', role: null });
const filters = ref({ role: null, type: null, status: null });

// --- LÓGICA ---
const openNewUserDialog = () => {
  newUser.value = { isInternal: true, email: '', username: '', password: '', role: null };
  showAddUserDialog.value = true;
};

const saveUser = () => {
  console.log("Guardando usuario:", newUser.value);
  showAddUserDialog.value = false;
};

// --- DATOS SIMULADOS ---
const users = ref([
  { id: 1, username: 'admin', email: 'admin@mail.com', role: 'Admin', type: 'Interno', status: 'Habilitada' },
  { id: 2, username: 'operador1', email: 'user@mail.com', role: 'Operador', type: 'Interno', status: 'Habilitada' },
  { id: 3, username: 'cli1', email: 'cli1@mail.com', role: 'Cliente', type: 'Externo', status: 'Habilitada' },
  { id: 4, username: 'cli2', email: 'cli2@gmail.com', role: 'Cliente', type: 'Externo', status: 'Deshabilitada' },
  { id: 5, username: 'simon', email: 'simon@mail.com', role: 'Operador', type: 'Interno', status: 'Habilitada' },
  { id: 6, username: 'transportes_sa', email: 'contact@trans.com', role: 'Cliente', type: 'Externo', status: 'Habilitada' },
  { id: 44, username: 'super', email: 'super@mail.com', role: 'Admin', type: 'Interno', status: 'Habilitada' },
]);

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchRole = !filters.value.role || user.role === filters.value.role;
    const matchType = !filters.value.type || user.type === filters.value.type;
    const matchStatus = !filters.value.status || user.status === filters.value.status;
    return matchRole && matchType && matchStatus;
  });
});
</script>

<style scoped>
/* --- LAYOUT GENERAL --- */
.dashboard-layout {
  display: flex; height: 100vh; width: 100%; overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #16213E;
}

/* --- MAIN CONTENT --- */
.main-content {
  flex: 1;
  background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), 
              url('/assets/images/fondoCompleto.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  padding: 2rem;
  overflow-y: auto;
}
.content-container { max-width: 1400px; margin: 0 auto; }

/* --- HEADER & ACTIONS --- */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { color: #F1F6F9; font-size: 2rem; margin: 0; font-weight: 600; }
.header-actions { display: flex; gap: 1rem; }

.add-user-btn {
  background-color: #4361ee !important; border: none !important; font-weight: 700 !important; font-size: 0.85rem !important;
  padding: 0.7rem 1.5rem !important; border-radius: 6px !important; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(67, 97, 238, 0.4); transition: transform 0.2s, box-shadow 0.2s;
}
.add-user-btn:hover { background-color: #3a56d4 !important; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(67, 97, 238, 0.5); }

/* --- FILTERS PANEL --- */
.filters-panel {
  display: flex; gap: 2rem; padding: 1.5rem; margin-bottom: 2rem;
  background: rgba(15, 52, 96, 0.8); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
}
.filter-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.filter-group label { color: #aebbc7; font-size: 0.9rem; }

:deep(.custom-dropdown) { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
:deep(.custom-dropdown .p-dropdown-label) { color: #F1F6F9; }

/* --- TABLE STYLES (CORREGIDO FONDO BLANCO) --- */
.table-wrapper { background-color: #0F3460; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }

:deep(.users-table .p-datatable-header), 
:deep(.users-table .p-datatable-thead > tr > th), 
:deep(.users-table .p-datatable-tbody > tr), /* IMPORTANTE: Transparencia en filas */
:deep(.users-table .p-datatable-tbody > tr > td), 
:deep(.users-table .p-datatable-footer), 
:deep(.users-table .p-paginator) {
  background: transparent !important; color: #F1F6F9 !important; border-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.users-table .p-datatable-thead > tr > th) { color: #aebbc7 !important; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; }
:deep(.users-table .p-datatable-tbody > tr:hover) { background: rgba(255, 255, 255, 0.05) !important; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar-small { width: 30px; height: 30px; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
.action-btn { color: #aebbc7 !important; }
.action-btn:hover { color: #F1F6F9 !important; background: rgba(255,255,255,0.1) !important; }

/* --- ESTILOS DEL DIALOGO (MODAL) --- */
:deep(.custom-dialog-dark) {
  background-color: #0F3460 !important; /* Azul oscuro (mismo de la sidebar) */
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5) !important;
  color: #F1F6F9 !important; /* Texto blanco */
}
:deep(.custom-dialog-dark .p-dialog-header),
:deep(.custom-dialog-dark .p-dialog-content),
:deep(.custom-dialog-dark .p-dialog-footer) {
  background: #0F3460 !important; /* O transparent */
  color: #F1F6F9 !important;
  border: none !important;
}
:deep(.custom-dialog-dark .p-dialog-header) { padding: 1.5rem 1.5rem 0.5rem 1.5rem; }
:deep(.custom-dialog-dark .p-dialog-title) { font-weight: 600; font-size: 1.25rem; }
:deep(.custom-dialog-dark .p-dialog-header-icon) { color: #aebbc7 !important; }
:deep(.custom-dialog-dark .p-dialog-content) { padding: 0 1.5rem 1.5rem 1.5rem; }

.input-wrapper {
  background-color: #231f38; border-radius: 4px 4px 0 0; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding: 8px 12px; transition: border-color 0.2s;
}
.input-wrapper:focus-within { border-bottom: 2px solid #7e73f0; }
.input-label { display: block; font-size: 0.75rem; color: #aebbc7; margin-bottom: 2px; }

:deep(.custom-input), :deep(.custom-input-pass .p-inputtext), :deep(.custom-dropdown-form) {
  background: transparent !important; border: none !important; color: #fff !important; padding: 0 !important; font-size: 0.95rem; box-shadow: none !important;
}
:deep(.custom-dropdown-form .p-dropdown-trigger) { color: #aebbc7; }
:deep(.p-checkbox .p-checkbox-box) { background: transparent; border: 2px solid #aebbc7; border-radius: 2px; }
:deep(.p-checkbox.p-checkbox-checked .p-checkbox-box) { background: #7e73f0; border-color: #7e73f0; }

.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0.5rem 0; }
.cancel-btn { color: #aebbc7 !important; font-weight: 600; letter-spacing: 0.5px; font-size: 0.85rem; }
.cancel-btn:hover { color: #fff !important; background: rgba(255, 255, 255, 0.05) !important; }
.save-btn { color: #7e73f0 !important; font-weight: 700; letter-spacing: 0.5px; font-size: 0.85rem; }
.save-btn:hover { background: rgba(126, 115, 240, 0.1) !important; }

.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.w-full { width: 100%; }
.label-text { color: #aebbc7; font-size: 0.9rem; }
.field-checkbox { display: flex; align-items: center; margin-bottom: 1rem; }
</style>