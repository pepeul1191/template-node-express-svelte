Apoderados<script>
  // src/pages/admin/Representatives.svelte
  // IMPORTS
  import { onMount } from 'svelte';
  import { Link } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";
  import RepresentativeDetail from '../../components/forms/RepresentativeDetail.svelte';
  import { Modal } from 'bootstrap';
  import RepresentativeFilter from '../../components/forms/RepresentativeFilter.svelte';

  let representativeDataTable;
  let representativeDetailModalEl;
  let representativeModalInstance;
  let representativeFormInstance;
  let modalTitle = '';

  // Alertas
  let alertMessage = {
    text: '',
    status: ''
  };

  // Configuración de tabla
  const TABLE_CONFIG = {
    columns: ['id', 'person.last_names', 'person.names','email', 'person.document_type.name', 'person.document_number'],
    types: ['id', 'td', 'td', 'td', 'td', 'id', 'td'],
    names: ['ID', 'Apellidos', 'Nombres', 'Correo', 'Documento', 'Número de Doc.', 'Acciones'],
    styles: ['max-width: 50px;', '', '', '', 'max-width: 120px;', 'max-width: 300px;', 'max-width: 200px;'],
    classes: ['d-none', '', '', '', '', '', 'text-end'],
    messages: {
      success: 'Datos actualizados correctamente',
      errorNetwork: 'No se pudo listar los apoderados. No hay conexión con el servidor.',
      notFound: 'No se pudo listar los apoderados. Recurso no encontrado.',
      serverError: 'No se pudo listar los apoderados. Error interno del servidor.',
      requestError: 'No se pudo listar los apoderados. No se recibió respuesta del servidor.',
      otherError: 'No se pudo listar los apoderados. Ocurrió un error inesperado.'
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
      action: (record) => deleteRepresentative(record)
    }
  ];

  const deleteRepresentative = (record) => {
    representativeDataTable.askToDeleteRow(record, 'id');
  };

  const openEditModal = (record) => {
    // record may include nested Person object
    modalTitle = 'Editar Apoderado';
    if (representativeFormInstance && typeof representativeFormInstance.showEdit === 'function') {
      console.log(record)
      representativeFormInstance.showEdit(record);
    }
    if (representativeModalInstance) representativeModalInstance.show();
  };

  const openCreateModal = () => {
    modalTitle = 'Nuevo Apoderado';
    if (representativeFormInstance && typeof representativeFormInstance.showCreate === 'function') {
      representativeFormInstance.showCreate();
    }
    if (representativeModalInstance) representativeModalInstance.show();
  };

  // Callback when modal saves a worker
  const handleSaved = (event) => {
    const saved = event.detail;
    alertMessage = { text: 'Apoderado guardado correctamente', status: 'success' };
    if (representativeModalInstance) representativeModalInstance.hide();
    representativeDataTable.list();
    setTimeout(() => alertMessage = { text: '', status: '' }, 4000);
  };

  const handleModalClose = () => {
    console.log('Modal cerrado');
    representativeDataTable.list();
    if (representativeModalInstance) representativeModalInstance.hide();
  };

  const handleSearch = (event) => {
    const { name, document_number, code, email } = event.detail;
    // add params to queryParams and refresh
    representativeDataTable.queryParams = { ...representativeDataTable.queryParams, name, document_number, code, email };
    representativeDataTable.pagination.actualPage = 1;
    representativeDataTable.list();
  };

  const handleClean = () => {
    representativeDataTable.queryParams = {};
    representativeDataTable.pagination.actualPage = 1;
    representativeDataTable.list();
  };

  // Inicialización
  onMount(() => {
    representativeDataTable.list();
    representativeDataTable.addButton.action = () => openCreateModal();
    representativeDataTable.actionButtons = createActions();
    // enable pagination
    representativeDataTable.pagination.display = true;
    representativeDataTable.pagination.actualPage = 1;
    // initialize bootstrap modal instance for the worker detail modal
    if (representativeDetailModalEl) {
      representativeModalInstance = new Modal(representativeDetailModalEl, { backdrop: 'static' });
      representativeDetailModalEl.addEventListener('hidden.bs.modal', handleModalClose);
    }
  });
</script>

<div class="container-fluid">
  <!-- Breadcrumb -->
  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> /
      Gestión de apoderados
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
      <RepresentativeFilter on:search={handleSearch} on:clean={handleClean} />
    </div>
  </div>

  <!-- Tabla -->
  <div class="card mt-4">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-user me-2"></i>
        Lista de apoderados
      </h6>
    </div>

    <div class="card-body">
      {#if alertMessage.text}
        <div class="alert alert-{alertMessage.status}" role="alert">
          {alertMessage.text}
        </div>
      {/if}

      <DataTable
        bind:this={representativeDataTable}
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
<div bind:this={representativeDetailModalEl} class="modal fade" tabindex="-1">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{modalTitle}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <RepresentativeDetail 
          bind:this={representativeFormInstance} 
          on:saved={handleSaved} 
          on:close={handleModalClose} />
      </div>
    </div>
  </div>
</div>


<style> 

</style>