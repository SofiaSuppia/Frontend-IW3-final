import api from '../api/axios';

// El backend define la ruta en Constants.URL_USUARIOS = "/usuarios"
const ENDPOINT = '/usuarios'; 

export const userService = {
  // Obtener todos los usuarios
  getAllUsers() {
    return api.get(ENDPOINT);
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