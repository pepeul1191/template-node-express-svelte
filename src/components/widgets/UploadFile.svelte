<script>
  // src/components/widgets/UploadFile.svelte
  import { createEventDispatcher } from 'svelte';
  import axios from 'axios';

  // Props
  export let postUrl = ''; // URL to POST files to
  export let jwtKey = 'jwtToken'; // localStorage key for JWT
  export let extraParams = {}; // extra form fields to send
  export let responseFormat = 'standard'; // 'standard' -> { success, message, data, error } or 'raw'
  export let allowedExtensions = []; // ['jpg','png','pdf'] (no dot, lowercase)
  export let maxFileSizeMB = 5; // maximum file size per file in MB
  export let multiple = false; // allow multiple file selection
  export let maxFiles = null; // optional maximum number of files when multiple=true
  export let fieldName = 'file'; // form field name for files
  export let headers = {}; // additional headers
  export let hideInput = false; // nueva prop para ocultar o mostrar el input file (default false)
  export let showProgress = true; // nueva prop para ocultar o mostrar el formulario de progreso (default true)
  export let fileUrlPrefix = ''; // prefijo para la URL del archivo (ej: /uploads/)

  const dispatch = createEventDispatcher();

  let inputEl;
  let selectedFiles = []; // array of File
  let uploads = []; // { file, progress, status, response, error, fileUrl }
  let errors = [];

  const humanSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024; const sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  function clear() {
    selectedFiles = [];
    uploads = [];
    errors = [];
    if (inputEl) inputEl.value = '';
  }

  function triggerFileInput() {
    if (inputEl) {
      inputEl.click();
    }
  }

  function onFileChange(e) {
    handleFiles(e.target.files);
  }

  function handleFiles(fileList) {
    errors = [];
    const arr = Array.from(fileList || []);

    if (!multiple && arr.length > 1) {
      errors.push('Solo puede seleccionar un archivo');
      return;
    }
    if (multiple && maxFiles && arr.length > maxFiles) {
      errors.push(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    const validated = [];
    for (const f of arr) {
      const err = validateFile(f);
      if (err) errors.push(`${f.name}: ${err}`);
      else validated.push(f);
    }

    if (validated.length > 0) {
      selectedFiles = multiple ? [...selectedFiles, ...validated] : validated;
      // initialize uploads entries
      for (const f of validated) uploads.push({ file: f, progress: 0, status: 'pending', response: null, error: null, fileUrl: null });
    }
  }

  function validateFile(file) {
    // extension
    if (allowedExtensions && allowedExtensions.length > 0) {
      const name = file.name || '';
      const ext = name.split('.').pop().toLowerCase();
      if (!allowedExtensions.map(x => x.toLowerCase()).includes(ext)) {
        return `Extensión no permitida (.${ext})`;
      }
    }

    // size
    if (maxFileSizeMB && maxFileSizeMB > 0) {
      const maxBytes = Number(maxFileSizeMB) * 1024 * 1024;
      if (file.size > maxBytes) {
        return `Archivo mayor a ${maxFileSizeMB} MB (${humanSize(file.size)})`;
      }
    }

    return null;
  }

  async function uploadAll() {
    errors = [];
    if (!postUrl) {
      errors.push('No se ha configurado postUrl');
      return;
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      // skip already uploaded
      const u = uploads.find(x => x.file === selectedFiles[i]);
      if (u && (u.status === 'done' || u.status === 'uploading')) continue;
      await uploadFile(selectedFiles[i]);
    }
  }

  async function uploadFile(file) {
    const idx = uploads.findIndex(x => x.file === file);
    if (idx === -1) return;
    uploads[idx].status = 'uploading';

    const form = new FormData();
    form.append(fieldName, file);
    // append extra params
    for (const k in extraParams) {
      if (Object.prototype.hasOwnProperty.call(extraParams, k)) {
        form.append(k, extraParams[k]);
      }
    }

    const jwt = typeof localStorage !== 'undefined' ? localStorage.getItem(jwtKey) : null;
    const cfg = {
      headers: {
        ...headers,
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (evt) => {
        const percent = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
        uploads[idx].progress = percent;
        dispatch('progress', { file, progress: percent });
      }
    };

    try {
      const res = await axios.post(postUrl, form, cfg);
      uploads[idx].status = 'done';
      uploads[idx].response = res.data;

      // Extract file URL from response if available
      if (res.data && res.data.data && res.data.data.url) {
        uploads[idx].fileUrl = res.data.data.url;
      } else if (res.data && res.data.url) {
        uploads[idx].fileUrl = res.data.url;
      } else if (res.data && res.data.data && res.data.data.fileUrl) {
        uploads[idx].fileUrl = res.data.data.fileUrl;
      } else if (res.data && res.data.fileUrl) {
        uploads[idx].fileUrl = res.data.fileUrl;
      } else if (fileUrlPrefix && res.data && res.data.data && res.data.data.filename) {
        // Construct URL from filename if prefix is provided
        uploads[idx].fileUrl = fileUrlPrefix + res.data.data.filename;
      }

      // normalize response
      if (responseFormat === 'standard') {
        // expected { success, message, data, error }
        if (res.data && res.data.success) {
          dispatch('uploaded', { file, data: res.data.data, message: res.data.message, fileUrl: uploads[idx].fileUrl });
        } else {
          uploads[idx].error = res.data?.error || res.data?.message || 'Error desconocido';
          dispatch('error', { file, error: uploads[idx].error, response: res.data });
        }
      } else {
        // raw
        dispatch('uploaded', { file, data: res.data, fileUrl: uploads[idx].fileUrl });
      }
    } catch (err) {
      uploads[idx].status = 'error';
      uploads[idx].error = err.response?.data || err.message || err;
      dispatch('error', { file, error: uploads[idx].error, response: err.response?.data || null });
    }
  }

  function removeFile(i) {
    const f = selectedFiles[i];
    selectedFiles = selectedFiles.filter((_, idx) => idx !== i);
    uploads = uploads.filter(u => u.file !== f);
  }

  function openFileInNewTab(fileUrl) {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }
</script>

<style>
  .upload-box { border: 1px dashed #ccc; padding: 12px; border-radius: 6px; }
  .file-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:6px 0; }
  .small-muted { font-size:0.85rem; color:#666; }
  progress { width: 180px; }
  .btn-link { background: none; border: none; color: #007bff; text-decoration: underline; cursor: pointer; padding: 0; font: inherit; }
  .btn-link:hover { color: #0056b3; }
</style>

<div class={`${!hideInput ? 'upload-box' : ''}`}>
  <div class="mb-2">
    {#if hideInput}
      <button type="button" class="btn btn-primary" on:click={triggerFileInput}>
        <i class="fa fa-folder-open" aria-hidden="true"></i>
        Seleccionar archivo{multiple ? 's' : ''}
      </button>

      <!-- Input oculto -->
      <input 
        bind:this={inputEl} 
        type="file" 
        on:change={onFileChange} 
        {multiple} 
        style="display: none;" 
      />

      <button 
        class="btn btn-primary" 
        on:click={uploadAll} 
        disabled={!postUrl || selectedFiles.length === 0}
      >
        <i class="fa fa-upload" aria-hidden="true"></i>
        Subir
      </button>

      <button class="btn btn-secondary" on:click={clear}>
        <i class="fa fa-trash" aria-hidden="true"></i>
        Limpiar
      </button>
    {:else}
      <input 
        bind:this={inputEl} 
        type="file" 
        on:change={onFileChange} 
        {multiple} 
      />
    {/if}
  </div>

  {#if errors.length}
    <div class="mb-2">
      {#each errors as err}
        <div class="alert alert-danger py-1 my-1">{err}</div>
      {/each}
    </div>
  {/if}
    
  {#if selectedFiles.length > 0 && showProgress === true}
    <div class="mb-2">
      {#each selectedFiles as f, i}
        <div class="file-row">
          <div>
            <strong>{f.name}</strong>
            <div class="small-muted">{humanSize(f.size)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            {#if uploads[i]}
              {#if uploads[i].status === 'uploading'}
                <progress value={uploads[i].progress} max="100">{uploads[i].progress}%</progress>
              {:else if uploads[i].status === 'done'}
                <span class="badge bg-success">Subido</span>
                <!-- Botón Ver si hay URL disponible -->
                {#if uploads[i].fileUrl}
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-info" 
                    on:click={() => openFileInNewTab(uploads[i].fileUrl)}
                    title="Ver archivo"
                  >
                    Ver
                  </button>
                {/if}
              {:else if uploads[i].status === 'error'}
                <span class="badge bg-danger">Error</span>
              {:else}
                <span class="small-muted">Pendiente</span>
              {/if}
            {/if}
            <button type="button" class="btn btn-sm btn-outline-danger" on:click={() => removeFile(i)}>Eliminar?</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if !hideInput}
    <div class="d-flex gap-2">
      <button class="btn btn-primary" on:click={uploadAll} disabled={!postUrl || selectedFiles.length===0}>Subir</button>
      <button class="btn btn-secondary" on:click={clear}>Limpiar</button>
    </div>
  {/if}
</div>