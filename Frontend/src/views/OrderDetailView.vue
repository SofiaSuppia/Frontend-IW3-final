<!-- filepath: /home/sofia/Escritorio/Frontend IW3 final/Frontend/src/views/OrderDetailView.vue -->
<template>
  <div class="dashboard-layout">
    <Sidebar activePage="orders" />

    <main class="main-content">
      <div v-if="loading" class="flex justify-content-center align-items-center h-full">
         <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #fff"></i>
      </div>

      <div v-else class="content-container">
        
        <!-- TÍTULO Y BOTONES -->
        <div class="page-header mb-4 flex justify-content-between align-items-center">
          <div>
            <h1 class="page-title">Detalle de Orden</h1>
            <h2 class="order-subtitle">Orden N° #{{ order?.id }}</h2>
          </div>
          
          <!-- BOTÓN DE CONCILIACIÓN (Visible siempre para probar) -->
          <Button 
            label="Ver Conciliación" 
            icon="pi pi-file-pdf" 
            class="p-button-Help p-button-raised"
            style="background-color: #E94560; border: none;"
            @click="$router.push(`/conciliacion/${orderId}`)"
          />
        </div>

        <!-- PRIMERA FILA: TARJETAS DE INFORMACIÓN -->
        <div class="grid-layout row-spacing mb-4">
          
          <!-- 1. INFO DE LA ORDEN (ACTUALIZADO) -->
          <div class="card glass-panel info-card">
            
            <!-- Fila 1: Cliente y Camión -->
            <div class="card-row">
              <div class="info-group">
                <label>Cliente:</label> <span>{{ order?.cliente?.razonSocial || order?.camion?.cisterna?.cliente?.razonSocial || 'Sin Nombre' }}</span>
              </div>
              <div class="info-group">
                <label>Camión:</label> <span>{{ order?.camion?.patente || 'N/A' }}</span>
              </div>
            </div>

            <!-- Fila 2: Preset y Estado -->
            <div class="card-row">
              <div class="info-group">
                <label>Preset:</label> <span>{{ order?.preset }} kg</span>
              </div>
              <div class="info-group">
                <label>Estado:</label> 
                <span :class="order?.estado === 2 ? 'text-green-400' : 'text-blue-400'">
                    {{ order?.estado === 2 ? 'Cargada' : 'En Proceso' }}
                </span>
              </div>
            </div>

            <!-- Fila 3: Recepción y Estimada -->
            <div class="card-row">
              <div class="info-group">
                <label>Fecha Recepción:</label> <span>{{ formatDate(order?.fechaRecepcion) }}</span>
              </div>
              <div class="info-group">
                <label>Fecha Estimada:</label> <span>{{ formatDate(order?.fechaPrevistaCarga) }}</span>
              </div>
            </div>

            <!-- Fila 4: Pesaje (Inicial / Final) -->
            <div class="card-row">
              <div class="info-group">
                <label>Pesaje Inicial:</label> <span class="text-indigo-300">{{ formatDate(order?.fechaPesajeInicial) }}</span>
              </div>
              <div class="info-group">
                <label>Pesaje Final:</label> <span class="text-indigo-300">{{ formatDate(order?.fechaPesajeFinal) }}</span>
              </div>
            </div>

            <!-- Fila 5: Carga (Inicio / Fin) -->
            <div class="card-row">
              <div class="info-group">
                <label>Inicio Carga:</label> <span class="text-teal-300">{{ formatDate(order?.fechaInicioCarga) }}</span>
              </div>
              <div class="info-group">
                <label>Fin Carga:</label> <span class="text-teal-300">{{ formatDate(order?.fechaFinCarga) }}</span>
              </div>
            </div>

          </div>

          <!-- 2. PRODUCTO -->
          <div class="card glass-panel product-card">
            <h3 class="card-title">Producto</h3> <!-- Ajusta si tienes el nombre del producto en el objeto orden -->
            <div class="product-detail">
              <label>Temp. Umbral</label>
              <!-- Aquí podrías mostrar la temperatura límite si viene en la Orden o Cisterna -->
              <span class="temp-value">-0.5 °C</span> 
            </div>
          </div>

          <!-- 3. ALERTA (Dinámica) -->
          <!-- Solo se muestra si activeAlarm existe (es decir, hay una PENDIENTE) -->
          <div v-if="activeAlarm" class="card glass-panel alert-card">
            <div class="alert-content">
              <h3 class="alert-title">¡ATENCIÓN!</h3>
              <p class="alert-msg">
                  Alarma ID {{ activeAlarm.id }}: {{ activeAlarm.observacion || 'Temperatura excedida detectada.' }}
                  <br>
                  <small>{{ new Date(activeAlarm.fecha).toLocaleString() }}</small>
              </p>
              <div class="alert-actions">
                <span class="action-link confirm" @click="openAttendDialog(activeAlarm)">CONFIRMAR / ATENDER</span>
              </div>
            </div>
          </div>
          
          <!-- Si no hay alarma activa, mostramos una tarjeta verde de "Todo OK" para mantener el grid -->
          <div v-else class="card glass-panel ok-card flex align-items-center justify-content-center">
             <div class="text-center">
                <i class="pi pi-check-circle text-green-400 text-3xl mb-2"></i>
                <h3 class="m-0 text-white">Sistemas Normales</h3>
                <p class="text-gray-400 text-sm mt-1">No hay alarmas pendientes</p>
             </div>
          </div>

        </div>

        <!-- SEGUNDA FILA: PROGRESO Y TABLA ALARMAS -->
        <div class="grid-layout-secondary row-spacing mb-4">
          
          <!-- PROGRESO CIRCULAR -->
          <div class="card glass-panel chart-card centered">
            <h3 class="card-title-sm">Progreso</h3>
            <div class="chart-wrapper">
               <Chart type="doughnut" :data="progressData" :options="donutOptions" class="w-full h-full" />
               <div class="donut-inner">
                 <span>{{ progressData.percentageText }}</span>
               </div>
            </div>
          </div>

          <!-- ETA (Placeholder) -->
          <div class="card glass-panel chart-card centered">
            <h3 class="card-title-sm">Tiempo estimado</h3>
            <div class="chart-wrapper">
               <Chart type="doughnut" :data="etaData" :options="donutOptions" class="w-full h-full" />
               <div class="donut-inner">
                 <span class="eta-label">ETA</span>
                 <span class="eta-value">--</span>
               </div>
            </div>
          </div>

          <!-- TABLA DE ALARMAS HISTÓRICO -->
          <div class="card glass-panel alarm-table-card">
            <h3 class="card-title-sm">Historial de Alarmas</h3>
            
            <!-- CAMBIO: Quitamos 'paginator' y ':rows'. Agregamos scrollHeight para mantener el tamaño -->
            <DataTable 
              :value="formattedAlarms" 
              class="compact-table" 
              responsiveLayout="scroll" 
              scrollable 
              scrollHeight="200px"
              v-model:expandedRows="expandedRows" 
              dataKey="id"
            >
              <Column expander style="width: 3rem" />
              <Column field="id" header="ID"></Column>
              <Column field="status" header="Estado">
                 <template #body="{ data }">
                    <span :class="data.status === 'PENDIENTE' ? 'status-warning' : 'status-ok'">{{ data.status }}</span>
                 </template>
              </Column>
              <Column field="timestamp" header="Hora"></Column>
              <Column field="temp" header="Temp (°C)"></Column>
              <Column header="Acción">
                 <template #body="{ data }">
                    <Button 
                        v-if="data.status === 'PENDIENTE'" 
                        label="Atender" 
                        icon="pi pi-check-square"
                        class="p-button-xs p-button-warning p-button-outlined" 
                        style="height: 2rem; font-size: 0.8rem;"
                        @click="openAttendDialog(data)" 
                    />
                 </template>
              </Column>

              <template #expansion="{ data }">
                  <div class="p-3" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                      <h4 class="text-white text-sm mb-2">Detalles de atención</h4>
                      <p v-if="data.observacion"><strong>Observación:</strong> {{ data.observacion }}</p>
                      <p v-else class="text-gray-400 font-italic">Sin observaciones.</p>
                      
                      <p v-if="data.auditor" class="mt-2 text-xs text-gray-400">
                          Atendido por: <span class="text-white">{{ data.auditor }}</span>
                      </p>
                  </div>
              </template>
            </DataTable>
          </div>
        </div>

        <!-- TERCERA FILA: TABLA DETALLES Y GRÁFICO DENSIDAD -->
        <div class="grid-graphs row-spacing mb-4">
          <div class="card glass-panel detail-table-card">
              <h3 class="card-title-sm">Detalles de Carga</h3>
              <DataTable :value="formattedDetails" class="compact-table" scrollable scrollHeight="300px">
                  <Column field="timestamp" header="Hora"></Column>
                  <Column field="mass" header="Masa (kg)"></Column>
                  <Column field="density" header="Densidad"></Column>
                  <Column field="temp" header="Temp. (°C)">
                      <template #body="{ data }">
                          <span :style="{ color: parseFloat(data.temp) > 0 ? '#E94560' : '#4DB6AC' }">{{ data.temp }}</span>
                      </template>
                  </Column>
                  <Column field="flow" header="Caudal"></Column>
              </DataTable>
          </div>

          <div class="card glass-panel graph-card">
             <h3 class="card-title-sm">Densidad (kg/m³)</h3>
             <Chart type="line" :data="densidadData" :options="commonChartOptions" class="h-15rem" />
          </div>
        </div>

        <!-- CUARTA FILA: GRÁFICOS CAUDAL Y TEMPERATURA -->
        <div class="grid-layout-secondary row-spacing mb-4">
            <div class="card glass-panel graph-card" style="grid-column: span 2;">
               <h3 class="card-title-sm">Caudal (kg/h)</h3>
               <Chart type="line" :data="caudalData" :options="commonChartOptions" class="h-15rem" />
            </div>

            <div class="card glass-panel graph-card">
                <h3 class="card-title-sm">Temperatura (°C)</h3>
                <Chart type="line" :data="tempData" :options="commonChartOptions" class="h-15rem" />
            </div>
        </div>

        <!-- BOTÓN: VER CONCILIACIÓN -->
        <div class="flex justify-content-end mb-4">
          <!-- Solo mostrar si la orden esta finalizada (estado 2) -->
          <Button 
              v-if="order?.estado === 2" 
              label="Ver Conciliación" 
              icon="pi pi-file" 
              class="p-button-help" 
              @click="$router.push(`/conciliacion/${orderId}`)"
          />
        </div>

        <!-- DIALOGO DE ATENCION DE ALARMA -->
        <Dialog 
            v-model:visible="showAlarmDialog" 
            header="Atender Alarma" 
            :modal="true" 
            :draggable="false"
            :style="{ width: '400px' }"
            class="custom-dialog-dark"
        >
            <div class="field">
                <label for="observation" class="block mb-2 text-white">Observación (Opcional)</label>
                <Textarea 
                    id="observation" 
                    v-model="alarmObservation" 
                    rows="4" 
                    class="w-full bg-bluegray-900 text-white" 
                    placeholder="Ingrese detalles de la acción tomada..."
                    autoResize 
                />
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" class="p-button-text text-white" @click="showAlarmDialog = false" />
                <Button label="Confirmar" icon="pi pi-check" class="p-button-success" @click="confirmAttendAlarm" />
            </template>
        </Dialog>

      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderDetails } from '../composables/useOrderDetails';
