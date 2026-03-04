<script>
  import { createEventDispatcher } from 'svelte';
  import axios from 'axios';

  export let form;
  const API = (typeof API_URL !== 'undefined' ? API_URL : (window && window.API_URL) || '');

  const dispatch = createEventDispatcher();

  let alertMessage = { text: '', status: '' };
  let busy = false;

  function showAlertFromResponse(resp, successStatus = 'success', errorStatus = 'danger', duration = 4000) {
    if (resp.success) {
      alertMessage = { text: resp.message || 'Operación exitosa', status: successStatus };
    } else {
      const msg = resp.message || '';
      const err = resp.error || '';
      alertMessage = { text: `${msg}${err ? ' - ' + err : ''}`, status: errorStatus };
    }
    setTimeout(() => {
      alertMessage = { text: '', status: '' };
    }, duration);
  }

  async function findUser() {
    if (!form.email) {
      alertMessage = { text: 'Ingrese un email para buscar', status: 'warning' };
      return;
    }

    busy = true;
    try {
      const token = localStorage.getItem('access_token');

      const resp = await axios.get(
        `${ACCESS_URL}/api/v1/users/search-id-by-email`,
        {
          params: { email: form.email },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (resp.data) {
        showAlertFromResponse(resp.data);
        if (resp.data.success && resp.data.data) {
          form.user_id = resp.data.data.id;
          form.user_name = resp.data.data.username || resp.data.data.name || '';
          dispatch('updated');
        }
      }
    } catch (err) {
      console.error(err);

      // Si la respuesta del servidor tiene formato JSON
      if (err.response?.data) {
        showAlertFromResponse(err.response.data);
      } else {
        // Error genérico de comunicación
        alertMessage = { text: 'Error de comunicación con el servidor', status: 'danger' };
      }
    } finally {
      busy = false;
    }
  }

  async function associateUserWithEmail() {
    if (!form.id || !form.email) { 
      alertMessage = { text: 'Worker id o email faltante', status: 'warning' }; 
      return; 
    }

    busy = true;
    try {
      const resp = await axios.put(`${API}api/v1/workers/${form.id}/associate-user`, { email: form.email, user_id: form.user_id});
      if (resp.data) {
        showAlertFromResponse(resp.data);
        if (resp.data.success && resp.data.data) {
          form.user_id = resp.data.data.user_id;
          form.user_name = resp.data.data.username || '';
          dispatch('updated');
        }
      }
    } catch (err) {
      console.error(err);
      alertMessage = { text: 'Error de comunicación con el servidor', status: 'danger' };
    } finally { busy = false; }
  }

  async function removeUser() {
    if (!form.id || !form.user_id) { 
      alertMessage = { text: 'No hay usuario asociado', status: 'warning' }; 
      return; 
    }

    if (!confirm('Quitar asociación con el usuario?')) return;

    busy = true;
    try {
      const resp = await axios.put(`${API}api/v1/workers/${form.id}/remove-user`, { });
      if (resp.data) {
        showAlertFromResponse(resp.data);
        if (resp.data.success) {
          form.user_id = null;
          form.user_name = '';
          dispatch('updated');
        }
      }
    } catch (err) {
      console.error(err);
      alertMessage = { text: 'Error de comunicación con el servidor', status: 'danger' };
    } finally { busy = false; }
  }

  export async function loadUser() { 
    if (!form.email) {
      alertMessage = { text: 'Usuario no tiene correo registrado', status: 'warning' };
      return;
    }

    busy = true;
    try {
      const token = localStorage.getItem('access_token');

      const resp = await axios.get(
        `${ACCESS_URL}/api/v1/users/search-id-by-email`,
        {
          params: { email: form.email },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (resp.data) {
        showAlertFromResponse(resp.data);
        if (resp.data.success && resp.data.data) {
          form.user_id = resp.data.data.id;
          form.user_name = resp.data.data.username || resp.data.data.name || '';
          dispatch('updated');
        }
      }
    } catch (err) {
      console.error(err);

      // Si la respuesta del servidor tiene formato JSON
      if (err.response?.data) {
        showAlertFromResponse(err.response.data);
      } else {
        // Error genérico de comunicación
        alertMessage = { text: 'Error de comunicación con el servidor para obtner el usuario', status: 'danger' };
      }
    } finally {
      busy = false;
    }
  }
</script>

<div class="bg-light p-3 rounded">
  <!-- Alerta -->
  {#if alertMessage.text}
    <div class="col-md-12">
      <div class="alert alert-{alertMessage.status}" role="alert">
        {alertMessage.text}
      </div>
    </div>
  {/if}

  <!-- Row: Inputs + Botones -->
  <div class="row mb-3 align-items-end">
    <div class="col-md-4">
      <label class="form-label">Email</label>
      <input class="form-control" bind:value={form.email} />
    </div>

    <div class="col-md-3">
      <label class="form-label">Usuario</label>
      <input class="form-control" value={form.user_name} readonly disabled />
    </div>

    <div class="col-md-5 d-flex gap-2 justify-content-end">
      <button class="btn btn-secondary" on:click={findUser} disabled={busy} type="button">
        <i class="fa fa-search"></i> Buscar
      </button>
      <button class="btn btn-secondary" on:click={removeUser} disabled={busy} type="button">
        <i class="fa fa-unlink"></i> Desasociar Usuario
      </button>
      <button class="btn btn-primary" on:click={associateUserWithEmail} disabled={busy} type="button">
        <i class="fa fa-check"></i> Guardar
      </button>
    </div>
  </div>
</div>

<style>
  .bg-light { background-color: #f8f9fa !important; }
</style>