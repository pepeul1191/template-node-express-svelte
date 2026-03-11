<svelte:options accessors={true} />

<script>
  // src/components/forms/StudentsFilter.svelte
  import { createEventDispatcher } from 'svelte';

  export let showSaveButton = false;

  const dispatch = createEventDispatcher();

  let name = '';
  let document_number = '';
  let code = '';
  let email = '';
  let relationFilter = 'related';

  const searchClick = (event) => {
    event.preventDefault();

    dispatch('search', {
      name,
      document_number,
      code,
      email,
      relationFilter
    });
  };

  const cleanClick = (event) => {
    event.preventDefault();

    if (name || document_number || code || email) {
      name = '';
      document_number = '';
      code = '';
      email = '';

      dispatch('clean');
    }
  };

  const saveClick = (event) => {
    event.preventDefault();
    dispatch('save');
  };
</script>

<form class="mb-4">
  <div class="row">

    <div class="col-md-3">
      <label for="name" class="form-label">Nombres o Apellidos</label>
      <input
        type="text"
        class="form-control"
        id="name"
        placeholder="Nombre"
        bind:value={name}
      />
    </div>

    <div class="col-md-2">
      <label for="document_number" class="form-label">Doc. de Identidad</label>
      <input
        type="text"
        class="form-control"
        id="document_number"
        placeholder="Documento"
        bind:value={document_number}
      />
    </div>

    <div class="col-md-2">
      <label for="code" class="form-label">Código</label>
      <input
        type="text"
        class="form-control"
        id="code"
        placeholder="Código"
        bind:value={code}
      />
    </div>

    {#if showSaveButton == false}

      <div class="col-md-2">
        <label for="email" class="form-label">Correo</label>
        <input
          type="email"
          class="form-control"
          id="email"
          placeholder="Correo"
          bind:value={email}
        />
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

    {#if !showSaveButton}
      <div class="col-md-3 d-flex align-items-end">
        <button
          type="submit"
          class="btn btn-primary me-2"
          on:click={searchClick}
        >
          <i class="fa fa-search me-2"></i> Buscar
        </button>

        <button
          type="reset"
          class="btn btn-secondary"
          on:click={cleanClick}
        >
          <i class="fa fa-eraser me-2"></i> Limpiar
        </button>
      </div>
    {/if}

  </div>

  {#if showSaveButton}
    <div class="row mt-3">
      <div class="col-12 text-end">

        <button
          type="submit"
          class="btn btn-primary me-2"
          on:click={searchClick}
        >
          <i class="fa fa-search me-2"></i> Buscar
        </button>

        <button
          type="reset"
          class="btn btn-secondary me-2"
          on:click={cleanClick}
        >
          <i class="fa fa-eraser me-2"></i> Limpiar
        </button>

        <button
          type="button"
          class="btn btn-success"
          on:click={saveClick}
        >
          <i class="fa fa-save me-2"></i> Guardar Cambios
        </button>

      </div>
    </div>
  {/if}
</form>
<style>
  .form-label {
    font-weight: 600;
  }
</style>