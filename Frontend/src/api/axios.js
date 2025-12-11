import axios from 'axios';

// Aquí definimos la dirección base de tu backend
const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1', 
});

// Esto es un "Interceptor":
// Cada vez que hagas una petición, revisa si tienes un token guardado.
// Si lo tienes, lo agrega automáticamente a la cabecera para que el backend sepa quién eres.
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;