<template>
  <div class="dashboard-layout">
    <Sidebar activePage="users" />
    <main class="main-content">
      <div class="content-container">
        
        <!-- ENCABEZADO -->
        <div class="page-header">
          <h1 class="page-title">Usuarios</h1>
          <div class="header-actions">
            <Button label="AGREGAR USUARIO" icon="pi pi-plus" class="add-user-btn" @click="openDialog()" />
          </div>
        </div>

        <!-- FILTROS -->
        <div class="filters-panel glass-panel">
          <div class="filter-item">
            <span class="filter-label">Rol</span>
            <Dropdown v-model="filters.role" :options="roleOptions" placeholder="Seleccionar" class="w-full custom-select-input" :showClear="true" appendTo="body" />
          </div>
          <div class="filter-item">
            <span class="filter-label">Tipo</span>
            <Dropdown v-model="filters.type" :options="typeOptions" placeholder="Seleccionar" class="w-full custom-select-input" :showClear="true" appendTo="body" />
          </div>
          <div class="filter-item">
            <span class="filter-label">Estado</span>
            <Dropdown v-model="filters.status" :options="statusOptions" placeholder="Seleccionar" class="w-full custom-select-input" :showClear="true" appendTo="body" />
          </div>
        </div>

        <!-- TABLA -->
        <div class="table-wrapper">
          <DataTable 
             :value="filteredUsers" 
             class="users-table" 
             responsiveLayout="scroll" 
             :loading="loading"
             scrollable 
             scrollHeight="calc(100vh - 350px)"
          >
            <Column field="id" header="ID" style="width: 50px"></Column>
            <Column field="username" header="Usuario">
              <template #body="{ data }">
                <div class="user-cell">
                  <div class="user-avatar-small" :style="{ backgroundColor: getRoleColor(data.role) }">
                    {{ data.username.charAt(0).toUpperCase() }}
                  </div>
                  <span>{{ data.username }}</span>
                </div>
              </template>
            </Column>
            <Column field="email" header="Email"></Column>
            <Column field="role" header="Rol">
              <template #body="{ data }">
                <Tag :value="data.role" :severity="CONFIG_ROLES[data.role]?.severity" :icon="CONFIG_ROLES[data.role]?.icon" />
              </template>
            </Column>
            <Column field="type" header="Tipo">
              <template #body="{ data }">
                <Tag :value="data.type" :severity="CONFIG_TYPES[data.type]?.severity" style="background: transparent; border: none; padding: 0; font-weight: 500; color: #F1F6F9;" />
              </template>
            </Column>
            <Column field="status" header="Estado">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="CONFIG_STATUS[data.status]?.severity" rounded />
              </template>
            </Column>
            <Column header="Acciones" style="width: 100px; text-align: center">
              <template #body="{ data }">
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded action-btn" @click="toggleActionMenu($event, data)" />
              </template>
            </Column>
          </DataTable>
          <div v-if="!loading && filteredUsers.length === 0" class="text-center p-4" style="color: #aebbc7;">No hay usuarios para mostrar.</div>
        
          <!-- Paginador DENTRO del wrapper para evitar scroll externo -->
          <BluePaginator 
             :first="page * pageSize" 
             :rows="pageSize" 
             :totalRecords="totalRecords" 
             @page="onPageChange" 
          />
        </div>
      </div>
    </main>

    <!-- COMPONENTES EXTERNOS -->
    <Menu ref="actionMenu" :model="menuActions" :popup="true" class="custom-menu" />
    <UserFormDialog v-model:visible="isDialogVisible" :user-data="selectedUserForEdit" @save="handleFormSave" />
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserManagement, CONFIG_ROLES, CONFIG_TYPES, CONFIG_STATUS } from '../composables/useUserManagement';
import UserFormDialog from '../components/UserFormDialog.vue';
import Sidebar from '../components/Sidebar.vue';

// PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Menu from 'primevue/menu';
import Toast from 'primevue/toast';
import Dropdown from 'primevue/dropdown';
import BluePaginator from '@/components/BluePaginator.vue';

// --- LOGICA DE NEGOCIO (Composable) ---
const { 
    users, 
    loading, 
    filters, 
    filteredUsers, 
    page, 
    pageSize, 
    totalRecords, 
    onPageChange,
    loadUsers, 
    saveUser, 
    deleteUser 
} = useUserManagement();

