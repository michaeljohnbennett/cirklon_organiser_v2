<script>
  import { session, CirklonEmpty, CirklonContinuousControl, CirklonTrackCtrl, trackValues } from '../../stores/session.js';
  import { createTrackControl } from '../../lib/models.js';

  $: instrument = $session.selectedInstrument;
  $: trackControls = instrument?.trackControls || [];
  $: continuousControls = instrument?.continuousControls || [];

  let selectedControl = null;
  let editorControl = null;

  const controlOptions = [CirklonEmpty, CirklonContinuousControl, CirklonTrackCtrl];

  function selectControl(control) {
    selectedControl = control;
    editorControl = { ...control };
  }

  function updateControl() {
    if (!editorControl || !selectedControl) return;

    const index = trackControls.indexOf(selectedControl);
    if (index === -1) return;

    const newControls = [...trackControls];
    newControls[index] = { ...editorControl };
    
    session.updateInstrument({ trackControls: newControls });
    selectedControl = newControls[index];
    editorControl = { ...newControls[index] };
  }

  function addPage() {
    const newControls = [...trackControls];
    for (let i = 0; i < 6; i++) {
      newControls.push(createTrackControl());
    }
    session.updateInstrument({ trackControls: newControls });
  }

  function deletePage() {
    if (trackControls.length <= 6) return;
    if (!confirm('Delete the last page of 6 controls? This cannot be undone.')) return;

    const newControls = trackControls.slice(0, -6);
    session.updateInstrument({ trackControls: newControls });
  }

  function getFullName(control) {
    if (control.option === CirklonEmpty) return ' ';
    if (control.option === CirklonContinuousControl) {
      return control.continuousControl ? `CC #${control.continuousControl.cc}` : 'CC';
    }
    if (control.option === CirklonTrackCtrl) return 'CTRL';
    return 'Unknown';
  }

  function getValue(control) {
    if (control.option === CirklonEmpty) return ' ';
    if (control.option === CirklonContinuousControl) {
      return control.continuousControl ? control.continuousControl.name : '';
    }
    if (control.option === CirklonTrackCtrl) return control.trackValue;
    return 'Unknown';
  }
  
  function deleteRow(rowIndex) {
    if (!confirm('Delete this row of 6 controls? This cannot be undone.')) return;
    
    const startIndex = rowIndex * 6;
    const newControls = [
      ...trackControls.slice(0, startIndex),
      ...trackControls.slice(startIndex + 6)
    ];
    session.updateInstrument({ trackControls: newControls });
    selectedControl = null;
    editorControl = null;
  }
  
  function insertRowAbove(rowIndex) {
    const startIndex = rowIndex * 6;
    const newControls = [...trackControls];
    for (let i = 0; i < 6; i++) {
      newControls.splice(startIndex, 0, createTrackControl());
    }
    session.updateInstrument({ trackControls: newControls });
  }
  
  function insertRowBelow(rowIndex) {
    const startIndex = (rowIndex + 1) * 6;
    const newControls = [...trackControls];
    for (let i = 0; i < 6; i++) {
      newControls.splice(startIndex, 0, createTrackControl());
    }
    session.updateInstrument({ trackControls: newControls });
  }
  
  function deleteAll() {
    if (confirm('Delete all track controls? This cannot be undone.')) {
      session.updateInstrument({ trackControls: [] });
      selectedControl = null;
      editorControl = null;
    }
  }
  
  function moveRowUp(rowIndex) {
    if (rowIndex === 0) return; // Can't move first row up
    
    const startIndex = rowIndex * 6;
    const prevStartIndex = (rowIndex - 1) * 6;
    
    const newControls = [...trackControls];
    // Swap the two rows
    const currentRow = newControls.splice(startIndex, 6);
    newControls.splice(prevStartIndex, 0, ...currentRow);
    
    session.updateInstrument({ trackControls: newControls });
  }
  
  function moveRowDown(rowIndex) {
    const totalRows = Math.ceil(trackControls.length / 6);
    if (rowIndex >= totalRows - 1) return; // Can't move last row down
    
    const startIndex = rowIndex * 6;
    const nextStartIndex = (rowIndex + 1) * 6;
    
    const newControls = [...trackControls];
    // Swap the two rows
    const nextRow = newControls.splice(nextStartIndex, 6);
    newControls.splice(startIndex, 0, ...nextRow);
    
    session.updateInstrument({ trackControls: newControls });
  }
</script>

