import api from '../api/axios';

export const userService = {
  // Obtener todos los usuarios
  getAllUsers() {
    return api.get('/users');
  },

  // Obtener usuario por ID
  getUserById(id) {
    return api.get(`/users/${id}`);
  },

  // Crear nuevo usuario
  createUser(userData) {
    return api.post('/users', userData);
  },

  // Actualizar usuario
  updateUser(id, userData) {
    return api.put(`/users/${id}`, userData);
  },

  // Eliminar usuario
  deleteUser(id) {
    return api.delete(`/users/${id}`);
  },

  // Habilitar/Deshabilitar usuario
  toggleUserStatus(id, enabled) {
    return api.patch(`/users/${id}/status`, { enabled });
  }
};