import Sidebar from '../components/Sidebar.vue';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';

const route = useRoute();
const orderId = route.params.id; // Tomamos ID de la URL

// Usamos el composable
const { 
    order, 
    loading, 
    fetchAllData, 
    caudalData, 
    densidadData, 
    tempData, 
    progressData, 
    formattedDetails, 
    formattedAlarms,
    activeAlarm,
    attendAlarm,
    commonChartOptions 
} = useOrderDetails(orderId);

const donutOptions = {
    responsive: true,
    cutout: '80%',
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
};

// --- DIALOGO ALARMA ---
const showAlarmDialog = ref(false);
const selectedAlarmId = ref(null);
const alarmObservation = ref('');

const openAttendDialog = (alarm) => {
    selectedAlarmId.value = alarm.id;
    alarmObservation.value = '';
    showAlarmDialog.value = true;
};

const confirmAttendAlarm = async () => {
    if (selectedAlarmId.value) {
        await attendAlarm(selectedAlarmId.value, alarmObservation.value);
        showAlarmDialog.value = false;
    }
};

// Datos estáticos para ETA (ya que no lo calculamos en backend aún)
const etaData = ref({
    labels: ['Transcurrido', 'Restante'],
    datasets: [{ data: [40, 60], backgroundColor: ['#ab47bc', 'rgba(255,255,255,0.1)'], borderWidth: 0, cutout: '85%' }]
});

