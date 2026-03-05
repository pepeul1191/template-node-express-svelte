<script>
  // src/pages/admin/Students.svelte
  // IMPORTS
  import { onMount } from 'svelte';
  import { Link } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";
  import StudentDetail from '../../components/forms/StudentDetail.svelte';
  import StudentsFilter from '../../components/forms/StudentsFilter.svelte';
  import { Modal } from 'bootstrap';

  let studentDataTable;
  let studentDetailModalEl;
  let studentModalInstance;
  let studentFormInstance;
  let modalTitle = '';

  // Alertas
  let alertMessage = {
    text: '',
    status: ''
  };

  // Configuración de tabla
  const TABLE_CONFIG = {
    columns: ['id', 'person.last_names', 'person.names','email', 'person.document_type.name', 'person.document_number', 'code'],
    types: ['id', 'td', 'td', 'td', 'td', 'id', 'td'],
    names: ['ID', 'Apellidos', 'Nombres', 'Correo', 'Documento', 'Número de Doc.', 'Código', 'Acciones'],
    styles: ['max-width: 50px;', '', '', '', 'max-width: 120px;', 'max-width: 300px;', 'max-width: 200px;'],
    classes: ['d-none', '', '', '', '', '', 'text-end'],
    messages: {
      success: 'Datos actualizados correctamente',
      errorNetwork: 'No se pudo listar los estudiantes. No hay conexión con el servidor.',
      notFound: 'No se pudo listar los estudiantes. Recurso no encontrado.',
      serverError: 'No se pudo listar los estudiantes. Error interno del servidor.',
      requestError: 'No se pudo listar los estudiantes. No se recibió respuesta del servidor.',
      otherError: 'No se pudo listar los estudiantes. Ocurrió un error inesperado.'
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
      action: (record) => deleteStudent(record)
    }
  ];

  const deleteStudent = (record) => {
    studentDataTable.askToDeleteRow(record, 'id');
  };

  const openEditModal = (record) => {
    // record may include nested Person object
    modalTitle = 'Editar Estudiante';
    if (studentFormInstance && typeof studentFormInstance.showEdit === 'function') {
      console.log(record)
      studentFormInstance.showEdit(record);
    }
    if (studentModalInstance) studentModalInstance.show();
  };

  const openCreateModal = () => {
    modalTitle = 'Nuevo Estudiante';
    if (studentFormInstance && typeof studentFormInstance.showCreate === 'function') {
      studentFormInstance.showCreate();
    }
    if (studentModalInstance) studentModalInstance.show();
  };

  // Callback when modal saves a student
  const handleSaved = (event) => {
    const saved = event.detail;
    alertMessage = { text: 'Estudiante guardado correctamente', status: 'success' };
    if (studentModalInstance) studentModalInstance.hide();
    studentDataTable.list();
    setTimeout(() => alertMessage = { text: '', status: '' }, 4000);
  };

  const handleModalClose = () => {
    console.log('Modal cerrado');
    studentDataTable.list();
    if (studentModalInstance) studentModalInstance.hide();
  };

  const handleSearch = (event) => {
    const { name, document_number, code, email } = event.detail;
    // add params to queryParams and refresh
    studentDataTable.queryParams = { ...studentDataTable.queryParams, name, document_number, code, email };
    studentDataTable.pagination.actualPage = 1;
    studentDataTable.list();
  };

  const handleClean = () => {
    studentDataTable.queryParams = {};
    studentDataTable.pagination.actualPage = 1;
    studentDataTable.list();
  };

  // Inicialización
  onMount(() => {
    studentDataTable.list();
    studentDataTable.addButton.action = () => openCreateModal();
    studentDataTable.actionButtons = createActions();
    // enable pagination
    studentDataTable.pagination.display = true;
    studentDataTable.pagination.actualPage = 1;
    // initialize bootstrap modal instance for the student detail modal
    if (studentDetailModalEl) {
      studentModalInstance = new Modal(studentDetailModalEl, { backdrop: 'static' });
      studentDetailModalEl.addEventListener('hidden.bs.modal', handleModalClose);
    }
  });
</script>

<div class="container-fluid">
  <!-- Breadcrumb -->
  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> /
      Gestión de Estudiantes
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
      <StudentsFilter on:search={handleSearch} on:clean={handleClean} />
    </div>
  </div>

  <!-- Tabla -->
  <div class="card mt-4">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-user me-2"></i>
        Lista de Estudiante
      </h6>
    </div>

    <div class="card-body">
      {#if alertMessage.text}
        <div class="alert alert-{alertMessage.status}" role="alert">
          {alertMessage.text}
        </div>
      {/if}

      <DataTable
        bind:this={studentDataTable}
        fetchURL={`${API_URL}api/v1/students`}
        saveURL={`${API_URL}api/v1/students`}
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
<div bind:this={studentDetailModalEl} class="modal fade" tabindex="-1">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{modalTitle}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <StudentDetail 
          bind:this={studentFormInstance} 
          on:saved={handleSaved} 
          on:close={handleModalClose} />
      </div>
    </div>
  </div>
</div>


<style> 

</style>