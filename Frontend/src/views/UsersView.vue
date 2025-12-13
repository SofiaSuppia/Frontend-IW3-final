<template>
  <div class="dashboard-layout">
    
    <!-- BARRA LATERAL -->
    <aside class="sidebar">
      <div class="brand">
        <img src="/assets/images/logo.png" alt="FluxGas Logo" class="sidebar-logo" />
      </div>
      <nav class="nav-menu">
        <ul>
          <li class="nav-item" @click="navigateTo('/home')"><span class="icon">🏠</span> <span>Inicio</span></li>
          <li class="nav-item" @click="navigateTo('/orders')"><span class="icon">🚛</span> <span>Órdenes</span></li>
          <li class="nav-item" @click="navigateTo('/products')"><span class="icon">🛢️</span> <span>Productos</span></li>
          <li class="nav-item active"><span class="icon">👥</span> <span>Usuarios</span></li>
        </ul>
      </nav>
      <div class="bottom-section">
        <div class="user-profile">
          <div class="avatar-circle">{{ username.charAt(0).toUpperCase() }}</div>
          <div class="user-info"><span class="user-name">{{ username }}</span><span class="user-role">Gerente</span></div>
        </div>
        <div class="logout-wrapper" @click="handleLogout"><span class="icon">↪️</span> <span>Cerrar Sesión</span></div>
      </div>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
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
            <Dropdown v-model="filters.role" :options="roleOptions" placeholder="Todos" class="custom-dropdown" showClear />
          </div>
          <div class="filter-group">
            <label>Tipo</label>
            <Dropdown v-model="filters.type" :options="typeOptions" placeholder="Todos" class="custom-dropdown" showClear />
          </div>
          <div class="filter-group">
            <label>Estado</label>
            <Dropdown v-model="filters.status" :options="statusOptions" placeholder="Todos" class="custom-dropdown" showClear />
          </div>
        </div>

        <!-- TABLA DE USUARIOS -->
        <div class="table-wrapper">
          <DataTable :value="filteredUsers" :paginator="true" :rows="6" class="users-table" responsiveLayout="scroll">
            <Column field="id" header="ID" style="width: 50px"></Column>
            <Column field="username" header="Usuario">
              <template #body="slotProps">
                <div class="user-cell">
                  <div class="user-avatar-small">{{ slotProps.data.username.charAt(0).toUpperCase() }}</div>
                  <span>{{ slotProps.data.username }}</span>
                </div>
              </template>
            </Column>
            <Column field="email" header="Email"></Column>
            <Column field="role" header="Rol">
              <template #body="slotProps">
                <Tag :value="slotProps.data.role" :severity="getRoleSeverity(slotProps.data.role)" />
              </template>
            </Column>
            <Column field="type" header="Tipo">
              <template #body="slotProps">
                <span :class="['type-badge', slotProps.data.type === 'Interno' ? 'type-internal' : 'type-external']">
                  {{ slotProps.data.type }}
                </span>
              </template>
            </Column>
            <Column field="status" header="Estado">
              <template #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" rounded />
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

    <!-- DIALOGO AGREGAR USUARIO (DISEÑO EXACTO IMAGEN) -->
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
        
        <!-- Checkbox Interno -->
        <div class="field-checkbox mb-4">
          <Checkbox v-model="newUser.isInternal" :binary="true" inputId="binary" />
          <label for="binary" class="ml-2 label-text">¿Es usuario interno?</label>
        </div>

        <!-- Email -->
        <div class="field mb-3 input-wrapper">
          <label for="email" class="input-label">Email</label>
          <InputText id="email" v-model="newUser.email" class="w-full custom-input" placeholder="prueba@mail.com" />
        </div>

        <!-- Username -->
        <div class="field mb-3 input-wrapper">
          <label for="username" class="input-label">Username</label>
          <InputText id="username" v-model="newUser.username" class="w-full custom-input" />
        </div>

        <!-- Contraseña -->
        <div class="field mb-3 input-wrapper">
          <label for="password" class="input-label">Contraseña</label>
          <Password id="password" v-model="newUser.password" class="w-full custom-input-pass" :feedback="false" toggleMask />
        </div>

        <!-- Roles -->
        <div class="field mb-4 input-wrapper">
          <label for="role" class="input-label">Roles</label>
          <Dropdown id="role" v-model="newUser.role" :options="roleOptions" placeholder="Seleccionar" class="w-full custom-dropdown-form" />
        </div>

      </div>

      <!-- Footer Botones -->
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
import authService from '../services/authService';

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
const username = localStorage.getItem('username') || 'Administrador';

