import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1', 
});

// Interceptor para agregar el token a TODAS las peticiones
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Token enviado:', token.substring(0, 20) + '...'); // DEBUG
        } else {
            console.warn('No hay token disponible'); // DEBUG
        }
        return config;
    }, 
    error => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 403) {
            console.error('Error 403: Token inválido o expirado');
            // Opcional: redirigir al login
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;