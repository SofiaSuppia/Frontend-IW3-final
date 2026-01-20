import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'       
import HomeView from '../views/HomeView.vue' 
import OrdersView from '../views/OrdersView.vue'
import UsersView from '../views/UsersView.vue'
import ProductsView from '@/views/ProductsView.vue'
import OrderDetailView from '@/views/OrderDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',          // <--- ESTO ES LA CLAVE: La raíz ahora es el Login
      name: 'login',
      component: Login
    },
    {
      path: '/home',      // El Dashboard estará en /home
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true } // Esta etiqueta protege la ruta
    },
    { path: '/orders', 
      component: OrdersView,
      meta: { requiresAuth: true } // Esta etiqueta protege la ruta
    },
    { path: '/users', 
      component: UsersView, 
      meta: { requiresAuth: true } 
    },
    { path: '/products', 
      component: ProductsView, 
      meta: { requiresAuth: true } 
    },
    { path: '/orders/:id', 
      component: OrderDetailView, 
      meta: { requiresAuth: true } 
    },
  ]
})

// --- GUARDIA DE SEGURIDAD ---
// Esto evita que alguien escriba "/home" en la barra sin haberse logueado
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  // Si la ruta a la que vas requiere autorización y NO tienes token...
  if (to.meta.requiresAuth && !token) {
    next('/'); // ...te devuelve al Login (la raíz)
  } else {
    next(); // ...si tienes token o vas al login, te deja pasar
  }
});

export default router
