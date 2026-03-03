<script>
  // src/components/forms/WorkerDetail.svelte
  import { createEventDispatcher, onMount } from 'svelte';
  import axios from 'axios';
  import WorkerForm from './WorkerForm.svelte';
  import ContactInfoForm from './ContactInfoForm.svelte';
  import UserForm from './UserForm.svelte';

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
  let sexs = [];
  let documentTypes = [];
  let loading = {
    sexs: false,
    documentTypes: false
  };

  // Cargar datos necesarios
  onMount(async () => {
    await Promise.all([
      loadSexs(),
      loadDocumentTypes()
    ]);
  });

  // Cargar sexs
  async function loadSexs() {
    loading.sexs = true;
    try {
      const jwt = localStorage.getItem('jwtToken');
      const response = await axios.get(`${API}api/v1/sexs`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (response.data.success && response.data.data.list) {
        sexs = response.data.data.list;
      }
    } catch (error) {
      console.error('Error cargando sexos:', error);
    } finally {
      loading.sexs = false;
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
      last_names: p.last_names || '',
      document_number: p.document_number || '',
      birth_date: p.birth_date || '',
      sex_id: p.sex.id || null,
      document_type_id: p.document_type.id || null,
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

  // phone/address and user handling moved to subcomponents
</script>

<!-- Tabs -->
<ul class="nav nav-tabs mb-3" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="tab-persona-tab" data-bs-toggle="tab" data-bs-target="#tab-persona" type="button" role="tab" aria-controls="tab-persona" aria-selected="true">Persona / Trabajador</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="tab-contact-tab" data-bs-toggle="tab" data-bs-target="#tab-contact" type="button" role="tab" aria-controls="tab-contact" aria-selected="false">Contacto</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="tab-user-tab" data-bs-toggle="tab" data-bs-target="#tab-user" type="button" role="tab" aria-controls="tab-user" aria-selected="false">Usuario</button>
  </li>
</ul>

<div class="tab-content">
    <div class="tab-pane fade show active" id="tab-persona" role="tabpanel" aria-labelledby="tab-persona-tab">
      <WorkerForm bind:form={form} sexs={sexs} documentTypes={documentTypes} loading={loading} on:save={save} on:close={close} />
    </div>

  <div class="tab-pane fade" id="tab-contact" role="tabpanel" aria-labelledby="tab-contact-tab">
    <ContactInfoForm bind:form={form} />
  </div>

  <div class="tab-pane fade" id="tab-user" role="tabpanel" aria-labelledby="tab-user-tab">
    <UserForm bind:form={form} on:updated={() => { /* parent could react if needed */ }} />
  </div>
</div>

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