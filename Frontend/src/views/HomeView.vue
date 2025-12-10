<template>
  <!-- Cambié p-jc-between por p-jc-center para centrar todo -->
  <header class="topbar p-d-flex p-jc-center p-ai-center">
    <div class="brand p-d-flex p-ai-center">
      <img class="logo" src="/assets/images/logo.png" alt="FluxGas" />
    </div>
    <!-- Botón "Ingresar" eliminado -->
  </header>

  <main class="hero">
    <div class="overlay">
      <div class="hero-content">
        <h1>Bienvenido a FluxGas</h1>
        <p>Soluciones confiables en transporte y distribución de gas.</p>
        <Button label="Acceder a mi cuenta" class="p-button-lg p-mt-3" @click="goLogin" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goLogin = () => router.push('/login')
</script>

<style scoped>
/* Topbar */
.topbar{
  position:fixed;
  top:0;left:0;right:0;
  padding:12px 24px;
  z-index:20;
  background:transparent;
  /* Aseguramos centrado con CSS puro también */
  display: flex;
  justify-content: center;
}

.brand{gap:12px}

.logo{
  /* Aumenté el tamaño aquí */
  height: 120px; 
  filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));
  transition: height 0.3s ease; /* Suaviza el cambio si se redimensiona */
}

/* Hero */
.hero{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background-image: url('/assets/images/fondo.png');
  background-size:cover;
  background-position:center;
}
.overlay{
  width:100%;
  min-height:100vh;
  background:linear-gradient(rgba(5,30,45,0.6), rgba(5,30,45,0.6));
  display:flex;
  align-items:center;
  justify-content:center;
}
.hero-content{
  text-align:center;
  color:#fff;
  padding:40px;
  max-width:900px;
}
.hero-content h1{font-size:44px;margin-bottom:10px}
.hero-content p{opacity:0.9;margin-bottom:22px}
</style>