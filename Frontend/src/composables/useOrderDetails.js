import { ref, computed } from 'vue';
import { orderService } from '../services/orderService';
import { useToast } from 'primevue/usetoast';
import axios from 'axios'; 

// Ajusta URL base si es distinta en tu orderService, pero aquí la usamos para alarmas tmb
const API_URL = 'http://localhost:8080/api/v1'; 
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useOrderDetails(orderId) {
    const toast = useToast();
    
    // Estados
    const order = ref(null);
    const details = ref([]);
    const alarms = ref([]);
    const loading = ref(true);

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aebbc7' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aebbc7' } }
        },
        elements: { line: { tension: 0.4 }, point: { radius: 0 } }
    };

    // --- CARGA DE DATOS ---
    const fetchAllData = async () => {
        loading.value = true;
        try {
            console.log(`[useOrderDetails] Cargando datos Orden ID: ${orderId}...`);

            const [orderData, detailsData, alarmsData] = await Promise.all([
                orderService.getOrderById(orderId),
                orderService.getDetailsByOrderId(orderId),
                orderService.getAlarmsByOrderId(orderId)
            ]);

            order.value = orderData; // Puede ser objeto directo o venir dentro de data dependiendo del axios setup

            // Manejo robusto de Detalles (Array vs Page)
            if (Array.isArray(detailsData)) details.value = detailsData;
            else if (detailsData?.content) details.value = detailsData.content;
            else details.value = [];

            // Manejo robusto de Alarmas
            if (Array.isArray(alarmsData)) alarms.value = alarmsData;
            else if (alarmsData?.content) alarms.value = alarmsData.content;
            else alarms.value = [];
            
            console.log("[useOrderDetails] Detalles cargados:", details.value.length);
            console.log("[useOrderDetails] Alarmas cargadas:", alarms.value.length);

        } catch (error) {
            console.error("Error cargando datos:", error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron recuperar datos del servidor.' });
        } finally {
            loading.value = false;
        }
    };

    // --- ACCIÓN: ATENDER ALARMA (Bonus) ---
    const attendAlarm = async (alarmaId, observacion = '') => {
        try {
            // Endpoint PUT /{id}/estado?estado=ATENDIDA&observacion=...
            const params = new URLSearchParams();
            params.append('estado', 'ATENDIDA');
            if (observacion) {
                params.append('observacion', observacion);
            }

            await axios.put(`${API_URL}/alarmas/${alarmaId}/estado?${params.toString()}`, {}, { 
                headers: getAuthHeaders() 
            });
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Alarma marcada como atendida' });
            // Recargamos solo las alarmas para actualizar la vista
            const res = await orderService.getAlarmsByOrderId(orderId);
            if(Array.isArray(res)) alarms.value = res;
            else if(res?.content) alarms.value = res.content;
        } catch (error) {
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la alarma' });
        }
    };

    // --- COMPUTADOS PARA GRÁFICOS Y TABLAS ---

    // 1. Detalles ordenados por fecha (CRÍTICO: backend usa fechaUltimoDato)
    const sortedDetails = computed(() => {
        if (!details.value || !Array.isArray(details.value)) return [];
        return [...details.value].sort((a, b) => new Date(a.fechaUltimoDato) - new Date(b.fechaUltimoDato));
    });

    // 2. Labels eje X
    const chartLabels = computed(() => {
        return sortedDetails.value.map(d => {
            const date = new Date(d.fechaUltimoDato);
            // Formato HH:mm:ss
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        });
    });

    // 3. Datasets
    const caudalData = computed(() => ({
        labels: chartLabels.value,
        datasets: [{
            label: 'Caudal',
            data: sortedDetails.value.map(d => d.caudal),
            borderColor: '#4fc3f7',
            borderWidth: 2,
            fill: false
        }]
    }));

    const densidadData = computed(() => ({
        labels: chartLabels.value,
        datasets: [{
            label: 'Densidad',
            data: sortedDetails.value.map(d => d.densidad),
            borderColor: '#ef5350',
            borderWidth: 2,
            fill: false
        }]
    }));

    const tempData = computed(() => ({
        labels: chartLabels.value,
        datasets: [{
            label: 'Temp',
            data: sortedDetails.value.map(d => d.temperatura),
            borderColor: '#64b5f6',
            borderWidth: 2,
            fill: false
        }]
    }));

    // 4. Progreso (Masa Acumulada vs Preset)
    const progressData = computed(() => {
        const preset = order.value?.preset || 1; // Evitar división por 0
        let maxMass = 0;
        
        if (sortedDetails.value.length > 0) {
            // Usamos el último dato recibido como la masa actual
            maxMass = sortedDetails.value[sortedDetails.value.length - 1].masaAcumulada;
        }

        let percentage = Math.round((maxMass / preset) * 100);
        if (percentage > 100) percentage = 100;

        return {
            labels: ['Completado', 'Restante'],
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: ['#ffa726', 'rgba(255,255,255,0.1)'],
                borderWidth: 0,
                cutout: '85%'
            }],
            percentageText: percentage + '%'
        };
    });

    // 5. Tabla Detalles (Formato visual)
    const formattedDetails = computed(() => {
        // Invertimos para ver el más reciente arriba
        return [...sortedDetails.value].reverse().map(d => ({
            id: d.id,
            timestamp: new Date(d.fechaUltimoDato).toLocaleString(), // MAPEO IMPORTANTE
            mass: d.masaAcumulada?.toFixed(2) + ' kg',
            density: d.densidad?.toFixed(3),
            temp: d.temperatura?.toFixed(2),
            flow: d.caudal?.toFixed(2)
        }));
    });

    // 6. Tabla Alarmas
    const formattedAlarms = computed(() => {
        if (!alarms.value) return [];
        return alarms.value.map(a => ({
            id: a.id,
            status: a.estado, // Backend: PENDIENTE | ATENDIDA
            timestamp: new Date(a.fecha).toLocaleString(),
            temp: a.temperaturaRegistrada, // Backend: temperaturaRegistrada
            observacion: a.observacion,
            // Intentamos obtener el nombre del auditor (ajusta según respuesta real del backend)
            auditor: a.usuarioAuditor?.username || a.usuario?.username || null
        }));
    });

    // 7. Alarma Activa (Para mostrar el card naranja grande)
    const activeAlarm = computed(() => {
        if (!alarms.value) return null;
        // Buscamos la primera alarma PENDIENTE
        return alarms.value.find(a => a.estado === 'PENDIENTE');
    });

    return {
        order,
        loading,
        caudalData,
        densidadData,
        tempData,
        progressData,
        formattedDetails,
        formattedAlarms,
        activeAlarm, // Nuevo
        attendAlarm, // Nuevo
        commonChartOptions,
        fetchAllData
    };
}