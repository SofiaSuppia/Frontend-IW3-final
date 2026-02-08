<template>
  <div class="dashboard-layout">
    <Sidebar activePage="products" />

    <main class="main-content">
      <div class="content-container">

        <!-- Header -->
        <header class="page-header">
          <h1 class="page-title">Productos</h1>
          <Button 
            label="AGREGAR PRODUCTO" 
            icon="pi pi-plus"
            class="add-btn" 
            @click="openAddDialog"
          />
        </header>

        <!-- Tabla -->
        <section class="table-wrapper">
          <div v-if="loading" class="loading-overlay">
            <i class="pi pi-spin pi-spinner"></i>
          </div>

          <!-- CAMBIO: Quitar paginación y agregar scroll -->
          <DataTable 
            :value="products" 
            :loading="loading"
            class="products-table"
            responsiveLayout="scroll"
            scrollable
            scrollHeight="600px" 
            :emptyMessage="EMPTY_TABLE_MESSAGE"
          >
            <Column field="id" header="ID" style="width: 80px" />
            
            <Column field="descripcion" header="Descripción" style="width: 50%">
              <template #body="{ data }">
                <span class="descripcion-text">{{ data.descripcion || 'Sin descripción' }}</span>
              </template>
            </Column>
            
            <Column field="nombre" header="Producto" style="width: 25%" />
            
            <Column field="umbralTemperatura" header="Temperatura Umbral (°C)" style="width: 15%">
              <template #body="{ data }">
                {{ formatTemp(data.umbralTemperatura) }}
              </template>
            </Column>
            
            <Column header="Acciones" style="width: 10%; text-align: center">
              <template #body="{ data }">
                <Button 
                  icon="pi pi-ellipsis-v" 
                  class="p-button-text p-button-rounded action-btn" 
                  @click="toggleMenu($event, data)"
                />
              </template>
            </Column>
          </DataTable>

          <!-- Paginador -->
          <BluePaginator 
             :first="page * pageSize" 
             :rows="pageSize" 
             :totalRecords="totalRecords" 
             @page="onPageChange" 
          />

        </section>

      </div>
    </main>

    <!-- Menú contextual -->
    <Menu ref="actionMenu" :model="menuItems" :popup="true" class="custom-menu" />

    <!-- Diálogo Agregar -->
    <Dialog 
      v-model:visible="showAddDialog" 
      :header="DIALOG_TITLES.ADD" 
      modal
      :style="{ width: '400px' }"
      class="custom-dialog-dark"
    >
      <ProductForm 
        v-model="newProduct" 
        :errors="formErrors"
        :is-editing="false"
      />
      <template #footer>
        <Button label="CANCELAR" icon="pi pi-times" class="p-button-text cancel-btn" @click="closeAddDialog" />
        <Button label="AGREGAR" icon="pi pi-check" class="p-button-text save-btn" @click="handleCreate" :loading="isSaving" />
      </template>
    </Dialog>

    <!-- Diálogo Editar -->
    <Dialog 
      v-model:visible="showEditDialog" 
      :header="DIALOG_TITLES.EDIT" 
      modal
      :style="{ width: '400px' }"
      class="custom-dialog-dark"
    >
      <ProductForm 
        v-model="editingProduct" 
        :errors="formErrors"
        :is-editing="true"
      />
      <template #footer>
        <Button label="CANCELAR" icon="pi pi-times" class="p-button-text cancel-btn" @click="closeEditDialog" />
        <Button label="GUARDAR" icon="pi pi-check" class="p-button-text save-btn" @click="handleUpdate" :loading="isSaving" />
      </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import ProductForm from '../components/ProductForm.vue';
import BluePaginator from '../components/BluePaginator.vue';
import { useProducts } from '../composables/useProducts';
import { DIALOG_TITLES, EMPTY_TABLE_MESSAGE, INITIAL_PRODUCT } from '../constants/productConstants';

// Componentes PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';

