/**
 * ===================================
 * COMPOSABLE: Lógica de Productos
 * ===================================
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import productService from '../services/productService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, INITIAL_PRODUCT } from '../constants/productConstants';

export function useProducts() {
  const router = useRouter();
  
  // ===================================
  // ESTADO
  // ===================================
  const loading = ref(false);
  const isSaving = ref(false);
  const products = ref([]);
  const selectedProduct = ref(null);
  
  // Paginación
  const page = ref(0);
  const pageSize = ref(5);
  const totalRecords = ref(0);

  const formErrors = ref({
    nombre: '',
    umbralTemperatura: ''
  });

  // ===================================
  // MÉTODOS: CRUD
  // ===================================
  
  const loadProducts = async () => {
    loading.value = true;
    try {
      const response = await productService.getAllProducts(page.value, pageSize.value);
      
      let data = [];
      if (response && response.content) {
          data = response.content;
          totalRecords.value = response.totalElements || 0;
      } else if (Array.isArray(response)) {
          data = response;
          totalRecords.value = response.length;
      }

      products.value = data;
      if (products.value.length > 0) {
        console.log('📦 Estructura del primer producto:', JSON.stringify(products.value[0], null, 2));
      }
      console.log('✅ Productos cargados:', products.value.length);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      handleApiError(error, ERROR_MESSAGES.LOAD);
    } finally {
      loading.value = false;
    }
  };

  const onPageChange = (event) => {
    page.value = event.page;
    pageSize.value = event.rows;
    loadProducts();
  };

  const createProduct = async (product) => {
    if (!validateProductForm(product)) return false;
    
    isSaving.value = true;
    try {
      await productService.createProduct(product);
      await loadProducts();
      showSuccessMessage(SUCCESS_MESSAGES.CREATE);
      return true;
    } catch (error) {
      console.error('❌ Error al crear:', error);
      handleApiError(error, ERROR_MESSAGES.CREATE);
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const updateProduct = async (id, product) => {
    if (!validateProductForm(product)) return false;
    
    isSaving.value = true;
    try {
      await productService.updateProduct(id, product);
      await loadProducts();
      showSuccessMessage(SUCCESS_MESSAGES.UPDATE);
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      handleApiError(error, ERROR_MESSAGES.UPDATE);
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const deleteProduct = async (product) => {
    const confirmed = confirm(
      `¿Eliminar "${product.nombre}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    loading.value = true;
    try {
      await productService.deleteProduct(product.id);
      await loadProducts();
      showSuccessMessage(SUCCESS_MESSAGES.DELETE);
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      handleApiError(error, ERROR_MESSAGES.DELETE);
    } finally {
      loading.value = false;
    }
  };

  // ===================================
  // VALIDACIÓN
  // ===================================
  
  const validateProductForm = (product) => {
    let isValid = true;
    clearFormErrors();

    if (!product.nombre?.trim()) {
      formErrors.value.nombre = ERROR_MESSAGES.REQUIRED_FIELD;
      isValid = false;
    }

    if (product.umbralTemperatura === null || product.umbralTemperatura === undefined) {
      formErrors.value.umbralTemperatura = ERROR_MESSAGES.REQUIRED_FIELD;
      isValid = false;
    } else if (isNaN(product.umbralTemperatura)) {
      formErrors.value.umbralTemperatura = ERROR_MESSAGES.INVALID_NUMBER;
      isValid = false;
    }

    return isValid;
  };

  const clearFormErrors = () => {
    formErrors.value = { nombre: '', umbralTemperatura: '' };
  };

  // ===================================
  // MANEJO DE ERRORES
  // ===================================
  
  const handleApiError = (error, defaultMessage) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      const message = status === 403 
        ? ERROR_MESSAGES.SESSION_EXPIRED 
        : ERROR_MESSAGES.UNAUTHORIZED;
      alert(message);
      router.push('/login');
      return;
    }

    const errorMessage = error.response?.data?.message || defaultMessage;
    alert(`❌ ${errorMessage}`);
  };

  const showSuccessMessage = (message) => {
    console.log(`✅ ${message}`);
  };

  // ===================================
  // RETORNO
  // ===================================
  
  return {
    loading,
    isSaving,
    products,
    selectedProduct,
    formErrors,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Paginación
    page,
    pageSize,
    totalRecords,
    onPageChange,
    
    clearFormErrors
  };
}