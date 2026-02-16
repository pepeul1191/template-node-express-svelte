<script>
  import { sidebarCollapsed } from "../../stores/sidebarStore";
</script>

<!-- SIDEBAR -->
<div
  id="sidebar"
  class="bg-secondary text-white d-flex flex-column vh-100 sidebar"
  class:collapsed={$sidebarCollapsed}
>

  <div class="flex-grow-1">

    <div class="sidebar-module active">
      <div class="module-title">
        
          Administración
      </div>

      <div class="module-items">
        <a href="/" class="sidebar-link sidebar-link-active">
          Datos Maestros
        </a>
        <a href="/students" class="sidebar-link">
          Estudiantes
        </a>
        <a href="/workers" class="sidebar-link">
          Trabajadores
        </a>
        <a href="/representatives" class="sidebar-link">
          Apoderados
        </a>
        <a href="/academic" class="sidebar-link">
          Académico
        </a>
      </div>
    </div>

    <!-- MÓDULOS SIMPLES -->
    <a href="#" class="sidebar-module-link">
      Mensajes
    </a>
    <a href="#" class="sidebar-module-link">
      Reportes
    </a>
    <a href="#" class="sidebar-module-link">
      Configuración
    </a>

  </div>

  <!-- FOOTER -->
  <div class="p-3 border-top border-light small text-white-50 sidebar-footer">
    {#if !$sidebarCollapsed}
      <div><strong>Mi Dashboard</strong></div>
      <div>Powered by Bootstrap 5</div>
      <div>Versión 1.0.0</div>
      <div class="mt-2">© 2026 Tu Empresa</div>
    {/if}
  </div>

</div>

<style>
  .sidebar {
    width: 250px;
    transition: width 0.3s ease;
    position: fixed;
    top: 56px;
    left: 0;
  }

  .sidebar.collapsed {
    width: 70px;
  }

  .sidebar-link,
  .sidebar-module-link {
    display: block;
    padding: 10px 20px;
    color: white;
    text-decoration: none;
  }

  .sidebar-link:hover,
  .sidebar-module-link:hover {
    background: rgba(255, 255, 255, 0.1);
  }
</style>
