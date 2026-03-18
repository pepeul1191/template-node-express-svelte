<script>
  // src/pages/admin/Courses.svelte
  import { onMount } from 'svelte';
  import { Link, navigate } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";
  import CourseDetail from '../../components/forms/CoursesDetail.svelte';
  import { Modal } from 'bootstrap';
  import CourseFilter from '../../components/forms/CoursesFilter.svelte';
  import axios from 'axios';

  const API = typeof API_URL !== 'undefined' ? API_URL : (window && window.API_URL) || '';

  let courseDataTable;
  let courseDetailModalEl;
  let courseModalInstance;
  let courseFormInstance;
  let modalTitle = '';
  let levels;

  let alertMessage = {
    text: '',
    status: ''
  };

  const TABLE_CONFIG = {
    columns: [
      'id',
      'name',
      'code',
      'level.name',
      'worker.person.full_name',
    ],
    types: ['id','td','td','td','td','td'],
    names: [
      'ID',
      'Nombre',
      'Código',
      'Nivel',
      'Docente Encargado',
      'Acciones'
    ],
    styles: [
      'max-width:50px;',
      '',
      'max-width:120px;',
      '',
      '',
      'max-width:200px;'
    ],
    classes: [
      'd-none',
      '',
      '',
      '',
      '',
      'text-end'
    ],
    messages: {
      success: 'Datos actualizados correctamente',
      errorNetwork: 'No se pudo listar los cursos. No hay conexión con el servidor.',
      notFound: 'No se pudo listar los cursos. Recurso no encontrado.',
      serverError: 'No se pudo listar los cursos. Error interno del servidor.',
      requestError: 'No se pudo listar los cursos. No se recibió respuesta del servidor.',
      otherError: 'No se pudo listar los cursos. Ocurrió un error inesperado.'
    }
  };

  const handleTableAlert = (event) => {
    alertMessage = event.detail;

    setTimeout(() => {
      alertMessage = { text:'', status:'' };
    },4300);
  };

  const goToSections = (record) => {
    // Usando svelte-routing (que ya tienes importado)
    navigate(`/management/courses/${record.id}/sections`);
    
    // O si prefieres abrir en nueva pestaña:
    // window.open(`/management/courses/${record.id}/sections`, '_blank');
  };

  const createActions = () => [
      {
      class:'btn-secondary',
      icon:'fa-cubes',
      label:'Secciones',
      action:(record)=>goToSections(record)
    },
    {
      class:'btn-primary',
      icon:'fa-edit',
      label:'Editar',
      action:(record)=>openEditModal(record)
    },
    {
      class:'btn-danger',
      icon:'fa-trash',
      label:'Eliminar',
      action:(record)=>deleteCourse(record)
    }
  ];

  const deleteCourse = (record) => {
    courseDataTable.askToDeleteRow(record,'id');
  };

  const openEditModal = (record) => {
    modalTitle = 'Editar Curso';
    console.log('EDIT')
    console.log(record)
    if(courseFormInstance && typeof courseFormInstance.showEdit === 'function'){
      console.log('IFFFFFFFFFFFF')
      courseFormInstance.showEdit(record);
    }

    if(courseModalInstance) courseModalInstance.show();
  };

  const openCreateModal = () => {
    modalTitle = 'Nuevo Curso';

    if(courseFormInstance && typeof courseFormInstance.showCreate === 'function'){
      courseFormInstance.showCreate();
    }

    if(courseModalInstance) courseModalInstance.show();
  };

  const handleSaved = () => {

    alertMessage = {
      text:'Curso guardado correctamente',
      status:'success'
    };

    if(courseModalInstance) courseModalInstance.hide();

    courseDataTable.list();

    setTimeout(()=>{
      alertMessage = { text:'', status:'' };
    },4000);
  };

  const handleModalClose = () => {
    if (courseModalInstance) {
      courseModalInstance.hide();
    }

    courseDataTable.list();
  };

  const handleSearch = (event) => {
    const { name, code, level_id} = event.detail;

    courseDataTable.queryParams = {
      ...courseDataTable.queryParams,
      name,
      code,
      level_id,
    };

    courseDataTable.pagination.actualPage = 1;

    courseDataTable.list();
  };

  const handleClean = () => {
    courseDataTable.queryParams = {};
    courseDataTable.pagination.actualPage = 1;
    courseDataTable.list();
  };

  onMount(()=>{
    loadLevels();

    courseDataTable.list();

    courseDataTable.addButton.action = () => openCreateModal();

    courseDataTable.actionButtons = createActions();

    courseDataTable.pagination.display = true;
    courseDataTable.pagination.actualPage = 1;

    if(courseDetailModalEl){
      courseModalInstance = new Modal(courseDetailModalEl,{ backdrop:'static' });

      courseDetailModalEl.addEventListener(
        'hidden.bs.modal',
        handleModalClose
      );
    }

  });

  // Cargar levels
  async function loadLevels() {
    try {
      const jwt = localStorage.getItem('jwtToken');
      const response = await axios.get(`${API}api/v1/levels`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (response.data.success && response.data.data.list) {
        levels = response.data.data.list;
      }
    } catch (error) {
      console.error('Error cargando sexos:', error);
    }
  }
</script>


<div class="container-fluid">

  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/management/academics">Gestión Académica</Link> /
      Gestión de Cursos
    </h3>
  </div>

  <!-- filtros -->
  <div class="card">

    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-search me-2"></i>
        Filtros de Búsqueda
      </h6>
    </div>

    <div class="card-body">

      <CourseFilter
        on:search={handleSearch}
        on:clean={handleClean}
        levels={levels}
      />

    </div>

  </div>


  <!-- tabla -->
  <div class="card mt-4">

    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-book me-2"></i>
        Lista de cursos
      </h6>
    </div>

    <div class="card-body">

      {#if alertMessage.text}
        <div class="alert alert-{alertMessage.status}">
          {alertMessage.text}
        </div>
      {/if}

      <DataTable
        bind:this={courseDataTable}
        fetchURL={`${API_URL}api/v1/courses`}
        saveURL={`${API_URL}api/v1/courses`}
        columnKeys={TABLE_CONFIG.columns}
        columnTypes={TABLE_CONFIG.types}
        columnNames={TABLE_CONFIG.names}
        columnStyles={TABLE_CONFIG.styles}
        columnClasses={TABLE_CONFIG.classes}
        tdStyles={TABLE_CONFIG.styles}
        messages={TABLE_CONFIG.messages}
        addButton={{ display:true, disabled:false, action:null }}
        saveButton={{ display:true, disabled:false, action:null }}
        actionButtons={[]}
        jwtToken={localStorage.getItem('jwtToken')}
        on:alert={handleTableAlert}
      />

    </div>

  </div>

</div>


<div bind:this={courseDetailModalEl} class="modal fade" tabindex="-1">

  <div class="modal-dialog modal-xl">

    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title">{modalTitle}</h5>

        <button
          type="button"
          class="btn-close"
          on:click={handleModalClose}
          data-bs-dismiss="modal">
        </button>
      </div>

      <div class="modal-body">

        <CourseDetail
          bind:this={courseFormInstance}
          on:saved={handleSaved}
          on:close={handleModalClose}
        />

      </div>

    </div>

  </div>

</div>