<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import axios from 'axios';

  // Props
  export let searchUrl = '';
  export let jwtKey = 'jwtToken';
  export let placeholder = 'Buscar...';
  export let minChars = 2;
  export let debounceMs = 300;
  export let onSelect = null;
  export let idKey = 'id';
  export let labelKey = 'name';
  export let value = '';

  // State
  let searchTerm = '';
  let results = [];
  let selectedId = null;
  let selectedLabel = '';
  let showResults = false;
  let isLoading = false;
  let error = '';
  let debounceTimer;
  let inputElement;

  $: if (value !== searchTerm) {
    searchTerm = value || '';
  }

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

      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.list)) {
        results = response.data.data.list;
        showResults = results.length > 0;
      } else if (Array.isArray(response.data)) {
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

  function onInputChange() {
    // Actualizar value para el padre
    value = searchTerm;
    
    // Si estamos escribiendo, resetear selectedId
    if (selectedId) {
      selectedId = null;
      selectedLabel = '';
    }
    
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
    const newValue = item[labelKey];
    
    selectedId = item[idKey];
    selectedLabel = newValue;
    searchTerm = newValue;
    value = newValue;

    showResults = false;
    results = [];

    dispatch('selected', { id: selectedId, label: selectedLabel });

    if (typeof onSelect === 'function') {
      onSelect({ id: selectedId, label: selectedLabel });
    }
  }

  function clear() {
    searchTerm = '';
    value = '';
    selectedId = null;
    selectedLabel = '';
    results = [];
    showResults = false;
    error = '';
    
    if (inputElement) {
      inputElement.focus();
    }
  }

  function onBlur() {
    setTimeout(() => {
      showResults = false;
    }, 200);
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
    z-index: 2;
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
      bind:this={inputElement}
      type="text"
      class="form-control"
      {placeholder}
      bind:value
      on:input={onInputChange}
      on:focus={() => {
        if (results.length > 0) showResults = true;
      }}
      on:blur={onBlur}
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
        {#each results as item (item[idKey])}
          <div 
            class="result-item" 
            on:mousedown|preventDefault={() => selectResult(item)}
          >
            <div class="result-label">{item[labelKey]}</div>
          </div>
        {/each}
      {:else}
        <div class="no-results">Sin resultados</div>
      {/if}
    </div>
  {/if}
</div>