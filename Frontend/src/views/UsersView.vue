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

        <!-- BARRA DE FILTROS MEJORADA -->
        <div class="filters-panel glass-panel">
          
          <!-- Filtro Rol -->
          <div class="filter-item">
            <span class="filter-label">Rol</span>
            <Select 
              v-model="filters.role" 
              :options="Object.keys(ROLE_CONFIG)" 
              placeholder="Seleccionar" 
              class="w-full custom-select-input" 
              :showClear="true"
              appendTo="body"
            />
          </div>

          <!-- Filtro Tipo -->
          <div class="filter-item">
            <span class="filter-label">Tipo</span>
            <Select 
              v-model="filters.type" 
              :options="Object.keys(TYPE_CONFIG)" 
              placeholder="Seleccionar" 
              class="w-full custom-select-input" 
              :showClear="true"
              appendTo="body"
            />
          </div>

          <!-- Filtro Estado -->
          <div class="filter-item">
            <span class="filter-label">Estado</span>
            <Select 
              v-model="filters.status" 
              :options="Object.keys(STATUS_CONFIG)" 
              placeholder="Seleccionar" 
              class="w-full custom-select-input" 
              :showClear="true"
              appendTo="body"
            />
          </div>

        </div>

        <!-- TABLA DE USUARIOS -->
        <div class="table-wrapper">
          
          <!-- CAMBIO: Se eliminaron las propiedades de paginación (:paginator, :rows, paginatorTemplate) -->
          <DataTable 
            :value="filteredUsers" 
            class="users-table" 
            responsiveLayout="scroll"
          >
            
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
                <Tag :value="slotProps.data.role" :severity="getRoleConfig(slotProps.data.role).severity" :icon="getRoleConfig(slotProps.data.role).icon" />
              </template>
            </Column>
            <Column field="type" header="Tipo">
              <template #body="slotProps">
                <Tag :value="slotProps.data.type" :severity="getTypeConfig(slotProps.data.type).severity" style="background: transparent; border: none; padding: 0; font-weight: 500;" />
              </template>
            </Column>
            <Column field="status" header="Estado">
              <template #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="getStatusConfig(slotProps.data.status).severity" rounded />
              </template>
            </Column>
            <Column header="Acciones" style="width: 100px; text-align: center">
              <template #body="slotProps">
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded action-btn" @click="toggleMenu($event, slotProps.data)" />
              </template>
            </Column>

          </DataTable>

          <!-- ELIMINADO: <BluePaginator ... /> -->
          
          <div v-if="filteredUsers.length === 0" class="text-center p-4" style="color: #aebbc7;">
            No hay usuarios para mostrar.
          </div>
        </div>

      </div>
    </main>

    <!-- MENÚ CONTEXTUAL -->
    <Menu ref="actionMenu" :model="menuItems" :popup="true" class="custom-menu" />

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
          <Checkbox v-model="newUser.isInternal" :binary="true" inputId="addInternal" />
          <label for="addInternal" class="ml-2 label-text">¿Es usuario interno?</label>
        </div>
        <div class="field mb-3 input-wrapper">
          <label for="addEmail" class="input-label">Email</label>
          <InputText id="addEmail" v-model="newUser.email" class="w-full custom-input" placeholder="prueba@mail.com" />
        </div>
        <div class="field mb-3 input-wrapper">
          <label for="addUsername" class="input-label">Username</label>
          <InputText id="addUsername" v-model="newUser.username" class="w-full custom-input" />
        </div>
        <div class="field mb-3 input-wrapper">
          <label for="addPassword" class="input-label">Contraseña</label>
          <Password 
            id="addPassword" 
            v-model="newUser.password" 
            class="w-full custom-input-pass" 
            :feedback="false" 
            toggleMask 
          />
        </div>
        
        <!-- CORRECCIÓN: Usar Select en lugar de Dropdown -->
        <div class="field mb-4 input-wrapper">
          <label for="addRole" class="input-label">Roles</label>
          <Select 
            id="addRole" 
            v-model="newUser.role" 
            :options="Object.keys(ROLE_CONFIG)" 
            placeholder="Seleccionar" 
            class="w-full custom-dropdown-form" 
            appendTo="body"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <Button label="CANCELAR" icon="pi pi-times" class="p-button-text cancel-btn" @click="closeAddDialog" />
          <Button label="AGREGAR USUARIO" icon="pi pi-check" class="p-button-text save-btn" @click="saveUser" />
        </div>
      </template>
    </Dialog>

    <!-- DIALOGO EDITAR USUARIO -->
    <Dialog 
      v-model:visible="showEditUserDialog" 
      modal 
      header="Editar Usuario" 
      :style="{ width: '400px' }"
      class="custom-dialog-dark"
      :draggable="false"
      :closeOnEscape="true"
      :dismissableMask="true"
    >
      <div class="form-content">
        <div class="field-checkbox mb-4">
          <Checkbox v-model="editingUser.isInternal" :binary="true" inputId="editInternal" />
          <label for="editInternal" class="ml-2 label-text">¿Es usuario interno?</label>
        </div>
        <div class="field mb-3 input-wrapper">
          <label for="editEmail" class="input-label">Email</label>
          <InputText id="editEmail" v-model="editingUser.email" class="w-full custom-input" placeholder="prueba@mail.com" />
        </div>
        <div class="field mb-3 input-wrapper">
          <label for="editUsername" class="input-label">Username</label>
          <InputText id="editUsername" v-model="editingUser.username" class="w-full custom-input" :readonly="true" />
          <small class="field-hint" style="color: #aebbc7; font-size: 0.8rem;">El username no puede modificarse</small>
        </div>
        
        <!-- CORRECCIÓN: Password con clase ajustada -->
        <div class="field mb-3 input-wrapper">
          <label for="editPassword" class="input-label">Nueva Contraseña (opcional)</label>
          <Password 
            id="editPassword" 
            v-model="editingUser.password" 
            class="w-full custom-input-pass" 
            :feedback="false" 
            toggleMask 
            placeholder="Dejar vacío para mantener" 
          />
        </div>

        <!-- CORRECCIÓN: Usar Select en lugar de Dropdown -->
        <div class="field mb-3 input-wrapper">
          <label for="editRole" class="input-label">Roles</label>
          <Select 
            id="editRole" 
            v-model="editingUser.role" 
            :options="Object.keys(ROLE_CONFIG)" 
            placeholder="Seleccionar" 
            class="w-full custom-dropdown-form" 
            appendTo="body"
          />
        </div>

        <!-- CORRECCIÓN: Usar Select en lugar de Dropdown -->
        <div class="field mb-4 input-wrapper">
          <label for="editStatus" class="input-label">Estado</label>
          <Select 
            id="editStatus" 
            v-model="editingUser.status" 
            :options="Object.keys(STATUS_CONFIG)" 
            placeholder="Seleccionar" 
            class="w-full custom-dropdown-form" 
            appendTo="body"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <Button label="CANCELAR" icon="pi pi-times" class="p-button-text cancel-btn" @click="closeEditDialog" />
          <Button label="GUARDAR" icon="pi pi-check" class="p-button-text save-btn" @click="updateUser" />
        </div>
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import { userService } from '../services/userService'; // Importar servicio
import { useToast } from 'primevue/usetoast'; // Importar Toast

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
import Menu from 'primevue/menu';
import Toast from 'primevue/toast';
import Select from 'primevue/select';

