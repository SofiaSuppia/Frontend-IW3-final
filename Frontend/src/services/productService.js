import api from '../api/axios';

export default {
    // Obtener todos los productos
    async getAllProducts() {
        try {
            const response = await api.get('/productos');
            return response.data;
        } catch (error) {
            console.error("Error al obtener productos:", error);
            throw error;
        }
    },

    // Crear un nuevo producto
    async createProduct(productData) {
        try {
            const response = await api.post('/productos', productData);
            return response.data;
        } catch (error) {
            console.error("Error al crear producto:", error);
            throw error;
        }
    },

    // Actualizar un producto existente
    async updateProduct(id, productData) {
        try {
            const response = await api.put(`/productos/${id}`, productData);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            throw error;
        }
    },

    // Eliminar un producto
    async deleteProduct(id) {
        try {
            const response = await api.delete(`/productos/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            throw error;
        }
    }
};