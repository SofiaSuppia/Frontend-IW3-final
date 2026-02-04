<!-- filepath: /home/sofia/Escritorio/Frontend IW3 final/Frontend/src/views/ConciliacionView.vue -->
<template>
  <div class="dashboard-layout">
    <Sidebar activePage="orders" />

    <main class="main-content">
      <!-- Botón Volver (oculto al imprimir) -->
      <div class="mb-4 print-hide">
        <Button label="Volver a la Orden" icon="pi pi-arrow-left" class="p-button-text text-white" @click="goBack" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-content-center align-items-center h-full">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #fff"></i>
      </div>

      <!-- REPORTE TIPO PAPEL -->
      <div v-else class="paper-sheet fade-in">
        
        <!-- CABECERA -->
        <header class="report-header">
          <div class="header-left">
            <h1 class="report-title">REPORTE DE CONCILIACIÓN DE CARGA DE COMBUSTIBLE</h1>
            <p class="report-meta">Fecha de generación: {{ formatDate(conciliacion?.fechaGeneracion) }}</p>
          </div>
          
          <div class="header-right logo-container">
            <!-- Logo simulado estilo FuelOps -->
            <div class="logo-box">
              <i class="pi pi-truck" style="font-size: 2rem; color: #00BFB2; margin-bottom: 5px;"></i>
              <div class="logo-text">FUEL OPS</div>
            </div>
          </div>
        </header>

        <!-- SECCIÓN 1: PRODUCTO -->
        <section class="report-section">
          <div class="section-header">Información del Producto Cargado</div>
          <table class="report-table">
            <tr>
              <td class="col-label">Producto:</td>
              <td class="col-value">{{ conciliacion?.productoNombre || 'Butano' }}</td>
            </tr>
            <tr>
              <td class="col-label">Descripción:</td>
              <td class="col-value">{{ conciliacion?.productoDescripcion || 'Componente del GLP, utilizado...' }}</td>
            </tr>
          </table>
        </section>

        <!-- SECCIÓN 2: PESAJE -->
        <section class="report-section">
          <div class="section-header">Datos del Pesaje</div>
          <table class="report-table">
            <tr>
              <td class="col-label">Pesaje inicial:</td>
              <td class="col-value">{{ formatNumber(conciliacion?.pesajeInicial) }} kg</td>
            </tr>
            <tr>
              <td class="col-label">Pesaje final:</td>
              <td class="col-value">{{ formatNumber(conciliacion?.pesajeFinal) }} kg</td>
            </tr>
            <tr>
              <td class="col-label">Producto cargado:</td>
              <td class="col-value font-bold">{{ formatNumber(conciliacion?.productoCargado) }} kg</td>
            </tr>
            <tr>
              <td class="col-label">Neto por balanza:</td>
              <td class="col-value font-bold">{{ formatNumber(conciliacion?.netoPorBalanza) }} kg</td>
            </tr>
            <tr>
              <td class="col-label">Diferencia entre balanza y caudalímetro:</td>
              <td class="col-value">{{ formatNumber(conciliacion?.diferenciaBalanzaCaudalimetro) }} kg</td>
            </tr>
          </table>
        </section>

        <!-- SECCIÓN 3: PROMEDIOS -->
        <section class="report-section">
          <div class="section-header">Promedios durante la Carga</div>
          <table class="report-table">
            <tr>
              <td class="col-label">Promedio de temperatura:</td>
              <td class="col-value">{{ formatNumber(conciliacion?.promedioTemperatura) }} °C</td>
            </tr>
            <tr>
              <td class="col-label">Promedio de densidad:</td>
              <td class="col-value">{{ formatNumber(conciliacion?.promedioDensidad, 3) }} kg/m³</td>
            </tr>
            <tr>
              <td class="col-label">Promedio de caudal:</td>
              <td class="col-value">{{ formatNumber(conciliacion?.promedioCaudal) }} L/h</td>
            </tr>
          </table>
        </section>

        <!-- FOOTER -->
        <footer class="report-footer">
          <p class="company-name">Generado por: FluxGas S.A</p>
          <p class="disclaimer">Este reporte es confidencial y está destinado únicamente para el uso de la empresa.</p>
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

const { conciliacion, loading, fetchConciliacion } = useConciliacion(orderId);

const goBack = () => router.go(-1);
const printReport = () => window.print();

const formatDate = (val) => val ? new Date(val).toLocaleString('es-AR') : new Date().toLocaleString('es-AR');
const formatNumber = (val, dec = 2) => val !== undefined ? Number(val).toFixed(dec) : '0.00';

onMounted(() => {
    fetchConciliacion();
});
</script>

<style scoped>
.dashboard-layout { display: flex; height: 100vh; background-color: #16213E; font-family: sans-serif; overflow: hidden; }
.main-content { flex: 1; padding: 2rem; overflow-y: auto; background: #0b1121; }

/* HOJA DE PAPEL BLANCA */
.paper-sheet {
  max-width: 850px;
  margin: 0 auto;
  background-color: #ffffff;
  padding: 40px 50px;
  box-shadow: 0 0 25px rgba(0,0,0,0.5);
  color: #333;
  font-family: 'Arial', sans-serif; /* Fuente estándar para reportes */
}

/* HEADER */
.report-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
.report-title { font-size: 1.25rem; font-weight: 700; color: #444; margin: 0 0 5px 0; text-transform: uppercase; max-width: 400px; line-height: 1.2; }
.report-meta { font-size: 0.8rem; color: #888; margin: 0; }

/* LOGO */
.logo-box {
  border: 4px solid #334; /* Borde oscuro */
  border-radius: 50%; /* Intento de simular el logo redondo */
  width: 100px; height: 80px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-radius: 10px;
  background: #f7f9fa;
}
.logo-text { font-weight: 900; color: #334; font-size: 0.9rem; letter-spacing: 1px; }

/* SECCIONES Y TABLAS */
.report-section { margin-bottom: 25px; }

.section-header {
  background-color: #333333; /* FONDO NEGRO */
  color: #ffffff;            /* TEXTO BLANCO */
  font-weight: bold;
  padding: 6px 10px;
  font-size: 0.95rem;
  border: 1px solid #000;
}

.report-table { width: 100%; border-collapse: collapse; border-left: 1px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000; }
.report-table td { padding: 6px 10px; border-bottom: 1px solid #ccc; font-size: 0.9rem; }
.report-table tr:last-child td { border-bottom: none; }

/* Columnas */
.col-label { width: 45%; border-right: 1px solid #000; font-weight: 500; } /* Línea vertical negra */
.col-value { width: 55%; }
.font-bold { font-weight: bold; }

/* FOOTER */
.report-footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px; font-size: 0.75rem; color: #999; }

/* Print */
@media print {
  .dashboard-layout { display: block; height: auto; background: white; }
  .sidebar, .print-hide { display: none !important; }
  .main-content { padding: 0; background: white; }
  .paper-sheet { box-shadow: none; margin: 0; width: 100%; max-width: 100%; padding: 0; border: none; }
}
</style>