// --- ELIMINADO handleAttend antiguo ---


const expandedRows = ref({}); // Para funcionalidad de expandir fila

// NUEVO: Función auxiliar para formatear fechas
const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Formato corto: dd/mm/yyyy hh:mm
    return new Date(dateString).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

onMounted(() => {
    fetchAllData();
});
</script>

<style scoped>
/* AGREGAR ESTO A TUS ESTILOS EXISTENTES PARA COLORES DE TEXTO ADICIONALES */
.text-indigo-300 { color: #7986cb; }
.text-teal-300 { color: #4db6ac; }

/* LOS MISMOS ESTILOS DE ANTES */
.dashboard-layout { display: flex; height: 100vh; background-color: #16213E; font-family: 'Segoe UI', sans-serif; overflow: hidden; }
.main-content { flex: 1; padding: 2rem; overflow-y: auto; background: linear-gradient(rgba(22, 33, 62, 0.8), rgba(22, 33, 62, 0.9)); }
.content-container { max-width: 1600px; margin: 0 auto; }
.page-title { color: #F1F6F9; font-size: 1.5rem; margin: 0; font-weight: 600; }
.order-subtitle { color: #aebbc7; font-size: 1.8rem; margin: 0; font-weight: 300; margin-top: 0.5rem; }

.grid-layout { display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 1.5rem; }
.grid-layout-secondary { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 1.5rem; }
.grid-graphs { display: grid; grid-template-columns: 1.02fr 1fr; gap: 1.5rem; }
.row-spacing { margin-bottom: 3rem; }

.glass-panel {
    background: #0F3460;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    color: #F1F6F9;
}

/* Info Cards Updated for density */
.info-card { display: flex; flex-direction: column; gap: 0.6rem; } /* Reducido un poco el gap para que entre todo */
.card-row { display: flex; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.4rem; }
.card-row:last-child { border-bottom: none; /* Quitar borde al último */ }
.info-group { display: flex; flex-direction: column; }
.info-group label { font-size: 0.70rem; color: #aebbc7; text-transform: uppercase; margin-bottom: 2px; }
.info-group span { font-size: 0.9rem; } /* Asegurar tamaño legible */

/* Alert Card */
.alert-card { border-left: 5px solid #ffa726 !important; background: rgba(255, 167, 38, 0.05); }
.ok-card { border-left: 5px solid #4DB6AC !important; background: rgba(77, 182, 172, 0.05); }
.alert-title { color: #F1F6F9; margin: 0 0 0.5rem 0; font-weight: 700; letter-spacing: 0.5px; }
.alert-msg { font-size: 0.85rem; color: #aebbc7; line-height: 1.4; margin-bottom: 1.5rem; }
.action-link { font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.confirm { color: #5c6bc0; }

/* Tablas */
.status-warning { color: #ffa726; font-weight: 700; }
.status-ok { color: #4DB6AC; font-weight: 700; }
:deep(.compact-table .p-datatable-thead > tr > th) { background: transparent !important; color: #aebbc7 !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; font-size: 0.8rem; padding: 0.8rem; }
:deep(.compact-table .p-datatable-tbody > tr > td) { background: transparent !important; color: #F1F6F9 !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; padding: 0.8rem; font-size: 0.85rem; }

/* Donut */
.chart-card { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; min-height: 200px; }
.chart-wrapper { width: 140px; height: 140px; position: relative; }
.donut-inner { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
.donut-inner span { display: block; font-size: 1.5rem; font-weight: bold; color: #F1F6F9; }
.eta-label { font-size: 0.8rem !important; color: #ab47bc !important; margin-bottom: -5px; } 
.eta-value { font-size: 1.2rem !important; }

/* Charts */
.h-15rem { height: 15rem; }
.card-title-sm { align-self: flex-start; margin: 0 0 1rem 0; font-size: 0.9rem; color: #F1F6F9; }

@media (max-width: 1200px) {
  .grid-layout, .grid-layout-secondary, .grid-graphs { grid-template-columns: 1fr; }
  .detail-table-card { grid-column: span 1 !important; }
}
</style>