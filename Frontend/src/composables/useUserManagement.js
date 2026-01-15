import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { userService } from '../services/userService';

// --- CONSTANTES COMPARTIDAS ---
export const CONFIG_ROLES = {
  'Admin':    { severity: 'danger',  icon: 'pi pi-shield', color: '#E94560' },
  'Operator': { severity: 'info',    icon: 'pi pi-cog',    color: '#64b5f6' },
  'Cli':      { severity: 'warning', icon: 'pi pi-user',   color: '#F9A826' }
};

export const CONFIG_TYPES = {
  'Interno': { severity: 'info' },
  'Externo': { severity: 'secondary' }
};

export const CONFIG_STATUS = {
  'Habilitada':    { severity: 'success' },
  'Deshabilitada': { severity: 'danger' }
};

const ROLE_DEFINITIONS = {
  'Admin':    { id: 1, name: 'ROLE_ADMIN',    description: 'administrador' },
  'Operator': { id: 2, name: 'ROLE_OPERATOR', description: 'operador' },
  'Cli':      { id: 3, name: 'ROLE_CLIENT',   description: 'cliente' }
};

export function useUserManagement() {
  const toast = useToast();
  const users = ref([]);
  const loading = ref(false);
  const filters = ref({ role: null, type: null, status: null });

  // --- HELPERS INTERNOS ---
  const mapBackendToFrontend = (u) => {
    let roleName = 'Cli';
    if (u.roles && u.roles.length > 0) {
      const rawRole = (u.roles[0].name || u.roles[0]).toString().toUpperCase();
      if (rawRole.includes('ADMIN')) roleName = 'Admin';
      else if (rawRole.includes('OPERATOR') || rawRole.includes('OPERADOR')) roleName = 'Operator';
    }
    return {
      id: u.idUser,
      username: u.username,
      email: u.email,
      role: roleName,
      type: roleName === 'Cli' ? 'Externo' : 'Interno',
      status: u.enabled ? 'Habilitada' : 'Deshabilitada',
      originalRoles: u.roles
    };
  };

  const createPayload = (form, isUpdate) => {
    const selectedRoleObj = ROLE_DEFINITIONS[form.role];
    const payload = {
      username: form.username,
      email: form.email,
      enabled: form.status === 'Habilitada',
      roles: [ selectedRoleObj ]
    };

    if (isUpdate) {
      payload.idUser = form.id;
      if (form.password && form.password.trim().length > 0) payload.password = form.password;
    } else {
      payload.password = form.password;
      payload.accountNonExpired = true;
      payload.accountNonLocked = true;
      payload.credentialsNonExpired = true;
      payload.alarmas = [];
    }
    return payload;
  };

  // --- ACCIONES CRUD ---
  const loadUsers = async () => {
    loading.value = true;
    try {
      const response = await userService.getAllUsers();
      users.value = (response.data || []).map(mapBackendToFrontend);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista.' });
    } finally {
      loading.value = false;
    }
  };

  const saveUser = async (formData, isUpdate) => {
    try {
      const payload = createPayload(formData, isUpdate);
      if (isUpdate) {
        await userService.updateUser(payload);
        toast.add({ severity: 'success', summary: 'Actualizado', detail: 'Usuario modificado correctamente.' });
      } else {
        await userService.createUser(payload);
        toast.add({ severity: 'success', summary: 'Creado', detail: 'Usuario creado exitosamente.' });
      }
      return true; // Éxito
    } catch (error) {
      console.error('Error guardando usuario:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Falló la operación.' });
      return false; // Fallo
    }
  };

  const deleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario eliminado.' });
      return true;
    } catch (error) {
      console.error('Error eliminando:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar.' });
      return false;
    }
  };

  // --- COMPUTED ---
  const filteredUsers = computed(() => {
    return users.value.filter(user => {
      const roleMatch = !filters.value.role || user.role === filters.value.role;
      const typeMatch = !filters.value.type || user.type === filters.value.type;
      const statusMatch = !filters.value.status || user.status === filters.value.status;
      return roleMatch && typeMatch && statusMatch;
    });
  });

  return {
    users,
    loading,
    filters,
    filteredUsers,
    loadUsers,
    saveUser,
    deleteUser
  };
}