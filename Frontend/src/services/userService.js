import api from '../api/axios';

// El backend define la ruta en Constants.URL_USUARIOS = "/usuarios"
const ENDPOINT = '/usuarios'; 

export const userService = {
  // Obtener todos los usuarios (paginado o completo)
  getAllUsers(page = null, size = null) {
      let url = ENDPOINT;
      // Solo agregar parámetros si se requieren explícitamente
      if (page !== null && size !== null) {
          url += `?page=${page}&size=${size}`;
      }
      return api.get(url);
  },

  // Obtener usuario por ID
  getUserById(id) {
    return api.get(`${ENDPOINT}/${id}`);
  },

  // Crear nuevo usuario
  createUser(userData) {
    return api.post(ENDPOINT, userData);
  },

  // Actualizar usuario
  updateUser(userData) {
    // El backend espera el objeto User completo en el body para el PUT
    return api.put(ENDPOINT, userData);
  },

  // Eliminar usuario
  deleteUser(id) {
    return api.delete(`${ENDPOINT}/${id}`);
  }
};