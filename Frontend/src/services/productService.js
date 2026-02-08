import api from '../api/axios';

export default {
    // Obtener todos los productos (paginado)
    async getAllProducts(page = 0, size = 10) {
        try {
            const response = await api.get(`/productos?page=${page}&size=${size}`);
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
            // El backend espera PUT /productos (sin ID en URL), el ID va en el body
            const response = await api.put('/productos', productData);
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