<!-- src/components/forms/SectionForm.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import UploadFile from '../widgets/UploadFile.svelte';

  export let form;
  let uploadFileComponent;

  const dispatch = createEventDispatcher();

  const doSave = (e) => {
    e.preventDefault();
    dispatch('save');
  };

  const doClose = (e) => {
    e.preventDefault();
    clearForm();
    dispatch('close');
  };

  const clearForm = () => {
    form.name = '';
    form.description = '';
    form.image_url = '';
    if (uploadFileComponent) {
      uploadFileComponent.clear();
    }
  };

  const fileUploaded = (e) => {
    form.image_url = e.detail.fileUrl || '';
  };

  const clearFile = (e) => {
    form.image_url = '';
  };
</script>

<form on:submit|preventDefault={doSave}>
  <div class="bg-light p-3 rounded">
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Nombre de la Sección</label>
        <input class="form-control" bind:value={form.name} required />
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Descripción</label>
        <textarea class="form-control" rows="4" bind:value={form.description}></textarea>
      </div>
      
      <div class="col-md-4 mb-3">
        <label class="form-label">Imagen</label>
        <UploadFile
          bind:this={uploadFileComponent}
          postUrl={`${FILES_URL}/api/v1/public`}
          baseURL={FILES_URL}
          allowedExtensions={['jpg','png','jpeg','svg']}
          maxFileSizeMB={5}
          extraParams={{ folder: 'sections' }}
          jwtKey={"file_token"}
          fileUrl={form.image_url}
          showProgress={false}
          hideInput={true}
          on:uploaded={fileUploaded}
          on:clear={clearFile}
        />
      </div>

      {#if form.image_url && form.image_url !== 'section.png'}
        <div class="col-md-2 mb-3">
          <label class="form-label d-block">Vista previa</label>
          <img
            src={`${FILES_URL}/${form.image_url}`}
            alt="Sección"
            class="img-thumbnail"
            style="max-width:120px;" />
        </div>
      {:else}
        <div class="col-md-2 mb-3">
          <label class="form-label d-block">Vista previa</label>
          <img
            src="/img/section.png"
            alt="Sección"
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