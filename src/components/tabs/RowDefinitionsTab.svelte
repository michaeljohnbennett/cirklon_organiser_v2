<script>
  import { session } from '../../stores/session.js';
  import { createRowDefinition } from '../../lib/models.js';

  $: instrument = $session.selectedInstrument;
  $: rowDefinitions = instrument?.rowDefinitions || [];

  let selectedRow = null;
  let editorRow = null;

  function selectRow(row) {
    selectedRow = row;
    editorRow = { ...row };
  }

  function saveRow() {
    if (!editorRow) return;

    if (selectedRow) {
      // Update existing
      const index = rowDefinitions.indexOf(selectedRow);
      const newRows = [...rowDefinitions];
      newRows[index] = { ...editorRow };
      session.updateInstrument({ rowDefinitions: newRows });
      selectedRow = newRows[index];
      editorRow = { ...newRows[index] };
    } else {
      // Add new
      const newRows = [...rowDefinitions, { ...editorRow }];
      session.updateInstrument({ rowDefinitions: newRows });
      selectedRow = null;
      editorRow = null;
    }
  }

  function deleteRow() {
    if (!selectedRow) return;
    
    const newRows = rowDefinitions.filter(r => r !== selectedRow);
    session.updateInstrument({ rowDefinitions: newRows });
    selectedRow = null;
    editorRow = null;
  }

  function newRow() {
    selectedRow = null;
    editorRow = createRowDefinition();
  }

  // Auto-save when editing
  $: if (editorRow && selectedRow) {
    saveRow();
  }
</script>

<div class="columns col-oneline">
    <div class="column col-7">
      <table class="table table-striped table-hover tablescroll">
        <thead>
          <tr>
            <th>Name</th>
            <th>Label</th>
            <th>Show</th>
          </tr>
        </thead>
        <tbody>
          {#if rowDefinitions.length > 0}
            {#each rowDefinitions as row}
              <tr 
                on:click={() => selectRow(row)}
                class:active={row === selectedRow}
              >
                <td>{row.name}</td>
                <td>{row.label}</td>
                <td>{row.show ? 'true' : 'false'}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">
              <span class="text-primary">{rowDefinitions.length}</span> Row Definitions
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div class="divider-vert col-1"></div>
    
    <div class="column col-4">
      {#if editorRow}
        <form class="form-horizontal" on:submit|preventDefault>
          <legend>{selectedRow ? 'Edit' : 'New'}</legend>
          
          <div class="form-group">
            <div class="col-3"><label class="form-label">Name</label></div>
            <div class="col-9">
              <input 
                class="form-input" 
                type="text" 
                maxlength="6" 
                placeholder="Name" 
                bind:value={editorRow.name}
              />
            </div>
          </div>
          
          <div class="form-group">
            <div class="col-3"><label class="form-label">Label</label></div>
            <div class="col-9">
              <input 
                class="form-input" 
                type="text" 
                maxlength="6" 
                placeholder="Label" 
                bind:value={editorRow.label}
              />
            </div>
          </div>
          
          <div class="form-group">
            <div class="col-3"><label class="form-label">Show</label></div>
            <div class="col-9">
              <label class="form-switch">
                <input type="checkbox" bind:checked={editorRow.show} />
                <i class="form-icon"></i>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <div class="col-3"></div>
            <div class="col-9">
              {#if selectedRow}
                <button class="btn btn-sm tooltip" data-tooltip="Delete selected row definition from list." on:click={deleteRow}>Delete</button>
              {:else}
                <button class="btn btn-sm tooltip" data-tooltip="Add new row definition to list." on:click={saveRow}>Add new</button>
              {/if}
            </div>
          </div>
        </form>
      {:else}
        <button class="btn btn-primary" on:click={newRow}>New Row Definition</button>
      {/if}
    </div>
  </div>