// Configuración Visual para Dropdowns de Filtro -> Importada del Composable
const roleOptions = Object.keys(CONFIG_ROLES);
const typeOptions = Object.keys(CONFIG_TYPES);
const statusOptions = Object.keys(CONFIG_STATUS);
const getRoleColor = (role) => CONFIG_ROLES[role]?.color || '#ccc';

// --- ESTADO LOCAL UI ---
const isDialogVisible = ref(false);
const selectedUserForEdit = ref(null);
const actionMenu = ref(null);
const selectedUserForAction = ref(null);

// --- MANEJADORES ---
const openDialog = (user = null) => {
  selectedUserForEdit.value = user; // Si es null, el componente Dialog sabe que es "Crear"
  isDialogVisible.value = true;
};

const handleFormSave = async (formData, isEditMode) => {
  const success = await saveUser(formData, isEditMode);
  if (success) {
    isDialogVisible.value = false;
    await loadUsers();
  }
};

const handleDelete = async () => {
  if (selectedUserForAction.value) {
    await deleteUser(selectedUserForAction.value.id);
    await loadUsers();
  }
};

const toggleActionMenu = (event, user) => {
  selectedUserForAction.value = user;
  actionMenu.value.toggle(event);
};

const menuActions = computed(() => [
  { label: 'Editar', icon: 'pi pi-pencil', command: () => openDialog(selectedUserForAction.value) },
  { label: 'Eliminar', icon: 'pi pi-trash', command: handleDelete }
]);

onMounted(loadUsers);
</script>

<style scoped>
/* --- SOLO ESTILOS DE LAYOUT Y TABLA (Específicos de la Vista) --- */
.dashboard-layout { display: flex; height: 100vh; width: 100%; overflow: hidden; font-family: 'Segoe UI', sans-serif; background-color: #16213E; }
.main-content { flex: 1; background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), url('/assets/images/fondo.png') no-repeat center center; background-size: cover; background-attachment: fixed; padding: 1.5rem; overflow-y: auto; }
.content-container { max-width: 1400px; margin: 0 auto; }

