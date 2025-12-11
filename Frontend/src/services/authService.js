import api from '../api/axios';

export default {
    async login(username, password) {
        try {
            // Hacemos la petición al backend.
            // Como tu backend pide los datos en la URL (Query Params), usamos 'params'.
            const response = await api.post('/login', null, {
                params: {
                    username: username,
                    password: password
                }
            });
            
            // Tu backend devuelve el token directamente como texto.
            const token = response.data;

            // Si recibimos un token, lo guardamos en el navegador (localStorage)
            if (token) {
                localStorage.setItem('token', token);
            }
            
            return token;
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    },

    // Función para cerrar sesión (borra el token)
    logout() {
        localStorage.removeItem('token');
    }
};