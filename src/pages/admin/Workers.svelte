<script>
  // src/pages/admin/Workers.svelte
  // IMPORTS
  import { onMount } from 'svelte';
  import { Link } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";
  import WorkerDetail from '../../components/forms/WorkerDetail.svelte';
  import WorkersFilter from '../../components/forms/WorkersFilter.svelte';
  import { Modal } from 'bootstrap';

  let workerDataTable;
  let workerDetailModalEl;
  let workerModalInstance;
  let workerFormInstance;
  let modalTitle = '';

  // Alertas
  let alertMessage = {
    text: '',
    status: ''
  };

  // Configuración de tabla
  const TABLE_CONFIG = {
    columns: ['id', 'person.last_names', 'person.names','person.sex.name', 'person.document_type.name', 'person.document_number', 'code'],
    types: ['id', 'td', 'td', 'td', 'td', 'id', 'td'],
    names: ['ID', 'Apellidos', 'Nombres', 'Sexo', 'Documento', 'Número de Doc.', 'Código', 'Acciones'],
    styles: ['max-width: 50px;', '', '', '', 'max-width: 120px;', 'max-width: 300px;', 'max-width: 200px;'],
    classes: ['d-none', '', '', '', '', '', 'text-end'],
    messages: {
      success: 'Datos actualizados correctamente',
      errorNetwork: 'No se pudo listar los trabajadores. No hay conexión con el servidor.',
      notFound: 'No se pudo listar los trabajadores. Recurso no encontrado.',
      serverError: 'No se pudo listar los trabajadores. Error interno del servidor.',
      requestError: 'No se pudo listar los trabajadores. No se recibió respuesta del servidor.',
      otherError: 'No se pudo listar los trabajadores. Ocurrió un error inesperado.'
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
      class: 'btn-primary',
      icon: 'fa-edit',
      label: 'Editar',
      action: (record) => openEditModal(record)
    },
    {
      class: 'btn-danger',
      icon: 'fa-trash',
      label: 'Eliminar',
      action: (record) => deleteWorker(record)
    }
  ];

  const deleteWorker = (record) => {
    workerDataTable.askToDeleteRow(record, 'id');
  };

  const openEditModal = (record) => {
    // record may include nested Person object
    modalTitle = 'Editar Trabajador';
    if (workerFormInstance && typeof workerFormInstance.showEdit === 'function') {
      workerFormInstance.showEdit(record);
    }
    if (workerModalInstance) workerModalInstance.show();
  };

  const openCreateModal = () => {
    modalTitle = 'Nuevo Trabajador';
    if (workerFormInstance && typeof workerFormInstance.showCreate === 'function') {
      workerFormInstance.showCreate();
    }
    if (workerModalInstance) workerModalInstance.show();
  };

  // Callback when modal saves a worker
  const handleSaved = (event) => {
    const saved = event.detail;
    alertMessage = { text: 'Trabajador guardado correctamente', status: 'success' };
    if (workerModalInstance) workerModalInstance.hide();
    workerDataTable.list();
    setTimeout(() => alertMessage = { text: '', status: '' }, 4000);
  };

  const handleModalClose = () => {
    if (workerModalInstance) workerModalInstance.hide();
  };

  const handleSearch = (event) => {
    const { name, documentNumber, code } = event.detail;
    // add params to queryParams and refresh
    workerDataTable.queryParams = { ...workerDataTable.queryParams, name, documentNumber, code };
    workerDataTable.pagination.actualPage = 1;
    workerDataTable.list();
  };

  const handleClean = () => {
    workerDataTable.queryParams = {};
    workerDataTable.pagination.actualPage = 1;
    workerDataTable.list();
  };

  // Inicialización
  onMount(() => {
    workerDataTable.list();
    workerDataTable.addButton.action = () => openCreateModal();
    workerDataTable.actionButtons = createActions();
    // enable pagination
    workerDataTable.pagination.display = true;
    workerDataTable.pagination.actualPage = 1;
    // initialize bootstrap modal instance for the worker detail modal
    if (workerDetailModalEl) {
      workerModalInstance = new Modal(workerDetailModalEl, { backdrop: 'static' });
    }
  });
</script>

<div class="container-fluid">
  <!-- Breadcrumb -->
  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> /
      Gestión de Trabajadores
    </h3>
  </div>

  <div class="card">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-search me-2"></i>
        Filtros de Búsqueda
      </h6>
    </div>

    <div class="card-body">
      <!-- filtro de búsqueda -->
      <WorkersFilter on:search={handleSearch} on:clean={handleClean} />
    </div>
  </div>

  <!-- Tabla -->
  <div class="card mt-4">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-user me-2"></i>
        Lista de Trabajadores
      </h6>
    </div>

    <div class="card-body">
      {#if alertMessage.text}
        <div class="alert alert-{alertMessage.status}" role="alert">
          {alertMessage.text}
        </div>
      {/if}

      <DataTable
        bind:this={workerDataTable}
        fetchURL={`${API_URL}api/v1/workers`}
        saveURL={`${API_URL}api/v1/workers`}
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

<!-- Modal wrapper for WorkerDetail -->
<div bind:this={workerDetailModalEl} class="modal fade" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{modalTitle}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <WorkerDetail bind:this={workerFormInstance} on:saved={handleSaved} on:close={handleModalClose} />
      </div>
    </div>
  </div>
</div>


<style> 

</style>