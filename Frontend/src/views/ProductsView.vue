<template>
  <div class="dashboard-layout">
    <Sidebar activePage="products" />

    <main class="main-content">
      <div class="content-container">
        
        <!-- Breadcrumb -->
        <nav class="breadcrumb mb-2">
          <span class="back-arrow" @click="router.push('/home')">←</span> 
          <span class="breadcrumb-text">Admin / Productos</span>
        </nav>

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

          <DataTable 
            :value="products" 
            :loading="loading"
            :paginator="true" 
            :rows="10" 
            class="products-table"
            :emptyMessage="EMPTY_TABLE_MESSAGE"
            paginatorTemplate="FirstPageLink PrevPageLink NextPageLink LastPageLink"
          >
            <Column field="id" header="ID" :sortable="true" style="width: 80px" />
            
            <Column field="descripcion" header="Descripción" :sortable="true" style="width: 50%">
              <template #body="{ data }">
                <span class="descripcion-text">{{ data.descripcion || 'Sin descripción' }}</span>
              </template>
            </Column>
            
            <Column field="nombre" header="Producto" :sortable="true" style="width: 25%" />
            
            <Column field="thresholdTemp" header="Temperatura Umbral (°C)" :sortable="true" style="width: 15%">
              <template #body="{ data }">
                {{ formatTemp(data.thresholdTemp) }}
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
  clearFormErrors
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

const formatTemp = (temp) => temp !== null && temp !== undefined ? `${temp.toFixed(1)}°C` : 'N/A';
</script>

