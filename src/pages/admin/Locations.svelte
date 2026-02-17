<script>
  import { onMount } from 'svelte';
  import { Link } from "svelte-routing";
  import DataTable from "../../components/widgets/DataTable.svelte";

  // Tablas
  let departmentDataTable;
  let provinceDataTable;
  let districtDataTable;

  // IDs seleccionados
  let departmentId;
  let provinceId;

  // Visibilidad de tablas
  let showProvinces = false;
  let showDistricts = false;

  // Búsqueda
  let search = "";
  let selectedId = null;

  // Alertas
  let alertMessage = {
    text: '',
    status: ''
  };

  // Configuración de tablas
  const TABLE_CONFIG = {
    departments: {
      columns: ['id', 'name'],
      types: ['id', 'input[text]'],
      names: ['ID', 'Nombre', 'Acciones'],
      styles: ['max-width: 50px;', 'max-width: 180px;', 'max-width: 150px;'],
      classes: ['d-none', '', 'text-end'],
      messages: {
        success: 'Datos actualizados',
        errorNetwork: 'No se pudo listar los departamentos. No hay conexión con el servidor.',
        notFound: 'No se pudo listar los departamentos. Recurso no encontrado.',
        serverError: 'No se pudo listar los departamentos. Error interno del servidor',
        requestError: 'No se pudo listar los departamentos. No se recibió respuesta del servidor',
        otherError: 'No se pudo listar los departamentos. Ocurrió un error no esperado al traer los datos del servidor',
      }
    },
    provinces: {
      messages: {
        success: 'Datos actualizados',
        errorNetwork: 'No se pudo listar las provincias. No hay conexión con el servidor.',
        notFound: 'No se pudo listar las provincias. Recurso no encontrado.',
        serverError: 'No se pudo listar las provincias. Error interno del servidor',
        requestError: 'No se pudo listar las provincias. No se recibió respuesta del servidor',
        otherError: 'No se pudo listar las provincias. Ocurrió un error no esperado al traer los datos del servidor',
      }
    },
    districts: {
      messages: {
        success: 'Datos actualizados',
        errorNetwork: 'No se pudo listar los distritos. No hay conexión con el servidor.',
        notFound: 'No se pudo listar los distritos. Recurso no encontrado.',
        serverError: 'No se pudo listar los distritos. Error interno del servidor',
        requestError: 'No se pudo listar los distritos. No se recibió respuesta del servidor',
        otherError: 'No se pudo listar los distritos. Ocurrió un error no esperado al traer los datos del servidor',
      }
    }
  };

  // Handlers de alertas
  const handleTableAlert = (callback) => {
    alertMessage = callback.detail;
    setTimeout(() => {
      alertMessage = { text: '', status: '' };
    }, 4300);
  };

  // Acciones de las tablas
  const createDepartmentActions = () => [
    {
      class: 'btn-secondary',
      icon: 'fa-list',
      label: 'Provincias',
      action: (record) => showProvincesTable(record.id)
    },
    {
      class: 'btn-danger',
      icon: 'fa-trash',
      label: 'Eliminar',
      action: (record) => deleteDepartment(record)
    }
  ];

  const createProvinceActions = () => [
    {
      class: 'btn-secondary',
      icon: 'fa-list',
      label: 'Distritos',
      action: (record) => showDistrictsTable(record.id)
    },
    {
      class: 'btn-danger',
      icon: 'fa-trash',
      label: 'Eliminar',
      action: (record) => deleteProvince(record)
    }
  ];

  const createDistrictActions = () => [
    {
      class: 'btn-danger',
      icon: 'fa-trash',
      label: 'Eliminar',
      action: (record) => deleteDistrict(record)
    }
  ];

  // Funciones de navegación entre tablas
  const showProvincesTable = (id) => {
    departmentId = id;
    showProvinces = true;
    showDistricts = false;

    setTimeout(() => {
      configureProvincesTable(id);
      provinceDataTable.list();
    }, 300);
  };

  const showDistrictsTable = (id) => {
    provinceId = id;
    showDistricts = true;

    setTimeout(() => {
      configureDistrictsTable(id);
      districtDataTable.list();
    }, 300);
  };

  // Configuración de tablas
  const configureProvincesTable = (departmentId) => {
    provinceDataTable.fetchURL = `${API_URL}api/v1/provinces/${departmentId}`;
    provinceDataTable.saveURL = `${API_URL}api/v1/provinces/${departmentId}`;
    provinceDataTable.addButton.action = () => provinceDataTable.addRow();
    provinceDataTable.actionButtons = createProvinceActions();
  };

  const configureDistrictsTable = (provinceId) => {
    districtDataTable.fetchURL = `${API_URL}api/v1/districts/${provinceId}`;
    districtDataTable.saveURL = `${API_URL}api/v1/districts/${provinceId}`;
    districtDataTable.addButton.action = () => districtDataTable.addRow();
    districtDataTable.actionButtons = createDistrictActions();
  };

  // Funciones de eliminación
  const deleteDepartment = (record) => {
    departmentDataTable.deleteRow(record, 'id');
    if (record.id === departmentId) {
      showProvinces = false;
      showDistricts = false;
    }
  };

  const deleteProvince = (record) => {
    provinceDataTable.deleteRow(record, 'id');
    if (record.id === provinceId) {
      showDistricts = false;
    }
  };

  const deleteDistrict = (record) => {
    districtDataTable.deleteRow(record, 'id');
  };

  // Inicialización
  onMount(() => {
    // Configurar tabla de departamentos
    departmentDataTable.list();
    departmentDataTable.addButton.action = () => departmentDataTable.addRow();
    departmentDataTable.actionButtons = createDepartmentActions();
  });

  // Debug
  onMount(() => {
    console.log('Department Table:', departmentDataTable);
    console.log('Province Table:', provinceDataTable);
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

  <!-- Autocompletado -->
  <div class="card mb-4">
    <div class="card-header p-2">
      <h6 class="mb-0">
        <i class="fa fa-info-circle me-2"></i>
        Prueba de Autocompletado de Búsqueda de Locaciones
      </h6>
    </div>

    <div class="card-body p-3">
      <div class="col-md-5 autocomplete-wrapper">
        <label class="form-label">Nombre de la Provincia</label>
        <input
          type="text"
          class="form-control"
          placeholder="Buscar..."
          bind:value={search}
        >
        <input type="hidden" bind:value={selectedId}>
        <div class="suggestion-list"></div>
      </div>
    </div>
  </div>

  <!-- Lista de ubicaciones -->
  <div class="card mb-4">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fa fa-list me-2"></i>
        Lista de Departamentos / Provincias / Distritos
      </h6>
    </div>

    <div class="card-body">
      <div class="row">
        <!-- Alerta -->
        {#if alertMessage.text}
          <div class="col-md-12">
            <div class="alert alert-{alertMessage.status}" role="alert">
              {alertMessage.text}
            </div>
          </div>
        {/if}

        <!-- Tabla de Departamentos -->
        <div class="col-md-4">
          <h6 class="subtitle">Departamentos</h6>
          <hr>
          <DataTable
            bind:this={departmentDataTable}
            fetchURL={`${API_URL}api/v1/departments`}
            columnKeys={TABLE_CONFIG.departments.columns}
            columnTypes={TABLE_CONFIG.departments.types}
            columnNames={TABLE_CONFIG.departments.names}
            columnStyles={TABLE_CONFIG.departments.styles}
            columnClasses={TABLE_CONFIG.departments.classes}
            tdStyles={TABLE_CONFIG.departments.styles}
            messages={TABLE_CONFIG.departments.messages}
            addButton={{ display: true, disabled: false, action: null }}
            saveButton={{ display: true, disabled: false, action: null }}
            actionButtons={[]}
            jwtToken={localStorage.getItem('jwtToken')}
            on:alert={handleTableAlert}
          />
        </div>

        <!-- Tabla de Provincias (condicional) -->
        {#if showProvinces}
          <div class="col-md-4">
            <h6 class="subtitle">Provincias</h6>
            <hr>
            <DataTable
              bind:this={provinceDataTable}
              fetchURL={`${API_URL}api/v1/provinces`}
              columnKeys={TABLE_CONFIG.departments.columns}
              columnTypes={TABLE_CONFIG.departments.types}
              columnNames={TABLE_CONFIG.departments.names}
              columnStyles={TABLE_CONFIG.departments.styles}
              columnClasses={TABLE_CONFIG.departments.classes}
              tdStyles={TABLE_CONFIG.departments.styles}
              messages={TABLE_CONFIG.provinces.messages}
              addButton={{ display: true, disabled: false, action: null }}
              saveButton={{ display: true, disabled: false, action: null }}
              actionButtons={[]}
              jwtToken={localStorage.getItem('jwtToken')}
              on:alert={handleTableAlert}
            />
          </div>
        {/if}

        <!-- Tabla de Distritos (condicional) -->
        {#if showDistricts}
          <div class="col-md-4">
            <h6 class="subtitle">Distritos</h6>
            <hr>
            <DataTable
              bind:this={districtDataTable}
              fetchURL={`${API_URL}api/v1/districts`}
              columnKeys={TABLE_CONFIG.departments.columns}
              columnTypes={TABLE_CONFIG.departments.types}
              columnNames={TABLE_CONFIG.departments.names}
              columnStyles={TABLE_CONFIG.departments.styles}
              columnClasses={TABLE_CONFIG.departments.classes}
              tdStyles={TABLE_CONFIG.departments.styles}
              messages={TABLE_CONFIG.districts.messages}
              addButton={{ display: true, disabled: false, action: null }}
              saveButton={{ display: true, disabled: false, action: null }}
              actionButtons={[]}
              jwtToken={localStorage.getItem('jwtToken')}
              on:alert={handleTableAlert}
            />
          </div>
        {/if}
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