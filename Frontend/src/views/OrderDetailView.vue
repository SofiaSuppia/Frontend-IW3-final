<!-- filepath: /home/sofia/Escritorio/Frontend IW3 final/Frontend/src/views/OrderDetailView.vue -->
<template>
  <div class="dashboard-layout">
    <Sidebar activePage="orders" /> <!-- Asumiendo que tienes un Sidebar -->

    <main class="main-content">
      <div class="content-container">
        
        <!-- TÍTULO -->
        <div class="page-header mb-4">
          <h1 class="page-title">Detalle de Orden</h1>
          <h2 class="order-subtitle">Orden N° #35</h2>
        </div>

        <!-- PRIMERA FILA: TARJETAS DE INFORMACIÓN -->
        <div class="grid-layout row-spacing mb-4">
          
          <!-- 1. INFO DE LA ORDEN -->
          <div class="card glass-panel info-card">
            <div class="card-row">
              <div class="info-group">
                <label>Número de Orden:</label> <span>35</span>
              </div>
              <div class="info-group">
                <label>Cliente:</label> <span>Shell</span>
              </div>
            </div>
            <div class="card-row">
              <div class="info-group">
                <label>Camión:</label> <span>GHI-7890</span>
              </div>
              <div class="info-group">
                <label>Preset:</label> <span>18270 kg</span>
              </div>
            </div>
            <div class="card-row">
              <div class="info-group">
                <label>Fecha Recepción:</label> <span>18/12/2024 15:21</span>
              </div>
              <div class="info-group">
                <label>Fecha Pesaje Inicial:</label> <span>18/12/2024 15:24</span>
              </div>
            </div>
            <div class="card-row">
              <div class="info-group">
                <label>Inicio de Carga:</label> <span>18/12/2024 15:28</span>
              </div>
              <div class="info-group">
                <label>Fin de Carga:</label> <span>18/12/2024 15:30</span>
              </div>
            </div>
             <div class="card-actions mt-3">
                <Button label="PESAJE INICIAL" class="p-button-danger p-button-sm custom-badge-btn" />
                <span class="timer-badge">Tiempo Transcurrido: 00:02:08</span>
             </div>
          </div>

          <!-- 2. PRODUCTO -->
          <div class="card glass-panel product-card">
            <h3 class="card-title">Butano</h3>
            <div class="product-detail">
              <label>Temperatura Umbral</label>
              <span class="temp-value">-0.5 °C</span>
            </div>
          </div>

          <!-- 3. ALERTA (Borde Naranja) -->
          <div class="card glass-panel alert-card">
            <div class="alert-content">
              <h3 class="alert-title">¡ATENCIÓN!</h3>
              <p class="alert-msg">Revisa los detalles de la alarma con ID 28 producida el 18 de diciembre de 2024...</p>
              <div class="alert-actions">
                <span class="action-link confirm">CONFIRMAR</span>
                <span class="action-link report">REPORTAR PROBLEMA</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SEGUNDA FILA: PROGRESO Y ALARMAS -->
        <div class="grid-layout-secondary row-spacing mb-4">
          
          <!-- PROGRESO CIRCULAR 1 -->
          <div class="card glass-panel chart-card centered">
            <h3 class="card-title-sm">Progreso de Carga</h3>
            <div class="chart-wrapper">
               <Chart type="doughnut" :data="progressData" :options="chartOptionsDonut" class="w-full h-full" />
               <div class="donut-inner">
                 <span>75%</span>
               </div>
            </div>
          </div>

          <!-- PROGRESO CIRCULAR 2 (ETA) -->
          <div class="card glass-panel chart-card centered">
            <h3 class="card-title-sm">Tiempo estimado</h3>
            <div class="chart-wrapper">
               <Chart type="doughnut" :data="etaData" :options="chartOptionsDonut" class="w-full h-full" />
               <div class="donut-inner">
                 <span class="eta-label">ETA</span>
                 <span class="eta-value">3h 39m</span>
               </div>
            </div>
          </div>

          <!-- TABLA DE ALARMAS -->
          <div class="card glass-panel alarm-table-card">
            <h3 class="card-title-sm">Alarmas de Temperatura - 18 de diciembre de 2024</h3>
            <DataTable :value="alarms" class="compact-table" responsiveLayout="scroll">
              <Column field="id" header="ID"></Column>
              <Column field="status" header="Estado">
                 <template #body="slotProps">
                    <span class="status-warning">{{ slotProps.data.status }}</span>
                 </template>
              </Column>
              <Column field="timestamp" header="Timestamp"></Column>
              <Column field="temp" header="Temperatura (°C)"></Column>
            </DataTable>
          </div>
        </div>

        <!-- TERCERA FILA: AHORA ACÁ VA LA TABLA (Más ancha) Y EL GRÁFICO DENSIDAD -->
        <div class="grid-graphs row-spacing mb-4">
          
          <!-- 1. TABLA (Movida aquí desde abajo) -->
          <!-- Le quitamos el style inline porque ahora el grid lo manejará -->
          <div class="card glass-panel detail-table-card">
              <h3 class="card-title-sm">Detalles de Carga</h3>
              <DataTable :value="cargaDetails" class="compact-table" scrollable scrollHeight="300px">
                  <Column field="timestamp" header="Timestamp"></Column>
                  <Column field="mass" header="Masa Acum."></Column>
                  <Column field="density" header="Densidad"></Column>
                  <Column field="temp" header="Temp.">
                      <template #body="{ data }">
                          <span :style="{ color: data.temp > 0 ? '#E94560' : '#4DB6AC' }">{{ data.temp }} °C</span>
                      </template>
                  </Column>
                  <Column field="flow" header="Caudal"></Column>
              </DataTable>
          </div>

          <!-- 2. GRÁFICO DENSIDAD (Se queda donde estaba) -->
          <div class="card glass-panel graph-card">
             <h3 class="card-title-sm">Densidad (kg/m³)</h3>
             <Chart type="line" :data="densidadData" :options="lineOptions" class="h-15rem" />
          </div>

        </div>

        <!-- CUARTA FILA: AHORA ACÁ VA EL GRÁFICO CAUDAL Y LA TEMPERATURA -->
        <div class="grid-layout-secondary row-spacing mb-4">
            
            <!-- 1. GRÁFICO CAUDAL (Movido aquí desde arriba) -->
            <!-- Le agregamos 'grid-column: span 2' para que ocupe el espacio ancho que tenía la tabla antes -->
            <div class="card glass-panel graph-card" style="grid-column: span 2;">
               <h3 class="card-title-sm">Caudal (kg/h)</h3>
               <Chart type="line" :data="caudalData" :options="lineOptions" class="h-15rem" />
            </div>

            <!-- 2. GRÁFICO TEMPERATURA (Se queda donde estaba) -->
            <div class="card glass-panel graph-card">
                <h3 class="card-title-sm">Temperatura</h3>
                <Chart type="line" :data="tempData" :options="lineOptions" class="h-15rem" />
            </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '../components/Sidebar.vue'; // Ajusta la ruta a tu sidebar
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

