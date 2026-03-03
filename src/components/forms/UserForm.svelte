<script>
  import { createEventDispatcher } from 'svelte';
  import axios from 'axios';

  export let form;
  const API = (typeof API_URL !== 'undefined' ? API_URL : (window && window.API_URL) || '');

  const dispatch = createEventDispatcher();

  let busy = false;

  async function findUser() {
    if (!form.email) {
      alert('Ingrese un email para buscar');
      return;
    }
    busy = true;
    try {
      const resp = await axios.get(`${API}api/v1/users/find`, { params: { email: form.email } });
      if (resp.data && resp.data.data) {
        form.user_id = resp.data.data.id;
        form.user_name = resp.data.data.username || resp.data.data.name || '';
        dispatch('updated');
      } else {
        alert('Usuario no encontrado');
      }
    } catch (err) {
      console.error(err);
      alert('Error buscando usuario');
    } finally { busy = false; }
  }

  async function associateUserWithEmail() {
    if (!form.id || !form.email) { alert('Worker id o email faltante'); return; }
    busy = true;
    try {
      const resp = await axios.post(`${API}api/v1/workers/${form.id}/associate-user`, { email: form.email });
      if (resp.data && resp.data.data) {
        form.user_id = resp.data.data.user_id;
        form.user_name = resp.data.data.username || '';
        dispatch('updated');
        alert('Asociado');
      }
    } catch (err) {
      console.error(err);
      alert('Error asociando usuario');
    } finally { busy = false; }
  }

  async function removeUser() {
    if (!form.id || !form.user_id) { alert('No hay usuario asociado'); return; }
    if (!confirm('Quitar asociación con el usuario?')) return;
    busy = true;
    try {
      const resp = await axios.post(`${API}api/v1/workers/${form.id}/remove-user`, { user_id: form.user_id });
      form.user_id = null;
      form.user_name = '';
      dispatch('updated');
      alert('Usuario removido');
    } catch (err) {
      console.error(err);
      alert('Error removiendo usuario');
    } finally { busy = false; }
  }

  async function sendPasswordChangeRequest() {
    if (!form.user_id) { alert('No hay usuario asociado'); return; }
    busy = true;
    try {
      await axios.post(`${API}api/v1/users/${form.user_id}/send-password-reset`);
      alert('Correo de cambio de contraseña enviado');
    } catch (err) {
      console.error(err);
      alert('Error enviando correo');
    } finally { busy = false; }
  }
</script>

<div class="bg-light p-3 rounded">
  <!-- Row 1: Inputs -->
  <div class="row mb-3">
    <div class="col-md-6">
      <label class="form-label">Email</label>
      <input class="form-control" bind:value={form.email} />
    </div>
    <div class="col-md-6">
      <label class="form-label">Usuario</label>
      <input class="form-control" value={form.user_name} readonly />
    </div>
  </div>

  <!-- Row 2: Buttons -->
  <div class="row">
    <div class="col-12 d-flex gap-2">
      <button class="btn btn-outline-primary" on:click={findUser} disabled={busy} type="button" title="Buscar usuario">
        <i class="fa fa-search"></i>
        <span class="ms-1">Buscar</span>
      </button>
      <button class="btn btn-primary" on:click={associateUserWithEmail} disabled={busy} type="button" title="Asociar usuario">
        <i class="fa fa-link"></i>
        <span class="ms-1">Asociar</span>
      </button>
      <button class="btn btn-warning" on:click={removeUser} disabled={busy} type="button" title="Quitar usuario">
        <i class="fa fa-unlink"></i>
        <span class="ms-1">Quitar</span>
      </button>
      <button class="btn btn-secondary" on:click={sendPasswordChangeRequest} disabled={busy} type="button" title="Enviar cambio de contraseña">
        <i class="fa fa-envelope"></i>
        <span class="ms-1">Enviar cambio contraseña</span>
      </button>
    </div>
  </div>
</div>

<style>
  .bg-light { background-color: #f8f9fa !important; }
</style>