const router = useRouter();
const actionMenu = ref(null);
const showAddDialog = ref(false);
const showEditDialog = ref(false);

const newProduct = ref({ ...INITIAL_PRODUCT });
const editingProduct = ref({ ...INITIAL_PRODUCT });

const { 
  loading, 
  isSaving, 
  products, 
  selectedProduct, 
  formErrors,
  loadProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  clearFormErrors,
  page,
  pageSize,
  totalRecords,
  onPageChange
} = useProducts();

// Menú contextual
const menuItems = computed(() => [
  { label: 'Editar', icon: 'pi pi-pencil', color: '#64b5f6', command: () => openEditDialog(selectedProduct.value) },
  { label: 'Eliminar', icon: 'pi pi-trash', color: '#E94560', command: () => deleteProduct(selectedProduct.value) }
]);

// Lifecycle
onMounted(() => loadProducts());

// Métodos
const openAddDialog = () => {
  newProduct.value = { ...INITIAL_PRODUCT };
  clearFormErrors();
  showAddDialog.value = true;
};

const closeAddDialog = () => {
  showAddDialog.value = false;
  clearFormErrors();
};

const openEditDialog = (product) => {
  editingProduct.value = { ...product };
  clearFormErrors();
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  clearFormErrors();
};

const handleCreate = async () => {
  const success = await createProduct(newProduct.value);
  if (success) closeAddDialog();
};

const handleUpdate = async () => {
  const success = await updateProduct(editingProduct.value.id, editingProduct.value);
  if (success) closeEditDialog();
};

const toggleMenu = (event, product) => {
  selectedProduct.value = product;
  actionMenu.value.toggle(event);
};

const formatTemp = (temp) => {
  if (temp === null || temp === undefined || temp === '') return 'N/A';
  const num = parseFloat(temp);
  return isNaN(num) ? 'N/A' : `${num.toFixed(1)}°C`;
};
</script>

