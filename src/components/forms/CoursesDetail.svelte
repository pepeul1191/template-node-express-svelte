<script>
  // src/components/forms/CourseDetail.svelte
  import { createEventDispatcher, onMount } from 'svelte';
  import axios from 'axios';
  import CourseForm from './CoursesForm.svelte';

  const dispatch = createEventDispatcher();
  const API = typeof API_URL !== 'undefined' ? API_URL : window.API_URL || '';

  let mode = 'create';

  let form = {
    id:null,
    name:'',
    code:'',
    description:'',
    sylabus_url:'',
    level_id:'',
    worker_id:''
  };

  let levels = [];
  let workers = [];

  let loading = {
    levels:false,
    workers:false
  };

  onMount(async () => {
    await Promise.all([
      loadLevels(),
      loadWorkers()
    ]);
  });

  async function loadLevels(){
    loading.levels = true;
    try{
      const jwt = localStorage.getItem('jwtToken');

      const res = await axios.get(`${API}api/v1/levels`,{
        headers:{ Authorization:`Bearer ${jwt}` }
      });

      if(res.data.success){
        levels = res.data.data.list;
      }
    }catch(err){
      console.error(err);
    }finally{
      loading.levels = false;
    }
  }

  async function loadWorkers(){
    loading.workers = true;

    try{
      const jwt = localStorage.getItem('jwtToken');

      const res = await axios.get(`${API}api/v1/workers`,{
        headers:{ Authorization:`Bearer ${jwt}` }
      });

      if(res.data.success){
        workers = res.data.data.list;
      }

    }catch(err){
      console.error(err);
    }finally{
      loading.workers = false;
    }
  }

  export function showCreate(){
    mode = 'create';

    form = {
      id:null,
      name:'',
      code:'',
      description:'',
      sylabus_url:'',
      level_id:'',
      worker_id:''
    };
  }

  export function showEdit(course){
    mode = 'edit';

    form = {
      id:course.id,
      name:course.name,
      code:course.code,
      description:course.description,
      sylabus_url:course.sylabus_url,
      level_id:course.level_id,
      worker_id:course.worker_id
    };
  }

  const save = async () => {

    const jwt = localStorage.getItem('jwtToken');

    try{

      if(mode === 'create'){

        const res = await axios.post(
          `${API}api/v1/courses`,
          form,
          { headers:{ Authorization:`Bearer ${jwt}` }}
        );

        dispatch('saved', res.data.data);

      }else{

        const res = await axios.put(
          `${API}api/v1/courses/${form.id}`,
          form,
          { headers:{ Authorization:`Bearer ${jwt}` }}
        );

        dispatch('saved', res.data.data);
      }

    }catch(error){
      console.error(error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const close = () => dispatch('close');

</script>

<!-- Tabs -->
<ul class="nav nav-tabs mb-3" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="tab-detail" data-bs-toggle="tab" data-bs-target="#tab-persona" type="button" role="tab" aria-controls="tab-detail" aria-selected="true">Detalle del Curso</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="tab-common-material-tab" data-bs-toggle="tab" data-bs-target="#tab-common-material" type="button" role="tab" aria-controls="tab-common-material" aria-selected="false">Material del Curso</button>
  </li>
</ul>

<div class="tab-content">
  <div class="tab-pane fade show active" id="tab-persona" role="tabpanel" aria-labelledby="tab-detail">
    <CourseForm
      bind:form={form}
      {levels}
      {workers}
      {loading}
      on:save={save}
      on:close={close}
    />
  </div>

  <div class="tab-pane fade" id="tab-common-material" role="tabpanel" aria-labelledby="tab-common-material-tab">
    Material del Curso (a implementar)
  </div>
</div>
