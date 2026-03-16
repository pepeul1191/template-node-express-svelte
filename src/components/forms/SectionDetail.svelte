<!-- src/components/forms/SectionDetail.svelte -->
<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import axios from 'axios';
  import SectionForm from './SectionForm.svelte';
	import SectionWorkerRoleForm from './SectionWorkerRoleForm.svelte';

  const API = typeof API_URL !== 'undefined' ? API_URL : (window && window.API_URL) || '';
  const dispatch = createEventDispatcher();

  let sectionWorkerRoleForm;  // referencia al formulario de roles de trabajadors por sección

  export let courseId = null;

  // mode: 'create' | 'edit'
  let mode = 'create';
  let form = {
    id: null,
    name: '',
    description: '',
    image_url: '',
    code: '',
    course_id: courseId
  };

  // Called by parent (modal wrapper) to prepare the form
  export function showCreate() {
    mode = 'create';
    form = {
      id: null,
      name: '',
      description: '',
      image_url: '',
      code: '',
      course_id: courseId
    };
  }

  export function showEdit(section) {
    mode = 'edit';
    form = {
      id: section.id,
      name: section.name || '',
      description: section.description || '',
      image_url: section.image_url || '',
      code: section.code || '',
      course_id: section.course_id || courseId
    };

    sectionWorkerRoleForm.sectionId = form.id;
    sectionWorkerRoleForm.searchWorkers(); 
  }

  const save = async () => {
    const jwt = localStorage.getItem('jwtToken');

    try {
      if (mode === 'create') {
        const payload = {
          name: form.name,
          description: form.description,
          code: form.code,
          image_url: form.image_url || 'section.png'
        };

        const res = await axios.post(`${API}api/v1/courses/${courseId}/sections`, payload, { 
          headers: { Authorization: `Bearer ${jwt}` } 
        });

        form.id = res.data.data.id;
        mode = 'edit';
        await tick();
        dispatch('saved', res.data.data || res.data);
      } else {
        const payload = {
          name: form.name,
          description: form.description,
          image_url: form.image_url,
          code: form.code,
        };

        const res = await axios.put(`${API}api/v1/courses/${courseId}/sections/${form.id}`, payload, { 
          headers: { Authorization: `Bearer ${jwt}` } 
        });
        dispatch('saved', res.data.data || res.data);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || 'Error al guardar');
    }
  };

  const close = () => dispatch('close');
</script>

<!-- Tabs -->
<ul class="nav nav-tabs mb-3" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="tab-detail-tab" data-bs-toggle="tab" data-bs-target="#tab-detail" type="button" role="tab" aria-controls="tab-detail" aria-selected="true">Detalle</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="tab-workers-tab" data-bs-toggle="tab" data-bs-target="#tab-workers" type="button" role="tab" aria-controls="tab-workers" aria-selected="false">Encargados</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="tab-documents-tab" data-bs-toggle="tab" data-bs-target="#tab-documents" type="button" role="tab" aria-controls="tab-documents" aria-selected="false">Lecturas y Casos</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="tab-adverts-tab" data-bs-toggle="tab" data-bs-target="#tab-adverts" type="button" role="tab" aria-controls="tab-adverts" aria-selected="false">Anuncios</button>
  </li>
</ul>

<div class="tab-content">

  <div class="tab-pane fade show active" id="tab-detail" role="tabpanel" aria-labelledby="tab-detail-tab">
    <SectionForm bind:form={form} on:save={save} on:close={close} />
  </div>

  <div class="tab-pane fade" id="tab-workers" role="tabpanel" aria-labelledby="tab-workers-tab">
    <SectionWorkerRoleForm bind:form={form} bind:sectionId={form.id} bind:this={sectionWorkerRoleForm}/>
  </div>

  <div class="tab-pane fade" id="tab-documents" role="tabpanel" aria-labelledby="tab-documents-tab">
    <h1>Lecturas y Casos</h1>
  </div>

  <div class="tab-pane fade" id="tab-adverts" role="tabpanel" aria-labelledby="tab-adverts-tab">
    <h1>Anuncios</h1>
  </div>

</div>