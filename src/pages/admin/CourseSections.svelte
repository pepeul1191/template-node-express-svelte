<script>
  // src/pages/admin/CourseSections.svelte
  // IMPORTS
  import { onMount } from 'svelte';
  import { Link, navigate } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";
  import SectionDetail from '../../components/forms/SectionDetail.svelte';
  import { Modal } from 'bootstrap';
  import axios from 'axios'; // 👈 Agregar este import

  // Recibir parámetros de la ruta
  export let courseId;
 // Esto obtiene el parámetro :courseId de la URL

  let sectionDataTable;
  let sectionDetailModalEl;
  let sectionModalInstance;
  let sectionFormInstance;
  let modalTitle = '';

  // Datos del curso
  let courseName = '';

  // Alertas
  let alertMessage = {
    text: '',
    status: ''
  };

  // Configuración de tabla
  const TABLE_CONFIG = {
    columns: ['id', 'name', 'code', 'description', ''],
    types: ['id', 'td', 'td', 'td', 'td'],
    names: ['ID', 'Nombre', 'Código', 'Descripción', 'Acciones'],
    styles: ['max-width: 50px;', '', 'max-width: 300px;', 'max-width: 150px;', 'd-none'],
    classes: ['d-none', '', '', '', 'd-none'],
    messages: {
      success: 'Datos actualizados correctamente',
      errorNetwork: 'No se pudo listar las secciones. No hay conexión con el servidor.',
      notFound: 'No se pudo listar las secciones. Recurso no encontrado.',
      serverError: 'No se pudo listar las secciones. Error interno del servidor.',
      requestError: 'No se pudo listar las secciones. No se recibió respuesta del servidor.',
      otherError: 'No se pudo listar las secciones. Ocurrió un error inesperado.'
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
      class: 'btn-secondary',
      icon: 'fa-users',
      label: 'Estudiantes',
      action: (record) => navigateToStudents(record)
    },
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
      action: (record) => deleteSection(record)
    },
  ];

  const navigateToStudents = (record) => {
    navigate(`/management/courses/${courseId}/sections/${record.id}/students`);
  };

  const deleteSection = (record) => {
    sectionDataTable.askToDeleteRow(record, 'id');
  };

  const openEditModal = (record) => {
    modalTitle = 'Editar Sección';
    if (sectionFormInstance && typeof sectionFormInstance.showEdit === 'function') {
      sectionFormInstance.showEdit(record);
    }
    if (sectionModalInstance) sectionModalInstance.show();
  };

  const openCreateModal = () => {
    modalTitle = 'Nueva Sección';
    if (sectionFormInstance && typeof sectionFormInstance.showCreate === 'function') {
      sectionFormInstance.showCreate();
    }
    if (sectionModalInstance) sectionModalInstance.show();
  };

  // Callback cuando se guarda una sección
  const handleSaved = (event) => {
    alertMessage = { text: 'Sección guardada correctamente', status: 'success' };
    if (sectionModalInstance) sectionModalInstance.hide();
    sectionDataTable.list();
    setTimeout(() => alertMessage = { text: '', status: '' }, 4000);
  };

  const handleModalClose = () => {
    console.log('Modal cerrado');
    sectionDataTable.list();
    if (sectionModalInstance) sectionModalInstance.hide();
  };

  const handleSearch = (event) => {
    const { name, description } = event.detail;
    // Agregar params a queryParams y actualizar
    sectionDataTable.queryParams = { ...sectionDataTable.queryParams, name, description };
    sectionDataTable.list();
  };

  const handleClean = () => {
    sectionDataTable.queryParams = {};
    sectionDataTable.list();
  };

  const handleBackToCourses = () => {
    navigate('/management/courses');
  };

  // Cargar datos del curso
  const loadCourseInfo = async () => {
    if (!courseId) return;
    
    try {
      const jwt = localStorage.getItem('jwtToken');
      const response = await axios.get(`${API_URL}api/v1/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (response.data.success) {
        courseName = response.data.data.name;
      }
    } catch (error) {
      console.error('Error cargando curso:', error);
    }
  };

  // Inicialización
  onMount(() => {
    if (courseId) {
      loadCourseInfo();
      
      // Esperar a que sectionDataTable esté disponible
      setTimeout(() => {
        if (sectionDataTable) {
          sectionDataTable.fetchURL = `${API_URL}api/v1/courses/${courseId}/sections`;
          sectionDataTable.saveURL = `${API_URL}api/v1/courses/${courseId}/sections`;
          sectionDataTable.deleteURL = `${API_URL}api/v1/courses/${courseId}/sections`;
          
          sectionDataTable.list();
          sectionDataTable.addButton.action = () => openCreateModal();
          sectionDataTable.actionButtons = createActions();
          
          // Deshabilitar paginación
          sectionDataTable.pagination.display = false;
        }
      }, 100);
      
      // Inicializar instancia del modal
      if (sectionDetailModalEl) {
        sectionModalInstance = new Modal(sectionDetailModalEl, { backdrop: 'static' });
        sectionDetailModalEl.addEventListener('hidden.bs.modal', handleModalClose);
      }
    } else {
      console.error('No se recibió courseId en los parámetros');
    }
  });
</script>

<div class="container-fluid">
  <!-- Breadcrumb -->
  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> /
      <Link to="/management/courses">Cursos</Link> /
      {courseName || 'Secciones del Curso'}
    </h3>
  </div>

  {#if courseId}
    <!-- Tabla -->
    <div class="card mt-4">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="fa fa-list me-2"></i>
          Lista de Secciones
        </h6>
      </div>

      <div class="card-body">
        {#if alertMessage.text}
          <div class="alert alert-{alertMessage.status}" role="alert">
            {alertMessage.text}
          </div>
        {/if}

        <DataTable
          bind:this={sectionDataTable}
          fetchURL={`${API_URL}api/v1/courses/${courseId}/sections`}
          saveURL={`${API_URL}api/v1/courses/${courseId}/sections`}
          deleteURL={`${API_URL}api/v1/courses/${courseId}/sections`}
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
  {:else}
    <div class="alert alert-danger">
      No se ha especificado un ID de curso válido.
    </div>
  {/if}
</div>

<!-- Modal para detalle de sección -->
<div bind:this={sectionDetailModalEl} class="modal fade" tabindex="-1">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{modalTitle}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <SectionDetail 
          bind:this={sectionFormInstance}
          courseId={courseId}
          on:saved={handleSaved} 
          on:close={handleModalClose} />
      </div>
    </div>
  </div>
</div>

<style>
</style>