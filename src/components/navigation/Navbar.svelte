<script>
  import 'bootstrap/dist/js/bootstrap.bundle.min.js';
  import { sidebarCollapsed } from "../../stores/sidebarStore";

  function toggleSidebar() {
    sidebarCollapsed.update(value => !value);
  }

  function signOut() {
    // Limpiar el localStorage
    localStorage.clear();

    // Redirigir a /sign-out
    window.location.href = '/sign-out';
  }
</script>

<nav class="navbar navbar-dark bg-dark px-3 w-100 fixed-top">
  
  <!-- LADO IZQUIERDO -->
  <div class="d-flex align-items-center">
    <button 
      class="btn btn-outline-light me-2"
      on:click={toggleSidebar}>
      ☰
    </button>
    <span class="navbar-brand mb-0 h1">Mi Dashboard</span>
  </div>

  <!-- LADO DERECHO -->
  <div class="dropdown">
    <button 
      class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 border-0"
      type="button"
      data-bs-toggle="dropdown">
      
      <img 
        src="/img/user.png"
        alt="Foto de perfil"
        class="rounded-circle"
        width="32"
        height="32">

      Juan Pérez
    </button>

    <ul class="dropdown-menu dropdown-menu-end">
      <li>
        <a class="dropdown-item" href="#">Editar perfil</a>
      </li>
      <li>
        <a class="dropdown-item" href="#">Configuración</a>
      </li>
      <li>
        <hr class="dropdown-divider">
      </li>
      <li>
        <!-- Botón de Cerrar sesión con método -->
        <button class="dropdown-item text-danger" on:click={signOut}>
          Cerrar sesión
        </button>
      </li>
    </ul>
  </div>

</nav>