const router = useRouter();
const toast = useToast();

// --- CONFIGURACIÓN ---
const ROLE_CONFIG = {
  'Admin':    { severity: 'danger',  icon: 'pi pi-shield', color: '#E94560' },
  'Operator': { severity: 'info',    icon: 'pi pi-cog',    color: '#64b5f6' },
  'Cli':  { severity: 'warning', icon: 'pi pi-user',   color: '#F9A826' }
};

const TYPE_CONFIG = {
  'Interno': { severity: 'info' },
  'Externo': { severity: 'secondary' }
};

const STATUS_CONFIG = {
  'Habilitada':    { severity: 'success' },
  'Deshabilitada': { severity: 'danger' }
};

// Helpers
const getRoleConfig = (role) => ROLE_CONFIG[role] || { severity: 'secondary', color: '#ccc' };
const getTypeConfig = (type) => TYPE_CONFIG[type] || { severity: 'secondary' };
const getStatusConfig = (status) => STATUS_CONFIG[status] || { severity: 'secondary' };

// --- ESTADO ---
const showAddUserDialog = ref(false);
const showEditUserDialog = ref(false);
const newUser = ref({ isInternal: true, email: '', username: '', password: '', role: null });
const editingUser = ref({ idUser: null, isInternal: true, email: '', username: '', password: '', role: null, status: null });
const filters = ref({ role: null, type: null, status: null });
const actionMenu = ref(null);
const selectedUser = ref(null);
const users = ref([]); 
const loading = ref(false);

