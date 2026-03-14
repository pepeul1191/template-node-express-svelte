<!-- src/components/forms/SectionDetail.svelte -->
<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import axios from 'axios';
  import SectionForm from './SectionForm.svelte';

  const API = typeof API_URL !== 'undefined' ? API_URL : (window && window.API_URL) || '';
  const dispatch = createEventDispatcher();

  export let courseId = null;

  // mode: 'create' | 'edit'
  let mode = 'create';
  let form = {
    id: null,
    name: '',
    description: '',
    image_url: '',
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
      course_id: section.course_id || courseId
    };
  }

  const save = async () => {
    const jwt = localStorage.getItem('jwtToken');

    try {
      if (mode === 'create') {
        const payload = {
          name: form.name,
          description: form.description,
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
          image_url: form.image_url
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

<div class="tab-content">
  <div class="tab-pane fade show active">
    <SectionForm bind:form={form} on:save={save} on:close={close} />
  </div>
</div>