// --- ESTADO DEL DIALOGO ---
const showAddUserDialog = ref(false);
const newUser = ref({
  isInternal: true,
  email: '',
  username: '',
  password: '',
  role: null
});

const openNewUserDialog = () => {
  newUser.value = { isInternal: true, email: '', username: '', password: '', role: null };
  showAddUserDialog.value = true;
};

const saveUser = () => {
  console.log("Guardando usuario:", newUser.value);
  showAddUserDialog.value = false;
};

// --- ESTADO DE FILTROS ---
const filters = ref({ role: null, type: null, status: null });
const roleOptions = ['Admin', 'Operador', 'Cliente'];
const typeOptions = ['Interno', 'Externo'];
const statusOptions = ['Habilitada', 'Deshabilitada'];

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

// --- LÓGICA DE FILTRADO ---
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchRole = !filters.value.role || user.role === filters.value.role;
    const matchType = !filters.value.type || user.type === filters.value.type;
    const matchStatus = !filters.value.status || user.status === filters.value.status;
    return matchRole && matchType && matchStatus;
  });
});

// --- HELPERS VISUALES ---
const getRoleSeverity = (role) => {
  switch (role) {
    case 'Admin': return 'danger';
    case 'Operador': return 'info';
    case 'Cliente': return 'warning';
    default: return 'secondary';
  }
};

const getStatusSeverity = (status) => {
  return status === 'Habilitada' ? 'success' : 'danger';
};

const handleLogout = () => {
  authService.logout();
  router.push('/');
};

const navigateTo = (route) => {
  router.push(route);
};
</script>