// --- MENÚ CONTEXTUAL ---
const menuItems = computed(() => [
  { 
    label: 'Editar', 
    icon: 'pi pi-pencil', 
    color: '#64b5f6', 
    command: () => openEditDialog(selectedUser.value) 
  },
  { 
    label: 'Eliminar', 
    icon: 'pi pi-trash', 
    color: '#E94560', 
    command: () => confirmDeleteUser(selectedUser.value) 
  }
]);

// --- CARGAR USUARIOS (GET) ---
const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await userService.getAllUsers();
    const rawData = response.data || [];

    users.value = rawData.map(u => {
      // Lógica de mapeo Backend -> Frontend
      let roleName = 'Cli'; // Valor por defecto (asumimos Cliente si no encontramos otro)
      
      if (u.roles && u.roles.length > 0) {
        // Convertimos a string y mayúsculas para comparar sin errores
        const rawRole = (u.roles[0].name || u.roles[0]).toString().toUpperCase(); 
        
        if (rawRole.includes('ADMIN')) {
            roleName = 'Admin';
        } else if (rawRole.includes('OPERATOR') || rawRole.includes('OPERADOR')) {
            roleName = 'Operator';
        } else {
            // Si no es Admin ni Operator, asumimos que es Cliente (Cli)
            // Esto atrapa ROLE_CLIENT, ROLE_USER, o cualquier otro rol básico
            roleName = 'Cli';
        }
      }

      // Determinar tipo basado en rol
      const type = roleName === 'Cli' ? 'Externo' : 'Interno';

      return {
        id: u.idUser, 
        username: u.username,
        email: u.email,
        role: roleName, // Ahora "Cli" se asignará correctamente a todos los que no sean Admin/Operator
        type: type,
        status: u.enabled ? 'Habilitada' : 'Deshabilitada',
        originalRoles: u.roles 
      };
    });

  } catch (error) {
    console.error("Error cargando usuarios:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios', life: 3000 });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUsers();
});

// --- CREAR USUARIO (POST) ---
const openNewUserDialog = () => {
  newUser.value = { isInternal: true, email: '', username: '', password: '', role: null };
  showAddUserDialog.value = true;
};

const closeAddDialog = () => {
  showAddUserDialog.value = false;
};

