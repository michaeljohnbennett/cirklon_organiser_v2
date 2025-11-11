<script>
  import { session, showImportModal, pendingImport } from '../stores/session.js';
  import { importInstrumentFromData, importMultipleInstruments } from '../lib/fileHandlers.js';

  function handleImport(mode) {
    if (!$session.importInstrumentData) return;

    const instrument = importInstrumentFromData($session.importInstrumentData, mode);
    
    if (instrument) {
      if (mode === 'new') {
        session.addInstrument(instrument);
      } else if (mode === 'merge') {
        // For merge, update the instrument with the merged data
        session.updateInstrument({
          continuousControls: instrument.continuousControls,
          rowDefinitions: instrument.rowDefinitions
        });
      }
    }

    session.clearImportData();
    showImportModal.set(false);
  }

  function handleMultiImport() {
    if (!$pendingImport) return;
    
    importMultipleInstruments($pendingImport.instruments);
    pendingImport.set(null);
    showImportModal.set(false);
  }

  function toggleInstrument(index) {
    pendingImport.update(data => {
      if (data) {
        data.instruments[index].selected = !data.instruments[index].selected;
      }
      return data;
    });
  }

  function handleCancel() {
    session.clearImportData();
    pendingImport.set(null);
    showImportModal.set(false);
  }

  $: isMultiImport = $pendingImport && $pendingImport.instruments.length > 1;
  $: selectedCount = $pendingImport ? $pendingImport.instruments.filter(i => i.selected).length : 0;
</script>

{#if isMultiImport}
  <div class="modal modal-sm active" id="importInstrumentSelection">
    <button 
      class="modal-overlay" 
      on:click={handleCancel}
      on:keydown={(e) => e.key === 'Enter' && handleCancel()}
      aria-label="Close modal"
      type="button"
    ></button>
    <div class="modal-container" role="document">
      <div class="modal-header">
        <div class="modal-title h6" style="font-size: 0.8rem;">Select Instruments to Import</div>
      </div>
      <div class="modal-body">
        <div class="content" style="max-height: 300px; overflow-y: auto;">
          <p style="font-size: 0.75rem; margin-bottom: 0.5rem;">Select which instruments to import:</p>
          {#each $pendingImport.instruments as instrument, index}
            <label class="form-checkbox" style="display: block; margin-bottom: 0.3rem; font-size: 0.75rem;">
              <input 
                type="checkbox" 
                checked={instrument.selected}
                on:change={() => toggleInstrument(index)}
              />
              <i class="form-icon"></i>
              {instrument.name}
            </label>
          {/each}
        </div>
      </div>
      <div class="modal-footer">
        <button 
          class="btn btn-sm btn-primary" 
          on:click={handleMultiImport}
          disabled={selectedCount === 0}
          style="font-size: 0.75rem;"
        >
          Import {selectedCount} Instrument{selectedCount !== 1 ? 's' : ''}
        </button>
        <button class="btn btn-sm" on:click={handleCancel} style="font-size: 0.75rem;">
          Cancel
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="modal modal-sm active" id="importInstrumentSelection">
    <button 
      class="modal-overlay" 
      on:click={handleCancel}
      on:keydown={(e) => e.key === 'Enter' && handleCancel()}
      aria-label="Close modal"
      type="button"
    ></button>
    <div class="modal-container" role="document">
      <div class="modal-header">
        <div class="modal-title h6" style="font-size: 0.8rem;">Import Instrument</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <p style="font-size: 0.75rem;">How would you like to import this instrument?</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-sm" on:click={() => handleImport('new')} style="font-size: 0.75rem;">
          As New Instrument
        </button>
        <button 
          class="btn btn-sm" 
          on:click={() => handleImport('merge')}
          disabled={!$session.selectedInstrument}
          style="font-size: 0.75rem;"
        >
          Merge with Current
        </button>
        <button class="btn btn-sm" on:click={handleCancel} style="font-size: 0.75rem;">
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal.modal-sm .modal-container {
    width: 24rem;
    max-width: 95vw;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.4rem;
    flex-wrap: nowrap;
  }
  
  .modal-footer .btn {
    flex: 0 0 auto;
    white-space: nowrap;
  }
</style>
