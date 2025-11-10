<script>
  import { session, isCCValid, isNameValid } from '../../stores/session.js';
  import { createContinuousControl } from '../../lib/models.js';

  $: instrument = $session.selectedInstrument;
  $: continuousControls = instrument?.continuousControls || [];
  
  let selectedCC = null;
  let editorCC = null;
  let editMode = 'new';

  function startNew() {
    selectedCC = null;
    editMode = 'new';
    editorCC = createContinuousControl();
  }

  function selectCC(cc) {
    if (selectedCC === cc) {
      startNew();
    } else {
      selectedCC = cc;
      editMode = 'edit';
      editorCC = { ...cc };
    }
  }

  function saveCC() {
    if (!isCCValid(editorCC.cc) || !isNameValid(editorCC.name)) return;

    const existingIndex = continuousControls.findIndex(c => c.cc === editorCC.cc);
    
    if (editMode === 'new' && existingIndex !== -1) {
      alert('CC number already exists!');
      return;
    }

    let newControls;
    if (editMode === 'edit' && selectedCC) {
      newControls = continuousControls.map(c => c === selectedCC ? { ...editorCC } : c);
    } else {
      newControls = [...continuousControls, { ...editorCC }];
    }

    session.updateInstrument({ continuousControls: newControls });
    startNew();
  }

  function deleteCC() {
    if (!selectedCC) return;
    
    const newControls = continuousControls.filter(c => c !== selectedCC);
    session.updateInstrument({ continuousControls: newControls });
    startNew();
  }

  function sortBy(field) {
    const sorted = [...continuousControls].sort((a, b) => {
      if (field === 'cc') {
        return parseInt(a.cc) - parseInt(b.cc);
      } else {
        return a[field].localeCompare(b[field]);
      }
    });
    session.updateInstrument({ continuousControls: sorted });
  }

  startNew();
</script>

<div class="container">
  <div class="columns">
    <!-- CC List -->
    <div class="column col-6">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Continuous Controls</div>
          <div class="btn-group btn-group-block">
            <button class="btn btn-sm" on:click={() => sortBy('cc')}>Sort by CC</button>
            <button class="btn btn-sm" on:click={() => sortBy('name')}>Sort by Name</button>
          </div>
        </div>
        <div class="panel-body" style="max-height: 400px; overflow-y: auto;">
          {#each continuousControls as cc}
            <div 
              class="tile tile-centered"
              class:active={selectedCC === cc}
              on:click={() => selectCC(cc)}
              style="cursor: pointer; padding: 0.4rem; margin: 0.2rem 0;"
            >
              <div class="tile-content">
                <div class="tile-title">CC #{cc.cc} - {cc.name}</div>
                <div class="tile-subtitle text-gray">Range: {cc.min} - {cc.max}</div>
              </div>
            </div>
          {/each}
          {#if continuousControls.length === 0}
            <p class="text-gray text-center">No continuous controls defined</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- CC Editor -->
    <div class="column col-6">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">{editMode === 'new' ? 'New' : 'Edit'} Continuous Control</div>
        </div>
        <div class="panel-body">
          {#if editorCC}
            <form class="form-horizontal" on:submit|preventDefault={saveCC}>
              <div class="form-group">
                <div class="col-3">
                  <label class="form-label" for="ccNumber">CC #</label>
                </div>
                <div class="col-9">
                  <input
                    class="form-input"
                    class:is-error={!isCCValid(editorCC.cc)}
                    type="number"
                    id="ccNumber"
                    min="0"
                    max="127"
                    bind:value={editorCC.cc}
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="col-3">
                  <label class="form-label" for="ccName">Name</label>
                </div>
                <div class="col-9">
                  <input
                    class="form-input"
                    class:is-error={!isNameValid(editorCC.name)}
                    type="text"
                    id="ccName"
                    bind:value={editorCC.name}
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="col-3">
                  <label class="form-label" for="ccMin">Min</label>
                </div>
                <div class="col-9">
                  <input
                    class="form-input"
                    type="number"
                    id="ccMin"
                    min="0"
                    max="127"
                    bind:value={editorCC.min}
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="col-3">
                  <label class="form-label" for="ccMax">Max</label>
                </div>
                <div class="col-9">
                  <input
                    class="form-input"
                    type="number"
                    id="ccMax"
                    min="0"
                    max="127"
                    bind:value={editorCC.max}
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="col-12">
                  <button 
                    class="btn btn-primary" 
                    type="submit"
                    disabled={!isCCValid(editorCC.cc) || !isNameValid(editorCC.name)}
                  >
                    {editMode === 'new' ? 'Add' : 'Update'} CC
                  </button>
                  {#if editMode === 'edit'}
                    <button class="btn" type="button" on:click={deleteCC}>Delete</button>
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
