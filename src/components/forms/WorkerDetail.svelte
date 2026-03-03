<script>
  // src/components/forms/WorkerDetail.svelte
  import { createEventDispatcher, onMount } from 'svelte';
  import axios from 'axios';
  import Autocomplete from '../widgets/Autocomplete.svelte';
  import UploadFile from '../widgets/UploadFile.svelte';
  import DataTable from '../widgets/DataTable.svelte';

  const API = typeof API_URL !== 'undefined' ? API_URL : (window && window.API_URL) || '';

  const dispatch = createEventDispatcher();

  // mode: 'create' | 'edit'
  let mode = 'create';
  let form = {
    id: null,
    person_id: '',
    person: {
      id: null,
      names: '',
      lastNames: '',
      documentNumber: '',
      birthDate: '',
      sex_id: null,
      document_type_id: null,
      imageUrl: '',
      phones: [],
      addresses: []
    },
    code: '',
    bio: '',
    email: '',
    user_id: null,
    user_name: ''
  };

  // Listas para los selects
  let sexos = [];
  let documentTypes = [];
  let loading = {
    sexos: false,
    documentTypes: false
  };

  // Cargar datos necesarios
  onMount(async () => {
    await Promise.all([
      loadSexos(),
      loadDocumentTypes()
    ]);

    // configure phones datatable add button if present
    if (phoneDataTable) {
      phoneDataTable.addButton.action = () => phoneDataTable.addRow();
      phoneDataTable.addButton.display = true;
      phoneDataTable.saveButton = { display: false, disabled: false, action: null };
    }

    // configure addresses datatable add button if present
    if (addressDataTable) {
      addressDataTable.addButton.action = () => addressDataTable.addRow();
      addressDataTable.addButton.display = true;
      addressDataTable.saveButton = { display: false, disabled: false, action: null };
    }
  });

  // Cargar sexos
  async function loadSexos() {
    loading.sexos = true;
    try {
      const jwt = localStorage.getItem('jwtToken');
      const response = await axios.get(`${API}api/v1/sexs`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (response.data.success && response.data.data.list) {
        sexos = response.data.data.list;
      }
    } catch (error) {
      console.error('Error cargando sexos:', error);
    } finally {
      loading.sexos = false;
    }
  }

  // Cargar tipos de documento
  async function loadDocumentTypes() {
    loading.documentTypes = true;
    try {
      const jwt = localStorage.getItem('jwtToken');
      const response = await axios.get(`${API}api/v1/document-types`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (response.data.success && response.data.data.list) {
        documentTypes = response.data.data.list;
      }
    } catch (error) {
      console.error('Error cargando tipos de documento:', error);
    } finally {
      loading.documentTypes = false;
    }
  }

  // Called by parent (modal wrapper) to prepare the form; parent shows the modal UI
  export function showCreate() {
    mode = 'create';
    form = {
      id: null,
      person_id: '',
      person: {
        id: null,
        names: '',
        lastNames: '',
        documentNumber: '',
        birthDate: '',
        sex_id: null,
        document_type_id: null,
        imageUrl: '',
        phones: [],
        addresses: []
      },
      code: '',
      bio: '',
      email: '',
      user_id: null,
      user_name: ''
    };
  }

  export function showEdit(worker) {
    mode = 'edit';
    form.id = worker.id;
    form.person_id = worker.person?.id ?? worker.person_id ?? '';
    // copy individual fields to avoid reactive issues
    const p = worker.person || {};
    form.person = {
      id: p.id || null,
      names: p.names || '',
      lastNames: p.lastNames || '',
      documentNumber: p.documentNumber || '',
      birthDate: p.birthDate || '',
      sex_id: p.sex_id || null,
      document_type_id: p.document_type_id || null,
      imageUrl: p.imageUrl || '',
      phones: p.phones ? [...p.phones] : [],
      addresses: p.addresses ? p.addresses.map(a => ({
          ...a,
          district_text: a.district_text || ''
        })) : []
    };
    form.code = worker.code || '';
    form.bio = worker.bio || '';
    form.email = worker.email || '';
    form.user_id = worker.user_id || null;
    form.user_name = worker.user_name || (worker.user_id ? `ID:${worker.user_id}` : '');
  }

  const save = async () => {
    const jwt = localStorage.getItem('jwtToken');

    try {
      if (mode === 'create') {
        const payload = {
          person_id: form.person_id,
          person: form.person,
          code: form.code,
          bio: form.bio,
          email: form.email,
          user_id: form.user_id
        };

        const res = await axios.post(`${API}api/v1/workers`, payload, { headers: { Authorization: `Bearer ${jwt}` } });
        dispatch('saved', res.data.data || res.data);
      } else {
        const payload = {
          person: form.person,
          code: form.code,
          bio: form.bio,
          email: form.email,
          user_id: form.user_id
        };
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

  // phone/address utilities
  let phoneDataTable;
  let addressDataTable;

  // User utilities
  async function findUser() {
    if (!form.email) {
      alert('Ingrese un correo para buscar');
      return;
    }
    try {
      const jwt = localStorage.getItem('jwtToken');
      const res = await axios.get(`${API}api/v1/users/find`, { params: { email: form.email }, headers: { Authorization: `Bearer ${jwt}` } });
      if (res.data && res.data.success && res.data.data) {
        form.user_id = res.data.data.id || null;
        form.user_name = res.data.data.username || res.data.data.email || `ID:${form.user_id}`;
      } else {
        alert('Usuario no encontrado');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Error buscando usuario');
    }
  }

  async function associateUserWithEmail() {
    if (!form.id) { alert('Guarde el trabajador antes de asociar un usuario'); return; }
    if (!form.email) { alert('Ingrese un correo para asociar'); return; }
    try {
      const jwt = localStorage.getItem('jwtToken');
      const res = await axios.post(`${API}api/v1/workers/${form.id}/associate-user`, { email: form.email }, { headers: { Authorization: `Bearer ${jwt}` } });
      if (res.data && res.data.success) {
        form.user_id = res.data.data.user_id || form.user_id;
        form.user_name = res.data.data.username || form.email;
        alert('Usuario asociado correctamente');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Error asociando usuario');
    }
  }

  async function removeUser() {
    if (!form.id || !form.user_id) { alert('No hay usuario asociado'); return; }
    try {
      const jwt = localStorage.getItem('jwtToken');
      const res = await axios.post(`${API}api/v1/workers/${form.id}/remove-user`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      if (res.data && res.data.success) {
        form.user_id = null;
        form.user_name = '';
        alert('Usuario desvinculado');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Error al quitar usuario');
    }
  }

  async function sendPasswordChangeRequest() {
    if (!form.user_id) { alert('No hay usuario asociado'); return; }
    try {
      const jwt = localStorage.getItem('jwtToken');
      const res = await axios.post(`${API}api/v1/users/${form.user_id}/send-password-reset`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      if (res.data && res.data.success) {
        alert('Solicitud de cambio de contraseña enviada');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Error enviando solicitud');
    }
  }

  function addPhone() {
    if (phoneDataTable && typeof phoneDataTable.addRow === 'function') {
      phoneDataTable.addRow();
    } else {
      form.person.phones.push({ description: '', phone: '' });
    }
  }

  function removePhone(idx) {
    // If DataTable is used, it will handle deletes via deleteRow when provided a record.
    // Here we just remove from the underlying array to keep things simple.
    form.person.phones.splice(idx, 1);
  }

  function addAddress() {
    form.person.addresses.push({ description: '', address: '', district_id: null, district_text: '' });
  }

  function removeAddress(idx) {
    form.person.addresses.splice(idx, 1);
  }
</script>

<!-- Primer Formulario: Datos de Persona + Datos de Trabajador -->
<form on:submit|preventDefault={save} class="mb-4">
  <div class="bg-light p-3 mb-3 rounded">
    <h5 class="mb-3">
      <i class="fa fa-user" aria-hidden="true"></i>
      <span class="ms-2">Datos de la persona y trabajador</span>
    </h5>

    <!-- Primera fila: Apellidos y Nombres -->
    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label">Apellidos</label>
        <input class="form-control" bind:value={form.person.lastNames} required />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">Nombres</label>
        <input class="form-control" bind:value={form.person.names} required />
      </div>
      <div class="col-md-2 mb-3">
        <label class="form-label">Fecha nac.</label>
        <input type="date" class="form-control" bind:value={form.person.birthDate} />
      </div>
      <div class="col-md-2 mb-3">
        <label class="form-label">Sexo</label>
        <select class="form-control" bind:value={form.person.sex_id} disabled={loading.sexos}>
          <option value="">--</option>
          {#each sexos as sexo}
            <option value={sexo.id}>{sexo.name}</option>
          {/each}
        </select>
        {#if loading.sexos}
          <small class="text-muted">Cargando...</small>
        {/if}
      </div>
    </div>

    <!-- Segunda fila: Fecha de nacimiento, Sexo, Tipo de documento, Documento, Código -->
    <div class="row">
      <div class="col-md-2 mb-3">
        <label class="form-label">Tipo Doc.</label>
        <select class="form-control" bind:value={form.person.document_type_id} disabled={loading.documentTypes}>
          <option value="">--</option>
          {#each documentTypes as docType}
            <option value={docType.id}>{docType.name}</option>
          {/each}
        </select>
        {#if loading.documentTypes}
          <small class="text-muted">Cargando...</small>
        {/if}
      </div>
      <div class="col-md-2 mb-3">
        <label class="form-label">Núme. Documento</label>
        <input class="form-control" bind:value={form.person.documentNumber} />
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">Código de trabajador</label>
        <input class="form-control" bind:value={form.code} />
      </div>
       <div class="col-md-5 mb-3">
        <label class="form-label">Imagen</label>
        <UploadFile
          postUrl={`${API}api/v1/uploads/person-image`}
          allowedExtensions={['jpg','png','jpeg']}
          maxFileSizeMB={5}
          showProgress={false}
          hideInput={true}
          on:uploaded={(e) => form.person.imageUrl = e.detail.data || ''}
        />
        {#if form.person.imageUrl}
          <div class="mt-2">
            <img src={form.person.imageUrl} alt="Foto" class="img-thumbnail" style="max-width:120px;" />
          </div>
        {/if}
      </div>
    </div>

    <!-- Tercera fila: Bio -->
    <div class="row">
      <div class="col-12 mb-3">
        <label class="form-label">Bio</label>
        <textarea class="form-control" rows="3" bind:value={form.bio}></textarea>
      </div>
    </div>

    <div class="text-end">
      <button type="button" class="btn btn-secondary me-2" on:click={close}>
        <i class="fa fa-times" aria-hidden="true"></i>
        <span class="ms-1">Cancelar</span>
      </button>
      <button type="submit" class="btn btn-primary">
        <i class="fa fa-save" aria-hidden="true"></i>
        <span class="ms-1">Guardar</span>
      </button>
    </div>
  </div>
</form>

<hr>

<!-- Segundo Formulario: Teléfonos y Direcciones -->
<form on:submit|preventDefault={(e) => e.preventDefault()} class="mt-4">
  <div class="bg-light p-3 rounded">
    <h5 class="mb-3">
      <i class="fa fa-address-card" aria-hidden="true"></i>
      <span class="ms-2">Datos de Usuario</span>
    </h5>

    
    <!-- Datos de Usuario: email, usuario y acciones -->
    <div class="row align-items-end">
      <div class="col-md-3 mb-3">
        <label class="form-label">Correo</label>
        <input class="form-control" type="email" bind:value={form.email} placeholder="correo@ejemplo.com" />
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">Usuario</label>
        <input class="form-control" type="text" value={form.user_name} readonly />
      </div>
      <div class="col-md-12 mb-3 d-flex gap-2">
        <button type="button" class="btn btn-primary" on:click={associateUserWithEmail}>
          <i class="fa fa-link me-1"></i> Asociar usuario con correo
        </button>
        <button type="button" class="btn btn-warning" on:click={findUser}>
          <i class="fa fa-search me-1"></i> Buscar usuario
        </button>
        <button type="button" class="btn btn-danger" on:click={removeUser}>
          <i class="fa fa-unlink me-1"></i> Quitar usuario
        </button>
        <button type="button" class="btn btn-secondary" on:click={sendPasswordChangeRequest}>
          <i class="fa fa-envelope me-1"></i> Enviar solicitud de cambio de contraseña
        </button>
      </div>
    </div>
  </div>
</form>

<hr>

<!-- Tercer Formulario: Teléfonos y Direcciones -->
<form on:submit|preventDefault={(e) => e.preventDefault()} class="mt-4">
  <div class="bg-light p-3 rounded">
    <h5 class="mb-3">
      <i class="fa fa-list" aria-hidden="true"></i>
      <span class="ms-2">Datos de Contacto</span>
    </h5>

    <!-- Teléfonos -->
    <div class="mb-3">
      <label class="form-label">
        <i class="fa fa-phone" aria-hidden="true"></i>
        <span class="ms-1">Teléfonos</span>
      </label>
      <DataTable
        bind:this={phoneDataTable}
        bind:data={form.person.phones}
        columnKeys={[ 'id', 'phone', 'description' ]}
        columnTypes={[ '', 'input[text]', 'input[text]' ]}
        columnNames={[ 'ID', 'Teléfono', 'Descripción', 'Acciones' ]}
        columnClasses={[ 'd-none', '', '' ]}
        columnStyles={[ 'max-width:50px;', '', '' ]}
        tdStyles={[ 'max-width:50px;', '', '' ]}
        addButton={{ display: true, disabled: false, action: null }}
        saveButton={{ display: false, disabled: false, action: null }}
        actionButtons={[
          {
            class: 'btn-danger',
            icon: 'fa-trash',
            label: 'Eliminar',
            action: (record) => phoneDataTable.deleteRow(record, 'id')
          }
        ]}
        jwtToken={localStorage.getItem('jwtToken')}
      />
    </div>

    <!-- Direcciones -->
    <div class="mb-3">
      <label class="form-label">
        <i class="fa fa-map-marker" aria-hidden="true"></i>
        <span class="ms-1">Direcciones</span>
      </label>
      <DataTable
        bind:this={addressDataTable}
        bind:data={form.person.addresses}
        columnKeys={[ 'id', 'description', 'district_text' ]}
        columnTypes={[ '', 'input[text]', `autocomplete(searchUrl=${API}api/v1/districts/search,idKey=district_id,labelKey=full_name,idTarget=district_id,minChars=2,debounceMs=300,hideInput=true,showProgress=false)` ]}
        columnNames={[ 'ID', 'Descripción', 'Distrito', 'Acciones' ]}
        columnClasses={[ 'd-none', '', '' ]}
        columnStyles={[ 'max-width:50px;', '', '' ]}
        tdStyles={[ 'max-width:50px;', '', '' ]}
        addButton={{ display: true, disabled: false, action: null }}
        saveButton={{ display: false, disabled: false, action: null }}
        actionButtons={[
          {
            class: 'btn-danger',
            icon: 'fa-trash',
            label: 'Eliminar',
            action: (record) => addressDataTable.deleteRow(record, 'id')
          }
        ]}
        jwtToken={localStorage.getItem('jwtToken')}
      />
    </div>
  </div>
</form>

<style>
  .form-label { 
    font-weight: 600; 
  }
  .bg-light {
    background-color: #f8f9fa !important;
  }
  .ms-1 {
    margin-left: 0.25rem !important;
  }
  .ms-2 {
    margin-left: 0.5rem !important;
  }
  .me-2 {
    margin-right: 0.5rem !important;
  }
</style>