const saveUser = async () => {
  try {
    if (!newUser.value.role) {
      toast.add({ severity: 'warn', summary: 'Atención', detail: 'Debes seleccionar un rol', life: 3000 });
      return;
    }

    // 1. Mapeo de Roles para coincidir con la BD
    // Definimos los IDs y descripciones aproximadas. 
    // Si el backend busca por nombre, el ID puede ser ignorado, pero lo enviamos por si acaso.
    const roleMap = {
      'Admin':    { id: 1, name: 'ROLE_ADMIN',    description: 'administrador' },
      'Operator': { id: 2, name: 'ROLE_OPERATOR', description: 'operador' },
      'Cli':      { id: 3, name: 'ROLE_CLIENT',   description: 'cliente' }
    };

    const selectedRoleObj = roleMap[newUser.value.role];

    // 2. Construcción del JSON exacto que pide el backend
    const payload = {
      accountNonExpired: true,
      accountNonLocked: true,
      credentialsNonExpired: true,
      enabled: true,
      email: newUser.value.email,
      username: newUser.value.username,
      password: newUser.value.password,
      roles: [ selectedRoleObj ], // Enviamos el objeto completo
      alarmas: []
    };

    await userService.createUser(payload);
    
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente', life: 3000 });
    showAddUserDialog.value = false;
    loadUsers(); 
  } catch (error) {
    console.error("Error creando usuario:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Falló la creación. Verifique los datos.', life: 3000 });
  }
};

// --- EDITAR USUARIO (PUT) ---
const toggleMenu = (event, user) => {
  selectedUser.value = user;
  actionMenu.value.toggle(event);
};

const openEditDialog = (user) => {
  editingUser.value = { 
    ...user,
    idUser: user.id, // Recuperar el ID real de Java
    isInternal: user.type === 'Interno',
    password: '' // Limpiar password
  };
  showEditUserDialog.value = true;
};

const closeEditDialog = () => {
  showEditUserDialog.value = false;
};

const updateUser = async () => {
  try {
    // 1. Mapeo de Roles (Igual que en crear usuario)
    // Es crucial enviar el objeto completo { id, name, description }
    const roleMap = {
      'Admin':    { id: 1, name: 'ROLE_ADMIN',    description: 'administrador' },
      'Operator': { id: 2, name: 'ROLE_OPERATOR', description: 'operador' },
      'Cli':      { id: 3, name: 'ROLE_CLIENT',   description: 'cliente' }
    };

    const selectedRoleObj = roleMap[editingUser.value.role];

    // 2. Construcción del JSON exacto
    const payload = {
      idUser: editingUser.value.idUser,
      username: editingUser.value.username,
      email: editingUser.value.email,
      enabled: editingUser.value.status === 'Habilitada',
      roles: [ selectedRoleObj ] // Array con el objeto completo
    };

    // Solo agregamos password al payload si el usuario escribió una nueva
    if (editingUser.value.password && editingUser.value.password.trim() !== '') {
      payload.password = editingUser.value.password;
    }

    await userService.updateUser(payload);
    
    toast.add({ severity: 'success', summary: 'Actualizado', detail: 'Usuario modificado correctamente', life: 3000 });
    showEditUserDialog.value = false;
    loadUsers();
  } catch (error) {
    console.error("Error actualizando:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el usuario', life: 3000 });
  }
};

// --- ELIMINAR USUARIO (DELETE) ---
const confirmDeleteUser = async (user) => {
  try {
    await userService.deleteUser(user.id);
    toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario eliminado', life: 3000 });
    loadUsers();
  } catch (error) {
    console.error("Error eliminando:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar', life: 3000 });
  }
};

// --- FILTROS ---
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
  background: rgba(255, 255, 255, 0.05); 
  backdrop-filter: blur(10px); 
  border-radius: 12px; 
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  align-items: flex-end; /* Alinea los inputs abajo */
}
.filter-item { flex: 1; }

/* ETIQUETA SUPERIOR (Estilo Label de la imagen) */
.filter-label {
  display: block;
  color: #F1F6F9;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  margin-left: 4px;
  letter-spacing: 0.5px;
}

/* INPUT ESTILO MATERIAL (Fondo Oscuro) */
:deep(.custom-select-input) { 
  background-color: #0a2540 !important; /* Fondo Azul Oscuro */
  border: 1px solid rgba(255, 255, 255, 0.15) !important; /* Borde sutil */
  border-radius: 10px; 
  height: 48px; 
  display: flex;
  align-items: center;
  padding-left: 1rem !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2); 
  transition: all 0.3s ease;
}

/* Texto dentro del select (Ahora debe ser claro) */
:deep(.custom-select-input .p-select-label) { 
  color: #F1F6F9 !important; /* Texto Blanco */
  font-weight: 500;
  padding: 0 !important;
  display: flex;
  align-items: center;
  height: 100%;
}

/* Placeholder (Gris azulado claro) */
:deep(.custom-select-input .p-select-label.p-placeholder) {
  color: #aebbc7 !important;
}

/* Icono de la flecha (Gris claro) */
:deep(.custom-select-input .p-select-dropdown) { 
  color: #aebbc7 !important; 
  width: 3rem;
}

/* Efecto Focus */
:deep(.custom-select-input:focus),
:deep(.custom-select-input.p-focus) {
  border-color: #4361ee !important;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1) !important;
}

/* --- TABLE WRAPPER CON EFECTO GLASS --- */
.table-wrapper { 
  background: rgba(255, 255, 255, 0.05) !important; 
  backdrop-filter: blur(10px); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 15px; 
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); 
}

