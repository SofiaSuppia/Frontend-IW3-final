import api from '../api/axios';

export const orderService = {
    // Obtener todas las órdenes
    async getAllOrders() {
        try {
            const response = await api.get('/ordenes?size=1000&page=0');
            return response.data;
        } catch (error) {
            console.error("Error al obtener órdenes", error);
            throw error;
        }
    },

    // 1. Obtener datos básicos de la orden
    async getOrderById(id) {
        // Esto trae cliente, producto, estado, etc.
        const response = await api.get(`/ordenes/${id}`);
        return response.data;
    },

    async getDetailsByOrderId(id) {
        try {
            // Llamamos al endpoint: GET /api/v1/detalles/by-orden/{id}
            const response = await api.get(`/detalles/by-orden/${id}`);
            return response.data;
        } catch (error) {
            console.warn(`Error obteniendo detalles para orden ${id}`, error);
            return []; // Retorna lista vacía si falla para no romper la vista
        }
    },

    // 3. Obtener alarmas
    // devolvemos array vacío directamente para evitar el error 403/404 rojo en consola.
    async getAlarmsByOrderId(id) {
        // Cuando crees el AlarmaRestController, descomenta la línea de abajo:
        const response = await api.get(`/alarmas/by-orden/${id}`);
        return response.data;  
        //return []; // Retorno vacío temporal para que el frontend se vea bien
    },

    // Crear nueva orden
    async createOrder(orderData) {
        const response = await api.post('/ordenes', orderData);
        return response.data;
    },

    // Actualizar orden
    async updateOrder(orderData) {
        const response = await api.put('/ordenes', orderData);
        return response.data;
    },

    // Eliminar orden
    async deleteOrder(id) {
        const response = await api.delete(`/ordenes/${id}`);
        return response.data;
    },

    // Conciliación
    async getConciliacion(idOrden) {
        const response = await api.get(`/ordenes/conciliacion/${idOrden}`);
        return response.data;
    }
};