<script>
  import { onMount } from 'svelte';
  import { Link } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";

  let departmentDataTable;

  let search = "";
  let selectedId = null;

  let alertMessage = {
    text: '',
    status: ''
  };

  const handleTableAlert = (callback) => { 
    alertMessage = callback.detail;
    setTimeout(() => {
      alertMessage = {
        text: '',
        status: '',
      };
    }, 4300);
  }

  onMount(() => {
    departmentDataTable.list();
    departmentDataTable.addButton.action = () => departmentDataTable.addRow();
    departmentDataTable.actionButtons = [
      {
        class: 'btn-secondary',
        icon: 'fa-list',
        label: 'Provincias',
        action: (record) => {
          //systemDataTable.askToDeleteRow(record, 'id');
          roleId = record.id;
          //permissionsDataTable.fetchURL = API_URL + 'api/v1/roles/' + roleId + '/permissions';
          //permissionsDataTable.saveURL = API_URL + 'api/v1/permissions/' + roleId;
          //permissionsDataTable.list();
          displayPermission = true;
        }
      },
      {
        class: 'btn-danger',
        icon: 'fa-trash',
        label: 'Eliminar',
        action: (record) => {
          //systemDataTable.askToDeleteRow(record, 'id');
          //console.log(record);
          departmentDataTable.deleteRow(record, 'id');
          if(record.id == roleId){
            displayPermission = false;
          }
        }
      },
    ];
  });
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
        <div class="col-md-12">
          {#if alertMessage.text != ''}
            <div class="alert alert-{alertMessage.status}" role="alert">
              {alertMessage.text}
            </div>
          {/if}
        </div>
        <div class="col-md-4">
          <h6 class="subtitle">Departamentos</h6>
          <hr>
          <DataTable 
            bind:this={departmentDataTable}
            fetchURL={API_URL + 'api/v1/departments'}
            columnKeys={['id', 'name']}
            columnTypes={['id', 'input[text]']}
            columnNames={['ID', 'Nombre', 'Acciones']}
            columnStyles={['max-width: 50px;', 'max-width: 180px;', 'max-width: 150px;']}
            columnClasses={['d-none', '', 'text-end']}
            tdStyles={['max-width: 50px;', 'max-width: 180px;', 'max-width: 150px;']}
            messages = {{
              success: 'Datos actualizados', 
              errorNetwork: 'No se pudo listar los departamentos. No hay conexión con el servidor.',
              notFound: 'No se pudo listar los departamentos. Recurso no encontrado.',
              serverError:'No se pudo listar los departamentos. Error interno del servidor',
              requestError: 'No se pudo listar los departamentos. No se recibió respuesta del servidor',
              otherError: 'No se pudo listar los departamentos. Ocurrió un error no esperado al traer los datos del servidor',
            }}
            addButton={{
              display: true,
              disabled: false,
              action: null
            }}
            saveButton={{
              display: true,
              disabled: false,
              action: null
            }}
            actionButtons={[]} 
            jwtToken={localStorage.getItem('jwtToken')}
            on:alert={handleTableAlert}
          />
        </div>
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
