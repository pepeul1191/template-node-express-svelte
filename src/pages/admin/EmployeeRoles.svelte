<script>
  import { onMount } from 'svelte';
  import { Link } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";

  let employeeRoleDataTable;

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
    styles: ['max-width: 50px;', 'max-width: 200px;', 'max-width: 150px;'],
    classes: ['d-none', '', 'text-end'],
    messages: {
      success: 'Datos actualizados correctamente',
      errorNetwork: 'No se pudo listar los roles. No hay conexión con el servidor.',
      notFound: 'No se pudo listar los roles. Recurso no encontrado.',
      serverError: 'No se pudo listar los roles. Error interno del servidor.',
      requestError: 'No se pudo listar los roles. No se recibió respuesta del servidor.',
      otherError: 'No se pudo listar los roles. Ocurrió un error inesperado.'
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
      action: (record) => deleteRole(record)
    }
  ];

  const deleteRole = (record) => {
    employeeRoleDataTable.deleteRow(record, 'id');
  };

  // Inicialización
  onMount(() => {
    employeeRoleDataTable.list();
    employeeRoleDataTable.addButton.action = () => employeeRoleDataTable.addRow();
    employeeRoleDataTable.actionButtons = createActions();
  });
</script>

<div class="container-fluid">
  <!-- Breadcrumb -->
  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> /
      <Link to="/">Datos Maestros</Link> /
      Gestión de Roles de Empleados
    </h3>
  </div>

  <!-- Tabla -->
  <div class="card">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-user me-2"></i>
        Lista de Roles de Empleados
      </h6>
    </div>

    <div class="card-body">
      {#if alertMessage.text}
        <div class="alert alert-{alertMessage.status}" role="alert">
          {alertMessage.text}
        </div>
      {/if}

      <DataTable
        bind:this={employeeRoleDataTable}
        fetchURL={`${API_URL}api/v1/employee-roles`}
        saveURL={`${API_URL}api/v1/employee-roles`}
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