// --- DATOS MOCKUP (SIMULADOS) ---

const alarms = ref([
  { id: 28, status: 'PENDIENTE', timestamp: '18/12/2024 15:29:54', temp: -0.37 }
]);

const cargaDetails = ref([
    { timestamp: '18/12/2024 15:31:24', mass: '8891.4 kg', density: '0.626', temp: -1.26, flow: '2981.69' },
    { timestamp: '18/12/2024 15:31:19', mass: '8586.9 kg', density: '0.634', temp: -1.86, flow: '2929' },
    { timestamp: '18/12/2024 15:31:14', mass: '8282.4 kg', density: '0.638', temp: 0.17, flow: '2916.09' },
    { timestamp: '18/12/2024 15:31:08', mass: '7977.9 kg', density: '0.608', temp: -1.61, flow: '3032' },
    { timestamp: '18/12/2024 15:31:03', mass: '7673.4 kg', density: '0.615', temp: -1.37, flow: '2909.7' },
]);

// --- CONFIGURACIÓN GRÁFICOS ---

// Estilo común de líneas
const commonDataset = {
    tension: 0.4,
    pointRadius: 0,
    borderWidth: 2,
    fill: false
};

const labels = ['15:31:20', '15:31:30', '15:31:40', '15:31:50', '15:32:00', '15:32:10'];

// Datos Caudal (Azul claro)
const caudalData = ref({
    labels: labels,
    datasets: [{ ...commonDataset, label: 'Caudal', data: [2900, 3100, 2950, 3050, 2920, 3200], borderColor: '#4fc3f7' }]
});

// Datos Densidad (Rojo/Naranja)
const densidadData = ref({
    labels: labels,
    datasets: [{ ...commonDataset, label: 'Densidad', data: [0.60, 0.63, 0.61, 0.64, 0.62, 0.63], borderColor: '#ef5350' }]
});

// Datos Temperatura (Azul)
const tempData = ref({
    labels: labels,
    datasets: [{ ...commonDataset, label: 'Temp', data: [-4, -2, -3, -1, 0, -2], borderColor: '#64b5f6' }]
});

// Opciones Line Charts
const lineOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aebbc7' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aebbc7' } }
    }
});

// DOUGHNUTS (Progreso)
const progressData = ref({
    labels: ['Completado', 'Restante'],
    datasets: [{ data: [75, 25], backgroundColor: ['#ffa726', 'rgba(255,255,255,0.1)'], borderWidth: 0, cutout: '85%' }]
});

const etaData = ref({
    labels: ['Transcurrido', 'Restante'],
    datasets: [{ data: [40, 60], backgroundColor: ['#ab47bc', 'rgba(255,255,255,0.1)'], borderWidth: 0, cutout: '85%' }]
});

const chartOptionsDonut = ref({
    responsive: true,
    cutout: '80%',
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
});

