import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'       
import HomeView from '../views/HomeView.vue' 
import OrdersView from '../views/OrdersView.vue'
import UsersView from '../views/UsersView.vue'
import ProductsView from '@/views/ProductsView.vue'
import OrderDetailView from '@/views/OrderDetailView.vue'
import ConciliacionView from '../views/ConciliacionView.vue';

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
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      beforeEnter: (to, from, next) => {
        // Obtenemos el rol. Puede venir del localStorage o decodificando el token si es necesario
        // Asumimos que guardaste 'role' o usamos la lógica del token
        let role = localStorage.getItem('role'); 
        
        // Si no hay rol explícito, intentamos leerlo del token (backup de seguridad)
        if (!role) {
            const token = localStorage.getItem('token');
            if (token) {
                 try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                    const decoded = JSON.parse(jsonPayload);
                    // Buscamos ROLE_ADMIN en roles o authorities
                    const roles = decoded.roles || decoded.authorities || [];
                    const roleString = JSON.stringify(roles).toUpperCase();
                    if (roleString.includes('ADMIN')) role = 'ADMIN';
                 } catch (e) {}
            }
        }

        // CORRECCIÓN AQUÍ: Comparamos mayúscula contra mayúscula
        if (role && role.toUpperCase().includes('ADMIN')) {
          next(); 
        } else {
          console.warn('Acceso denegado: Rol detectado ->', role);
          next('/home'); 
        }
      }
    },
    { path: '/products', 
      component: ProductsView, 
      meta: { requiresAuth: true } 
    },
    { path: '/orders/:id', 
      component: OrderDetailView, 
      meta: { requiresAuth: true } 
    },
    {
      path: '/conciliacion/:id',
      name: 'conciliacion',
      component: ConciliacionView,
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
