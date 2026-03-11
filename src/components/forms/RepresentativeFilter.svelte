<svelte:options accessors={true} />
<script>
  // src/components/forms/RepresentativeFilter.svelte
  import { createEventDispatcher } from 'svelte';

  export let showSaveButton = false;

  const dispatch = createEventDispatcher();
  let name = '';
  let document_number = '';
  let email = ''; // Nuevo campo para correo
  let relationFilter = 'related' ;

  const searchClick = (event) => {
    event.preventDefault();
    dispatch('search', { name, document_number, email, relationFilter }); // Incluimos email en el dispatch
  };

  const cleanClick = (event) => {
    event.preventDefault();
    if (name || document_number || email) { // Verificamos también email
      name = '';
      document_number = '';
      email = ''; // Limpiamos email
      dispatch('clean');
    }
  };

  const saveClick = (event) => {
    event.preventDefault();
    dispatch('save');
  };
</script>

<style>
  /* estilos opcionales */
</style>

<form class="mb-4">
  <div class="row">
    <div class="col-md-3">
      <label for="name" class="form-label">Nombres o Apellidos</label>
      <input type="text" class="form-control" id="name" placeholder="Nombre" bind:value={name} />
    </div>
    <div class="col-md-2">
      <label for="document_number" class="form-label">Doc. de Identidad</label>
      <input type="text" class="form-control" id="document_number" placeholder="Documento" bind:value={document_number} />
    </div>
    {#if showSaveButton == false}
      <div class="col-md-3">
        <label for="email" class="form-label">Correo</label>
        <input type="email" class="form-control" id="email" placeholder="Correo" bind:value={email} />
      </div>
    {:else}
      <div class="col-md-2">
        <label for="relationFilter" class="form-label">Relación</label>
        <select
          id="relationFilter"
          class="form-select"
          bind:value={relationFilter}
        >
          <option value={null}>Ambos</option>
          <option value="related">Relacionado</option>
          <option value="not_related">No Relacionado</option>
        </select>
      </div>
    {/if}
    <div class="col-md-{showSaveButton ? '5' : '3'} d-flex align-items-end">
      <button type="submit" class="btn btn-primary me-2" on:click={searchClick}>
        <i class="fa fa-search me-2"></i> Buscar
      </button>
      <button type="reset" class="btn btn-secondary" on:click={cleanClick}>
        <i class="fa fa-eraser me-2"></i> Limpiar
      </button>
      {#if showSaveButton}
        <button type="button" class="btn btn-success me-2" style="margin-left: 7px;" on:click={saveClick}>
          <i class="fa fa-plus me-2"></i> Guardar Cambios
        </button>
      {/if}
    </div>
  </div>
</form>