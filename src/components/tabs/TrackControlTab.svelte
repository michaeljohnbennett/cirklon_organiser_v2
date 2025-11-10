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
    if (selectedControl === control) {
      selectedControl = null;
      editorControl = null;
    } else {
      selectedControl = control;
      editorControl = { ...control };
    }
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

  function getDisplayName(control) {
    if (control.option === CirklonEmpty) return ' ';
    if (control.option === CirklonContinuousControl) {
      return control.continuousControl ? `CC #${control.continuousControl.cc}` : 'CC';
    }
    if (control.option === CirklonTrackCtrl) return 'CTRL';
    return 'Unknown';
  }

  function getDisplayValue(control) {
    if (control.option === CirklonEmpty) return ' ';
    if (control.option === CirklonContinuousControl) {
      return control.continuousControl ? control.continuousControl.name : '';
    }
    if (control.option === CirklonTrackCtrl) return control.trackValue;
    return 'Unknown';
  }
</script>

<div class="container">
  <div class="columns">
    <!-- Track Control Grid -->
    <div class="column col-7">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Track Controls</div>
          <div class="btn-group btn-group-block">
            <button class="btn btn-sm" on:click={addPage}>Add Page</button>
            <button 
              class="btn btn-sm" 
              on:click={deletePage}
              disabled={trackControls.length <= 6}
            >
              Delete Last Page
            </button>
          </div>
        </div>
        <div class="panel-body">
          {#each Array(Math.ceil(trackControls.length / 6)) as _, pageIndex}
            <div class="divider text-center" data-content="Page {pageIndex + 1}"></div>
            <div class="columns">
              {#each trackControls.slice(pageIndex * 6, (pageIndex + 1) * 6) as control, idx}
                <div class="column col-2">
                  <button
                    class="btn btn-block"
                    class:btn-primary={selectedControl === control}
                    on:click={() => selectControl(control)}
                    style="margin: 0.2rem 0;"
                  >
                    <div class="text-bold">{getDisplayName(control)}</div>
                    <div class="text-small">{getDisplayValue(control)}</div>
                  </button>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Track Control Editor -->
    <div class="column col-5">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Edit Control</div>
        </div>
        <div class="panel-body">
          {#if editorControl}
            <form class="form-horizontal" on:submit|preventDefault={updateControl}>
              <div class="form-group">
                <div class="col-4">
                  <label class="form-label">Type</label>
                </div>
                <div class="col-8">
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
                  <div class="col-4">
                    <label class="form-label">MIDI CC</label>
                  </div>
                  <div class="col-8">
                    <select
                      class="form-select"
                      bind:value={editorControl.continuousControl}
                      on:change={updateControl}
                    >
                      <option value={null}>Select CC...</option>
                      {#each continuousControls as cc}
                        <option value={cc}>CC #{cc.cc} - {cc.name}</option>
                      {/each}
                    </select>
                  </div>
                </div>
              {/if}

              {#if editorControl.option === CirklonTrackCtrl}
                <div class="form-group">
                  <div class="col-4">
                    <label class="form-label">Track Value</label>
                  </div>
                  <div class="col-8">
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

              <div class="form-group">
                <div class="col-12">
                  <button class="btn btn-primary" type="submit">Update</button>
                  <button class="btn" type="button" on:click={() => { selectedControl = null; editorControl = null; }}>
                    Clear
                  </button>
                </div>
              </div>
            </form>
          {:else}
            <p class="text-gray text-center">Select a control to edit</p>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
