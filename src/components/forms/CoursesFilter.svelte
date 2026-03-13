<svelte:options accessors={true} />
<script>
  // src/components/forms/CoursesFilter.svelte
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let name = '';
  let code = '';
  let level_id = ''; 

  export let levels = [];

  const searchClick = (event) => {
    event.preventDefault();
    dispatch('search', { name, code, level_id }); // Incluimos email en el dispatch
  };

  const cleanClick = (event) => {
    event.preventDefault();
    if (name || code || level_id) { // Verificamos también email
      name = '';
      code = '';
      level_id = '';
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
      <label for="name" class="form-label">Nombre</label>
      <input type="text" class="form-control" id="name" placeholder="Nombre" bind:value={name} />
    </div>
    <div class="col-md-1">
      <label for="code" class="form-label">Código</label>
      <input type="text" class="form-control" id="code" placeholder="Código" bind:value={code} />
    </div>
    <div class="col-md-3">
      <label for="relationFilter" class="form-label">Nivel Académico</label>
      <select class="form-control" bind:value={level_id}>
        <option value="">--</option>
        {#each levels as level}
          <option value={level.id} selected={level.id === level_id}>
          {level.name}
          </option>
        {/each}
      </select>
    </div>

    <div class="col-md-5 d-flex align-items-end">
      <button type="submit" class="btn btn-primary me-2" on:click={searchClick}>
        <i class="fa fa-search me-2"></i> Buscar
      </button>
      <button type="reset" class="btn btn-secondary" on:click={cleanClick}>
        <i class="fa fa-eraser me-2"></i> Limpiar
      </button>
      <button type="button" class="btn btn-success me-2" style="margin-left: 7px;" on:click={saveClick}>
        <i class="fa fa-plus me-2"></i> Guardar Cambios
      </button>
    </div>
  </div>
</form>