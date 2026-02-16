<script>
  import { Link } from "svelte-routing";

  let search = "";
  let selectedId = null;
</script>

<div class="container-fluid">

  <!-- Breadcrumb -->
  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> /
      <Link to="/">Datos Maestros</Link> /
      Gestión de Locaciones
    </h3>
  </div>

  <!-- AUTOCOMPLETE -->
  <div class="card mb-4">
    <div class="card-header p-2">
      <h6 class="mb-0">
        <i class="fa fa-info-circle me-2"></i>
        Prueba de Autocompletado de Búsqueda de Locaciones
      </h6>
    </div>

    <div class="card-body p-3">
      <div class="col-md-5 autocomplete-wrapper">

        <label class="form-label">
          Nombre de la Provincia
        </label>

        <input
          type="text"
          class="form-control"
          placeholder="Buscar..."
          bind:value={search}
        >

        <input type="hidden" bind:value={selectedId}>

        <div class="suggestion-list">
          <!-- Aquí irán las sugerencias dinámicas -->
        </div>

      </div>
    </div>
  </div>

  <!-- LISTA -->
  <div class="card mb-4">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-list me-2"></i>
        Lista de Departamentos / Provincias / Distritos
      </h6>
    </div>

    <div class="card-body">
      <div class="row">
        <!-- Aquí irá tu tabla o contenido -->
      </div>
    </div>
  </div>

</div>

<style>
  .autocomplete-wrapper {
    position: relative;
  }

  .suggestion-list {
    position: absolute;
    width: 100%;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    z-index: 1000;
  }
</style>
