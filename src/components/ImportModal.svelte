<script>
  import { session, showImportModal } from '../stores/session.js';
  import { importInstrumentFromData } from '../lib/fileHandlers.js';

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

  function handleCancel() {
    session.clearImportData();
    showImportModal.set(false);
  }
</script>

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