/* --- TABLE STYLES (FONDO TRANSPARENTE) --- */
:deep(.users-table) {
  background: transparent !important;
}

/* NUEVO: Separación entre el ícono y el texto en los Tags (Roles) */
:deep(.p-tag .p-tag-icon) {
  margin-right: 0.5rem !important; /* Espacio de 8px */
}

:deep(.users-table .p-datatable-wrapper) {
  background: transparent !important;
}

:deep(.users-table .p-datatable-header), 
:deep(.users-table .p-datatable-thead > tr > th) { 
  background: transparent !important; 
  color: #aebbc7 !important; 
  font-weight: 600; 
  text-transform: uppercase; 
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  padding: 1.5rem 1rem;
}

:deep(.users-table .p-datatable-tbody > tr) {
  background: transparent !important; 
  color: #F1F6F9 !important;
  transition: background 0.2s ease;
}

:deep(.users-table .p-datatable-tbody > tr > td) {
  background: transparent !important;
  color: #F1F6F9 !important; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  padding: 1.5rem 1rem;
}

:deep(.users-table .p-datatable-tbody > tr:hover) { 
  background: rgba(255, 255, 255, 0.1) !important; 
}

:deep(.users-table .p-datatable-footer), 
:deep(.users-table .p-paginator) {
  background: transparent !important; 
  color: #F1F6F9 !important; 
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  padding: 1rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  color: #aebbc7 !important;
  border-radius: 50%;
}

:deep(.p-paginator .p-paginator-page:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
  background: #ffffff !important;
  color: #0F3460 !important;
  font-weight: 700;
}

