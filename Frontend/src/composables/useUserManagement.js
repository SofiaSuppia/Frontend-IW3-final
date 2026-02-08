import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { userService } from '../services/userService';

// --- CONSTANTES COMPARTIDAS ---
export const CONFIG_ROLES = {
  'Admin':    { severity: 'danger',  icon: 'pi pi-shield', color: '#E94560' },
  'Operador': { severity: 'info',    icon: 'pi pi-cog',    color: '#64b5f6' },
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
  'Operador': { id: 2, name: 'ROLE_OPERADOR', description: 'operador' },
  'Cli':      { id: 3, name: 'ROLE_CLIENT',   description: 'cliente' }
};

export function useUserManagement() {
  const toast = useToast();
  const users = ref([]);
  const loading = ref(false);
  const filters = ref({ role: null, type: null, status: null });

  // Paginación
  const page = ref(0);
  const pageSize = ref(5);
  const totalRecords = ref(0);

  // --- HELPERS INTERNOS ---
  const mapBackendToFrontend = (u) => {
    let roleName = 'Cli';
    if (u.roles && u.roles.length > 0) {
      const rawRole = (u.roles[0].name || u.roles[0]).toString().toUpperCase();
      if (rawRole.includes('ADMIN')) roleName = 'Admin';
      else if (rawRole.includes('Operador') || rawRole.includes('OPERADOR')) roleName = 'Operador';
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
      
      let response;
      
      if (!hasActiveFilters.value) {
          // MODALIDAD BACKEND: Pedimos solo la página actual
          response = await userService.getAllUsers(page.value, pageSize.value);
      } else {
          // MODALIDAD FRONTEND: Pedimos TODO para filtrar localmente
          response = await userService.getAllUsers();
      }

      let data = [];
      const responseBody = response.data || response;

      if (responseBody && responseBody.content) {
         // Viene como Page (Spring)
         data = responseBody.content;
         // Si estamos en modo backend, actualizamos el total real del servidor
         if (!hasActiveFilters.value) {
            totalRecords.value = (responseBody.totalElements !== undefined) ? responseBody.totalElements : data.length;
         }
      } else if (Array.isArray(responseBody)) {
        // Viene como Lista (Spring)
        data = responseBody;
        if (!hasActiveFilters.value) {
             totalRecords.value = data.length;
        }
      }

      users.value = (data || []).map(mapBackendToFrontend);
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista.' });
    } finally {
      loading.value = false;
    }
  };

  const onPageChange = (event) => {
    page.value = event.page;
    pageSize.value = event.rows;
    // Si estamos en modo frontend, no necesitamos recargar del servidor, solo cambiar el slice.
    // Pero si estamos en modo backend, SÍ hay que recargar.
    // Para simplificar, recargamos siempre si es backend, o si es front no hace daño (ya que tenemos cache de users.value pero aqui sobrescribimos).
    // MEJORA: Si es modo frontend, NO llamar a loadUsers, solo actualizar page.
    if (!hasActiveFilters.value) {
        loadUsers();
    }
  };
  
  // Watcher para filtros: Cuando cambian, reseteamos página y recargamos
  // Nota: Vue 'watch' debe importarse si se usa, pero aquí lo haremos a través del setter o método expuesto si hubiera.
  // Como `filters` es ref y se muta directamente desde la vista con v-model, necesitamos una forma de reaccionar.
  // La mejor forma aquí es retornar un método `applyFilters` o usar un watch dentro del setup, pero
  // `useUserManagement` es un composable. Lo ideal es exponer un método para recargar si cambian.
  // O usar un watch interno.


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
  
  /**
   * Usuarios globales filtrados (CLIENT-SIDE)
   * Se calculan sobre TODOS los usuarios traídos del backend si hay filtros
   */
  const globalFilteredUsers = computed(() => {
    let result = [...users.value];
    
    // Si estamos en modo Backend (sin filtros), `users.value` solo tiene 1 página,
    // así que este filtrado no tiene mucho efecto, pero no rompe nada.
    
    // Si estamos en modo Frontend (con filtros), `users.value` tiene TODO,
    // por lo que este filtrado es efectivo sobre el total.

    if (hasActiveFilters.value) {
        if (filters.value.role) {
            result = result.filter(u => u.role === filters.value.role);
        }
        if (filters.value.type) {
             result = result.filter(u => u.type === filters.value.type);
        }
        if (filters.value.status) {
             result = result.filter(u => u.status === filters.value.status);
        }
    }
    
    return result;
  });

  /**
   * Usuarios a mostrar en la tabla
   * - Modo Backend: Devuelve el array tal cual (ya viene paginado del servidor).
   * - Modo Frontend: Toma el array global filtrado y hace el slice de la página actual.
   */
  const filteredUsers = computed(() => {
    if (!hasActiveFilters.value) {
        // Modo backend: lo que hay es lo que se muestra
        return users.value; 
    } else {
        // Modo frontend: Paginación local
        const start = page.value * pageSize.value;
        const end = start + pageSize.value;
        return globalFilteredUsers.value.slice(start, end);
    }
  });

  // Detector de filtros activos
  const hasActiveFilters = computed(() => {
      return !!(filters.value.role || filters.value.type || filters.value.status);
  });

  // Total de registros dinámico
  const computedTotalRecords = computed(() => {
      if (!hasActiveFilters.value) {
          return totalRecords.value; // El valor seteado desde el backend response
      } else {
          return globalFilteredUsers.value.length; // El total filtrado localmente
      }
  });


  // Reactividad ante cambios en los filtros
  watch(filters, () => {
      page.value = 0; // Resetear a primera página
      loadUsers();    // Recargar datos (Full o Parcial según filtros)
  }, { deep: true });

  return {
    users,
    loading,
    filters,
    filteredUsers, // Esta el la lista paginada correcta para la tabla
    
    // Paginación
    page,
    pageSize,
    totalRecords: computedTotalRecords, // Usar el total computado
    onPageChange,
    
    loadUsers,
    saveUser,
    deleteUser
  };
}