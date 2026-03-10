<svelte:options accessors={true} />
<script>
  // src/components/forms/StudentRepresentativeForm.svelte
  import RepresentativeFilter from "./RepresentativeFilter.svelte";
  import axios from "axios";
  import { onMount } from "svelte";

  let alertMessage = {
    text: "",
    status: ""
  };

  let queryParams = {};
  let representativesFounded = [];
  let representativeRoles = [];

  export let relationFilter = 'related';
  export let studentId = null;

  onMount(() => {
    loadRepresentativeRoles();
  });

  const loadRepresentativeRoles = () => {
    axios
      .get(`${API_URL}api/v1/representative-roles`)
      .then((response) => {
        representativeRoles = response.data.data.list;
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
      .get(`${API_URL}api/v1/representatives-students-roles?limit=9&student_id=${studentId}&relation_filter=${relation_filter}`, {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined
      })
      .then((response) => {
        let genericResponse = response.data.data;
        representativesFounded = genericResponse.list;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  export const searchRepresentatives = () => {
    axios
      .get(`${API_URL}api/v1/representatives-students-roles?limit=9&student_id=${studentId}&relation_filter=related`, {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined
      })
      .then((response) => {
        let genericResponse = response.data.data;
        representativesFounded = genericResponse.list;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleClean = () => {
    queryParams = {};
    representativesFounded = [];
  };

  const handleAdd = (representative) => {
    // función vacía por ahora
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
  <h6>Filtros de Búsqueda para Apoderados</h6>

  <RepresentativeFilter 
    on:search={handleSearch} 
    on:clean={handleClean} 
    showSaveButton={true} />

  {#if alertMessage.text}
    <div class="alert alert-{alertMessage.status}" role="alert">
      {alertMessage.text}
    </div>
  {/if}

  {#if representativesFounded.length > 0}
    <div class="row">
      {#each representativesFounded as item }
        {#if item.representative}
          {@const rep = item.representative}
          {@const person = rep.person}
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
                      class="representative-img me-3" />
                  {:else}
                    <img
                      src="/img/user.png"
                      alt="Foto"
                      class="representative-img me-3" />
                  {/if}

                  <div class="flex-grow-1">
                    <h6 class="mb-1">{nameParts.names} {nameParts.last_names}</h6>

                    <div>
                      <strong>Documento:</strong>
                      {person?.document?.type} - {person?.document?.number}
                    </div>

                    <div><strong>Sexo:</strong> {person?.sex?.name}</div>
                    <div><strong>Nacimiento:</strong> {person?.birth_date}</div>
                  </div>

                </div>

                <!-- Formulario -->
                <div>
                  <label class="form-label">
                    Relación con el alumno
                  </label>
                  <select 
                    class="form-select" 
                    bind:value={item.selectedRoleId}
                    on:change={(e) => {
                      item.selectedRoleId = e.target.value;
                    }}
                  >
                    <option value="">Seleccione...</option>
                    {#each representativeRoles as role}
                      <option 
                        value={role.id}
                        selected={currentRole?.id === role.id}
                      >
                        {role.name}
                      </option>
                    {/each}
                  </select>
                </div>

                <!-- Botón de acción -->
                <div class="mt-3">
                  <button 
                    class="btn btn-primary btn-sm w-100"
                    on:click={() => handleAdd(item)}
                  >
                    {currentRole ? 'Actualizar' : 'Agregar'} Representante
                  </button>
                </div>

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
          No hay registros de apoderados para mostrar.
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .representative-card {
    max-width: 700px;
  }

  .representative-img {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    object-fit: cover;
  }
</style>