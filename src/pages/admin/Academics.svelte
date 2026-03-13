<script>
  import { Link } from "svelte-routing";

  export let userRoles = [];

  const hasRole = (role) => userRoles.includes(role);

  // 📦 Configuración de cards
  const dashboardModules = [
    {
      title: "Cursos",
      description: "Gestiona los cursos disponibles en el sistema",
      icon: "fa-book",
      route: "/management/courses"
    },
    {
      title: "Secciones",
      description: "Gestiona las secciones asignadas a los cursos",
      icon: "fa-th-large",
      route: "/management/sections"
    },
    {
      title: "Asistencia",
      description: "Gestiona el registro de asistencia de los estudiantes",
      icon: "fa-calendar-check-o",
      route: "/management/attendance"
    }
  ];
</script>

<div class="container-fluid">

  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> / Datos Académicos
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
