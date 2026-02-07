import { ref, computed } from 'vue';
import { orderService } from '../services/orderService';
import { useToast } from 'primevue/usetoast';

export function useConciliacion(orderId) {
    const toast = useToast();
    
    // Almacenamos los datos crudos
    const orderRaw = ref({}); 
    const concRaw = ref({});
    const loading = ref(true);

    const extractData = (response) => {
        if (!response) return {};
        if (response.data && typeof response.data === 'object' && !Array.isArray(response)) {
            return response.data;
        }
        return response;
    };

    const fetchConciliacion = async () => {
        loading.value = true;
        try {
            // 1. Cargar ORDEN
            const orderRes = await orderService.getOrderById(orderId);
            orderRaw.value = extractData(orderRes);

            // 2. Cargar CONCILIACIÓN (Esta es la que trae las claves en español según tu foto)
            try {
                const concRes = await orderService.getConciliacion(orderId);
                concRaw.value = extractData(concRes);
                console.log("ESTRUCTURA REAL RECIBIDA:", concRaw.value); 
            } catch (err) {
                console.warn("Usando respaldo de orden.");
            }

        } catch (error) {
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error cargando datos.' });
        } finally {
            loading.value = false;
        }
    };

    /**
     * Función auxiliar que busca un valor probando múltiples nombres de llave
     * (Prueba: nombreExacto, camelCase, o Keys con espacios según tu consola)
     */
    const findVal = (obj1, obj2, keys) => {
        const fuentes = [obj2, obj1]; // Prioridad: Conciliación, luego Orden
        
        for (const fuente of fuentes) {
            if (!fuente) continue;
            for (const key of keys) {
                if (fuente[key] !== undefined && fuente[key] !== null) {
                    return Number(fuente[key]); // Aseguramos que sea número
                }
            }
        }
        return 0;
    };

    const conciliacion = computed(() => {
        const o = orderRaw.value || {};
        const c = concRaw.value || {}; 
        
        // --- 1. DATOS EXACTOS DESDE EL SERIALIZADOR BACKEND ---
        // Claves exactas: "Pesaje inicial", "Pesaje final", "Producto cargado", "Neto por balanza", "Diferencia entre balanza y caudalímetro"

        const pInicial = findVal(o, c, ["Pesaje inicial"]);
        const pFinal = findVal(o, c, ["Pesaje final"]);
        
        // "Producto cargado" en el backend = orden.getUltimaMasaAcumulada()
        const prodCargado = findVal(o, c, ["Producto cargado"]);
        
        const neto = findVal(o, c, ["Neto por balanza"]);
        const dif = findVal(o, c, ["Diferencia entre balanza y caudalímetro"]);

        // --- 2. PROMEDIOS ---
        const promTemp = findVal(o, c, ["Promedio de temperatura"]);
        const promDens = findVal(o, c, ["Promedio de densidad"]);
        const promCaudal = findVal(o, c, ["Promedio de caudal"]);

        // --- 3. METADATA ---
        // Preset (Objetivo)
        const preset = findVal(o, c, ["preset"]);

        let prodObj = c.producto || o.producto || {};
        const prodNombre = prodObj.nombre || 'Sin Especificar';
        const prodDesc = prodObj.descripcion || '';

        return {
            fechaGeneracion: o.fechaFinCarga || new Date().toISOString(),
            productoNombre: prodNombre,
            productoDescripcion: prodDesc,
            
            preset: preset,
            pesajeInicial: pInicial,
            pesajeFinal: pFinal,
            netoPorBalanza: neto,
            productoCargado: prodCargado, // Esto es el caudalímetro acumulado
            diferencia: dif,

            promedioTemperatura: promTemp,
            promedioDensidad: promDens,
            promedioCaudal: promCaudal
        };
    });

    return { conciliacion, loading, fetchConciliacion };
}