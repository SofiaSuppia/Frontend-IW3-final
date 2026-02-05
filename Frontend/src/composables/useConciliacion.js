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
        
        // --- 1. DATOS NUMÉRICOS (Mapeo basado en tu captura de consola) ---
        
        // Buscamos "Pesaje inicial" (con espacio) O "pesajeInicial" (código)
        const pInicial = findVal(o, c, ["Pesaje inicial", "pesajeInicial", "pesaje_inicial"]);
        
        const pFinal = findVal(o, c, ["Pesaje final", "pesajeFinal", "pesaje_final"]);
        
        const prodCargado = findVal(o, c, ["Producto cargado", "productoCargado", "masaAcumulada", "masa_acumulada"]);
        
        // El neto y diferencia a veces vienen calculados con nombres largos
        let neto = findVal(o, c, ["Neto por balanza", "netoPorBalanza", "neto"]);
        if (neto === 0) neto = pFinal - pInicial; // Auto-calcular si falla

        let dif = findVal(o, c, ["Diferencia entre balanza y caudalimetro", "diferencia", "diferenciaBalanzaCaudalimetro"]);
        if (dif === 0) dif = neto - prodCargado; // Auto-calcular si falla

        // --- 2. PROMEDIOS ---
        const promTemp = findVal(o, c, ["Promedio de temperatura", "promedioTemperatura"]);
        const promDens = findVal(o, c, ["Promedio de densidad", "promedioDensidad"]);
        const promCaudal = findVal(o, c, ["Promedio de caudal", "promedioCaudal"]);

        // --- 3. PRODUCTO ---
        // El nombre del producto es string, no usamos findVal numérico
        let prodObj = c.producto || o.producto || (o.detalleOrden && o.detalleOrden.producto) || {};
        // A veces el nombre viene plano en la raíz
        const nombrePlano = c["Producto"] || c["producto"] || c["nombreProducto"]; 
        
        const prodNombre = nombrePlano || prodObj.descripcion || prodObj.nombre || prodObj.name || 'Sin Especificar';
        const prodDesc = prodObj.especificaciones || prodObj.descripcion || 'Sin descripción';

        return {
            fechaGeneracion: c.fechaGeneracion || o.fechaFinCarga || new Date().toISOString(),
            
            productoNombre: prodNombre,
            productoDescripcion: prodDesc,

            pesajeInicial: pInicial,
            pesajeFinal: pFinal,
            netoPorBalanza: neto,
            productoCargado: prodCargado,
            diferencia: dif,

            promedioTemperatura: promTemp,
            promedioDensidad: promDens,
            promedioCaudal: promCaudal
        };
    });

    return { conciliacion, loading, fetchConciliacion };
}