<style scoped>
/* --- LAYOUT GENERAL --- */
.dashboard-layout {
  display: flex; height: 100vh; width: 100%; overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #16213E;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 260px; background-color: #0F3460; color: #F1F6F9;
  display: flex; flex-direction: column; padding: 1.5rem;
  box-shadow: 4px 0 15px rgba(0,0,0,0.4); z-index: 20;
  justify-content: space-between;
}
.brand { display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); min-height: 60px; }
.sidebar-logo { max-width: 180px; height: auto; max-height: 60px; object-fit: contain; }
.nav-menu ul { list-style: none; padding: 0; margin: 0; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; margin-bottom: 8px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; color: #aebbc7; font-weight: 500; }
.nav-item:hover { background-color: rgba(255, 255, 255, 0.05); color: #F1F6F9; }
.nav-item.active { background-color: #E94560; color: white; box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3); }
.icon { font-size: 1.1rem; }
.bottom-section { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; }
.user-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 10px; }
.avatar-circle { width: 40px; height: 40px; background-color: #F1F6F9; color: #0F3460; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.95rem; font-weight: bold; color: #F1F6F9; }
.user-role { font-size: 0.75rem; color: #aebbc7; }
.logout-wrapper { display: flex; align-items: center; gap: 10px; padding: 10px; color: #aebbc7; cursor: pointer; transition: 0.3s; border-radius: 6px; }
.logout-wrapper:hover { color: #E94560; background-color: rgba(233, 69, 96, 0.1); }

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

/* --- TABLE STYLES --- */
.table-wrapper { background-color: #0F3460; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
:deep(.users-table .p-datatable-tbody > tr) { background: transparent !important; color: #F1F6F9 !important; }
:deep(.users-table .p-datatable-header), :deep(.users-table .p-datatable-thead > tr > th), :deep(.users-table .p-datatable-tbody > tr > td), :deep(.users-table .p-datatable-footer), :deep(.users-table .p-paginator) {
  background: transparent !important; color: #F1F6F9 !important; border-color: rgba(255, 255, 255, 0.05) !important;
}
:deep(.users-table .p-datatable-thead > tr > th) { color: #aebbc7 !important; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; }
:deep(.users-table .p-datatable-tbody > tr:hover) { background: rgba(255, 255, 255, 0.05) !important; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar-small { width: 30px; height: 30px; background: #E94560; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
.type-badge { font-size: 0.85rem; font-weight: 600; }
.type-internal { color: #64b5f6; }
.type-external { color: #aebbc7; }
.action-btn { color: #aebbc7 !important; }
.action-btn:hover { color: #F1F6F9 !important; background: rgba(255,255,255,0.1) !important; }

/* --- ESTILOS DEL DIALOGO (MODAL) --- */

/* 1. Fondo principal del Dialogo (Azul muy oscuro/Morado profundo) */
:deep(.custom-dialog-dark) {
  background: #100c26 !important; /* Color exacto de la imagen */
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5) !important;
}

/* 2. Hacemos transparentes las secciones internas para que se vea el fondo principal */
:deep(.custom-dialog-dark .p-dialog-header),
:deep(.custom-dialog-dark .p-dialog-content),
:deep(.custom-dialog-dark .p-dialog-footer) {
  background: transparent !important;
  border: none !important;
  color: #e0e0e0 !important;
}

/* Header */
:deep(.custom-dialog-dark .p-dialog-header) {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
}
:deep(.custom-dialog-dark .p-dialog-title) {
  font-weight: 600; font-size: 1.25rem;
}
:deep(.custom-dialog-dark .p-dialog-header-icon) {
  color: #aebbc7 !important;
}

/* Content */
:deep(.custom-dialog-dark .p-dialog-content) {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

/* Estilo de Inputs "Filled" (Cajas rectangulares más claras) */
.input-wrapper {
  background-color: #231f38; /* Fondo del input (morado grisáceo) */
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-bottom: 2px solid #7e73f0; /* Línea inferior morada al enfocar */
}

.input-label {
  display: block;
  font-size: 0.75rem;
  color: #aebbc7;
  margin-bottom: 2px;
}

/* Inputs transparentes dentro del wrapper */
:deep(.custom-input), 
:deep(.custom-input-pass .p-inputtext),
:deep(.custom-dropdown-form) {
  background: transparent !important;
  border: none !important;
  color: #fff !important;
  padding: 0 !important;
  font-size: 0.95rem;
  box-shadow: none !important;
}

:deep(.custom-dropdown-form .p-dropdown-trigger) {
  color: #aebbc7;
}

/* Checkbox */
:deep(.p-checkbox .p-checkbox-box) {
  background: transparent;
  border: 2px solid #aebbc7;
  border-radius: 2px;
}
:deep(.p-checkbox.p-checkbox-checked .p-checkbox-box) {
  background: #7e73f0;
  border-color: #7e73f0;
}

/* Botones del Footer (Texto plano) */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0.5rem 0;
}

.cancel-btn {
  color: #aebbc7 !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}
.cancel-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.save-btn {
  color: #7e73f0 !important; /* Morado vibrante */
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}
.save-btn:hover {
  background: rgba(126, 115, 240, 0.1) !important;
}

/* Utilidades */
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.w-full { width: 100%; }
.label-text { color: #aebbc7; font-size: 0.9rem; }
.field-checkbox { display: flex; align-items: center; margin-bottom: 1rem; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 0; }
</style>