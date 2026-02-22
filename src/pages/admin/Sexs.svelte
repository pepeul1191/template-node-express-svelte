<script>
  import { onMount } from 'svelte';
  import { Link } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";

  let sexDataTable;

  // Alertas
  let alertMessage = {
    text: '',
    status: ''
  };

  // Configuración de tabla
  const TABLE_CONFIG = {
    columns: ['id', 'name'],
    types: ['id', 'input[text]'],
    names: ['ID', 'Nombre', 'Acciones'],
    styles: ['max-width: 50px;', 'max-width: 400px;', 'max-width: 350px;'],
    classes: ['d-none', '', 'text-end'],
    messages: {
      success: 'Datos actualizados correctamente',
      errorNetwork: 'No se pudo listar los sexos. No hay conexión con el servidor.',
      notFound: 'No se pudo listar los sexos. Recurso no encontrado.',
      serverError: 'No se pudo listar los sexos. Error interno del servidor.',
      requestError: 'No se pudo listar los sexos. No se recibió respuesta del servidor.',
      otherError: 'No se pudo listar los sexos. Ocurrió un error inesperado.'
    }
  };

  // Manejo de alertas
  const handleTableAlert = (event) => {
    alertMessage = event.detail;

    setTimeout(() => {
      alertMessage = { text: '', status: '' };
    }, 4300);
  };

  // Acciones de tabla
  const createActions = () => [
    {
      class: 'btn-danger',
      icon: 'fa-trash',
      label: 'Eliminar',
      action: (record) => deleteLevel(record)
    }
  ];

  const deleteLevel = (record) => {
    sexDataTable.deleteRow(record, 'id');
  };

  // Inicialización
  onMount(() => {
    sexDataTable.list();
    sexDataTable.addButton.action = () => sexDataTable.addRow();
    sexDataTable.actionButtons = createActions();
  });
</script>

<div class="container-fluid">
  <!-- Breadcrumb -->
  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> /
      <Link to="/">Datos Maestros</Link> /
      Gestión de Sexos
    </h3>
  </div>

  <!-- Tabla -->
  <div class="card">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-user me-2"></i>
        Lista de Sexos
      </h6>
    </div>

    <div class="card-body">
      {#if alertMessage.text}
        <div class="alert alert-{alertMessage.status}" role="alert">
          {alertMessage.text}
        </div>
      {/if}

      <DataTable
        bind:this={sexDataTable}
        fetchURL={`${API_URL}api/v1/sexs`}
        saveURL={`${API_URL}api/v1/sexs`}
        columnKeys={TABLE_CONFIG.columns}
        columnTypes={TABLE_CONFIG.types}
        columnNames={TABLE_CONFIG.names}
        columnStyles={TABLE_CONFIG.styles}
        columnClasses={TABLE_CONFIG.classes}
        tdStyles={TABLE_CONFIG.styles}
        messages={TABLE_CONFIG.messages}
        addButton={{ display: true, disabled: false, action: null }}
        saveButton={{ display: true, disabled: false, action: null }}
        actionButtons={[]}
        jwtToken={localStorage.getItem('jwtToken')}
        on:alert={handleTableAlert}
      />
    </div>
  </div>
</div>
