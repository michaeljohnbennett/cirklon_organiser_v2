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
            <th style="width: 60px;">Visible</th>
          </tr>
        </thead>
        <tbody>
          {#if rowDefinitions.length > 0}
            {#each rowDefinitions as row}
              <tr 
                on:click={() => selectRow(row)}
                class:active={row === selectedRow}
                style="cursor: pointer;"
              >
                <td><strong>{row.name}</strong></td>
                <td>{row.label || '—'}</td>
                <td style="text-align: center; font-size: 0.8rem;">
                  {#if row.show}
                    <span style="color: #32b643; font-weight: 600;">✓</span>
                  {:else}
                    <span style="color: #999;">—</span>
                  {/if}
                </td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td colspan="3" style="text-align: center; padding: 2rem; color: #999; font-size: 0.85rem;">
                No row definitions yet. Click "New Row Definition" to add one.
              </td>
            </tr>
          {/if}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">
              <span class="text-primary" style="font-weight: 600;">{rowDefinitions.length}</span> 
              Row Definition{rowDefinitions.length !== 1 ? 's' : ''}
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
            <div class="col-3"><label class="form-label" for="row-def-name">Name</label></div>
            <div class="col-9">
              <input 
                id="row-def-name"
                class="form-input" 
                type="search"
                maxlength="12" 
                placeholder="e.g., Bass, Melody, Drums" 
                bind:value={editorRow.name}
              />
              <small style="color: #999; display: block; margin-top: 0.2rem;">Row identifier (max 12 chars)</small>
            </div>
          </div>
          
          <div class="form-group">
            <div class="col-3"><label class="form-label" for="row-def-label">Label</label></div>
            <div class="col-9">
              <input 
                id="row-def-label"
                class="form-input" 
                type="search"
                maxlength="16" 
                placeholder="Short description" 
                bind:value={editorRow.label}
              />
              <small style="color: #999; display: block; margin-top: 0.2rem;">Display label for this row</small>
            </div>
          </div>

          <div class="form-group">
            <div class="col-3"><label class="form-label">Display</label></div>
            <div class="col-9">
              <label class="form-switch">
                <input type="checkbox" bind:checked={editorRow.show} />
                <i class="form-icon"></i> Show this row in sequence
              </label>
              <small style="color: #999; display: block; margin-top: 0.2rem;">Toggle visibility in the sequencer display</small>
            </div>
          </div>
          
          <div class="form-group">
            <div class="col-3"></div>
            <div class="col-9">
              {#if selectedRow}
                <button type="button" class="btn btn-sm tooltip" data-tooltip="Delete this row definition." on:click={deleteRow}>Delete</button>
                <button type="button" class="btn btn-sm" on:click={() => { selectedRow = null; editorRow = null; }} style="margin-left: 0.5rem;">Cancel</button>
              {:else}
                <button type="button" class="btn btn-sm btn-primary tooltip" data-tooltip="Add this row definition." on:click={saveRow}>Add Row</button>
              {/if}
            </div>
          </div>
        </form>
      {:else}
        <div class="empty-state">
          <button class="btn btn-primary btn-lg" on:click={newRow}>+ New Row Definition</button>
          <p style="font-size: 0.75rem; color: #999; margin-top: 1rem; line-height: 1.4;">
            Row definitions organize and name the rows in your sequencer.<br/>
            Add rows for different instruments, patterns, or sequences.
          </p>
        </div>
      {/if}
    </div>
  </div>

<style>
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
  }

  .empty-state .btn-lg {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }

  .table tbody tr:hover {
    background-color: #f9f9fa;
  }

  .table tbody tr.active {
    background-color: #e3e5ff;
  }

  .form-switch {
    margin-bottom: 0;
  }
</style>
