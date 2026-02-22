<script>
  // src/components/navigation/Sidebar.svelte
  import { sidebarCollapsed } from "../../stores/sidebarStore";
  import { Link } from "svelte-routing";

  const activeClass = (path) => ({ isCurrent, isPartiallyCurrent }) => {
    const isRoot = path === "/";

    const active = isRoot
      ? isCurrent                    // solo exact match para "/"
      : isCurrent || isPartiallyCurrent;

    return {
      class: active
        ? "sidebar-link sidebar-link-active"
        : "sidebar-link"
    };
  };
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
        <Link to="/" getProps={activeClass("/")}>
          Datos Maestros
        </Link>

        <Link to="/management/students" getProps={activeClass("/students")}>
          Estudiantes
        </Link>

        <Link to="/management/workers" getProps={activeClass("/workers")}>
          Trabajadores
        </Link>

        <Link to="/management/representatives" getProps={activeClass("/representatives")}>
          Apoderados
        </Link>

        <Link to="/academic" getProps={activeClass("/academic")}>
          Académico
        </Link>
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

  .sidebar-link-active{
    font-size: 18px;
  }
</style>
