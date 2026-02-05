<!-- filepath: /home/sofia/Escritorio/Frontend IW3 final/Frontend/src/views/ConciliacionView.vue -->
<template>
  <div class="dashboard-layout">
    <Sidebar activePage="orders" />

    <main class="main-content">
      <!-- Botón Volver -->
      <div class="mb-4 print-hide">
        <Button class="p-button-text text-white" @click="goBack">
            <i class="pi pi-arrow-left" style="margin-right: 10px;"></i>
            Volver a la Orden
        </Button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-content-center align-items-center h-full">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #fff"></i>
      </div>

      <!-- REPORTE FINAL -->
      <div v-else class="paper-sheet fade-in">
        
        <!-- CABECERA -->
        <header class="report-header">
          <div class="header-left">
            <h1 class="report-title">REPORTE DE CONCILIACIÓN DE CARGA</h1>
            <p class="report-meta">Orden ID: #{{ orderId }}</p>
            <p class="report-meta">Fecha de emisión: {{ formatDate(conciliacion.fechaGeneracion) }}</p>
          </div>
          
          <div class="header-right">
            <!-- CAMBIO: Nuevo Logo FluxGas -->
            <div class="logo-placeholder">
              <i class="pi pi-bolt" style="color: #E94560; font-size: 1.8rem;"></i>
              <span style="font-size: 1.8rem; font-weight: bold; color: white;">FluxGas</span>
            </div>
          </div>
        </header>

        <!-- SECCIÓN 1: PRODUCTO -->
        <section class="report-section">
          <div class="section-header">1. INFORMACIÓN DEL PRODUCTO</div>
          <table class="report-table">
            <tbody>
              <tr>
                <td class="col-label">Producto Carga:</td>
                <td class="col-value font-bold">{{ conciliacion.productoNombre }}</td>
              </tr>
              <tr>
                <td class="col-label">Descripción Técnica:</td>
                <td class="col-value">{{ conciliacion.productoDescripcion }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- SECCIÓN 2: BALANCE DE MASAS -->
        <section class="report-section">
          <div class="section-header">2. BALANCE DE MASAS (PESAJE VS CAUDALÍMETRO)</div>
          <table class="report-table">
            <tbody>
              <tr>
                <td class="col-label">Pesaje Inicial (Balanza):</td>
                <td class="col-value">{{ formatNumber(conciliacion.pesajeInicial) }} kg</td>
              </tr>
              <tr>
                <td class="col-label">Pesaje Final (Balanza):</td>
                <td class="col-value">{{ formatNumber(conciliacion.pesajeFinal) }} kg</td>
              </tr>
              <tr class="highlight-row">
                <td class="col-label">Neto Cargado (Balanza):</td>
                <td class="col-value font-bold">{{ formatNumber(conciliacion.netoPorBalanza) }} kg</td>
              </tr>
              <tr>
                <td class="col-label">Total Cargado (Caudalímetro):</td>
                <td class="col-value">{{ formatNumber(conciliacion.productoCargado) }} kg</td>
              </tr>
              <tr>
                <td class="col-label">Diferencia (Balanza - Caudal):</td>
                <td class="col-value font-bold" :style="{ color: Math.abs(conciliacion.diferencia) > 10 ? 'red' : 'green' }">
                    {{ formatNumber(conciliacion.diferencia) }} kg
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- SECCIÓN 3: CONDICIONES OPERATIVAS -->
        <section class="report-section">
          <div class="section-header">3. CONDICIONES OPERATIVAS PROMEDIO</div>
          <table class="report-table">
            <tbody>
              <tr>
                <td class="col-label">Temperatura Promedio:</td>
                <td class="col-value">{{ formatNumber(conciliacion.promedioTemperatura, 1) }} °C</td>
              </tr>
              <tr>
                <td class="col-label">Densidad Promedio:</td>
                <td class="col-value">{{ formatNumber(conciliacion.promedioDensidad, 3) }} kg/m³</td>
              </tr>
              <tr>
                <td class="col-label">Caudal Promedio:</td>
                <td class="col-value">{{ formatNumber(conciliacion.promedioCaudal, 0) }} L/h</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- FOOTER -->
        <footer class="report-footer">
          <p class="company-name">Documento generado autmáticamente por el sistema FuelOps v1.0</p>
          <div class="print-hide text-right mt-3">
            <Button label="Imprimir Reporte" icon="pi pi-print" class="p-button-outlined p-button-secondary" @click="printReport"/>
          </div>
        </footer>

      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConciliacion } from '../composables/useConciliacion';