/* HEADER */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.page-title { color: #F1F6F9; font-size: 2rem; margin: 0; font-weight: 600; }
.add-user-btn { background-color: #4361ee !important; border: none !important; font-weight: 700 !important; font-size: 0.85rem !important; padding: 0.7rem 1.5rem !important; border-radius: 6px !important; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(67, 97, 238, 0.4); transition: transform 0.2s, box-shadow 0.2s; display: flex !important; gap: 12px !important;}
.add-user-btn:hover { background-color: #3a56d4 !important; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(67, 97, 238, 0.5); }

/* FILTROS */
.filters-panel { display: flex; gap: 2rem; padding: 1rem; margin-bottom: 1rem; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); align-items: flex-end; }
.filter-item { flex: 1; }
.filter-label { display: block; color: #F1F6F9; font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; margin-left: 4px; letter-spacing: 0.5px; }

:deep(.custom-select-input) { background-color: #0a2540 !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; border-radius: 10px; height: 48px; display: flex; align-items: center; padding-left: 1rem !important; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: all 0.3s ease; }
:deep(.custom-select-input .p-select-label) { color: #F1F6F9 !important; font-weight: 500; padding: 0 !important; display: flex; align-items: center; height: 100%; }
:deep(.custom-select-input .p-select-label.p-placeholder) { color: #aebbc7 !important; }
:deep(.custom-select-input .p-select-dropdown) { color: #aebbc7 !important; width: 3rem; }
:deep(.custom-select-input:focus), :deep(.custom-select-input.p-focus) { border-color: #4361ee !important; box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1) !important; }

/* TABLA */
.table-wrapper { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 1.5rem; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
:deep(.users-table) { background: transparent !important; }
:deep(.p-tag .p-tag-icon) { margin-right: 0.5rem !important; }
:deep(.users-table .p-datatable-wrapper) { background: transparent !important; }
:deep(.users-table .p-datatable-header), :deep(.users-table .p-datatable-thead > tr > th) { background: transparent !important; color: #aebbc7 !important; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; border-top: none !important; border-left: none !important; border-right: none !important; padding: 1rem 1rem; }
:deep(.users-table .p-datatable-tbody > tr) { background: transparent !important; color: #F1F6F9 !important; transition: background 0.2s ease; }
:deep(.users-table .p-datatable-tbody > tr > td) { background: transparent !important; color: #F1F6F9 !important; border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; border-top: none !important; border-left: none !important; border-right: none !important; padding: 0.75rem 1rem; }
:deep(.users-table .p-datatable-tbody > tr:hover) { background: rgba(255, 255, 255, 0.1) !important; }
:deep(.users-table .p-datatable-footer), :deep(.users-table .p-paginator) { background: transparent !important; color: #F1F6F9 !important; border-top: 1px solid rgba(255, 255, 255, 0.1) !important; border-bottom: none !important; border-left: none !important; border-right: none !important; padding: 1rem; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar-small { width: 30px; height: 30px; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
.action-btn { color: #aebbc7 !important; }
.action-btn:hover { color: #F1F6F9 !important; background: rgba(255,255,255,0.1) !important; }
</style>

<!-- ESTILOS GLOBALES ESTRICTAMENTE NECESARIOS PARA OVERRIDES DE LIBRERÍAS -->
<style>
/* SELECTS Y DROPDOWNS */
.p-dropdown-panel, .p-select-panel, .p-select-overlay { background-color: #0F3460 !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 8px !important; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important; }
.p-dropdown-items, .p-select-items, .p-select-list { background-color: #0F3460 !important; padding: 0 !important; }
.p-dropdown-item, .p-select-item, .p-select-option { background: transparent !important; color: #F1F6F9 !important; padding: 12px 16px !important; transition: all 0.2s ease; border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; border-radius: 0 !important; }
.p-dropdown-item:not(.p-highlight):not(.p-disabled):hover, .p-select-item:not(.p-highlight):not(.p-disabled):hover, .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover { background: rgba(255, 255, 255, 0.1) !important; color: #ffffff !important; }
.p-dropdown-item.p-highlight, .p-select-item.p-highlight, .p-select-option.p-select-option-selected { background: rgba(67, 97, 238, 0.2) !important; color: #ffffff !important; font-weight: 600; }
.p-select-header, .p-dropdown-header { background-color: #0F3460 !important; color: #F1F6F9 !important; border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; }
.p-select-filter, .p-dropdown-filter { background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; color: #F1F6F9 !important; }

/* DIALOGO OSCURO (BASE) */
.p-dialog.custom-dialog-dark { background-color: #0F3460 !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 12px !important; margin: 2rem !important; padding: 40px !important; }
.p-dialog.custom-dialog-dark .p-dialog-header { background-color: #0F3460 !important; color: #F1F6F9 !important; border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; }
.p-dialog.custom-dialog-dark .p-dialog-title { color: #F1F6F9 !important; }
.p-dialog.custom-dialog-dark .p-dialog-header-icon { color: #aebbc7 !important; }
.p-dialog.custom-dialog-dark .p-dialog-content { background-color: #0F3460 !important; color: #F1F6F9 !important; }
.p-dialog.custom-dialog-dark .p-dialog-footer { background-color: #0F3460 !important; border-top: 1px solid rgba(255, 255, 255, 0.1) !important; }
.p-dialog-mask { background-color: rgba(0, 0, 0, 0.6) !important; }

/* MENÚ CONTEXTUAL */
body .p-menu.custom-menu, body .p-menu.p-menu-overlay.custom-menu { background-color: #0F3460 !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 8px !important; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important; padding: 0.5rem !important; }
body .custom-menu .p-menu-list { display: flex !important; flex-direction: column !important; gap: 12px !important; }
body .custom-menu .p-menuitem { margin: 0 !important; }
body .custom-menu .p-menuitem-link { color: #F1F6F9 !important; padding: 12px 16px !important; border-radius: 6px !important; display: flex !important; align-items: center !important; }
body .custom-menu .p-menuitem-link:hover { background: rgba(255, 255, 255, 0.1) !important; }
body .custom-menu .p-menuitem-icon { color: #64b5f6 !important; margin-right: 25px !important; font-size: 1.2rem !important; display: inline-block !important; }
body .custom-menu .p-menuitem-text { color: #F1F6F9 !important; font-weight: 500; margin-left: 0 !important; }
</style>