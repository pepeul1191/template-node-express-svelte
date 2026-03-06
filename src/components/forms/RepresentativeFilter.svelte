<svelte:options accessors={true} />
<script>
  // src/components/forms/WorkersFilter.svelte
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let name = '';
  let document_number = '';
  let email = ''; // Nuevo campo para correo

  const searchClick = (event) => {
    event.preventDefault();
    dispatch('search', { name, document_number, email }); // Incluimos email en el dispatch
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
    <div class="col-md-2">
      <label for="email" class="form-label">Correo</label>
      <input type="email" class="form-control" id="email" placeholder="Correo" bind:value={email} />
    </div>
    <div class="col-md-3 d-flex align-items-end">
      <button type="submit" class="btn btn-primary me-2" on:click={searchClick}>
        <i class="fa fa-search me-2"></i> Buscar
      </button>
      <button type="reset" class="btn btn-secondary" on:click={cleanClick}>
        <i class="fa fa-eraser me-2"></i> Limpiar
      </button>
    </div>
  </div>
</form>