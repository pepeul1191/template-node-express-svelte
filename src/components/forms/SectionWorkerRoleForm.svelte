<svelte:options accessors={true} />

<script>
  // src/components/forms/SectionWorkerRoleForm.svelte
  import WorkerFilter from "./WorkersFilter.svelte";
  import axios from "axios";
  import { onMount } from "svelte";

  let alertMessage = {
    text: "",
    status: ""
  };

  let queryParams = {};
  let workersFounded = [];
  let workerRoles = [];

  export let relationFilter = 'related';
  export let sectionId = null;

  onMount(() => {
    loadWorkerRoles();
  });

  const loadWorkerRoles = () => {
    axios
      .get(`${API_URL}api/v1/worker-roles`)
      .then((response) => {
        workerRoles = response.data.data.list;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  export const handleSearch = (event) => {
    const {
      name = '',
      document_number = '',
      code = '',
      email = '',
      relationFilter = null,
    } = event?.detail ?? {};

    let relation_filter = relationFilter;
    queryParams = { ...queryParams, name, document_number, code, email, relationFilter };

    axios
      .get(`${API_URL}api/v1/sections-workers-roles/workers?limit=9&section_id=${sectionId}&relation_filter=${relation_filter}`, {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined
      })
      .then((response) => {
        let genericResponse = response.data.data;
        
        // Asegurar que cada item tenga un objeto role (aunque sea null)
        workersFounded = genericResponse.list.map(item => ({
          ...item,
          role: item.role || {id: null}
        }));
        
        console.log('Trabajadores con roles normalizados:', workersFounded);
      })
      .catch((error) => {
        console.error(error);
        alertMessage = { text: 'Error al buscar trabajadores', status: 'danger' };
      });
  };

  export const searchWorkers = () => {
    axios
      .get(`${API_URL}api/v1/sections-workers-roles/workers?limit=9&section_id=${sectionId}&relation_filter=related`, {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined
      })
      .then((response) => {
        let genericResponse = response.data.data;
        
        // Asegurar que cada item tenga un objeto role (aunque sea null)
        workersFounded = genericResponse.list.map(item => ({
          ...item,
          role: item.role || {id: null}
        }));
        
        console.log('Trabajadores con roles normalizados:', workersFounded);
      })
      .catch((error) => {
        alertMessage = { text: 'Error al buscar trabajadores', status: 'danger' };
        console.error(error);
      });
  };

  const handleClean = () => {
    queryParams = {};
    workersFounded = [];
  };

  const handleSave = () => {
    const simplifiedList = workersFounded.map(item => ({
      worker_id: item.worker.id,
      rol_id: item.role?.id || null
    }));

    axios.put(`${API_URL}api/v1/sections-workers-roles/${sectionId}/workers`, {
      workers: simplifiedList
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(function (response) {
      alertMessage = { text: 'Trabajadores actualizados correctamente', status: 'success' };
    })
    .catch(function (error) {
      console.error(error);
      alertMessage = { text: 'Error al actualizar trabajadores', status: 'danger' };
    });
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

<div class="p-3 rounded"> 
  <h6>Filtros de Búsqueda para Trabajadores</h6>

  <WorkerFilter 
    on:search={handleSearch} 
    on:clean={handleClean} 
    on:save={handleSave} 
    showSaveButton={true} />

  {#if alertMessage.text}
    <div class="alert alert-{alertMessage.status}" role="alert">
      {alertMessage.text}
    </div>
  {/if}

  {#if workersFounded.length > 0}
    <div class="row">
      {#each workersFounded as item }
        {#if item.worker}
          {@const worker = item.worker}
          {@const person = worker.person}
          {@const currentRole = item.role}
          {@const nameParts = splitFullName(person?.full_name)}
          
          <div class="col-md-6 col-lg-4 mb-3">
            <div class="card h-100">
              <div class="card-body">

                <!-- Cabecera: imagen + datos -->
                <div class="d-flex align-items-center mb-3">

                  {#if person?.image_url && person.image_url !== 'img/user.png' && person.image_url !== '/img/user.png'}
                    <img
                      src={`${FILES_URL}/${person.image_url}`}
                      alt="Foto"
                      class="worker-img me-3" />
                  {:else}
                    <img
                      src="/img/user.png"
                      alt="Foto"
                      class="worker-img me-3" />
                  {/if}

                  <div class="flex-grow-1">
                    <h6 class="mb-1">{nameParts.names} {nameParts.last_names}</h6>

                    <div>
                      <strong>Código:</strong> {worker.code || 'Sin código'}
                    </div>

                    <div>
                      <strong>Documento:</strong>
                      {person?.document?.type} - {person?.document?.number}
                    </div>

                    <div><strong>Sexo:</strong> {person?.sex?.name}</div>
                    <div><strong>Nacimiento:</strong> {person?.birth_date}</div>
                  </div>

                </div>

                <!-- Formulario de rol -->
                <div>
                  <label class="form-label">Rol del trabajador en la sección</label>
                  <select 
                    class="form-select" 
                    bind:value={item.role.id}
                  >
                    <option value={null}>-- Seleccionar --</option>
                    {#each workerRoles as role}
                      <option 
                        value={role.id}
                        selected={item.role?.id === role.id}
                      >
                        {role.name}
                      </option>
                    {/each}
                  </select>
                </div>

                <!-- Mostrar información adicional del rol (opcional) -->
                <!-- <div class="mt-2 small text-muted">
                  Rol seleccionado: {item.role?.name || 'Ninguno'}
                </div> -->

              </div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="row">
      <div class="col-12">
        <div class="alert alert-info text-center">
          No hay registros de trabajadores para mostrar.
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .worker-card {
    max-width: 700px;
  }

  .worker-img {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    object-fit: cover;
  }

  .form-label {
    font-weight: 600;
    font-size: 0.9rem;
  }
</style>