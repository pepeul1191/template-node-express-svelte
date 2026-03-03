<script>
  // src/components/widgets/UploadFile.svelte
  import { createEventDispatcher } from 'svelte';
  import axios from 'axios';

  // Props
  export let postUrl = ''; // URL to POST files to
  export let jwtKey = 'jwtToken'; // localStorage key for JWT
  export let extraParams = {}; // extra form fields to send
  export let responseFormat = 'standard'; // 'standard' -> { success, message, data, error } or 'raw'
  export let baseURL = '/';
  export let allowedExtensions = []; // ['jpg','png','pdf'] (no dot, lowercase)
  export let maxFileSizeMB = 5; // maximum file size per file in MB
  export let multiple = false; // allow multiple file selection (ahora siempre false implícitamente)
  export let maxFiles = 1; // máximo siempre 1
  export let fieldName = 'file'; // form field name for files
  export let headers = {}; // additional headers
  export let hideInput = false; // nueva prop para ocultar o mostrar el input file (default false)
  export let showProgress = true; // nueva prop para ocultar o mostrar el formulario de progreso (default true)
  export let fileUrlPrefix = ''; // prefijo para la URL del archivo (ej: /uploads/)
  export let fileUrl = '';

  const dispatch = createEventDispatcher();

  let inputEl;
  let selectedFile = null; // ahora es un solo archivo, no array
  let upload = { file: null, progress: 0, status: 'pending', response: null, error: null, fileUrl: null }; // un solo upload
  let errors = [];

  const humanSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024; const sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  function clear() {
    selectedFile = null;
    upload = { file: null, progress: 0, status: 'pending', response: null, error: null, fileUrl: null };
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

    // Siempre solo un archivo
    if (arr.length === 0) return;
    
    if (arr.length > 1) {
      errors.push('Solo puede seleccionar un archivo');
      return;
    }

    const file = arr[0];
    const err = validateFile(file);
    if (err) {
      errors.push(`${file.name}: ${err}`);
      return;
    }

    // Si ya había un archivo seleccionado, lo reemplazamos
    selectedFile = file;
    upload = { file: file, progress: 0, status: 'pending', response: null, error: null, fileUrl: null };
    
    // Auto-subir si hideInput es true (comportamiento similar al original)
    if (!hideInput && postUrl) {
      uploadFile();
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

  async function uploadFile() {
    if (!selectedFile) {
      errors.push('No hay archivo seleccionado');
      return;
    }

    if (!postUrl) {
      errors.push('No se ha configurado postUrl');
      return;
    }

    // Si ya está subido o subiendo, no hacer nada
    if (upload.status === 'done' || upload.status === 'uploading') return;

    upload.status = 'uploading';

    const form = new FormData();
    form.append(fieldName, selectedFile);
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
        upload.progress = percent;
        dispatch('progress', { file: selectedFile, progress: percent });
      }
    };

    try {
      const res = await axios.post(postUrl, form, cfg);
      upload.response = res.data;

      // Extract file URL from response if available
      if (res.data && res.data.data && res.data.data.url) {
        upload.fileUrl = res.data.data.url;
      } else if (res.data && res.data.url) {
        upload.fileUrl = res.data.url;
      } else if (res.data && res.data.data && res.data.data.fileUrl) {
        upload.fileUrl = res.data.data.fileUrl;
      } else if (res.data && res.data.fileUrl) {
        upload.fileUrl = res.data.fileUrl;
      } else if (fileUrlPrefix && res.data && res.data.data) {
        const d = res.data.data;
        // if backend returns folder+filename, build path
        if (d.folder && d.filename) {
          upload.fileUrl = `${fileUrlPrefix}${d.folder}/${d.filename}`;
        } else if (d.filename) {
          upload.fileUrl = fileUrlPrefix + d.filename;
        }
        upload.status = 'done';
        fileUrl = upload.fileUrl;
      }

      // normalize response
      if (responseFormat === 'standard') {
        // expected { success, message, data, error }
        if (res.data && res.data.success) {
          upload.status = 'done';
          fileUrl = `${res.data.data.folder}/${res.data.data.filename}`;
          console.log('File:', res.data.data);
          console.log('File uploaded successfully. URL:', fileUrl);
          dispatch('uploaded', { file: selectedFile, data: res.data.data, message: res.data.message, fileUrl: fileUrl });
        } else {
          const resp = res.data || {};
          const errMsg = resp.message || resp.error || 'Error desconocido';
          upload.error = errMsg;
          upload.errorMessage = resp.message || resp.error;
          dispatch('error', {
            file: selectedFile,
            error: errMsg,
            message: resp.message,
            response: resp
          });
        }
      } else {
        // raw
        dispatch('uploaded', { file: selectedFile, data: res.data, fileUrl: upload.fileUrl });
      }
    } catch (err) {
      upload.status = 'error';
      upload.error = err.response?.data || err.message || err;
      dispatch('error', { file: selectedFile, error: upload.error, response: err.response?.data || null });
    }
  }

  function removeFile() {
    clear();
  }

  function openFileInNewTab() {
    console.log('Opening file URL:', fileUrl);
    if (fileUrl) {
      window.open(`${baseURL}/${fileUrl}`, '_blank');
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
        Archivo
      </button>

      <!-- Input oculto -->
      <input 
        bind:this={inputEl} 
        type="file" 
        on:change={onFileChange} 
        multiple={false}
        style="display: none;" 
      />

      <button 
        type="button"
        class="btn btn-primary" 
        on:click={uploadFile} 
        disabled={!postUrl || !selectedFile || upload.status === 'uploading' || upload.status === 'done'}
      >
        <i class="fa fa-upload" aria-hidden="true"></i>
        Subir
      </button>

      {#if fileUrl != ''}
        <button 
          type="button" 
          class="btn btn-primary" 
          on:click={() => openFileInNewTab()}
          title="Ver archivo"
        >
          <i class="fa fa-picture-o" aria-hidden="true"></i>
          Ver
        </button>
      {/if}

      <button class="btn btn-secondary" on:click={clear} disabled={!selectedFile}>
        <i class="fa fa-trash" aria-hidden="true"></i>
        Limpiar
      </button>
    {:else}
      <input 
        bind:this={inputEl} 
        type="file" 
        on:change={onFileChange} 
        multiple={false}
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
    
  {#if selectedFile && showProgress === true}
    <div class="mb-2">
      <div class="file-row">
        <div>
          <strong>{selectedFile.name}</strong>
          <div class="small-muted">{humanSize(selectedFile.size)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          {#if upload.status === 'uploading'}
            <progress value={upload.progress} max="100">{upload.progress}%</progress>
          {:else if upload.status === 'done'}
            <span class="badge bg-success">Subido</span>
            <!-- Botón Ver si hay URL disponible -->
            {#if fileUrl}
              <button 
                type="button" 
                class="btn btn-sm btn-outline-info" 
                on:click={() => openFileInNewTab()}
                title="Ver archivo"
              >
                Ver
              </button>
            {/if}
          {:else if upload.status === 'error'}
            <span class="badge bg-danger">Error</span>
            {#if upload.error}
              <span class="small-muted ms-2">{upload.error}</span>
            {/if}
          {:else}
            <span class="small-muted">Pendiente</span>
          {/if}
          <button type="button" class="btn btn-sm btn-outline-danger" on:click={removeFile}>Eliminar</button>
        </div>
      </div>
    </div>
  {/if}

  {#if !hideInput}
    <div class="d-flex gap-2">
      <button class="btn btn-primary" on:click={uploadFile} disabled={!postUrl || !selectedFile || upload.status === 'uploading' || upload.status === 'done'}>Subir</button>
      <button class="btn btn-secondary" on:click={clear} disabled={!selectedFile}>Limpiar</button>
    </div>
  {/if}
</div>