<div class="columns">
    <div class="column col-7">
      <section id="controls" class="controls-with-actions">
        {#each trackControls as control, index}
          <button 
            type="button"
            class="control"
            class:active={control === selectedControl}
            class:cc={control.option === CirklonContinuousControl}
            class:track={control.option === CirklonTrackCtrl}
            on:click={() => selectControl(control)}
            style="cursor: pointer;"
          >
            <div>{getFullName(control)}</div>
            <div>{getValue(control)}</div>
          </button>
          
          {#if (index + 1) % 6 === 0}
            <div class="row-actions">
              <button 
                type="button" 
                class="btn btn-sm btn-action tooltip" 
                data-tooltip="Move row up"
                on:click={() => moveRowUp(Math.floor(index / 6))}
                disabled={Math.floor(index / 6) === 0}
              >
                <i class="icon icon-arrow-up"></i>
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-action tooltip" 
                data-tooltip="Move row down"
                on:click={() => moveRowDown(Math.floor(index / 6))}
                disabled={Math.floor(index / 6) >= Math.ceil(trackControls.length / 6) - 1}
              >
                <i class="icon icon-arrow-down"></i>
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-action btn-success tooltip" 
                data-tooltip="Insert row above"
                on:click={() => insertRowAbove(Math.floor(index / 6))}
              >
                ↑+
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-action btn-success tooltip" 
                data-tooltip="Insert row below"
                on:click={() => insertRowBelow(Math.floor(index / 6))}
              >
                ↓+
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-action btn-error tooltip" 
                data-tooltip="Delete this row"
                on:click={() => deleteRow(Math.floor(index / 6))}
              >
                <i class="icon icon-delete"></i>
              </button>
            </div>
          {/if}
        {/each}
      </section>
      <div style="margin-top: 1rem;">
        <button class="btn btn-sm btn-error" on:click={deleteAll} disabled={trackControls.length === 0}>
          Delete All
        </button>
      </div>
    </div>
    
    <div class="divider-vert col-1"></div>
    
    <div class="column col-4">
      <form class="form-horizontal" on:submit|preventDefault>
        {#if selectedControl}
          <legend>Edit</legend>
        {:else}
          <legend>Select a element to Edit</legend>
        {/if}
        
        {#if editorControl}
          <div class="form-group">
            <div class="col-3">
              <label class="form-label" for="track-control-type">Type</label>
            </div>
            <div class="col-9">
              <select
                id="track-control-type"
                class="form-select"
                bind:value={editorControl.option}
                on:change={updateControl}
              >
                {#each controlOptions as option}
                  <option value={option}>{option}</option>
                {/each}
              </select>
            </div>
          </div>

          {#if editorControl.option === CirklonContinuousControl}
            <div class="form-group">
              <div class="col-3">
                <label class="form-label" for="track-control-cc">CC</label>
              </div>
              <div class="col-9">
                <select
                  id="track-control-cc"
                  class="form-select"
                  value={editorControl.continuousControl?.cc || ''}
                  on:change={(e) => {
                    const ccNum = parseInt(e.target.value);
                    editorControl.continuousControl = continuousControls.find(cc => cc.cc === ccNum) || null;
                    updateControl();
                  }}
                >
                  <option value="">Select CC...</option>
                  {#each continuousControls as cc}
                    <option value={cc.cc}>{cc.label || `CC #${cc.cc} - ${cc.name}`}</option>
                  {/each}
                </select>
              </div>
            </div>
          {/if}

          {#if editorControl.option === CirklonTrackCtrl}
            <div class="form-group">
              <div class="col-3">
                <label class="form-label" for="track-control-value">Track CTRL</label>
              </div>
              <div class="col-9">
                <select
                  id="track-control-value"
                  class="form-select"
                  bind:value={editorControl.trackValue}
                  on:change={updateControl}
                >
                  {#each trackValues as value}
                    <option value={value}>{value}</option>
                  {/each}
                </select>
              </div>
            </div>
          {/if}
        {/if}
      </form>
      
      <div class="btn-group">
        <button class="btn btn-sm" on:click={addPage}>Add new page</button>
        <button
          class="btn btn-sm btn-error"
          on:click={deletePage}
          disabled={trackControls.length <= 6}
        >
          Delete last page
        </button>
      </div>
    </div>
  </div>

<style>
  .controls-with-actions {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr auto !important;
  }
  
  .row-actions {
    display: flex;
    gap: 0.2rem;
    align-items: center;
    justify-content: center;
  }
  
  .btn-action {
    padding: 0.15rem 0.35rem;
    min-width: auto;
    width: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.1rem;
  }
  
  .btn-action .icon {
    font-size: 0.7rem;
  }
  
  .btn-action:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>