<script>
  import { onMount } from 'svelte';
  import { Link } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";

  let documentTypeDataTable;

  // Alertas
  let alertMessage = {
    text: '',
    status: ''
  };

  // Configuración de tabla
  const TABLE_CONFIG = {
    columns: ['id', 'name'],
    types: ['id', 'td'],
    names: ['ID', 'Nombre', 'Acciones'],
    styles: ['max-width: 50px;', 'max-width: 400px;', 'max-width: 350px;'],
    classes: ['d-none', '', 'text-end'],
    messages: {
      success: 'Datos actualizados correctamente',
      errorNetwork: 'No se pudo listar los tipos de documento en identidad. No hay conexión con el servidor.',
      notFound: 'No se pudo listar los tipos de documento en identidad. Recurso no encontrado.',
      serverError: 'No se pudo listar los tipos de documento en identidad. Error interno del servidor.',
      requestError: 'No se pudo listar los tipos de documento en identidad. No se recibió respuesta del servidor.',
      otherError: 'No se pudo listar los tipos de documento en identidad. Ocurrió un error inesperado.'
    }
  };

  // Manejo de alertas
  const handleTableAlert = (event) => {
    alertMessage = event.detail;

    setTimeout(() => {
      alertMessage = { text: '', status: '' };
    }, 4300);
  };

  // Inicialización
  onMount(() => {
    documentTypeDataTable.list();
  });
</script>

<div class="container-fluid">
  <!-- Breadcrumb -->
  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> /
      <Link to="/">Datos Maestros</Link> /
      Gestión de tipos de documento en identidad
    </h3>
  </div>

  <!-- Tabla -->
  <div class="card">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-user me-2"></i>
        Lista de tipos de documento en identidad
      </h6>
    </div>

    <div class="card-body">
      {#if alertMessage.text}
        <div class="alert alert-{alertMessage.status}" role="alert">
          {alertMessage.text}
        </div>
      {/if}

      <DataTable
        bind:this={documentTypeDataTable}
        fetchURL={`${API_URL}api/v1/document-types`}
        saveURL={`${API_URL}api/v1/document-types`}
        columnKeys={TABLE_CONFIG.columns}
        columnTypes={TABLE_CONFIG.types}
        columnNames={TABLE_CONFIG.names}
        columnStyles={TABLE_CONFIG.styles}
        columnClasses={TABLE_CONFIG.classes}
        tdStyles={TABLE_CONFIG.styles}
        messages={TABLE_CONFIG.messages}
        addButton={{ display: false, disabled: false, action: null }}
        saveButton={{ display: false, disabled: false, action: null }}
        actionButtons={[]}
        jwtToken={localStorage.getItem('jwtToken')}
        on:alert={handleTableAlert}
      />
    </div>
  </div>
</div>
