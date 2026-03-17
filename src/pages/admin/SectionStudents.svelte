<script>
  // src/pages/admin/SectionStudents.svelte
  // IMPORTS
  import { onMount } from 'svelte';
  import { Link } from "svelte-routing";
  import axios from 'axios';
  import StudentFilter from "../../components/forms/StudentsFilter.svelte";

  // Recibir parámetros de la ruta
  export let courseId;
  export let sectionId;

  // Datos del curso y sección
  let courseName = '';
  let sectionName = '';

  // Alertas
  let alertMessage = {
    text: '',
    status: ''
  };

  // Datos de estudiantes
  let queryParams = {};
  let studentsFounded = [];
  let selectedStudents = [];
  let relationFilter = 'related';

  // Cargar estudiantes de la sección
  const loadSectionStudents = async () => {
    if (!sectionId) return;
    
    try {
      const jwt = localStorage.getItem('jwtToken');
      const response = await axios.get(`${API_URL}api/v1/sections/${sectionId}/students?limit=100&relation_filter=related`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      
      if (response.data.success) {
        studentsFounded = response.data.data.list.map(item => ({
          ...item,
          selected: true
        }));
        selectedStudents = studentsFounded.map(s => s.student.id);
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      alertMessage = { text: 'Error al cargar estudiantes', status: 'danger' };
    }
  };

  // Cargar datos del curso
  const loadCourseData = async () => {
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

  // Cargar datos de la sección
  const loadSectionData = async () => {
    if (!courseId || !sectionId) return;
    
    try {
      const jwt = localStorage.getItem('jwtToken');
      const response = await axios.get(`${API_URL}api/v1/courses/${courseId}/sections/${sectionId}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      
      if (response.data.success) {
        sectionName = response.data.data.name;
      }
    } catch (error) {
      console.error('Error cargando sección:', error);
    }
  };

  // Inicialización
  onMount(() => {
    if (courseId && sectionId) {
      loadCourseData();
      loadSectionData();
      loadSectionStudents();
    }
  });

  // Manejar búsqueda
  export const handleSearch = (event) => {
    const {
      name = '',
      document_number = '',
      code = '',
      email = '',
      relationFilter: filter = 'related'
    } = event?.detail ?? {};

    relationFilter = filter;
    queryParams = { name, document_number, code, email };

    const jwt = localStorage.getItem('jwtToken');
    axios
      .get(`${API_URL}api/v1/sections/${sectionId}/students?limit=42&relation_filter=${relationFilter}`, {
        params: Object.keys(queryParams).some(key => queryParams[key]) ? queryParams : undefined,
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then((response) => {
        let genericResponse = response.data.data;
        
        if (relationFilter === 'related') {
          // Si son relacionados, todos están seleccionados por defecto
          studentsFounded = genericResponse.list.map(item => ({
            ...item,
            selected: true
          }));
          selectedStudents = studentsFounded.map(s => s.student.id);
        } else if (relationFilter === 'not_related') {
          // Si no son relacionados, ninguno está seleccionado
          studentsFounded = genericResponse.list.map(item => ({
            ...item,
            selected: false
          }));
        } else {
          // Ambos: marcar como seleccionados los que están en selectedStudents
          studentsFounded = genericResponse.list.map(item => ({
            ...item,
            selected: selectedStudents.includes(item.student.id)
          }));
        }
        
        alertMessage = { text: 'Búsqueda realizada con éxito', status: 'success' };
        setTimeout(() => {
          alertMessage = { text: '', status: '' };
        }, 3000);
      })
      .catch((error) => {
        console.error(error);
        alertMessage = { text: 'Error al buscar estudiantes', status: 'danger' };
      });
  };

  // Limpiar búsqueda
  const handleClean = () => {
    queryParams = {};
    loadSectionStudents();
    relationFilter = 'related';
    alertMessage = { text: 'Filtros limpiados', status: 'info' };
    setTimeout(() => {
      alertMessage = { text: '', status: '' };
    }, 3000);
  };

  // Guardar cambios
  const handleSave = () => {
    const studentIds = studentsFounded
      .filter(item => item.selected)
      .map(item => item.student.id);

    const jwt = localStorage.getItem('jwtToken');
    axios.post(`${API_URL}api/v1/sections/${sectionId}/students`, {
      studentIds: studentIds
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`
      }
    })
    .then(function (response) {
      selectedStudents = studentIds;
      alertMessage = { text: 'Estudiantes asignados correctamente', status: 'success' };
      // Recargar con filtro related después de guardar
      relationFilter = 'related';
      handleSearch({ detail: { relationFilter: 'related' } });
      setTimeout(() => {
        alertMessage = { text: '', status: '' };
      }, 3000);
    })
    .catch(function (error) {
      console.error(error);
      alertMessage = { text: 'Error al asignar estudiantes', status: 'danger' };
    });
  };

  // Toggle selección de estudiante
  const toggleStudent = (studentId) => {
    const student = studentsFounded.find(s => s.student.id === studentId);
    if (student) {
      student.selected = !student.selected;
    }
  };

  // Seleccionar todos
  const selectAll = () => {
    studentsFounded = studentsFounded.map(s => ({
      ...s,
      selected: true
    }));
  };

  // Deseleccionar todos
  const deselectAll = () => {
    studentsFounded = studentsFounded.map(s => ({
      ...s,
      selected: false
    }));
  };

  // Función para dividir el nombre completo
  const splitFullName = (fullName) => {
    if (!fullName) return { names: '', last_names: '' };
    const parts = fullName.split(', ');
    if (parts.length === 2) {
      return {
        last_names: parts[0],
        names: parts[1]
      };
    }
    return {
      last_names: fullName,
      names: ''
    };
  };
</script>

<div class="container-fluid">
  <!-- Breadcrumb -->
  <div class="header-route">
    <h3 class="mb-4">
      <i class="fa fa-tachometer me-2"></i>
      <Link to="/">Administración</Link> /
      <Link to="/management/courses">Cursos</Link> /
      <Link to={`/management/courses/${courseId}/sections`}>Secciones</Link> /
      {sectionName || 'Estudiantes'}
    </h3>
  </div>

  {#if courseId && sectionId}
    <div class="card mt-4">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="fa fa-search me-2"></i>
          Filtros de Búsqueda para Estudiantes
        </h6>
      </div>

      <div class="card-body">
        <StudentFilter 
          on:search={handleSearch} 
          on:clean={handleClean} 
          on:save={handleSave} 
          showSaveButton={true} />
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          <i class="fa fa-users me-2"></i>
          Lista de Estudiantes de la Sección {sectionName}
        </h6>
        
        {#if studentsFounded.length > 0}
          <div>
            <span class="badge bg-primary me-2">
              {studentsFounded.filter(s => s.selected).length} seleccionados
            </span>
            <span class="badge bg-secondary">
              Total: {studentsFounded.length}
            </span>
            <span class="badge bg-info ms-2">
              Filtro: {relationFilter === 'related' ? 'Relacionados' : relationFilter === 'not_related' ? 'No relacionados' : 'Todos'}
            </span>
          </div>
        {/if}
      </div>

      <div class="card-body">
        {#if alertMessage.text}
          <div class="alert alert-{alertMessage.status}" role="alert">
            {alertMessage.text}
          </div>
        {/if}

        {#if studentsFounded.length > 0}
          <div class="mb-3">
            <button class="btn btn-sm btn-outline-primary me-2" on:click={selectAll}>
              <i class="fa fa-check-square me-1"></i> Seleccionar Todos
            </button>
            <button class="btn btn-sm btn-outline-secondary" on:click={deselectAll}>
              <i class="fa fa-square me-1"></i> Deseleccionar Todos
            </button>
          </div>

          <div class="row">
            {#each studentsFounded as item}
              {#if item.student}
                {@const student = item.student}
                {@const person = student.person}
                {@const nameParts = splitFullName(person?.full_name)}
                
                <div class="col-md-6 col-lg-4 mb-3">
                  <div class="card h-100">
                    <div class="card-body">
                      <div class="d-flex align-items-start">
                        <div class="form-check me-3">
                          <input 
                            type="checkbox" 
                            class="form-check-input" 
                            id={`student-${student.id}`}
                            checked={item.selected}
                            on:change={() => toggleStudent(student.id)}
                          />
                        </div>

                        <!-- Imagen y datos -->
                        <div class="d-flex align-items-center flex-grow-1">
                          {#if person?.image_url && person.image_url !== 'img/user.png' && person.image_url !== '/img/user.png'}
                            <img
                              src={`${FILES_URL}/${person.image_url}`}
                              alt="Foto"
                              class="student-img me-3" />
                          {:else}
                            <img
                              src="/img/user.png"
                              alt="Foto"
                              class="student-img me-3" />
                          {/if}

                          <div>
                            <h6 class="mb-1">{nameParts.last_names}, {nameParts.names}</h6>
                            <div><strong>Código:</strong> {student.code || 'Sin código'}</div>
                            <div>
                              <strong>Documento:</strong>
                              {person?.document?.type} - {person?.document?.number}
                            </div>
                            <div><strong>Sexo:</strong> {person?.sex?.name}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          <div class="alert alert-info text-center">
            <i class="fa fa-info-circle me-2"></i>
            No hay registros de estudiantes para mostrar.
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="alert alert-danger">
      <i class="fa fa-exclamation-triangle me-2"></i>
      No se ha especificado un ID de curso o sección válido.
    </div>
  {/if}
</div>

<style>
  .student-img {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    object-fit: cover;
  }

  .form-check-input {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }

  .card-header .badge {
    font-size: 0.9rem;
  }
</style>