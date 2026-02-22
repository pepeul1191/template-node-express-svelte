<script>
  import { Link } from "svelte-routing";

  export let userRoles = [];

  const hasRole = (role) => userRoles.includes(role);

  // 📦 Configuración de cards
  const dashboardModules = [
    {
      title: "Locaciones",
      description: "Gestiona departamentos, provincias y distritos",
      icon: "fa-map-marker",
      route: "/management/locations"
    },
    {
      title: "Roles de Empleados",
      description: "Gestiona los roles y permisos de los empleados",
      icon: "fa-user",
      route: "/management/employee-roles"
    },
    {
      title: "Roles de Apoderados",
      description: "Gestiona los roles y permisos de los apoderados",
      icon: "fa-users",
      route: "/management/representative-roles"
    },
    {
      title: "Tipos de Documento",
      description: "Gestiona los tipos de documento para las personas",
      icon: "fa-id-card",
      route: "/management/document-types"
    },
    {
      title: "Niveles",
      description: "Gestiona los niveles académicos de los cursos",
      icon: "fa-sitemap",
      route: "/management/levels"
    },
    {
      title: "Tipos de Evaluación",
      description: "Gestiona las categorías de evaluaciones académicas",
      icon: "fa-check-square-o",
      route: "/management/evaluation-types"
    },
    {
      title: "Sexos",
      description: "Gestiona los tipos de sexo registrados en el sistema",
      icon: "fa-venus-mars",
      route: "/management/sexs"
    }
  ];
</script>

<div class="container-fluid">

  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> / Datos Maestros
    </h3>
  </div>

  <div class="row g-4">

    {#each dashboardModules as module}
      <div class="col-md-3 col-sm-6">
        <div class="card dashboard-card">
          <div class="card-body text-center">

            <div class="card-icon mb-3">
              <i class={`fa ${module.icon}`}></i>
            </div>

            <h5 class="card-title">{module.title}</h5>

            <p class="card-text">
              {module.description}
            </p>

            <Link
              to={module.route}
              class="btn btn-primary btn-sm">
              Ir a Gestión
            </Link>

          </div>
        </div>
      </div>
    {/each}

  </div>

  {#if hasRole('File Managment')}
    <div class="mt-4">
      <Link to="/files">
        Administrador de archivos
      </Link>
    </div>
  {/if}

</div>

<style>
  .dashboard-card {
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .dashboard-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .card-icon > i {
    font-size: 40px !important;
  }
</style>
