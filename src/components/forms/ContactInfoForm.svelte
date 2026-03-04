<script>
  import DataTable from '../widgets/DataTable.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  export let form;

  const API = (typeof API_URL !== 'undefined' ? API_URL : (window && window.API_URL) || '');

  // column keys/names/types for phones
  const phoneColumnKeys = ['id', 'phone', 'description'];
  const phoneColumnNames = ['ID', 'Número', 'Descripción'];
  const phoneColumnTypes = ['hidden', 'input[text]', 'input[text]'];
  const phoneColumnClasses = ['d-none', '', ''];

  // column keys/names/types for addresses
  const addressColumnKeys = ['id', 'address', 'description' ,'district.name'];
  const addressColumnNames = ['ID', 'Dirección', 'Descripción', 'Distrito', 'Acciones'];
  // use DataTable's autocomplete column type for district (comma-separated params)
  const addressColumnTypes = ['hidden', 'input[text]', 'input[text]', `autocomplete(searchUrl=${API}api/v1/districts/search,idKey=id,labelKey=name,idTarget=district_id,minChars=2,debounceMs=300,hideInput=false,showProgress=true)`];
  const addressColumnClasses = ['d-none', '', '', ''];

  let phoneTableRef;
  let addressTableRef;
  let personId = null;

  function phoneAddAction() {
    if (phoneTableRef && typeof phoneTableRef.addRow === 'function') {
      phoneTableRef.addRow();
    } else {
      // fallback
      const tmp = { id: `tmp_${Math.random().toString(36).slice(2,8)}`, phone: '', description: '' };
      form.person.phones.push(tmp);
      form.person.phones = form.person.phones;
    }
  }

  function addressAddAction() {
    if (addressTableRef && typeof addressTableRef.addRow === 'function') {
      addressTableRef.addRow();
    } else {
      const tmp = { id: `tmp_${Math.random().toString(36).slice(2,8)}`, description: '', district_text: '', district_id: null };
      form.person.addresses.push(tmp);
      form.person.addresses = form.person.addresses;
    }
  }

  const phoneActionButtons = [
    {
      class: 'btn-danger',
      icon: 'fa-trash',
      label: 'Eliminar',
      action: (record) => phoneTableRef && phoneTableRef.deleteRow(record, 'id')
    }
  ];

  const addressActionButtons = [
    {
      class: 'btn-danger',
      icon: 'fa-trash',
      label: 'Eliminar',
      action: (record) => addressTableRef && addressTableRef.deleteRow(record, 'id')
    }
  ];

  export const loadTables = () => {
    personId = form.person_id;

    phoneTableRef.fetchURL = `${API_URL}api/v1/persons/${personId}/phones`;
    phoneTableRef.saveURL = `${API_URL}api/v1/persons/${personId}/phones`;
    phoneTableRef.list();

    addressTableRef.fetchURL = `${API_URL}api/v1/persons/${personId}/addresses`;
    addressTableRef.saveURL = `${API_URL}api/v1/persons/${personId}/addresses`;
    addressTableRef.list();
  };

  // Alertas
  let alertMessage = {
    text: '',
    status: ''
  };

  // Handlers de alertas
  const handleTableAlert = (callback) => {
    alertMessage = callback.detail;
    setTimeout(() => {
      alertMessage = { text: '', status: '' };
    }, 4300);
  };
</script>

<div class="mb-3">
  <!-- Alerta -->
  {#if alertMessage.text}
    <div class="col-md-12">
      <div class="alert alert-{alertMessage.status}" role="alert">
        {alertMessage.text}
      </div>
    </div>
  {/if}


  <div class="bg-light p-3 rounded mb-3">
    <p class="text-muted small">Teléfonos</p>
    <DataTable
      bind:this={phoneTableRef}
      bind:data={form.person.phones}
      columnKeys={phoneColumnKeys}
      columnNames={phoneColumnNames}
      columnTypes={phoneColumnTypes}
      columnClasses={phoneColumnClasses}
      addButton={{ display: true, disabled: false, action: phoneAddAction }}
      saveButton={{ display: false, disabled: false, action: null }}
      actionButtons={phoneActionButtons}
      idKey="id"
      on:alert={handleTableAlert}
    />
  </div>

  <div class="bg-light p-3 rounded">
    <p class="text-muted small">Direcciones</p>
    <DataTable
      bind:this={addressTableRef}
      bind:data={form.person.addresses}
      columnKeys={addressColumnKeys}
      columnNames={addressColumnNames}
      columnTypes={addressColumnTypes}
      columnClasses={addressColumnClasses}
      addButton={{ display: true, disabled: false, action: addressAddAction }}
      saveButton={{ display: false, disabled: false, action: null }}
      actionButtons={addressActionButtons}
      idKey="id"
      on:alert={handleTableAlert}
    />
  </div>
</div>

<style>
  .bg-light { background-color: #f8f9fa !important; }
</style>
