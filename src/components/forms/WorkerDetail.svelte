<script>
  // src/components/forms/WorkerDetail.svelte
  import { createEventDispatcher } from 'svelte';
  import axios from 'axios';

  const API = typeof API_URL !== 'undefined' ? API_URL : (window && window.API_URL) || '';

  const dispatch = createEventDispatcher();

  // mode: 'create' | 'edit'
  let mode = 'create';
  let form = {
    id: null,
    person_id: '',
    person: null,
    code: '',
    bio: ''
  };

  // Called by parent (modal wrapper) to prepare the form; parent shows the modal UI
  export function showCreate() {
    mode = 'create';
    form = { id: null, person_id: '', person: null, code: '', bio: '' };
  }

  export function showEdit(worker) {
    mode = 'edit';
    // worker may come with nested Person
    form.id = worker.id;
    form.person_id = worker.person?.id ?? worker.person_id ?? '';
    form.person = worker.person ?? null;
    form.code = worker.code ?? '';
    form.bio = worker.bio ?? '';
  }

  const save = async () => {
    const jwt = localStorage.getItem('jwtToken');

    try {
      if (mode === 'create') {
        const payload = {
          person_id: form.person_id,
          code: form.code,
          bio: form.bio,
        };

        const res = await axios.post(`${API}api/v1/workers`, payload, { headers: { Authorization: `Bearer ${jwt}` } });
        dispatch('saved', res.data.data || res.data);
      } else {
        const payload = { code: form.code, bio: form.bio };
        const res = await axios.put(`${API}api/v1/workers/${form.id}`, payload, { headers: { Authorization: `Bearer ${jwt}` } });
        dispatch('saved', res.data.data || res.data);
      }
    } catch (error) {
      console.error(error);
      // simple alert, could be improved
      alert(error.response?.data?.message || error.message || 'Error al guardar');
    }
  };

  // Parent modal should hide; dispatch close so parent can react if needed
  const close = () => dispatch('close');
</script>


<form on:submit|preventDefault={save}>
  <div class="mb-3">
    <label class="form-label">Person ID</label>
    <input
        class="form-control"
        bind:value={form.person_id}
        placeholder="ID de la persona"
        disabled={mode === 'edit'} />
    {#if form.person}
      <small class="text-muted">{form.person.names} {form.person.lastNames}</small>
    {/if}
  </div>

  <div class="mb-3">
    <label class="form-label">Código</label>
    <input class="form-control" bind:value={form.code} />
  </div>

  <div class="mb-3">
    <label class="form-label">Bio</label>
    <textarea class="form-control" rows="3" bind:value={form.bio}></textarea>
  </div>

  <div class="text-end">
    <button type="button" class="btn btn-secondary me-2" on:click={close}>Cancelar</button>
    <button type="submit" class="btn btn-primary">Guardar</button>
  </div>
</form>

<style>
  .form-label { font-weight: 600; }
</style>
