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
        // For merge, we've modified the selected instrument in place
        // Just trigger a reactive update
        session.updateInstrument({});
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
  <div class="modal-overlay" on:click={handleCancel}></div>
  <div class="modal-container" role="document">
    <div class="modal-header">
      <div class="modal-title h5">Import Instrument</div>
    </div>
    <div class="modal-body">
      <div class="content">
        <p>How would you like to import this instrument?</p>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" on:click={() => handleImport('new')}>
        As New Instrument
      </button>
      <button 
        class="btn" 
        on:click={() => handleImport('merge')}
        disabled={!$session.selectedInstrument}
      >
        Merge with Current
      </button>
      <button class="btn" on:click={handleCancel}>
        Cancel
      </button>
    </div>
  </div>
</div>