.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar-small { 
  width: 30px; height: 30px; color: white; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  font-weight: bold; font-size: 0.8rem; 
}
.action-btn { color: #aebbc7 !important; }
.action-btn:hover { color: #F1F6F9 !important; background: rgba(255,255,255,0.1) !important; }

/* --- ESTILOS DEL DIALOGO (MODAL) --- */
:deep(.custom-dialog-dark) {
  background-color: #0F3460 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5) !important;
  color: #F1F6F9 !important;
  border-radius: 12px !important;
  margin: 2rem !important;
}
:deep(.custom-dialog-dark .p-dialog-header),
:deep(.custom-dialog-dark .p-dialog-content),
:deep(.custom-dialog-dark .p-dialog-footer) {
  background: #0F3460 !important;
  color: #F1F6F9 !important;
  border: none !important;
}
:deep(.custom-dialog-dark .p-dialog-header) { padding: 1.5rem 1.5rem 0.5rem 1.5rem; }
:deep(.custom-dialog-dark .p-dialog-title) { font-weight: 600; font-size: 1.25rem; }
:deep(.custom-dialog-dark .p-dialog-header-icon) { color: #aebbc7 !important; }
:deep(.custom-dialog-dark .p-dialog-content) { padding: 0 1.5rem 1.5rem 1.5rem; }

.input-wrapper {
  background-color: #0F3460; /* ← Mismo color que el diálogo */
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

/* ESTILOS PARA PASSWORD Y INPUTS */
:deep(.custom-input), 
:deep(.custom-input-pass .p-inputtext), 
:deep(.custom-dropdown-form) {
  background: transparent !important; 
  border: none !important; 
  color: #fff !important; 
  padding: 0 !important; 
  font-size: 0.95rem; 
  box-shadow: none !important;
  width: 100%; /* IMPORTANTE: Ocupar todo el ancho */
}

/* CORRECCIÓN ESPECÍFICA PARA EL COMPONENTE PASSWORD */
:deep(.custom-input-pass) {
  width: 100%;
  position: relative;
  display: block;
}

:deep(.custom-input-pass .p-inputtext) {
  width: 100%;
  padding-right: 40px !important;
}

/* Ajuste del icono del ojo */
:deep(.custom-input-pass .p-password-show-icon),
:deep(.custom-input-pass .p-password-hide-icon),
:deep(.custom-input-pass .p-icon),
:deep(.custom-input-pass svg) {
  color: #aebbc7 !important;
  /* right: 0 !important; */
  cursor: pointer;
  position: absolute !important;
  top: 50% !important;
  right: 2px !important;
  transform: translateY(-50%) !important;
  left: auto !important;
  margin-top: 0 !important;
  width: 1.1rem !important;
  height: 1.1rem !important;
  z-index: 10 !important;
}

/*:deep(.custom-input-pass .p-password-show-icon:hover),
:deep(.custom-input-pass .p-password-hide-icon:hover) {
  color: #4361ee !important;
}/* Efecto hover azul */


:deep(.custom-dropdown-form .p-dropdown-trigger) { color: #aebbc7; }
:deep(.p-checkbox .p-checkbox-box) { 
  background: rgba(255, 255, 255, 0.05); 
  border: 2px solid #aebbc7; 
  border-radius: 4px; 
}
:deep(.p-checkbox.p-checkbox-checked .p-checkbox-box) { 
  background: #4361ee; 
  border-color: #4361ee; 
}

.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0.5rem 0; }
.cancel-btn { color: #aebbc7 !important; font-weight: 600; letter-spacing: 0.5px; font-size: 0.85rem; }
.cancel-btn:hover { color: #fff !important; background: rgba(255, 255, 255, 0.05) !important; }
.save-btn { color: #7e73f0 !important; font-weight: 700; letter-spacing: 0.5px; font-size: 0.85rem; }
.save-btn:hover { background: rgba(126, 115, 240, 0.1) !important; }

.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.w-full { width: 100%; }
.label-text { color: #F1F6F9; font-size: 0.9rem; font-weight: 500; cursor: pointer; user-select: none; }
.field-checkbox { 
  display: flex; 
  align-items: center; 
  margin-bottom: 1rem; 
  padding: 12px 16px;
  background-color: #0F3460;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animación de entrada */
@keyframes fadeIn { 
  to { opacity: 1; } 
}
</style>

<!-- ESTILOS GLOBALES PARA EL MENÚ Y DROPDOWNS (sin scoped) -->
<style>
/* ===================================
   DROPDOWNS Y SELECTS - ESTILO OSCURO (TEMA DE LA PÁGINA)
   =================================== */

/* 1. El contenedor flotante (Panel/Overlay) */
.p-dropdown-panel,
.p-select-panel,
.p-select-overlay {
  background-color: #0F3460 !important; /* Fondo Azul Oscuro */
  border: 1px solid rgba(255, 255, 255, 0.1) !important; /* Borde sutil */
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
  z-index: 9999 !important;
}

/* 2. La lista contenedora (ul) */
.p-dropdown-items,
.p-select-items,
.p-select-list {
  background-color: #0F3460 !important;
  padding: 0 !important;
}

/* 3. Los items individuales (li/option) */
.p-dropdown-item,
.p-select-item,
.p-select-option {
  background: transparent !important;
  color: #F1F6F9 !important;       /* Texto Blanco/Claro */
  padding: 12px 16px !important;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; /* Separador muy sutil */
  border-radius: 0 !important;
  margin: 0 !important;
}

/* 4. Hover sobre item (cuando pasas el mouse) */
.p-dropdown-item:not(.p-highlight):not(.p-disabled):hover,
.p-select-item:not(.p-highlight):not(.p-disabled):hover,
.p-select-option:not(.p-select-option-selected):not(.p-disabled):focus,
.p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
  background: rgba(255, 255, 255, 0.1) !important; /* Azul un poco más claro */
  color: #ffffff !important;
}

/* 5. Item seleccionado (Highlight) */
.p-dropdown-item.p-highlight,
.p-select-item.p-highlight,
.p-select-option.p-select-option-selected {
  background: rgba(67, 97, 238, 0.2) !important; /* Azul brillante translúcido */
  color: #ffffff !important;
  font-weight: 600;
}

/* Header del dropdown (si tiene filtro) */
.p-dropdown-header,
.p-select-header {
  background-color: #0F3460 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 0.75rem 1rem !important;
  color: #F1F6F9 !important;
}

/* Input de filtro dentro del panel */
.p-dropdown-filter,
.p-select-filter {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #F1F6F9 !important;
}

/* Mensaje vacío */
.p-dropdown-empty-message,
.p-select-empty-message {
  background: #0F3460 !important;
  color: #aebbc7 !important;
  padding: 1rem !important;
}

/* --- MANTENEMOS LOS DIÁLOGOS OSCUROS --- */
.p-dialog.custom-dialog-dark {
  background-color: #0F3460 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  margin: 2rem !important; 
  padding: 40px !important;
}
.p-dialog.custom-dialog-dark .p-dialog-header { background-color: #0F3460 !important; color: #F1F6F9 !important; border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; }
.p-dialog.custom-dialog-dark .p-dialog-title { color: #F1F6F9 !important; }
.p-dialog.custom-dialog-dark .p-dialog-header-icon { color: #aebbc7 !important; }
.p-dialog.custom-dialog-dark .p-dialog-content { background-color: #0F3460 !important; color: #F1F6F9 !important; }
.p-dialog.custom-dialog-dark .p-dialog-footer { background-color: #0F3460 !important; border-top: 1px solid rgba(255, 255, 255, 0.1) !important; }
.p-dialog-mask { background-color: rgba(0, 0, 0, 0.6) !important; }

/* Menú contextual (Click derecho) - Oscuro */
.p-menu.custom-menu,
.p-menu.p-menu-overlay.custom-menu { 
  background-color: #0F3460 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
  padding: 1rem !important; /* Espacio interno general */
}

/* 1. ESPACIO ENTRE CADA PALABRA (ITEMS) */
.custom-menu .p-menu-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 15px !important; /* <--- ESTO SEPARA LOS BOTONES VERTICALMENTE */
}

.custom-menu .p-menuitem {
  margin: 0 !important; /* Reseteamos márgenes individuales */
}

/* 2. ESPACIO ENTRE ÍCONO Y TEXTO */
.custom-menu .p-menuitem-link { 
  color: #F1F6F9 !important; 
  padding: 10px 12px !important;
  border-radius: 6px !important;
  display: flex !important;
  align-items: center !important;
  /* gap: 16px !important; /* Ajuste estándar para separar el ícono del texto */
}

.custom-menu .p-menuitem-link:hover { 
  background: rgba(255, 255, 255, 0.1) !important; 
}

/* Icono */
.custom-menu .p-menuitem-icon { 
  color: #64b5f6 !important; 
  margin-right: 20px !important; /* Quitamos margen antiguo para que mande el gap */
  font-size: 1.1rem !important;
}

/* Texto */
.custom-menu .p-menuitem-text { 
  color: #F1F6F9 !important; 
  font-weight: 500;
}
/*.custom-menu .p-menuitem-link { color: #F1F6F9 !important; }
.custom-menu .p-menuitem-link:hover { background: rgba(255, 255, 255, 0.1) !important; }
.custom-menu .p-menuitem-icon { color: #64b5f6 !important; }
.custom-menu .p-menuitem-text { color: #F1F6F9 !important; }*/
</style>