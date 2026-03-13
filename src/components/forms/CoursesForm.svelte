<script>
  // src/components/forms/CourseForm.svelte
  import { createEventDispatcher } from 'svelte';

  export let form;
  export let levels = [];
  export let workers = [];
  export let loading = { levels:false, workers:false };

  const dispatch = createEventDispatcher();

  const doSave = (e) => {
    e.preventDefault();
    dispatch('save');
  };

  const doClose = () => {
    dispatch('close');
  };
</script>

<form on:submit|preventDefault={doSave}>
  <div class="bg-light p-3 rounded">

    <div class="row">

      <div class="col-md-6 mb-3">
        <label class="form-label">Nombre del curso</label>
        <input class="form-control" bind:value={form.name} required />
      </div>

      <div class="col-md-3 mb-3">
        <label class="form-label">Código</label>
        <input class="form-control" bind:value={form.code} required />
      </div>

      <div class="col-md-3 mb-3">
        <label class="form-label">Nivel</label>
        <select class="form-control" bind:value={form.level_id} disabled={loading.levels}>
          <option value="">--</option>
          {#each levels as level}
            <option value={level.id}>{level.name}</option>
          {/each}
        </select>
      </div>

    </div>

    <div class="row">

      <div class="col-md-6 mb-3">
        <label class="form-label">Docente</label>
        <select class="form-control" bind:value={form.worker_id} disabled={loading.workers}>
          <option value="">--</option>
          {#each workers as worker}
            <option value={worker.id}>
              {worker.person?.last_names} {worker.person?.names}
            </option>
          {/each}
        </select>
      </div>

      <div class="col-md-6 mb-3">
        <label class="form-label">Syllabus URL</label>
        <input class="form-control" bind:value={form.sylabus_url} />
      </div>

    </div>

    <div class="row">
      <div class="col-md-12 mb-3">
        <label class="form-label">Descripción</label>
        <textarea class="form-control" rows="3" bind:value={form.description}></textarea>
      </div>
    </div>

    <div class="text-end">
      <button type="button" class="btn btn-secondary me-2" on:click={doClose}>
        <i class="fa fa-times"></i>
        <span class="ms-1">Cancelar</span>
      </button>

      <button type="submit" class="btn btn-primary">
        <i class="fa fa-save"></i>
        <span class="ms-1">Guardar</span>
      </button>
    </div>

  </div>
</form>

<style>
.form-label { font-weight:600; }
</style>