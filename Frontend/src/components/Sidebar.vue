<template>
  <aside class="sidebar">
    <div class="brand">
      <img src="/assets/images/logo.png" alt="FluxGas Logo" class="sidebar-logo" />
    </div>
    <nav class="nav-menu">
      <ul>
        <li 
          class="nav-item" 
          :class="{ active: activePage === 'home' }" 
          @click="navigateTo('/home')"
        >
          <span class="icon">🏠</span> <span>Inicio</span>
        </li>
        <li 
          class="nav-item" 
          :class="{ active: activePage === 'orders' }" 
          @click="navigateTo('/orders')"
        >
          <span class="icon">🚛</span> <span>Órdenes</span>
        </li>
        <li 
          class="nav-item" 
          :class="{ active: activePage === 'products' }" 
          @click="navigateTo('/products')"
        >
          <span class="icon">🛢️</span> <span>Productos</span>
        </li>
        <li 
          class="nav-item" 
          :class="{ active: activePage === 'users' }" 
          @click="navigateTo('/users')"
        >
          <span class="icon">👥</span> <span>Usuarios</span>
        </li>
      </ul>
    </nav>
    <div class="bottom-section">
      <div class="user-profile">
        <div class="avatar-circle">{{ username.charAt(0).toUpperCase() }}</div>
        <div class="user-info">
          <span class="user-name">{{ username }}</span>
          <span class="user-role">Gerente</span>
        </div>
      </div>
      <div class="logout-wrapper" @click="handleLogout">
        <span class="icon">↪️</span> <span>Cerrar Sesión</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';
import authService from '../services/authService';

// Definimos la propiedad para saber qué item activar
const props = defineProps({
  activePage: {
    type: String,
    required: true
  }
});

const router = useRouter();
const username = localStorage.getItem('username') || 'Administrador';

const handleLogout = () => {
  authService.logout();
  router.push('/');
};

const navigateTo = (route) => {
  router.push(route);
};
</script>

<style scoped>
/* Estilos exclusivos de la Sidebar */
.sidebar {
  width: 260px; 
  background-color: #0F3460; 
  color: #F1F6F9;
  display: flex; 
  flex-direction: column; 
  padding: 1.5rem;
  box-shadow: 4px 0 15px rgba(0,0,0,0.4); 
  z-index: 20;
  justify-content: space-between;
  height: 100vh; /* Asegura que ocupe toda la altura */
}

.brand { 
  display: flex; align-items: center; justify-content: center; 
  margin-bottom: 2rem; padding-bottom: 1rem; 
  border-bottom: 1px solid rgba(255,255,255,0.1); 
  min-height: 60px; 
}
.sidebar-logo { max-width: 180px; height: auto; max-height: 60px; object-fit: contain; }

.nav-menu ul { list-style: none; padding: 0; margin: 0; }

.nav-item { 
  display: flex; align-items: center; gap: 12px; 
  padding: 12px 15px; margin-bottom: 8px; 
  border-radius: 8px; cursor: pointer; 
  transition: all 0.3s ease; color: #aebbc7; font-weight: 500; 
}
.nav-item:hover { background-color: rgba(255, 255, 255, 0.05); color: #F1F6F9; }
.nav-item.active { background-color: #E94560; color: white; box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3); }

.icon { font-size: 1.1rem; }

.bottom-section { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; }

.user-profile { 
  display: flex; align-items: center; gap: 12px; 
  margin-bottom: 1.5rem; padding: 10px; 
  background: rgba(0,0,0,0.2); border-radius: 10px; 
}
.avatar-circle { 
  width: 40px; height: 40px; background-color: #F1F6F9; 
  color: #0F3460; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  font-weight: bold; font-size: 1.2rem; 
}
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.95rem; font-weight: bold; color: #F1F6F9; }
.user-role { font-size: 0.75rem; color: #aebbc7; }

.logout-wrapper { 
  display: flex; align-items: center; gap: 10px; 
  padding: 10px; color: #aebbc7; cursor: pointer; 
  transition: 0.3s; border-radius: 6px; 
}
.logout-wrapper:hover { color: #E94560; background-color: rgba(233, 69, 96, 0.1); }
</style>