import Sidebar from '../components/Sidebar.vue';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const orderId = route.params.id;

// Usamos el composable que arreglamos en el paso anterior para obtener los datos completos
const { conciliacion, loading, fetchConciliacion } = useConciliacion(orderId);

const goBack = () => router.go(-1);
const printReport = () => window.print();

const formatDate = (val) => {
    if (!val) return new Date().toLocaleDateString();
    return new Date(val).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' });
};

const formatNumber = (val, dec = 2) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toFixed(dec);
};

onMounted(() => {
    fetchConciliacion();
});
</script>

<style scoped>
/* --- ESTILOS GENERALES --- */
.dashboard-layout { display: flex; height: 100vh; background-color: #16213E; font-family: sans-serif; overflow: hidden; }
/*.main-content { flex: 1; padding: 2rem; overflow-y: auto; background: #0b1121; }*/
.main-content {
  flex: 1;
  background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), 
              url('/assets/images/fondo.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  padding: 2rem;
  overflow-y: auto;
}

/* HOJA DE PAPEL */
.paper-sheet {
  max-width: 800px;
  margin: 0 auto;
  background-color: rgba(16, 25, 48, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px 60px;
  box-shadow: 0 0 25px rgba(0,0,0,0.5);
  color: #e0e0e0;
  font-family: 'Segoe UI', Arial, sans-serif;
  border-radius: 4px; /* Un toque sutil */
}

/* HEADER */
.report-header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #00BFB2; padding-bottom: 15px; }
.report-title { font-size: 1.4rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; text-transform: uppercase; max-width: 450px; line-height: 1.2; }
.report-meta { font-size: 0.85rem; color: #a0a0a0; margin: 2px 0; }

.logo-box { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.logo-text { font-weight: 900; color: #334; font-size: 0.9rem; letter-spacing: 1px; }

/* SECCIONES */
.report-section { margin-bottom: 5px; }

.section-header {
  background-color: #2c3e50;
  color: #00BFB2;
  font-weight: 700;
  padding: 4px 8px;
  font-size: 0.9rem;
  border-top: 1px solid #444;
  border-bottom: 1px solid #444;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* TABLA */
.report-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.report-table td { padding: 8px 8px; border-bottom: 1px solid #2d3d5a; vertical-align: middle; }
.col-label { width: 45%; font-weight: 500; color: #b0b0b0; }
.col-value { width: 55%; text-align: right; color: #ffffff; }
.font-bold { font-weight: 700; }
.highlight-row { background-color: rgba(0, 191, 178, 0.1); color: white; font-weight: bold; border-top: 2px solid #00BFB2; border-bottom: 2px solid #00BFB2; }

/* FOOTER */
.report-footer { margin-top: 5px; padding-top: 5px; border-top: 1px solid #444; }
.company-name { font-size: 0.75rem; color: #777; text-align: center; font-style: italic; }

@media print {
  .dashboard-layout { display: block; height: auto; background: white; }
  .p-sidebar, .sidebar, .print-hide { display: none !important; }
  .main-content { padding: 0; background: white !important;; width: 100%; overflow: visible; }
  .paper-sheet { box-shadow: none; border: none; background-color: white !important; color: black !important; margin: 0; padding: 0; width: 100%; max-width: 100%; }
  
  /* Forzar colores de fondo al imprimir */
  /* Ajuste de colores de textos para papel */
  .report-title { color: black !important; }
  .report-meta { color: #333 !important; }
  .col-label { color: #333 !important; }
  .col-value { color: black !important; }
  .report-table td { border-bottom: 1px solid #ddd !important; }
  .section-header { 
    background-color: #eee !important; 
    color: black !important; 
    border-color: #aaa !important;
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
  }
  .highlight-row { 
    background-color: #f0f0f0 !important; 
    border-color: #ccc !important;
    color: black !important;
  }
}
</style>