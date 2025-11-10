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
</script>

<div class="columns">
    <div class="column col-7">
      <section id="controls">
        {#each trackControls as control, index}
          <div 
            class="control"
            class:active={control === selectedControl}
            class:cc={control.option === CirklonContinuousControl}
            class:track={control.option === CirklonTrackCtrl}
            on:click={() => selectControl(control)}
            style="cursor: pointer;"
          >
            <div>{getFullName(control)}</div>
            <div>{getValue(control)}</div>
          </div>
        {/each}
      </section>
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
              <label class="form-label">Type</label>
            </div>
            <div class="col-9">
              <select
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
                <label class="form-label">CC</label>
              </div>
              <div class="col-9">
                <select
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
                <label class="form-label">Track CTRL</label>
              </div>
              <div class="col-9">
                <select
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
        <button class="btn btn-sm" on:click={deletePage}>Delete last page</button>
      </div>
    </div>
  </div>
