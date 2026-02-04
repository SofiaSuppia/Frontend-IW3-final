import api from '../api/axios';

export const orderService = {
    // Obtener todas las órdenes
    async getAllOrders() {
        try {
            // Agregamos un tamaño de página grande para asegurar que traiga todo
            // Si tu backend usa Spring Boot estándar, esto suele funcionar.
            const response = await api.get('/ordenes?size=1000&page=0');
            return response.data;
        } catch (error) {
            console.error("Error al obtener órdenes:", error);
            throw error;
        }
    },

    // Obtener una orden por ID
    async getOrderById(id) {
        try {
            const response = await api.get(`/ordenes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener orden ${id}:`, error);
            throw error;
        }
    },
    // --- DETALLE ---
    async getDetailsByOrderId(id) {
        try {
            // La URL base ya está en 'api', solo ponemos la ruta relativa
            const response = await api.get(`/ordenes/${id}/detalle`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener detalles orden ${id}:`, error);
            // Retornamos array vacío para no romper la vista si falla
            return []; 
        }
    },

    // --- ALARMA ---
    async getAlarmsByOrderId(id) {
        try {
            const response = await api.get(`/ordenes/${id}/alarmas`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener alarmas orden ${id}:`, error);
            return [];
        }
    },

    // Crear nueva orden
    async createOrder(orderData) {
        try {
            const response = await api.post('/ordenes', orderData);
            return response.data;
        } catch (error) {
            console.error("Error al crear orden:", error);
            throw error;
        }
    },

    // Actualizar orden
    async updateOrder(orderData) {
        try {
            const response = await api.put('/ordenes', orderData);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar orden:", error);
            throw error;
        }
    },

    // Eliminar orden
    async deleteOrder(id) {
        try {
            const response = await api.delete(`/ordenes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar orden ${id}:`, error);
            throw error;
        }
    },

    // Obtener conciliación de orden
    async getConciliacion(idOrden) {
        try {
            const response = await api.get(`/ordenes/conciliacion/${idOrden}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener conciliación de orden ${idOrden}:`, error);
            throw error;
        }
    }
};