</script>

<style scoped>
/* --- LAYOUT PRINCIPAL --- */
.dashboard-layout { display: flex; height: 100vh; background-color: #16213E; font-family: 'Segoe UI', sans-serif; overflow: hidden; }
.main-content { flex: 1; padding: 2rem; overflow-y: auto; background: linear-gradient(rgba(22, 33, 62, 0.8), rgba(22, 33, 62, 0.9)); }
.content-container { max-width: 1600px; margin: 0 auto; }

/* --- TIPOGRAFÍA --- */
.page-title { color: #F1F6F9; font-size: 1.5rem; margin: 0; font-weight: 600; }
.order-subtitle { color: #aebbc7; font-size: 1.8rem; margin: 0; font-weight: 300; margin-top: 0.5rem; }

/* --- SISTEMA GRID --- */
.grid-layout { display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 1.5rem; }
.grid-layout-secondary { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 1.5rem; }

/* CAMBIO: Reducimos el ancho de la columna izquierda (tabla) para dar espacio al gráfico */
.grid-graphs { 
    display: grid; 
    grid-template-columns: 1.02fr 1fr; /* Antes era 2fr 1fr */
    gap: 1.5rem; 
}

/* --- TARJETAS GLASIMORPHISM --- */
.glass-panel {
    background: #0F3460;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    color: #F1F6F9;
}

/* --- ESTILOS ESPECÍFICOS DE TARJETAS --- */

/* 1. INFO CARD */
.info-card { display: flex; flex-direction: column; gap: 0.8rem; }
.card-row { display: flex; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; }
.card-row:last-child { border-bottom: none; }
.info-group { display: flex; flex-direction: column; }
.info-group label { font-size: 0.75rem; color: #aebbc7; text-transform: uppercase; margin-bottom: 2px; }
.info-group span { font-size: 0.95rem; font-weight: 600; }
.custom-badge-btn { background-color: #b71c1c !important; border: none; font-size: 0.7rem; padding: 0.3rem 0.8rem; }
.card-actions { display: flex; align-items: center; justify-content: space-between; }
.timer-badge { background: rgba(67, 97, 238, 0.2); color: #64b5f6; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; }

/* 2. PRODUCTO CARD */
.product-card { display: flex; flex-direction: column; }
.card-title { margin: 0 0 1rem 0; font-weight: 600; font-size: 1.1rem; }
.product-detail { margin-top: auto; }
.product-detail label { display: block; color: #aebbc7; font-size: 0.8rem; }
.temp-value { font-size: 1.5rem; color: #F1F6F9; font-weight: bold; }

/* 3. ALERTA CARD */
.alert-card { border-left: 5px solid #ffa726 !important; background: rgba(255, 167, 38, 0.05); position: relative; }
.alert-title { color: #F1F6F9; margin: 0 0 0.5rem 0; font-weight: 700; letter-spacing: 0.5px; }
.alert-msg { font-size: 0.85rem; color: #aebbc7; line-height: 1.4; margin-bottom: 1.5rem; }
.alert-actions { display: flex; gap: 1.5rem; }
.action-link { font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.action-link:hover { opacity: 0.8; }
.confirm { color: #5c6bc0; }
.report { color: #ef5350; }

/* 4. DONUT CHARTS */
.chart-card { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; min-height: 200px; }
.card-title-sm { align-self: flex-start; margin: 0 0 1rem 0; font-size: 0.9rem; color: #F1F6F9; }
.chart-wrapper { width: 140px; height: 140px; position: relative; }
.donut-inner { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
.donut-inner span { display: block; font-size: 1.5rem; font-weight: bold; color: #F1F6F9; }
.eta-label { font-size: 0.8rem !important; color: #ab47bc !important; margin-bottom: -5px; }
.eta-value { font-size: 1.2rem !important; }

/* 5. TABLAS */
:deep(.compact-table .p-datatable-thead > tr > th) { background: transparent !important; color: #aebbc7 !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; font-size: 0.8rem; padding: 0.8rem; }
:deep(.compact-table .p-datatable-tbody > tr > td) { background: transparent !important; color: #F1F6F9 !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; padding: 0.8rem; font-size: 0.85rem; }
:deep(.compact-table .p-datatable-tbody > tr:hover) { background: rgba(255, 255, 255, 0.05) !important; }
.status-warning { color: #ffa726; font-weight: 700; font-size: 0.8rem; }

/* 6. GRAFICOS */
.graph-card { padding: 1rem; }
.h-15rem { height: 15rem; }

/* RESPONSIVE */
@media (max-width: 1200px) {
  .grid-layout, .grid-layout-secondary { grid-template-columns: 1fr; }
  .grid-graphs { grid-template-columns: 1fr; }
  .detail-table-card { grid-column: span 1 !important; }
}

/* --- ESPACIO ENTRE FILAS --- */
.row-spacing {
    margin-bottom: 3rem; /* Ajusta este valor a tu necesidad */
}
</style>