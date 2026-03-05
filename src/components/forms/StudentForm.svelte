<script>
  // src/components/forms/StudentForm.svelte
  import { createEventDispatcher } from 'svelte';
  import UploadFile from '../widgets/UploadFile.svelte';

  export let form;
  export let sexs = [];
  export let documentTypes = [];
  export let loading = { sexs: false, documentTypes: false };

  const dispatch = createEventDispatcher();
  let uploadFileComponent; // referencia al componente UploadFile

  const doSave = (e) => {
    e.preventDefault();
    dispatch('save');
  }

  const doClose = (e) => {
    e.preventDefault();
    clearForm();
    dispatch('close');
  }

  const clearForm = () => {
    // Limpiar campos del formulario
    form.person.last_names = '';
    form.person.names = '';
    form.person.birth_date = '';
    form.person.sex_id = '';
    form.person.document_type_id = '';
    form.person.document_number = '';
    form.code = '';
    form.person.image_url = '';
    
    // Limpiar el componente UploadFile si existe
    if (uploadFileComponent) {
      uploadFileComponent.clear();
    }
  }

  const fileUploaded = (e) => {
    //console.log(e)
    form.person.image_url = `${e.detail.fileUrl}` || '';
  }

  const clearFile = (e) => {
    form.person.image_url = '';
  }
</script>

<form on:submit|preventDefault={doSave}>
  <div class="bg-light p-3 rounded">
    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label">Apellidos</label>
        <input class="form-control" bind:value={form.person.last_names} required />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">Nombres</label>
        <input class="form-control" bind:value={form.person.names} required />
      </div>
      <div class="col-md-2 mb-3">
        <label class="form-label">Fecha nac.</label>
        <input type="date" class="form-control" bind:value={form.person.birth_date} />
      </div>
      <div class="col-md-2 mb-3">
        <label class="form-label">Sexo</label>
        <select class="form-control" bind:value={form.person.sex_id} disabled={loading.sexs}>
          <option value="">--</option>
          {#each sexs as sex}
            <option value={sex.id} selected={sex.id === form.sex_id}>
            {sex.name}
            </option>
          {/each}
        </select>
        {#if loading.sexs}
          <small class="text-muted">Cargando...</small>
        {/if}
      </div>
    </div>

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
        <input class="form-control" bind:value={form.person.document_number} />
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">Código de trabajador</label>
        <input class="form-control" bind:value={form.code} />
      </div>
      <div class="col-md-5 mb-3">
        <label class="form-label">Imagen</label>
        <UploadFile
          bind:this={uploadFileComponent}
          postUrl={`${FILES_URL}/api/v1/public`}
          baseURL={FILES_URL}
          allowedExtensions={['jpg','png','jpeg']}
          maxFileSizeMB={5}
          extraParams={{ folder: 'workers' }}
          jwtKey={"file_token"}
          fileUrl={form.person.image_url}
          showProgress={false}
          hideInput={true}
          on:uploaded={fileUploaded}
          on:clear={clearFile}
        />
      </div>
    </div>

    <div class="row align-items-start">

      <!-- Columna de la imagen -->
      {#if form.person.image_url && form.person.image_url !== 'img/user.png' && form.person.image_url !== '/img/user.png'}
        <div class="col-md-2 mb-3">
          <label class="form-label d-block">Foto</label>
          <img
            src={`${FILES_URL}/${form.person.image_url}`}
            alt="Foto"
            class="img-thumbnail"
            style="max-width:120px;" />
        </div>
      {:else}
        <div class="col-md-2 mb-3">
          <label class="form-label d-block">Foto</label>
          <img
            src="/img/user.png"
            alt="Foto"
            class="img-thumbnail"
            style="max-width:120px;" />
        </div>
      {/if}
    </div>

    <div class="text-end">
      <button type="button" class="btn btn-secondary me-2" on:click={doClose}>
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

<style>
  .form-label { font-weight: 600; }
  .bg-light { background-color: #f8f9fa !important; }
</style>