<style scoped>
/* Estilos simplificados - mantener solo los esenciales */
.dashboard-layout { display: flex; height: 100vh; background-color: #16213E; }
.main-content { flex: 1; padding: 2rem; overflow-y: auto; background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), url('/assets/images/fondo.png') no-repeat center center; background-size: cover; background-attachment: fixed; }
.content-container { max-width: 1400px; margin: 0 auto; }
.breadcrumb { color: #aebbc7; font-size: 0.9rem; display: flex; gap: 10px; margin-bottom: 1rem; }
.back-arrow { cursor: pointer; font-size: 1.2rem; transition: color 0.2s; }
.back-arrow:hover { color: white; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { color: #F1F6F9; font-size: 2rem; margin: 0; font-weight: 600; }
.add-btn { 
  background-color: #4361ee !important; 
  border: none !important; 
  font-weight: 700 !important; 
  padding: 0.7rem 1.5rem !important; 
  border-radius: 4px !important; 
  display: flex !important;
  gap: 0.5rem !important;
  align-items: center !important;
}
.add-btn:hover { background-color: #3a56d4 !important; }
:deep(.add-btn .p-button-icon) { margin-right: 0 !important; }

/* Contenedor de tabla con efecto glass */
.table-wrapper { 
  background: rgba(255, 255, 255, 0.05) !important; /* ← Fondo semi-transparente */
  backdrop-filter: blur(10px); /* ← Efecto blur */
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 15px; 
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); 
  position: relative; 
  opacity: 0; 
  animation: fadeIn 0.6s forwards 0.2s;
}

.loading-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(22, 33, 62, 0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; border-radius: 8px; }
.loading-overlay i { font-size: 2rem; color: #F9A826; }
.descripcion-text { color: #aebbc7; font-size: 0.85rem; }
.action-btn { color: #F1F6F9 !important; }
.action-btn:hover { background: rgba(255, 255, 255, 0.1) !important; }
.mb-2 { margin-bottom: 0.5rem; }

/* DataTable - Fondo transparente */
:deep(.products-table) {
  background: transparent !important;
}

:deep(.products-table .p-datatable-wrapper) {
  background: transparent !important;
}

:deep(.products-table .p-datatable-thead > tr > th) { 
  background: transparent !important; /* ← Fondo transparente */
  color: #aebbc7 !important; 
  font-weight: 600; 
  font-size: 0.85rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; 
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  padding: 1.5rem 1rem; 
}

:deep(.products-table .p-datatable-tbody > tr) { 
  background: transparent !important; /* ← Fondo transparente */
  color: #F1F6F9 !important; 
  transition: background 0.2s ease;
}

:deep(.products-table .p-datatable-tbody > tr > td) { 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; 
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  padding: 1.5rem 1rem; 
  color: #F1F6F9 !important;
}

:deep(.products-table .p-datatable-tbody > tr:hover) { 
  background: rgba(255, 255, 255, 0.1) !important; /* ← Hover sutil */
}

/* Paginador con fondo transparente */
/* CSS Cleanup for Paginator - Removing old overrides that conflict with BluePaginator */
:deep(.products-table .p-paginator) {
  display: none !important; /* Hide built-in datatable paginator if active */
}

/* Botones de navegación (<<, <, >, >>) */
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) { 
  color: #aebbc7 !important; 
  min-width: 2.5rem; 
  height: 2.5rem; 
  border-radius: 4px;
  background: transparent !important;
  border: none !important;
}

:deep(.p-paginator .p-paginator-first:hover),
:deep(.p-paginator .p-paginator-prev:hover),
:deep(.p-paginator .p-paginator-next:hover),
:deep(.p-paginator .p-paginator-last:hover) { 
  background: rgba(255, 255, 255, 0.1) !important; 
  color: #fff !important; 
}

/* Números de página */
:deep(.p-paginator .p-paginator-pages) {
  display: flex;
  gap: 0.25rem;
}

/* 
 * BluePaginator maneja sus propios estilos.
 * Eliminamos cualquier regla que oculte o deforme los botones.
 */

:deep(.p-paginator .p-paginator-page:hover) { 
  background: rgba(255, 255, 255, 0.1) !important; 
  color: #fff !important; 
}

/* Página activa */
:deep(.p-paginator .p-paginator-page.p-highlight) { 
  background: #ffffff !important;
  color: #0F3460 !important;
  font-weight: 700;
}

/* Deshabilitar botones cuando no se pueden usar */
:deep(.p-paginator .p-disabled) {
  opacity: 0.4;
  cursor: not-allowed !important;
}

/* Diálogos */
:deep(.p-dialog.custom-dialog-dark) { 
  background-color: #0F3460 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important; 
  border-radius: 8px !important; 
}

:deep(.p-dialog.custom-dialog-dark .p-dialog-header) { 
  background-color: #0F3460 !important;
  color: #F1F6F9 !important; 
  padding: 1.5rem !important; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; 
}

:deep(.p-dialog.custom-dialog-dark .p-dialog-content) { 
  background-color: #0F3460 !important;
  padding: 1.5rem !important; 
}

:deep(.p-dialog.custom-dialog-dark .p-dialog-footer) { 
  background-color: #0F3460 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important; 
  padding: 1rem 1.5rem !important; 
}

.cancel-btn { color: #aebbc7 !important; font-weight: 600; display: flex !important; gap: 0.5rem !important; align-items: center !important; }
.cancel-btn:hover { color: #fff !important; background: rgba(255, 255, 255, 0.05) !important; }
.save-btn { color: #7e73f0 !important; font-weight: 700; display: flex !important; gap: 0.5rem !important; align-items: center !important; }
.save-btn:hover { background: rgba(126, 115, 240, 0.15) !important; }

:deep(.cancel-btn .p-button-icon),
:deep(.save-btn .p-button-icon) {
  margin-right: 0 !important;
}

/* Animación de entrada */
@keyframes fadeIn { 
  to { opacity: 1; } 
}
</style>

<!-- ESTILOS GLOBALES CORREGIDOS (Alta Prioridad) -->
<style>
/* 1. Contenedor del Menú y Filtros (La caja azul) */
body .p-menu.custom-menu,
body .p-dropdown-panel, 
body .p-multiselect-panel { 
  background-color: #0F3460 !important; 
  border: 1px solid rgba(255, 255, 255, 0.15) !important; 
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
  min-width: 240px !important; /* Un poco más ancho */

  /* ESPACIOS DEL RECUADRO (Padding) */
  padding-top: 1rem !important;    /* Más espacio arriba */
  padding-bottom: 1rem !important; /* Más espacio abajo */
  padding-left: 1rem !important;   /* Espacio a la izquierda */
  padding-right: 1rem !important;  /* Espacio a la derecha */
}

/* 2. Espacio entre cada opción (Editar vs Eliminar) */
body .custom-menu .p-menuitem,
body .p-dropdown-item,
body .p-multiselect-item {
  margin-bottom: 10rem !important; /* Separación clara entre renglones */
}

/* Quitar margen al último elemento para que no quede espacio extra abajo */
body .custom-menu .p-menuitem:last-child,
body .p-dropdown-item:last-child,
body .p-multiselect-item:last-child {
  margin-bottom: 0 !important;
}

/* 3. Estilo interno de cada botón/enlace */
body .custom-menu .p-menuitem-link,
body .p-dropdown-item,
body .p-multiselect-item {
  padding: 10px 15px !important;
  border-radius: 8px !important;
  color: #ffffff !important;
  transition: all 0.2s ease;
  display: flex !important;
  align-items: center !important;
  background: transparent !important;
}

/* Hover (Efecto al pasar el mouse) */
body .custom-menu .p-menuitem-link:hover,
body .p-dropdown-item:not(.p-highlight):not(.p-disabled):hover,
body .p-multiselect-item:not(.p-highlight):not(.p-disabled):hover { 
  background: rgba(100, 181, 246, 0.15) !important; 
  transform: translateX(5px); 
}

/* 4. Separación entre ICONO y TEXTO */
body .custom-menu .p-menuitem-icon {
  margin-right: 1.5rem !important; /* <--- AQUÍ ESTÁ EL ESPACIO GRANDE QUE PEDISTE */
  font-size: 1.2rem !important;
  color: #64b5f6 !important;
}

/* Texto de la opción */
body .custom-menu .p-menuitem-text {
  font-weight: 500 !important;
  font-size: 1rem !important;
}

/* Icono de eliminar en rojo */
body .custom-menu .p-menuitem:last-child .p-menuitem-icon {
  color: #E94560 !important;
}

/* --- Estilos extra para Filtros (Dropdowns) --- */
body .p-dropdown-item.p-highlight,
body .p-multiselect-item.p-highlight {
  background: rgba(100, 181, 246, 0.3) !important;
  color: #ffffff !important;
}

body .p-dropdown-header,
body .p-multiselect-header {
  background: #0F3460 !important;
  color: #F1F6F9 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 1rem !important;
  border-radius: 12px 12px 0 0 !important;
  /* Ajuste negativo para compensar el padding del contenedor padre */
  margin: -1.5rem -1.2rem 1rem -1.2rem !important; 
}

/* --- DIÁLOGOS --- */
body .p-dialog.custom_dialog_dark {
  background-color: #0F3460 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
body .p-dialog.custom_dialog_dark .p-dialog-header,
body .p-dialog.custom_dialog_dark .p-dialog-content,
body .p-dialog.custom_dialog_dark .p-dialog-footer {
  background-color: #0F3460 !important;
  color: #F1F6F9 !important;
}
body .p-dialog.custom_dialog_dark .p-dialog-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
body .p-dialog.custom_dialog_dark .p-dialog-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}
</style>