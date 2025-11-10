<script>
  import { session, isNameValid } from '../../stores/session.js';
  import { createRowDefinition } from '../../lib/models.js';

  $: instrument = $session.selectedInstrument;
  $: rowDefinitions = instrument?.rowDefinitions || [];

  let selectedRow = null;
  let editorRow = null;
  let editMode = 'new';

  function startNew() {
    selectedRow = null;
    editMode = 'new';
    editorRow = createRowDefinition();
  }

  function selectRow(row) {
    if (selectedRow === row) {
      startNew();
    } else {
      selectedRow = row;
      editMode = 'edit';
      editorRow = { ...row };
    }
  }

  function saveRow() {
    if (!isNameValid(editorRow.name) || !isNameValid(editorRow.label)) return;

    let newRows;
    if (editMode === 'edit' && selectedRow) {
      newRows = rowDefinitions.map(r => r === selectedRow ? { ...editorRow } : r);
    } else {
      newRows = [...rowDefinitions, { ...editorRow }];
    }

    session.updateInstrument({ rowDefinitions: newRows });
    startNew();
  }

  function deleteRow() {
    if (!selectedRow) return;
    
    const newRows = rowDefinitions.filter(r => r !== selectedRow);
    session.updateInstrument({ rowDefinitions: newRows });
    startNew();
  }

  startNew();
</script>

<div class="container">
  <div class="columns">
    <!-- Row Definitions List -->
    <div class="column col-6">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Row Definitions</div>
        </div>
        <div class="panel-body" style="max-height: 400px; overflow-y: auto;">
          {#each rowDefinitions as row}
            <div 
              class="tile tile-centered"
              class:active={selectedRow === row}
              on:click={() => selectRow(row)}
              style="cursor: pointer; padding: 0.4rem; margin: 0.2rem 0;"
            >
              <div class="tile-content">
                <div class="tile-title">{row.name} - {row.label}</div>
                <div class="tile-subtitle text-gray">
                  {row.show ? 'Always show' : 'Hide when empty'}
                </div>
              </div>
            </div>
          {/each}
          {#if rowDefinitions.length === 0}
            <p class="text-gray text-center">No row definitions defined</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Row Definition Editor -->
    <div class="column col-6">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">{editMode === 'new' ? 'New' : 'Edit'} Row Definition</div>
        </div>
        <div class="panel-body">
          {#if editorRow}
            <form class="form-horizontal" on:submit|preventDefault={saveRow}>
              <div class="form-group">
                <div class="col-3">
                  <label class="form-label" for="rowName">Name</label>
                </div>
                <div class="col-9">
                  <input
                    class="form-input"
                    class:is-error={!isNameValid(editorRow.name)}
                    type="text"
                    id="rowName"
                    bind:value={editorRow.name}
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="col-3">
                  <label class="form-label" for="rowLabel">Label</label>
                </div>
                <div class="col-9">
                  <input
                    class="form-input"
                    class:is-error={!isNameValid(editorRow.label)}
                    type="text"
                    id="rowLabel"
                    bind:value={editorRow.label}
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="col-9 col-ml-auto">
                  <label class="form-checkbox">
                    <input type="checkbox" bind:checked={editorRow.show} />
                    <i class="form-icon"></i> Always show
                  </label>
                </div>
              </div>

              <div class="form-group">
                <div class="col-12">
                  <button 
                    class="btn btn-primary" 
                    type="submit"
                    disabled={!isNameValid(editorRow.name) || !isNameValid(editorRow.label)}
                  >
                    {editMode === 'new' ? 'Add' : 'Update'} Row
                  </button>
                  {#if editMode === 'edit'}
                    <button class="btn" type="button" on:click={deleteRow}>Delete</button>
                  {/if}
                  <button class="btn" type="button" on:click={startNew}>Clear</button>
                </div>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .tile.active {
    background-color: #f0f1f4;
  }
</style>
