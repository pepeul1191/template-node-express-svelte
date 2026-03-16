<script>
  import { createEventDispatcher } from 'svelte';
  import UploadFile from '../widgets/UploadFile.svelte';

  export let form;
  export let courseId; // <- viene del componente padre

  let uploadFileComponent;

  const dispatch = createEventDispatcher();

  const doSave = (e) => {
    e.preventDefault();

    // asegurar que el course_id se incluya
    form.course_id = courseId;

    dispatch('save', form);
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
    form.code = '';

    if (uploadFileComponent) {
      uploadFileComponent.clear();
    }
  };

  const fileUploaded = (e) => {
    form.image_url = e.detail.fileUrl || '';
  };

  const clearFile = () => {
    form.image_url = '';
  };
</script>

<form on:submit|preventDefault={doSave}>
  <div class="p-3 rounded">

    <div class="row">
      <div class="col-md-8 mb-3">
        <label class="form-label">Nombre de la sección *</label>
        <input
          class="form-control"
          bind:value={form.name}
          maxlength="45"
          placeholder="Ej: Introducción"
          required />
      </div>

      <div class="col-md-4 mb-3">
        <label class="form-label">Código</label>
        <input
          class="form-control"
          bind:value={form.code}
          maxlength="20" />
      </div>
    </div>

    <div class="row">
      <div class="col-md-12 mb-3">
        <label class="form-label">Descripción</label>
        <textarea
          class="form-control"
          rows="3" 
          bind:value={form.description}
          placeholder="Descripción breve"
        ></textarea>
      </div>
    </div>

    <div class="row align-items-end">
      <div class="col-md-5 mb-3">
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

      <div class="col-md-2 mb-3">
        <label class="form-label d-block">Vista previa</label>

        <img
          src={form.image_url
            ? `${FILES_URL}/${form.image_url}`
            : '/img/section.png'}
          alt="Sección"
          class="img-thumbnail preview-img" />
      </div>
    </div>

    <div class="text-end mt-3">
      <button type="button" class="btn btn-outline-secondary me-2" on:click={doClose}>
        <i class="fa fa-times"></i>
        <span class="ms-1">Cancelar</span>
      </button>

      <button type="submit" class="btn btn-primary">
        <i class="fa fa-save"></i>
        <span class="ms-1">Guardar</span>
      </button>
    </div>

  </div>
</form>

<style>
  .form-label{
    font-weight:600;
  }

  .preview-img{
    max-width:120px;
    max-height:120px;
    object-fit:contain;
  }

  .bg-light{
    background:#f8f9fa;
  }
</style>