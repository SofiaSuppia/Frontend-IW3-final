import { ref, computed, triggerRef } from 'vue';
import { orderService } from '../services/orderService';
import { webSocketService } from '../services/websocketService';
import { useToast } from 'primevue/usetoast';
import axios from 'axios'; 

const API_URL = 'http://localhost:8080/api/v1'; 
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useOrderDetails(orderId) {
    const toast = useToast();
    
    // Estados principales
    const order = ref(null);
    const details = ref([]); // Histórico/Tabla (Fuente: API cada 5s)
    const alarms = ref([]);
    const loading = ref(true);

    // Estado secundario para Gráficos y Widgets (Fuente: API + WS cada ~1s)
    const realtimeDetails = ref([]); 

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, 
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aebbc7' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aebbc7' } }
        },
        elements: { line: { tension: 0.4 }, point: { radius: 0 } }
    };

    // --- CARGA DE DATOS HISTÓRICOS ---
    const fetchAllData = async (isPolling = false) => {
        if (!isPolling) loading.value = true;
        try {
            if (!isPolling) console.log(`[useOrderDetails] Cargando datos Orden ID: ${orderId}...`);

            const [orderData, detailsData, alarmsData] = await Promise.all([
                orderService.getOrderById(orderId),
                orderService.getDetailsByOrderId(orderId),
                orderService.getAlarmsByOrderId(orderId)
            ]);

            order.value = orderData; 

            // Manejo robusto de Detalles
            let loadedDetails = [];
            if (Array.isArray(detailsData)) loadedDetails = detailsData;
            else if (detailsData?.content) loadedDetails = detailsData.content;

            // Ordenamos por fecha
            loadedDetails = loadedDetails.sort((a, b) => new Date(a.fechaUltimoDato) - new Date(b.fechaUltimoDato));

            details.value = loadedDetails; // Para la tabla

            // Inicializamos realtimeDetails solo la primera vez o si está vacío
            if (!isPolling || realtimeDetails.value.length === 0) {
                 realtimeDetails.value = [...loadedDetails];
            }

            // Manejo de Alarmas
            if (Array.isArray(alarmsData)) alarms.value = alarmsData;
            else if (alarmsData?.content) alarms.value = alarmsData.content;
            else alarms.value = [];
            
            if (!isPolling) {
                console.log("[useOrderDetails] Histórico cargado:", details.value.length);
            }

        } catch (error) {
            console.error("Error cargando datos:", error);
            if (!isPolling) toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron recuperar datos del servidor.' });
        } finally {
            if (!isPolling) loading.value = false;
        }
    };

    // --- WEBSOCKET & POLLING ---
    let pollingInterval = null;
    let wsSubscription = null;
    let timerInterval = null; // Para el cronómetro visual local

    const startUpdates = (pollingTime = 5000) => {
        // 1. Carga inicial
        fetchAllData(false);

        // 2. Polling para tabla y alarmas (Backup y consistencia BD)
        if (!pollingInterval) {
            pollingInterval = setInterval(() => {
                fetchAllData(true);
            }, pollingTime);
        }
        
        // 3. Iniciar cronómetro visual (segundero)
        startTimer();

        // 4. Conexión WebSocket para Gráficos
        const numericOrderId = Number(orderId);
        
        // Conexión segura usando el servicio
        webSocketService.connect('http://localhost:8080/ws', () => {
            console.log("Suscribiendo a /topic/masa...");
            
            wsSubscription = webSocketService.subscribe('/topic/masa', (newDetail) => {
                // --- EXTRACTOR DE ID ROBUSTO ---
                let incomingOrderId = null;
                
                // Intento 1: Objeto orden anidado
                if (newDetail.orden && typeof newDetail.orden === 'object') {
                    incomingOrderId = newDetail.orden.id;
                } 
                // Intento 2: Propiedad directa orden (si es ID)
                else if (newDetail.orden) {
                    incomingOrderId = newDetail.orden;
                }
                // Intento 3: Nombres comunes alternativos en DTOs
                else if (newDetail.idOrden) {
                    incomingOrderId = newDetail.idOrden;
                }
                else if (newDetail.ordenId) {
                    incomingOrderId = newDetail.ordenId;
                }

                // --- FIX FINAL PARA ORDEN === NULL (Caso BackEnd Mal Formado) ---
                if (!incomingOrderId) { 
                    incomingOrderId = numericOrderId; // FORCE MATCH
                }

                // Debug matching
                const isMatch = incomingOrderId && Number(incomingOrderId) === numericOrderId;
                
                if (isMatch) {
                    
                    // Verificamos unicidad por ID o Timestamp
                    const exists = realtimeDetails.value.some(d => 
                       d.id === newDetail.id || 
                       new Date(d.fechaUltimoDato).getTime() === new Date(newDetail.fechaUltimoDato || newDetail.fecha).getTime()
                    );
                    
                    if (!exists) {
                        // --- NORMALIZACIÓN DE DATOS ---
                        const normalizedDetail = {
                            id: newDetail.id || Date.now(),
                            masaAcumulada: newDetail.masaAcumulada ?? newDetail.masa ?? 0,
                            densidad: newDetail.densidad ?? 0,
                            temperatura: newDetail.temperatura ?? newDetail.temperaturaRegistrada ?? 0,
                            caudal: newDetail.caudal ?? 0,
                            fechaUltimoDato: newDetail.fechaUltimoDato ?? newDetail.fecha ?? newDetail.timestamp ?? new Date().toISOString()
                        };

                        // Agregamos al array de tiempo real (FORZANDO REACTIVIDAD con Spread Operator)
                        const newArray = [...realtimeDetails.value, normalizedDetail];
                        realtimeDetails.value = newArray;
                        
                        // Opcional: Si el array crece demasiado (>2000), cortar el principio
                        if (realtimeDetails.value.length > 2000) {
                             realtimeDetails.value = realtimeDetails.value.slice(1);
                        }

                        // 4. Disparo manual
                        triggerRef(realtimeDetails);
                    }
                }
            });
        });
    };

    const stopUpdates = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (wsSubscription) {
            // El servicio maneja el unsubscribe interno si quisieramos, pero aquí cortamos conexión
            // En una app real, quizas mantienes conexión y solo desuscribes el topic
            if (wsSubscription.unsubscribe) wsSubscription.unsubscribe();
            wsSubscription = null;
        }
        webSocketService.disconnect();
    };


    // --- COMPUTADOS (AHORA USAN chartDetails para Gráficos) ---

    // Array principal para gráficos: Ordenado por fecha
    const chartDetails = computed(() => {
        return [...realtimeDetails.value].sort((a, b) => new Date(a.fechaUltimoDato) - new Date(b.fechaUltimoDato));
    });

    const chartLabels = computed(() => {
        return chartDetails.value.map(d => {
            return new Date(d.fechaUltimoDato).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        });
    });

    const caudalData = computed(() => ({
        labels: chartLabels.value,
        datasets: [{
            label: 'Caudal',
            data: chartDetails.value.map(d => d.caudal),
            borderColor: '#4fc3f7', borderWidth: 2, fill: false
        }]
    }));

    const densidadData = computed(() => ({
        labels: chartLabels.value,
        datasets: [{
            label: 'Densidad',
            data: chartDetails.value.map(d => d.densidad),
            borderColor: '#ef5350', borderWidth: 2, fill: false
        }]
    }));

    const tempData = computed(() => ({
        labels: chartLabels.value,
        datasets: [{
            label: 'Temp',
            data: chartDetails.value.map(d => d.temperatura),
            borderColor: '#64b5f6', borderWidth: 2, fill: false
        }]
    }));

    // 2. Progreso y ETA (Basados en el dato más reciente de realtime)
    const progressData = computed(() => {
        const preset = order.value?.preset || 0; 
        
        // FIX: Si la orden ya está finalizada (estado 2) O
        // Si la masa acumulada está MUY CERCA del preset (95% o más) pero ya no hay flujo
        // forzamos el 100% visual para evitar "96%" eterno.
        
        let currentMass = 0;
        let currentFlow = 0;
        if (chartDetails.value.length > 0) {
            const last = chartDetails.value[chartDetails.value.length - 1];
            currentMass = last.masaAcumulada || 0;
            currentFlow = last.caudal || 0;
        }

        const isFinishedState = order.value?.estado === 'FINALIZADA';
        // Si está casi lleno (>98%) y el flujo es básicamente nulo (<10), asumimos que terminó
        const isPhysicallyFinished = (preset > 0) && (currentMass / preset > 0.98) && (currentFlow < 10);

        if (isFinishedState || isPhysicallyFinished) {
             return {
                labels: ['Completado', ''],
                datasets: [{ data: [100, 0], backgroundColor: ['#ffa726', 'rgba(255,255,255,0.1)'], borderWidth: 0, cutout: '85%' }],
                percentageText: '100%'
            };
        }

        // BUGFIX 100%: Si preset es 0 (no definido), no calcular para evitar 100% erróneo o NaN
        if (!preset || preset <= 0) {
             return {
                labels: ['Pendiente', ''],
                datasets: [{ data: [0, 100], backgroundColor: ['#ffa726', 'rgba(255,255,255,0.1)'], borderWidth: 0, cutout: '85%' }],
                percentageText: '0%'
            };
        }

        let percentage = Math.round((currentMass / preset) * 100);
        
        // Tope visual 100% (aunque físicamente se pase un poquito)
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

    const calculatedEta = computed(() => {
        // FIX: Si ya finalizó -> ETA Cero
        if (order.value?.estado === 'FINALIZADA') return { text: 'Finalizada', value: 0 };
        
        if (!order.value || chartDetails.value.length === 0) return { text: '--', value: 0 };
        
        const lastDetail = chartDetails.value[chartDetails.value.length - 1]; 
        const currentMass = lastDetail.masaAcumulada || 0;
        const currentFlow = lastDetail.caudal || 0; 
        const preset = order.value.preset || 0;

        // Validaciones básicas
        if (currentMass >= preset) return { text: 'Completando...', value: 0 };
        
        // Detección de "Dato Viejo"
        // Si el último dato tiene más de 60 segundos de antigüedad, no podemos confiar en el caudal actual
        const lastTime = new Date(lastDetail.fechaUltimoDato).getTime();
        const now = Date.now();
        // Solo aplicar esta lógica si NO venimos del WS recién (damos margen de 30s)
        if ((now - lastTime) > 60000) {
            return { text: '-- (Sin flujo reciente)', value: 0 };
        }

        if (currentFlow <= 10) return { text: 'En espera...', value: 0 }; 

        // SUAVIZADO DE ETA: Usar promedio de últimos 5 caudales para evitar saltos locos
        // Recogemos los últimos 5 puntos
        const lastPoints = chartDetails.value.slice(-5); 
        // Filtramos solo los que tengan caudal válido positivo
        const flowSamples = lastPoints.map(d => d.caudal).filter(c => c > 10);
        // Promedio simple
        const averageFlow = flowSamples.reduce((a, b) => a + b, 0) / (flowSamples.length || 1);
        
        // Usar promedio si hay muestras, si no el actual
        const effectiveFlow = averageFlow > 0 ? averageFlow : currentFlow;

        const remainingMass = Math.max(0, preset - currentMass);
        const hoursRemaining = remainingMass / effectiveFlow;
        const totalMinutesRemaining = hoursRemaining * 60; // Total en minutos con decimales

        let text = '';
        if (totalMinutesRemaining >= 60) {
            const h = Math.floor(totalMinutesRemaining / 60);
            const m = Math.round(totalMinutesRemaining % 60);
            text = `${h}h ${m}m`;
        } else if (totalMinutesRemaining >= 1) {
            text = `${Math.round(totalMinutesRemaining)} min`;
        } else {
             // Si queda menos de 1 minuto, mostramos segundos
            const seconds = Math.round(totalMinutesRemaining * 60);
            text = `${seconds} seg`;
        }

        return { text, value: Math.round(totalMinutesRemaining) }; 
    });

    // 3. Tiempo Transcurrido (Independiente de datos, depende del reloj)
    const elapsedTime = ref('00:00:00');
    
    const startTimer = () => {
       if (timerInterval) clearInterval(timerInterval);
       timerInterval = setInterval(() => {
          if (!order.value?.fechaInicioCarga) {
             // Si no hay fecha inicio, intentamos ver si hay primer detalle
             if (chartDetails.value.length > 0) {
                 // Fallback visual: Primer detalle como inicio
                 // const start = new Date(chartDetails.value[0].fechaUltimoDato).getTime();
                 // ... lógica alternativa si hiciera falta ...
             }
             elapsedTime.value = '00:00:00';
             return;
          }
          const start = new Date(order.value.fechaInicioCarga).getTime();
          const end = order.value.fechaFinCarga ? new Date(order.value.fechaFinCarga).getTime() : Date.now();
          const diffMs = Math.max(0, end - start);
          
          const hours = Math.floor(diffMs / 3600000);
          const minutes = Math.floor((diffMs % 3600000) / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);
          
          elapsedTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
       }, 1000);
    };

    const etaData = computed(() => {
        // Estado FINALIZADA -> Lleno (Violeta)
        if (order.value?.estado === 'FINALIZADA') {
             return {
                labels: ['Estimado', ''],
                datasets: [{ 
                    data: [100, 0], 
                    backgroundColor: ['#ab47bc', 'rgba(255,255,255,0.1)'], 
                    borderWidth: 0, 
                    cutout: '85%' 
                }]
            };
        }

        // Si el texto del ETA calculado indica error o espera -> Vacío Visualmente (Gris)
        const text = calculatedEta.value.text;
        if (text.includes('--') || text.includes('Sin flujo') || text.includes('En espera')) {
             return {
                labels: ['Estimado', ''],
                datasets: [{ 
                    data: [0, 100], 
                    backgroundColor: ['#ab47bc', 'rgba(255,255,255,0.1)'], 
                    borderWidth: 0, 
                    cutout: '85%' 
                }]
            };
        }

        // Caso normal: Lleno (Violeta)
        return {
            labels: ['Estimado', ''],
            datasets: [{ 
                data: [100, 0], 
                backgroundColor: ['#ab47bc', 'rgba(255,255,255,0.1)'], 
                borderWidth: 0, 
                cutout: '85%' 
            }]
        };
    });

    // --- Tabla de Detalles (Usa 'details' histórico) ---
    const formattedDetails = computed(() => {
        return [...details.value].reverse().map(d => ({
            id: d.id,
            timestamp: new Date(d.fechaUltimoDato).toLocaleString(), 
            mass: d.masaAcumulada?.toFixed(2) + ' kg',
            density: d.densidad?.toFixed(3),
            temp: d.temperatura?.toFixed(2),
            flow: d.caudal?.toFixed(2)
        }));
    });

    const formattedAlarms = computed(() => {
        if (!alarms.value) return [];
        return alarms.value.map(a => ({
            id: a.id,
            status: a.estado, 
            timestamp: new Date(a.fecha).toLocaleString(),
            temp: a.temperaturaRegistrada,
            observacion: a.observacion,
            auditor: a.usuarioAuditor?.username || a.usuario?.username || null
        }));
    });

    const activeAlarm = computed(() => {
        if (!alarms.value) return null;
        return alarms.value.find(a => a.estado === 'PENDIENTE');
    });

    // --- ACCIÓN: ATENDER ALARMA ---
    const attendAlarm = async (alarmaId, observacion = '') => {
        try {
            const params = new URLSearchParams();
            params.append('estado', 'ATENDIDA');
            if (observacion) params.append('observacion', observacion);

            await axios.put(`${API_URL}/alarmas/${alarmaId}/estado?${params.toString()}`, {}, { 
                headers: getAuthHeaders() 
            });
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Alarma atendida' });
            
            const res = await orderService.getAlarmsByOrderId(orderId);
            if(Array.isArray(res)) alarms.value = res;
            else if(res?.content) alarms.value = res.content;
        } catch (error) {
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Falló actualización' });
        }
    };
    // --- NUEVO: Información del Producto ---
    const productInfo = computed(() => {
        const o = order.value || {};
        
        // 1. Buscar objeto Producto
        const prod = (o.detalleOrden && o.detalleOrden.producto) || 
                     o.producto || 
                     (o.camion && o.camion.cisterna ? o.camion.cisterna.producto : {}) || 
                     {};

        // 2. Buscar objeto Cisterna (A veces el límite está en el tanque, no en el producto)
        const cisterna = (o.camion && o.camion.cisterna) || {};

        console.log("DEBUG PRODUCTO:", prod); // Mira la consola (F12) para ver las claves reales
        console.log("DEBUG CISTERNA:", cisterna);

        // 3. Buscar el valor de temperatura (Prioridad: Producto -> Cisterna -> 0)
        // Probamos todas las variantes posibles de nombre
        const val = prod.temperaturaLimite || 
                    prod.tempLimite || 
                    prod.limitTemperature ||
                    prod.umbralTemperatura ||
                    cisterna.temperaturaLimite || // Límite físico del tanque
                    cisterna.tempLimite ||
                    0;

        return {
            nombre: prod.nombre || prod.nombre || prod.name || 'Sin especificar',
            tempUmbral: Number(val) // Convertimos a número por si viene como string "35.4"
        };
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
        activeAlarm, 
        attendAlarm,
        calculatedEta, 
        elapsedTime,   
        etaData,       
        activeAlarm, // Nuevo
        productInfo, // Nuevo
        attendAlarm, // Nuevo
        commonChartOptions,
        fetchAllData,
        startPolling: startUpdates, // Exponemos con el nombre compatible
        stopPolling: stopUpdates
    };
}