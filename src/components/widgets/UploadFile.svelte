<script>
  // src/components/widgets/UploadFile.svelte
  import { createEventDispatcher } from 'svelte';
  import { onDestroy } from 'svelte';
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
  export let showCleanButton = true; // nueva prop para ocultar o mostrar el botón de limpiar (default true)
  export let fileUrlPrefix = ''; // prefijo para la URL del archivo (ej: /uploads/)
  export let fileUrl = ''; // prop reactiva para la URL del archivo
  export let messageDuration = 5000; // duración en ms para mostrar mensajes (default 5 segundos)

  const dispatch = createEventDispatcher();

  // Guardar valores iniciales
  const initialProps = {
    fileUrl: fileUrl
  };

  let inputEl;
  let selectedFile = null; // ahora es un solo archivo, no array
  let upload = { file: null, progress: 0, status: 'pending', response: null, error: null, fileUrl: null }; // un solo upload
  let errors = [];
  let successMessage = '';
  
  // Timeouts para auto-limpiar mensajes
  let errorTimeouts = [];
  let successTimeout = null;

  // Limpiar timeouts al destruir el componente
  onDestroy(() => {
    clearAllTimeouts();
  });

  function clearAllTimeouts() {
    // Limpiar timeouts de errores
    errorTimeouts.forEach(timeout => clearTimeout(timeout));
    errorTimeouts = [];
    
    // Limpiar timeout de éxito
    if (successTimeout) {
      clearTimeout(successTimeout);
      successTimeout = null;
    }
  }

  const humanSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024; const sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  function resetToInitial() {
    selectedFile = null;
    upload = { file: null, progress: 0, status: 'pending', response: null, error: null, fileUrl: null };
    errors = [];
    successMessage = '';
    fileUrl = initialProps.fileUrl; // Restaurar URL inicial
    
    if (inputEl) inputEl.value = '';
    
    // Limpiar timeouts
    clearAllTimeouts();
    
    // Dispatch evento de limpieza con el valor inicial
    dispatch('clear', { fileUrl: initialProps.fileUrl });
  }

  export function clear() {
    resetToInitial();
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
    successMessage = '';
    clearAllTimeouts();
    
    const arr = Array.from(fileList || []);

    // Siempre solo un archivo
    if (arr.length === 0) return;
    
    if (arr.length > 1) {
      addErrorWithTimeout('Solo puede seleccionar un archivo');
      return;
    }

    const file = arr[0];
    const err = validateFile(file);
    if (err) {
      addErrorWithTimeout(`${file.name}: ${err}`);
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

  function addErrorWithTimeout(errorMsg) {
    errors = [...errors, errorMsg];
    
    // Configurar timeout para eliminar este error específico
    const timeout = setTimeout(() => {
      errors = errors.filter(e => e !== errorMsg);
      // También eliminar este timeout de la lista
      errorTimeouts = errorTimeouts.filter(t => t !== timeout);
    }, messageDuration);
    
    errorTimeouts = [...errorTimeouts, timeout];
  }

  function setSuccessWithTimeout(message) {
    successMessage = message;
    
    // Limpiar timeout anterior si existe
    if (successTimeout) {
      clearTimeout(successTimeout);
    }
    
    // Configurar nuevo timeout
    successTimeout = setTimeout(() => {
      successMessage = '';
      successTimeout = null;
    }, messageDuration);
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
      addErrorWithTimeout('No hay archivo seleccionado');
      return;
    }

    if (!postUrl) {
      addErrorWithTimeout('No se ha configurado postUrl');
      return;
    }

    // Si ya está subido o subiendo, no hacer nada
    if (upload.status === 'done' || upload.status === 'uploading') return;

    upload.status = 'uploading';
    errors = [];
    successMessage = '';
    clearAllTimeouts();

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
        fileUrl = upload.fileUrl;
      } else if (res.data && res.data.url) {
        upload.fileUrl = res.data.url;
        fileUrl = upload.fileUrl;
      } else if (res.data && res.data.data && res.data.data.fileUrl) {
        upload.fileUrl = res.data.data.fileUrl;
        fileUrl = upload.fileUrl;
      } else if (res.data && res.data.fileUrl) {
        upload.fileUrl = res.data.fileUrl;
        fileUrl = upload.fileUrl;
      } else if (fileUrlPrefix && res.data && res.data.data) {
        const d = res.data.data;
        // if backend returns folder+filename, build path
        if (d.folder && d.filename) {
          upload.fileUrl = `${fileUrlPrefix}${d.folder}/${d.filename}`;
          fileUrl = upload.fileUrl;
        } else if (d.filename) {
          upload.fileUrl = fileUrlPrefix + d.filename;
          fileUrl = upload.fileUrl;
        }
      }

      // normalize response
      if (responseFormat === 'standard') {
        // expected { success, message, data, error }
        if (res.data && res.data.success) {
          upload.status = 'done';
          if (res.data.data && res.data.data.folder && res.data.data.filename) {
            fileUrl = `${res.data.data.folder}/${res.data.data.filename}`;
            upload.fileUrl = fileUrl;
          }
          const msg = res.data.message || 'Archivo subido exitosamente';
          setSuccessWithTimeout(msg);
          console.log('File:', res.data.data);
          console.log('File uploaded successfully. URL:', fileUrl);
          dispatch('uploaded', { file: selectedFile, data: res.data.data, message: res.data.message, fileUrl: fileUrl });
        } else {
          const resp = res.data || {};
          const errMsg = resp.message || resp.error || 'Error desconocido';
          upload.error = errMsg;
          upload.errorMessage = resp.message || resp.error;
          addErrorWithTimeout(errMsg);
          dispatch('error', {
            file: selectedFile,
            error: errMsg,
            message: resp.message,
            response: resp
          });
        }
      } else {
        // raw
        upload.status = 'done';
        setSuccessWithTimeout('Archivo subido exitosamente');
        dispatch('uploaded', { file: selectedFile, data: res.data, fileUrl: upload.fileUrl });
      }
    } catch (err) {
      upload.status = 'error';
      upload.error = err.response?.data || err.message || err;
      const errorMsg = err.response?.data?.message || err.message || 'Error al subir el archivo';
      addErrorWithTimeout(errorMsg);
      dispatch('error', { file: selectedFile, error: upload.error, response: err.response?.data || null });
    }
  }

  function removeFile() {
    resetToInitial();
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
  .status-label { font-size:0.8rem; padding:2px 6px; border-radius:3px; display: inline-block; margin-right: 4px; }
  .status-label.success { background-color: #d4edda; color: #155724; }
  .status-label.error { background-color: #f8d7da; color: #721c24; }
  .status-label.pending { background-color: #fff3cd; color: #856404; }
  .status-label.info { background-color: #d1ecf1; color: #0c5460; }
  .message-container { margin-bottom: 8px; }
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

      {#if showCleanButton}
        <button class="btn btn-secondary" on:click={clear} disabled={!selectedFile && fileUrl === initialProps.fileUrl}>
          <i class="fa fa-trash" aria-hidden="true"></i>
          Limpiar
        </button>
      {/if}
    {:else}
      <input 
        bind:this={inputEl} 
        type="file" 
        on:change={onFileChange} 
        multiple={false}
      />
    {/if}
  </div>

  <!-- Contenedor de mensajes -->
  <div class="message-container">
    <!-- Mensajes de error como labels -->
    {#if errors.length}
      <div class="mb-2">
        {#each errors as err}
          <small class="status-label error">{err}</small>
        {/each}
      </div>
    {/if}

    <!-- Mensaje de éxito como label -->
    {#if successMessage}
      <div class="mb-2">
        <small class="status-label success">{successMessage}</small>
      </div>
    {/if}
  </div>
    
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
            <small class="status-label info">Subiendo...</small>
          {:else if upload.status === 'done'}
            <small class="status-label success">Subido</small>
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
            <small class="status-label error">Error</small>
            {#if upload.error}
              <span class="small-muted ms-2">{upload.error}</span>
            {/if}
          {:else}
            <small class="status-label pending">Pendiente</small>
          {/if}
          <button type="button" class="btn btn-sm btn-outline-danger" on:click={removeFile}>Eliminar</button>
        </div>
      </div>
    </div>
  {/if}

  {#if !hideInput}
    <div class="d-flex gap-2">
      <button class="btn btn-primary" on:click={uploadFile}   disabled={!postUrl || !selectedFile || upload.status === 'uploading' || upload.status === 'done'}>Subir</button>
      <button class="btn btn-secondary" on:click={clear} disabled={!selectedFile}>Limpiar</button>
    </div>
  {/if}
</div>