<script>
  import { createEventDispatcher } from 'svelte';
  import axios from 'axios';

  // Props
  export let searchUrl = ''; // URL para búsqueda (ej: /api/v1/districts/search/locations?name=)
  export let jwtKey = 'jwtToken'; // localStorage key para JWT
  export let placeholder = 'Buscar...';
  export let minChars = 2; // mínimo de caracteres para buscar
  export let debounceMs = 300; // delay para búsqueda
  export let onSelect = null; // función callback al seleccionar
  export let idKey = 'district_id'; // nombre de la propiedad que representa el id
  export let labelKey = 'full_name'; // nombre de la propiedad que representa el label/ texto
  export let value = ''; // bind:value para sincronizar el texto de búsqueda

  // State
  let searchTerm = value || '';

  // keep internal term in sync when parent changes bound value
  $: if (value !== searchTerm) {
    searchTerm = value;
  }
  let results = [];
  let selectedId = null;
  let selectedLabel = '';
  let showResults = false;
  let isLoading = false;
  let error = '';
  let debounceTimer;

  const dispatch = createEventDispatcher();

  async function search() {
    error = '';
    results = [];
    showResults = false;

    if (!searchTerm || searchTerm.length < minChars) {
      return;
    }

    if (!searchUrl) {
      error = 'searchUrl no configurada';
      return;
    }

    isLoading = true;

    try {
      const jwt = typeof localStorage !== 'undefined' ? localStorage.getItem(jwtKey) : null;
      const config = {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      };

      const url = `${searchUrl}?name=${encodeURIComponent(searchTerm)}`;
      const response = await axios.get(url, config);

      // Normalizar respuesta según formato { success, message, data: { list }, error }
      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.list)) {
        results = response.data.data.list;
        showResults = results.length > 0;
      } else if (Array.isArray(response.data)) {
        // Fallback si es un array directo
        results = response.data;
        showResults = results.length > 0;
      } else {
        error = response.data?.message || 'Error en la búsqueda';
      }
    } catch (err) {
      error = err.response?.data?.message || err.message || 'Error en la búsqueda';
      showResults = false;
    } finally {
      isLoading = false;
    }
  }

  function onInputChange(e) {
    searchTerm = e.target.value;
    value = searchTerm;
    clearTimeout(debounceTimer);

    if (!searchTerm) {
      results = [];
      showResults = false;
      return;
    }

    debounceTimer = setTimeout(() => {
      search();
    }, debounceMs);
  }

  function selectResult(item) {
    selectedId = item[idKey];
    selectedLabel = item[labelKey];
    searchTerm = item[labelKey];
    showResults = false;
    results = [];

    // Dispatch event
    dispatch('selected', { id: selectedId, label: selectedLabel });

    // Llamar callback si existe
    if (typeof onSelect === 'function') {
      onSelect({ id: selectedId, label: selectedLabel });
    }
  }

  function clear() {
    searchTerm = '';
    selectedId = null;
    selectedLabel = '';
    results = [];
    showResults = false;
    error = '';
  }

  function toggleResults() {
    if (results.length > 0) {
      showResults = !showResults;
    }
  }
</script>

<style>
  .autocomplete-container {
    position: relative;
    width: 100%;
  }

  .input-group-wrapper {
    position: relative;
  }

  .form-control {
    padding-right: 38px;
  }

  .clear-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: #666;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
  }

  .clear-btn:hover {
    color: #333;
  }

  .results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .result-item {
    padding: 10px 12px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
  }

  .result-item:hover {
    background-color: #f5f5f5;
  }

  .result-item.selected {
    background-color: #e3f2fd;
  }

  .result-label {
    font-weight: 500;
    font-size: 0.9rem;
  }

  .result-id {
    font-size: 0.8rem;
    color: #999;
  }

  .no-results {
    padding: 12px;
    text-align: center;
    color: #999;
    font-size: 0.9rem;
  }

  .error-text {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 4px;
  }

  .loading-text {
    padding: 12px;
    text-align: center;
    color: #666;
    font-size: 0.9rem;
  }
</style>

<div class="autocomplete-container">
  <div class="input-group-wrapper">
    <input
      type="text"
      class="form-control"
      {placeholder}
      value={searchTerm}
      on:input={onInputChange}
      on:focus={() => {
        if (results.length > 0) showResults = true;
      }}
      autocomplete="off"
    />
    {#if selectedId || searchTerm}
      <button type="button" class="clear-btn" on:click={clear} title="Limpiar">
        ✕
      </button>
    {/if}
  </div>

  {#if error}
    <div class="error-text">{error}</div>
  {/if}

  {#if showResults}
    <div class="results-dropdown">
      {#if isLoading}
        <div class="loading-text">Buscando...</div>
      {:else if results.length > 0}
        {#each results as item (item.district_id)}
          <div class="result-item" on:click={() => selectResult(item)}>
                <div class="result-label">{item[labelKey]}</div>
              <div class="result-id d-none">ID: {item[idKey]}</div>
          </div>
        {/each}
      {:else}
        <div class="no-results">Sin resultados</div>
      {/if}
    </div>
  {/if}
</div>
