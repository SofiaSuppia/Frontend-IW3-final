/**
 * ===================================
 * CONSTANTES: Gestión de Productos
 * ===================================
 */

export const ITEMS_PER_PAGE = 10;
export const EMPTY_TABLE_MESSAGE = 'No hay productos registrados';

export const DIALOG_TITLES = {
  ADD: 'Agregar Producto',
  EDIT: 'Editar Producto'
};

export const ERROR_MESSAGES = {
  LOAD: 'Error al cargar productos',
  CREATE: 'Error al crear producto',
  UPDATE: 'Error al actualizar producto',
  DELETE: 'Error al eliminar producto',
  SESSION_EXPIRED: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión.',
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_NUMBER: 'Debe ser un número válido'
};

export const SUCCESS_MESSAGES = {
  CREATE: 'Producto creado exitosamente',
  UPDATE: 'Producto actualizado exitosamente',
  DELETE: 'Producto eliminado exitosamente'
};

export const INITIAL_PRODUCT = {
  descripcion: '',
  nombre: '',
  thresholdTemp: 0,
  density: 0,
  stock: false
};