<template>
  <div class="login-container">
    <!-- Capa oscura para mejorar lectura del texto sobre la imagen -->
    <div class="overlay-mask"></div>

    <div class="content-wrapper">
      
      <!-- LADO IZQUIERDO: Texto de Bienvenida -->
      <div class="text-section">
        <!-- LOGO AGREGADO AQUÍ -->
        <img src="/assets/images/logo.png" alt="FluxGas Logo" class="login-logo" />
        
        <h1>Bienvenido<br>de vuelta</h1>
        <p class="description">
          Soluciones confiables en transporte y distribución de gas. 
          Conectando energía con eficiencia.
        </p>
        <!-- Iconos decorativos -->
        <div class="social-icons">
          <i class="pi pi-facebook"></i>
          <i class="pi pi-twitter"></i>
          <i class="pi pi-instagram"></i>
        </div>
      </div>

      <!-- LADO DERECHO: Formulario (Glass Card) -->
      <div class="form-section">
        <div class="glass-card">
          <h2>Iniciar Sesión</h2>
          
          <div class="input-group">
            <label for="username">Usuario</label>
            <InputText id="username" v-model="username" class="custom-input" placeholder="admin" />
          </div>

          <div class="input-group">
            <label for="password">Contraseña</label>
            <div class="password-wrapper">
              <Password 
                id="password" 
                v-model="password" 
                class="custom-input-password" 
                :feedback="false" 
                toggleMask 
                placeholder="••••••"
                inputClass="custom-input-inner"
              />
            </div>
          </div>

          <!-- Checkbox y Olvidé contraseña en la misma línea -->
          <div class="options-row">
            <div class="remember-me">
              <input type="checkbox" id="remember" />
              <label for="remember">Recordarme</label>
            </div>
            <span class="forgot-link" @click="handleForgotPassword">¿Olvidaste tu contraseña?</span>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <Button label="INGRESAR AHORA" class="login-btn" @click="handleLogin" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService'; 

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref(''); 

const handleLogin = async () => {
  error.value = ''; 
  try {
    console.log("Intentando loguear con:", username.value); // Debug
    
    // 1. Llamada al Backend
    await authService.login(username.value, password.value);
    
    console.log("Login exitoso, redirigiendo..."); // Debug
    
    // 2. Redirección
    router.push('/home'); 
  } catch (err) {
    console.error("Error de login:", err); // Ver esto en consola (F12)
    error.value = 'Usuario o contraseña incorrectos';
  }
};

const handleForgotPassword = () => {
  console.log('Recuperar contraseña');
};
</script>

<style scoped>
/* --- CONTENEDOR PRINCIPAL (FONDO) --- */
.login-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background-image: url('/assets/images/fondo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Máscara oscura sutil sobre toda la imagen */
.overlay-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 52, 96, 0.4); 
  z-index: 1;
}

/* --- WRAPPER DEL CONTENIDO --- */
.content-wrapper {
  position: relative;
  z-index: 2;
  width: 90%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 1fr; 
  gap: 4rem;
  align-items: center;
}

/* --- LADO IZQUIERDO (TEXTO) --- */
.text-section {
  color: #fff;
  padding-right: 2rem;
}

/* Estilo para el Logo */
.login-logo {
  height: 80px; /* Ajusta el tamaño según prefieras */
  margin-bottom: 1.5rem;
  display: block;
}

.text-section h1 {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.text-section .description {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 450px;
  margin-bottom: 2rem;
}

.social-icons {
  display: flex;
  gap: 1rem;
}
.social-icons i {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
  transition: 0.3s;
}
.social-icons i:hover { opacity: 1; transform: translateY(-3px); }


/* --- LADO DERECHO (FORMULARIO) --- */
.form-section {
  display: flex;
  justify-content: flex-end; 
}

.glass-card {
  background: rgba(22, 33, 62, 0.85); 
  backdrop-filter: blur(10px); 
  padding: 3rem;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.glass-card h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #fff;
}

/* Inputs */
.input-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
label { font-size: 0.9rem; color: #F1F6F9; }

:deep(.custom-input), :deep(.custom-input-inner) {
  background-color: #F1F6F9 !important; 
  border: none !important;
  color: #0F3460 !important; 
  padding: 12px !important;
  border-radius: 4px !important;
  width: 100%;
  font-weight: 500;
}
:deep(.custom-input:focus), :deep(.custom-input-inner:focus) {
  box-shadow: 0 0 0 2px #F9A826 !important;
}
:deep(.p-password), :deep(.p-password-input) { width: 100%; }

/* Icono del ojo centrado */
:deep(.p-password) { position: relative; }
:deep(.p-password .p-icon) {
  position: absolute;
  top: 50% !important;
  transform: translateY(-50%) !important;
  right: 12px !important;
  color: #0F3460 !important;
  cursor: pointer;
}

/* Opciones */
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  color: #ccc;
}
.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.forgot-link {
  color: #ccc;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-link:hover { color: #fff; text-decoration: underline; }

/* Botón Principal */
.login-btn {
  background-color: #F9A826 !important; 
  color: #fff !important;
  border: none !important;
  padding: 14px !important;
  font-weight: 700 !important;
  width: 100%;
  border-radius: 4px !important;
  transition: background 0.3s;
}
.login-btn:hover {
  background-color: #e0961f !important;
}

/* Footer Links */
.footer-links {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  color: #aaa;
}
.footer-links span {
  cursor: pointer;
}
.footer-links span:hover { color: #fff; text-decoration: underline; }

.error-msg {
  color: #ff6b6b;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: bold;
}

/* --- RESPONSIVE --- */
@media (max-width: 900px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  .text-section {
    padding-right: 0;
  }
  /* Centrar logo en móvil */
  .login-logo {
    margin: 0 auto 1.5rem auto;
  }
  .text-section h1 { font-size: 3rem; }
  .description { margin: 0 auto 2rem auto; }
  .social-icons { justify-content: center; }
  .form-section { justify-content: center; }
}
</style>