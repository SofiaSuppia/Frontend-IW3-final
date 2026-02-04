import { ref } from 'vue';
import { orderService } from '../services/orderService';
import { useToast } from 'primevue/usetoast';

export function useConciliacion(orderId) {
    const toast = useToast();
    const conciliacion = ref(null);
    const loading = ref(true);

    // Datos por defecto (para que la estructura se vea aunque cargue)
    const emptyConciliacion = {
        producto: { nombre: '-', descripcion: '-' }, // Ajustar segun tu backend
        pesajeInicial: 0,
        pesajeFinal: 0,
        productoCargado: 0,
        netoPorBalanza: 0,
        diferenciaBalanzaCaudalimetro: 0,
        promedioTemperatura: 0,
        promedioDensidad: 0,
        promedioCaudal: 0,
        fechaGeneracion: new Date().toISOString()
    };

    const fetchConciliacion = async () => {
        loading.value = true;
        try {
            // Llamada al endpoint: /ordenes/conciliacion/{id}
            const data = await orderService.getConciliacion(orderId);
            conciliacion.value = data;
        } catch (error) {
            console.error("Error cargando conciliación:", error);
            conciliacion.value = emptyConciliacion;
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la conciliación.' });
        } finally {
            loading.value = false;
        }
    };

    return {
        conciliacion,
        loading,
        fetchConciliacion
    };
}