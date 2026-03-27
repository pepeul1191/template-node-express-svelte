<svelte:options accessors={true} />
<!-- src/components/forms/CourseMaterial.svelte -->
<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import axios from 'axios';
  import UploadFile from '../widgets/UploadFile.svelte';

  export let course;

  const dispatch = createEventDispatcher();
  const API = typeof API_URL !== 'undefined' ? API_URL : window.API_URL || '';

  let folders = [];
  let currentFolder = null; // null = raíz
  let files = [];
  let loading = false;
  let showCreateFolder = false;
  let showCreateFile = false;
  let showEditFolder = false;
  let showEditFile = false;
  let newFolderTitle = '';
  let newFolderDescription = '';
  let newFileTitle = '';
  let uploadComponent;
  let extraParams = {};
  let selectedFile = null;
  let uploading = false;
  let editingFolder = null;
  let editingDocument = null;
  let rootFolderId = null;

  // Cargar contenido (carpetas y documentos) según la carpeta actual
  async function setRootFolderId(){
    try {
      const jwt = localStorage.getItem('jwtToken');
      
      // Construir URL según si estamos en raíz o en una carpeta
      const url = `${API}api/v1/folders/${course.id}/root-folder-id`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      if (res.data.success) {
        rootFolderId = res.data.data.id;
      }else{
        console.error('Error loading root folder id:', err);
        alert('Error al cargar el id de la carpeta raíz');  
      }

    } catch (err) {
      console.error('Error loading contents:', err);
      alert('Error al cargar el contenido');
    } finally {
      loading = false;
    }
  }

  export async function loadContents() {
    await setRootFolderId();

    loading = true;
    try {
      const jwt = localStorage.getItem('jwtToken');
      
      // Construir URL según si estamos en raíz o en una carpeta
      let url = `${API}api/v1/courses/${course.id}/materials?folder_id=${rootFolderId}`;
      if (currentFolder) {
        url = `${API}api/v1/folders/${currentFolder.id}/contents`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      if (res.data.success) {
        if (currentFolder) {
          // Si estamos en una carpeta, recibimos sus documentos
          files = res.data.data.files || [];
          folders = []; // No mostramos subcarpetas (solo un nivel)
        } else {
          // En la raíz, recibimos carpetas y documentos
          folders = res.data.data.folders || [];
          files = res.data.data.files || [];
        }
      }
    } catch (err) {
      console.error('Error loading contents:', err);
      alert('Error al cargar el contenido');
    } finally {
      loading = false;
    }
  }

  // Crear nueva carpeta
  async function createFolder() {
    if (!newFolderTitle.trim()) {
      alert('El título de la carpeta es requerido');
      return;
    }

    try {
      const jwt = localStorage.getItem('jwtToken');
      
      const fileRes = await axios.post(
        `${FILES_URL}api/v1/sub-folder`,
        {
          path: `courses/${course.id}-${course.name}/common-material/${newFolderTitle}`,
          destination: "storage"
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      if (fileRes.data.success) {
        const res = await axios.post(
          `${BASE_URL}api/v1/courses/${course.id}/folders`,
          {
            title: newFolderTitle,
            description: newFolderDescription,
            rootFolderId
          },
          { headers: { Authorization: `Bearer ${jwt}` } }
        );

        if (res.data.success) {
          await loadContents();
          newFolderTitle = '';
          newFolderDescription = '';
          showCreateFolder = false;
        }else{
          await axios.delete(
            `${FILES_URL}api/v1/sub-folder`,
            {
              path: `courses/${course.id}-${course.name}/common-material/${newFolderTitle}`,
              destination: "storage"
            },
            { headers: { Authorization: `Bearer ${jwt}` } }
          );
        } 
      }
    } catch (err) {
      console.error('Error creating folder:', err);
      alert('Error al crear la carpeta');
    }
  }

  // Actualizar carpeta existente
  async function updateFolder() {
    if (!newFolderTitle.trim()) {
      alert('El título de la carpeta es requerido');
      return;
    }

    try {
      const jwt = localStorage.getItem('jwtToken');
      
      const res = await axios.put(
        `${API}api/v1/folders/${editingFolder.id}`,
        {
          title: newFolderTitle,
          description: newFolderDescription
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      if (res.data.success) {
        await loadContents();
        cancelEditFolder();
      }
    } catch (err) {
      console.error('Error updating folder:', err);
      alert('Error al actualizar la carpeta');
    }
  }

  // Actualizar documento existente
  async function updateDocument() {
    if (!newFileTitle.trim()) {
      alert('El título del documento es requerido');
      return;
    }

    try {
      const jwt = localStorage.getItem('jwtToken');
      
      const res = await axios.put(
        `${API}api/v1/documents/${editingDocument.id}`,
        {
          title: newFileTitle
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      if (res.data.success) {
        await loadContents();
        cancelEditFile();
      }
    } catch (err) {
      console.error('Error updating document:', err);
      alert('Error al actualizar el documento');
    }
  }

  // Entrar a una carpeta
  function enterFolder(folder) {
    currentFolder = folder;
    loadContents();
  }

  // Volver a la raíz
  function goToRoot() {
    currentFolder = null;
    loadContents();
  }

  // Eliminar carpeta
  async function deleteFolder(folderId) {
    if (!confirm('¿Estás seguro de eliminar esta carpeta y todo su contenido?')) {
      return;
    }

    try {
      const jwt = localStorage.getItem('jwtToken');
      
      const res = await axios.delete(`${API}api/v1/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      if (res.data.success) {
        await loadContents();
      }
    } catch (err) {
      console.error('Error deleting folder:', err);
      alert('Error al eliminar la carpeta');
    }
  }

  // Eliminar documento
  async function deleteDocument(docId) {
    if (!confirm('¿Estás seguro de eliminar este documento?')) {
      return;
    }

    try {
      const jwt = localStorage.getItem('jwtToken');
      
      const res = await axios.delete(`${API}api/v1/documents/${docId}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      if (res.data.success) {
        await loadContents();
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Error al eliminar el documento');
    }
  }

  // Función para crear el registro del documento en la base de datos
  async function createDocumentRecord(fileData) {
    try {
      const jwt = localStorage.getItem('jwtToken');
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      const fileUrl = `${BASE_URL}api/v1/files`;
      let params = {};
      params.autogenerated = false;

      // Construir la URL completa del archivo
      if(currentFolder){
        params.folder = `courses/${course.id}-${course.name}/common-material/${newFolderTitle}`
      }else{
        params.folder = `courses/${course.id}-${course.name}/common-material`
      }
      
      // Determinar el folder_id
      const folderId = currentFolder ? currentFolder.id : rootFolderId;
      
      const documentData = {
        folder_id: folderId,
        name: newFileTitle.trim() || fileData.originalName || fileData.filename,
        autogenerated_title: fileData.filename,
        url: fileUrl,
        uploaded_by: user?.id || null
      };
      
      // Llamar a tu API para crear el registro del documento
      const res = await axios.post(
        fileUrl,
        documentData,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      
      if (res.data.success) {
        console.log('Documento creado exitosamente');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating document record:', err);
      alert('Error al guardar la información del documento');
      return false;
    }
  }

  // Iniciar creación de nuevo archivo
  function startCreateFile() {
    showCreateFile = true;
    showEditFile = false;
    newFileTitle = '';
    selectedFile = null;
    editingDocument = null;
  }

  // Iniciar edición de carpeta
  function startEditFolder(folder) {
    editingFolder = folder;
    newFolderTitle = folder.title;
    newFolderDescription = folder.description || '';
    showEditFolder = true;
    showCreateFile = false;
    showCreateFolder = false;
  }

  // Iniciar edición de documento
  function startEditDocument(doc) {
    editingDocument = doc;
    newFileTitle = doc.title;
    showEditFile = true;
    showCreateFile = false;
    showCreateFolder = false;
    selectedFile = { fileName: doc.autogenerated_title || doc.title };
  }

  // Cancelar edición de carpeta
  function cancelEditFolder() {
    showEditFolder = false;
    editingFolder = null;
    newFolderTitle = '';
    newFolderDescription = '';
  }

  // Cancelar edición de archivo
  function cancelEditFile() {
    showEditFile = false;
    editingDocument = null;
    newFileTitle = '';
    selectedFile = null;
  }

  // Cancelar creación de archivo
  function cancelCreateFile() {
    showCreateFile = false;
    newFileTitle = '';
    selectedFile = null;
    if (uploadComponent) {
      uploadComponent.clear();
    }
  }

  // Manejar archivo subido
  async function handleFileUploaded(event) {
    console.log('Archivo subido:', event.detail);
    
    if (!newFileTitle.trim()) {
      alert('Por favor ingresa un título para el archivo');
      return;
    }
    
    uploading = true;
    
    try {
      const fileData = {
        ...event.detail,
        originalName: event.detail.fileName
      };
      
      const success = await createDocumentRecord(fileData);
      
      if (success) {
        await loadContents();
        cancelCreateFile();
      }
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      alert('Error al procesar el archivo subido');
    } finally {
      uploading = false;
    }
  }

  // Obtener parámetros extra para el uploader
  function getExtraParams() {
    const params = {};

    // Construir la URL completa del archivo
    if(currentFolder){
      params.folder = `courses/${course.id}-${course.name}/common-material/${newFolderTitle}`
    }else{
      params.folder = `courses/${course.id}-${course.name}/common-material`
    }

    params.autogenerated = false;
      
    if (currentFolder) {
      params.folder_id = currentFolder.id;
    } else {
      params.context = 'course';
      params.context_id = course.id;
    }
    
    return params;
  }

  function showFolderForm(){
    showCreateFolder = !showCreateFolder;
    // cerrar los demás
    showEditFile = false;
    showCreateFile = false;
    showEditFolder = false;
  }

  function showDocumentForm(){
    showCreateFile = !showCreateFile;
    // cerrar los demás
    showEditFile = false;
    showCreateFolder = false;
    showEditFolder = false;
  }
</script>

<div class="course-material">
  <!-- Barra de navegación y acciones -->
  <div class="d-flex justify-content-between align-items-center mb-3">
    <div class="d-flex align-items-center">
      <h5 class="mb-0 me-3">
        {#if currentFolder}
          <button class="btn btn-link p-0 me-2" on:click={goToRoot} title="Volver a la raíz">
            <i class="fa fa-arrow-left"></i>
          </button>
          <i class="fa fa-folder-open text-warning me-2"></i>
          Carpeta: {currentFolder.title}
        {:else}
          <i class="fa fa-book text-primary me-2"></i>
          Material del Curso
        {/if}
      </h5>
    </div>
    
    <div class="d-flex gap-2">
      {#if !currentFolder && !showEditFolder && !showEditFile}
        <button 
          class="btn btn-secondary" 
          on:click={showFolderForm}
          title="Crear una nueva carpeta para organizar los archivos"
        >
          <i class="fa fa-folder"></i>
          <span class="ms-1">Nueva Carpeta</span>
        </button>
      {/if}
      
      {#if !showCreateFile && !showEditFile}
        <button 
          class="btn btn-primary" 
          on:click={showDocumentForm}
          title="Subir un nuevo archivo al curso"
        >
          <i class="fa fa-file"></i>
          <span class="ms-1">Nuevo Archivo</span>
        </button>
      {/if}
    </div>
  </div>

  <!-- Formulario de nueva carpeta -->
  {#if showCreateFolder && !currentFolder}
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">
          <i class="fa fa-folder-plus me-2 text-warning"></i>
          Nueva Carpeta
        </h6>
        <div class="mb-3">
          <label class="form-label">Título <span class="text-danger">*</span></label>
          <input 
            type="text" 
            class="form-control" 
            bind:value={newFolderTitle}
            placeholder="Ej. Documentos, Exámenes, Prácticas, etc."
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Descripción (opcional)</label>
          <textarea 
            class="form-control" 
            rows="2"
            bind:value={newFolderDescription}
            placeholder="Descripción del contenido de la carpeta"
          ></textarea>
        </div>
        <div class="text-end">
          <button class="btn btn-secondary me-2" on:click={() => showCreateFolder = false}>
            <i class="fa fa-times me-1"></i>
            Cancelar
          </button>
          <button class="btn btn-primary" on:click={createFolder}>
            <i class="fa fa-check me-1"></i>
            Crear Carpeta
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Formulario de edición de carpeta -->
  {#if showEditFolder}
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">
          <i class="fa fa-edit me-2 text-warning"></i>
          Editar Carpeta
        </h6>
        <div class="mb-3">
          <label class="form-label">Título <span class="text-danger">*</span></label>
          <input 
            type="text" 
            class="form-control" 
            bind:value={newFolderTitle}
            placeholder="Ej. Documentos, Exámenes, Prácticas, etc."
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Descripción (opcional)</label>
          <textarea 
            class="form-control" 
            rows="2"
            bind:value={newFolderDescription}
            placeholder="Descripción del contenido de la carpeta"
          ></textarea>
        </div>
        <div class="text-end">
          <button class="btn btn-secondary me-2" on:click={cancelEditFolder}>
            <i class="fa fa-times me-1"></i>
            Cancelar
          </button>
          <button class="btn btn-primary" on:click={updateFolder}>
            <i class="fa fa-save me-1"></i>
            Actualizar Carpeta
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Formulario de nuevo archivo -->
  {#if showCreateFile}
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">
          <i class="fa fa-file me-2 text-primary"></i>
          Subir Nuevo Archivo
        </h6>
        
        <div class="mb-3">
          <label class="form-label">
            Título del archivo <span class="text-danger">*</span>
            {#if selectedFile}
              <small class="text-muted ms-2">
                (Nombre original: {selectedFile.fileName})
              </small>
            {/if}
          </label>
          <input 
            type="text" 
            class="form-control" 
            bind:value={newFileTitle}
            placeholder="Ingresa un título descriptivo para el archivo"
            disabled={uploading}
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Archivo <span class="text-danger">*</span></label>
          <UploadFile
            bind:this={uploadComponent}
            postUrl={`${FILES_URL}api/v1/storage`}
            baseURL={FILES_URL}
            allowedExtensions={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'mp4', 'webm', 'zip']}
            maxFileSizeMB={50}
            extraParams={getExtraParams()}
            jwtKey="jwtToken"
            showProgress={false}
            showCleanButton={true}
            hideInput={true}
            multiple={false}
            disabled={uploading || !newFileTitle.trim()}
            on:uploaded={handleFileUploaded}
          />
          <small class="text-muted">
            Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, TXT, MP4, WEBM, ZIP (Max. 50MB)
          </small>
        </div>

        <div class="text-end">
          <button class="btn btn-secondary me-2" on:click={cancelCreateFile} disabled={uploading}>
            <i class="fa fa-times me-1"></i>
            Cancelar
          </button>
        </div>

        {#if uploading}
          <div class="progress mt-2">
            <div 
              class="progress-bar progress-bar-striped progress-bar-animated" 
              style="width: 100%"
            >
              Subiendo archivo y guardando información...
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Formulario de edición de archivo -->
  {#if showEditFile}
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">
          <i class="fa fa-edit me-2 text-primary"></i>
          Editar Archivo
        </h6>
        
        <div class="mb-3">
          <label class="form-label">
            Título del archivo <span class="text-danger">*</span>
            {#if selectedFile}
              <small class="text-muted ms-2">
                (Nombre original: {selectedFile.fileName})
              </small>
            {/if}
          </label>
          <input 
            type="text" 
            class="form-control" 
            bind:value={newFileTitle}
            placeholder="Ingresa un título descriptivo para el archivo"
          />
          <small class="text-muted">
            <i class="fa fa-info-circle me-1"></i>
            Este título será visible para los estudiantes
          </small>
        </div>

        {#if currentFolder}
          <div class="alert alert-info py-2">
            <i class="fa fa-folder me-2"></i>
            <small>El archivo está en la carpeta: <strong>{currentFolder.title}</strong></small>
          </div>
        {/if}

        {#if editingDocument}
          <div class="mb-3">
            <label class="form-label">Información del archivo</label>
            <div class="border rounded p-2 bg-light">
              <small class="d-block">
                <i class="fa fa-file-o me-1"></i>
                <strong>Nombre original:</strong> {editingDocument.autogenerated_title || 'No disponible'}
              </small>
              <small class="d-block">
                <i class="fa fa-calendar me-1"></i>
                <strong>Subido:</strong> {new Date(editingDocument.created).toLocaleString()}
              </small>
              {#if editingDocument.url}
                <small class="d-block">
                  <i class="fa fa-link me-1"></i>
                  <a href={editingDocument.url} target="_blank" class="text-decoration-none">
                    Ver archivo <i class="fa fa-external-link"></i>
                  </a>
                </small>
              {/if}
            </div>
          </div>
        {/if}

        <div class="text-end">
          <button class="btn btn-secondary me-2" on:click={cancelEditFile}>
            <i class="fa fa-times me-1"></i>
            Cancelar
          </button>
          <button class="btn btn-primary" on:click={updateDocument}>
            <i class="fa fa-save me-1"></i>
            Actualizar Archivo
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Listado de contenido -->
  {#if loading}
    <div class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  {:else}
    <!-- Carpetas (solo en raíz) -->
    {#if !currentFolder && folders.length > 0}
      <div class="mb-4">
        <h6 class="mb-2">
          <i class="fa fa-folder text-warning me-2"></i>
          Carpetas
        </h6>
        <div class="list-group">
          {#each folders as folder}
            {#if folder.parent_id != null}
              <div class="list-group-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center" on:click={() => enterFolder(folder)} style="cursor: pointer; flex: 1;">
                  <i class="fa fa-folder text-warning me-2"></i>
                  <div>
                    <div class="fw-bold">{folder.title} - {folder.parent_id}</div>
                    {#if folder.description}
                      <small class="text-muted">{folder.description}</small>
                    {/if}
                  </div>
                </div>
                <div class="btn-group" role="group">
                  <button 
                    class="btn btn-primary" 
                    on:click={() => startEditFolder(folder)}
                    title="Editar carpeta"
                  >
                    <i class="fa fa-edit"></i>
                    Editar
                  </button>
                  <button 
                    class="btn btn-danger"
                    style="margin-left: 10px;" 
                    on:click={() => deleteFolder(folder.id)}
                    title="Eliminar carpeta"
                  >
                    <i class="fa fa-trash"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}

    <!-- Archivos -->
    {#if files.length > 0}
      <div>
        <h6 class="mb-2">
          <i class="fa fa-file text-primary me-2"></i>
          Archivos
        </h6>
        <div class="list-group">
          {#each files as doc}
            <div class="list-group-item d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="fa fa-file text-primary me-2"></i>
                <div>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    class="text-decoration-none fw-bold"
                  >
                    {doc.name}
                  </a>
                  {#if doc.autogenerated_title && doc.autogenerated_title !== doc.title}
                    <br>
                    <small class="text-muted">
                      <i class="fa fa-file-o me-1"></i>
                      {doc.autogenerated_title}
                    </small>
                  {/if}
                  <br>
                  <small class="text-muted">
                    <i class="fa fa-calendar me-1"></i>
                    {new Date(doc.created).toLocaleDateString()}
                    {#if doc.uploaded_by}
                      • <i class="fa fa-user me-1"></i>ID: {doc.uploaded_by}
                    {/if}
                  </small>
                </div>
              </div>
              <div class="btn-group" role="group">
                <button 
                  class="btn btn-outline-secondary" 
                  on:click={() => startEditDocument(doc)}
                  title="Editar documento"
                >
                  <i class="fa fa-edit"></i>
                  Editar documento
                </button>
                <button 
                  class="btn btn-outline-danger" 
                  on:click={() => deleteDocument(doc.id)}
                  title="Eliminar documento"
                >
                  <i class="fa fa-trash"></i>
                  Eliminar documento
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if !showCreateFolder && !showCreateFile && !showEditFolder && !showEditFile}
      <div class="text-center py-4 text-muted">
        <i class="fa fa-folder-open fa-3x mb-2"></i>
        <p>No hay archivos o carpetas en esta ubicación</p>
        <button class="btn btn-primary" on:click={startCreateFile}>
          <i class="fa fa-upload me-1"></i>
          Subir el primer archivo
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .course-material {
    min-height: 300px;
  }
  
  .list-group-item {
    transition: background-color 0.2s;
  }
  
  .list-group-item:hover {
    background-color: #f8f9fa;
  }
  
  .btn-link {
    text-decoration: none;
    color: inherit;
  }
  
  .btn-link:hover {
    color: #0d6efd;
  }
  
  .alert {
    border-left: 4px solid #17a2b8;
  }
  
  .btn-group {
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .list-group-item:hover .btn-group {
    opacity: 1;
  }
</style>