<style scoped>
/* Estilos simplificados - mantener solo los esenciales */
.dashboard-layout { display: flex; height: 100vh; background-color: #16213E; }
.main-content { flex: 1; padding: 2rem; overflow-y: auto; background: linear-gradient(rgba(22, 33, 62, 0.6), rgba(22, 33, 62, 0.75)), url('/assets/images/fondoCompleto.png') no-repeat center center; background-size: cover; }
.content-container { max-width: 1400px; margin: 0 auto; }
.breadcrumb { color: #aebbc7; font-size: 0.9rem; display: flex; gap: 10px; margin-bottom: 1rem; }
.back-arrow { cursor: pointer; font-size: 1.2rem; transition: color 0.2s; }
.back-arrow:hover { color: white; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { color: #F1F6F9; font-size: 2rem; margin: 0; font-weight: 600; }
.add-btn { background-color: #4361ee !important; border: none !important; font-weight: 700 !important; padding: 0.7rem 1.5rem !important; border-radius: 4px !important; }
.add-btn:hover { background-color: #3a56d4 !important; }
.table-wrapper { background-color: #0F3460; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); position: relative; }
.loading-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(22, 33, 62, 0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; border-radius: 8px; }
.loading-overlay i { font-size: 2rem; color: #F9A826; }
.descripcion-text { color: #aebbc7; font-size: 0.85rem; }
.action-btn { color: #F1F6F9 !important; }
.action-btn:hover { background: rgba(255, 255, 255, 0.1) !important; }
.mb-2 { margin-bottom: 0.5rem; }

/* DataTable */
:deep(.products-table .p-datatable-thead > tr > th) { background-color: #0F3460 !important; color: #aebbc7 !important; font-weight: 600; font-size: 0.85rem; border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important; padding: 1.5rem 1rem; }
:deep(.products-table .p-datatable-tbody > tr) { background: #0F3460 !important; color: #F1F6F9 !important; }
:deep(.products-table .p-datatable-tbody > tr > td) { border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; padding: 1.5rem 1rem; }
:deep(.products-table .p-datatable-tbody > tr:hover) { background: rgba(255, 255, 255, 0.05) !important; }

/* Paginador simplificado */
:deep(.p-paginator) { background: #0F3460 !important; border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 1rem; }
:deep(.p-paginator .p-paginator-element) { color: #aebbc7 !important; min-width: 2.5rem; height: 2.5rem; border-radius: 4px; }
:deep(.p-paginator .p-paginator-element:hover) { background: rgba(255, 255, 255, 0.1) !important; color: #fff !important; }
:deep(.p-paginator .p-paginator-element.p-highlight) { background: #4361ee !important; color: #fff !important; }

/* Diálogos */
:deep(.p-dialog.custom-dialog-dark) { 
  background-color: #0F3460 !important; /* ← CAMBIAR AQUÍ */
  border: 1px solid rgba(255, 255, 255, 0.1) !important; 
  border-radius: 8px !important; 
}

:deep(.p-dialog.custom-dialog-dark .p-dialog-header) { 
  background-color: #0F3460 !important; /* ← CAMBIAR AQUÍ */
  color: #F1F6F9 !important; 
  padding: 1.5rem !important; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; 
}

:deep(.p-dialog.custom-dialog-dark .p-dialog-content) { 
  background-color: #0F3460 !important; /* ← CAMBIAR AQUÍ - ESTE ES EL IMPORTANTE */
  padding: 1.5rem !important; 
}

:deep(.p-dialog.custom-dialog-dark .p-dialog-footer) { 
  background-color: #0F3460 !important; /* ← CAMBIAR AQUÍ */
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important; 
  padding: 1rem 1.5rem !important; 
}

.cancel-btn { color: #aebbc7 !important; font-weight: 600; }
.cancel-btn:hover { color: #fff !important; background: rgba(255, 255, 255, 0.05) !important; }
.save-btn { color: #7e73f0 !important; font-weight: 700; }
.save-btn:hover { background: rgba(126, 115, 240, 0.15) !important; }
</style>

<!-- ESTILOS GLOBALES PARA EL MENÚ (sin scoped) -->
<style>
/* Menú contextual - FONDO #0F3460 */
.p-menu.custom-menu,
.p-menu.p-menu-overlay.custom-menu { 
  background-color: #0F3460 !important; 
  border: 0 none !important; 
  border-radius: 8px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  padding: 0.5rem 0 !important;
  min-width: 180px;
}

/* Items del menú */
.custom-menu .p-menuitem {
  margin: 0 !important;
}

.custom-menu .p-menuitem-link {
  padding: 12px 16px !important;
  background: transparent !important;
  border-radius: 0 !important;
  color: #ffffff !important; /* ← TEXTO BLANCO */
  transition: all 0.2s ease;
}

.custom-menu .p-menuitem-link:hover { 
  background: #0a2540 !important; /* ← AZUL MÁS OSCURO al hover */
}

.custom-menu .p-menuitem-icon {
  margin-right: 12px !important;
  font-size: 1.1rem;
  color: #64b5f6 !important;
}

.custom-menu .p-menuitem-text {
  font-weight: 500;
  letter-spacing: 0.3px;
  color: #ffffff !important; /* ← TEXTO BLANCO */
}

/* Color específico para el icono de eliminar */
.custom-menu .p-menuitem:last-child .p-menuitem-icon {
  color: #E94560 !important;
}

/* Efecto focus para accesibilidad */
.custom-menu .p-menuitem-link:focus {
  background: #0a2540 !important; /* ← AZUL OSCURO al hacer focus */
  outline: none;
}

/* Contenedor principal del diálogo */
.p-dialog.custom-dialog-dark {
  background-color: #0F3460 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

/* Header del diálogo */
.p-dialog.custom-dialog-dark .p-dialog-header {
  background-color: #0F3460 !important;
  color: #F1F6F9 !important;
  padding: 1.5rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Título del diálogo */
.p-dialog.custom-dialog-dark .p-dialog-title {
  color: #F1F6F9 !important;
  font-weight: 600;
}

/* Botón de cerrar (X) */
.p-dialog.custom-dialog-dark .p-dialog-header-icon {
  color: #aebbc7 !important;
}

.p-dialog.custom-dialog-dark .p-dialog-header-icon:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

/* Contenido del diálogo - AQUÍ ESTÁ EL PROBLEMA */
.p-dialog.custom-dialog-dark .p-dialog-content {
  background-color: #0F3460 !important;
  padding: 1.5rem !important;
  color: #F1F6F9 !important;
}

/* Footer del diálogo */
.p-dialog.custom-dialog-dark .p-dialog-footer {
  background-color: #0F3460 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 1rem 1.5rem !important;
}

/* Overlay/máscara del diálogo */
.p-dialog-mask {
  background-color: rgba(0, 0, 0, 0.6) !important;
}
</style>