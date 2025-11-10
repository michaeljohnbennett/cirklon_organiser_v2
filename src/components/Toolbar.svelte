<script>
  import { session, showImportModal } from '../stores/session.js';
  import { saveSession, loadSession, loadInstrumentFile, exportInstrumentData } from '../lib/fileHandlers.js';
  import { createInstrument } from '../lib/models.js';
  import { saveAs } from 'file-saver';

  let sessionFileInput;
  let instrumentFileInput;

  function handleNewSession() {
    if (confirm('Create new session? Unsaved changes will be lost.')) {
      session.reset();
    }
  }

  function handleSaveSession() {
    saveSession($session);
  }

  function handleLoadSession() {
    if ($session.instruments.length > 0) {
      if (!confirm('Load session? Unsaved changes will be lost.')) {
        return;
      }
    }
    sessionFileInput.click();
  }

  function handleSessionFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      loadSession(file);
      event.target.value = ''; // Reset input
    }
  }

  function handleNewInstrument() {
    const instrument = createInstrument();
    session.addInstrument(instrument);
  }

  function handleImportInstrument() {
    instrumentFileInput.click();
  }

  function handleInstrumentFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      loadInstrumentFile(file);
      event.target.value = ''; // Reset input
    }
  }

  function handleDeleteInstrument() {
    if ($session.selectedInstrument && confirm('Delete instrument "' + $session.selectedInstrument.name + '"?')) {
      session.deleteInstrument($session.selectedInstrument);
    }
  }

  function handleDuplicateInstrument() {
    if (!$session.selectedInstrument) return;

    const original = $session.selectedInstrument;
    
    // Create a deep copy of the instrument
    const duplicate = JSON.parse(JSON.stringify(original));
    
    // Smart naming: check if name ends with a number
    const match = original.name.match(/^(.+?)(\d+)$/);
    if (match) {
      // Name ends with a number, increment it
      const baseName = match[1];
      const number = parseInt(match[2]);
      duplicate.name = `${baseName}${number + 1}`;
    } else {
      // No number at end, append "2"
      duplicate.name = `${original.name}2`;
    }
    
    session.addInstrument(duplicate);
  }

  function handleExportInstrument() {
    if (!$session.selectedInstrument) return;
    
    const instrument = $session.selectedInstrument;
    const instrumentData = {
      instrument_data: {}
    };
    
    // Export the instrument data
    instrumentData.instrument_data[instrument.name] = exportInstrumentData(instrument);
    
    const output = JSON.stringify(instrumentData, null, '\t');
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    
    // Sanitize filename
    const filename = instrument.name.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
    saveAs(blob, `${filename}.CKI`);
    
    setTimeout(() => {
      alert(`Instrument "${instrument.name}" exported as "${filename}.CKI"`);
    }, 100);
  }

</script>

<input
  type="file"
  bind:this={sessionFileInput}
  on:change={handleSessionFileSelected}
  accept=".json,.CKI"
  style="display: none"
/>

<input
  type="file"
  bind:this={instrumentFileInput}
  on:change={handleInstrumentFileSelected}
  accept=".CKI"
  style="display: none"
/>

<div class="toolbar-container">
  <div class="navbar">
    <section class="navbar-section columns">
      <div class="column col-auto">
        <div class="btn-group btn-group-block">
          <button class="btn" on:click={handleNewSession}>New</button>
          <button class="btn" on:click={handleLoadSession}>Open</button>
          <button class="btn" on:click={handleSaveSession}>Save</button>
        </div>
      </div>
      <div class="column" style="text-align:center">
        {#if $session.selectedInstrument}
          <span class="label label-rounded label-primary">{$session.selectedInstrument.name}</span>
        {/if}
      </div>
    </section>
    <section class="navbar-center">
      <div class="btn-group btn-group-block">
        <button 
          class="btn tooltip" 
          data-tooltip="Import instrument" 
          on:click={handleImportInstrument}
        >
          <i class="icon icon-upload btn-sm"></i>
        </button>
        <button 
          class="btn tooltip" 
          data-tooltip="Export selected instrument" 
          on:click={handleExportInstrument}
          disabled={!$session.selectedInstrument}
        >
          <i class="icon icon-download btn-sm"></i>
        </button>
        <button 
          class="btn tooltip" 
          data-tooltip="Add new instrument" 
          on:click={handleNewInstrument}
        >
          <i class="icon icon-plus"></i>
        </button>
        <button 
          class="btn tooltip" 
          data-tooltip="Duplicate selected instrument" 
          on:click={handleDuplicateInstrument}
          disabled={!$session.selectedInstrument}
        >
          <i class="icon icon-copy"></i>
        </button>
        <button 
          class="btn tooltip" 
          data-tooltip="Delete selected instrument" 
          on:click={handleDeleteInstrument}
          disabled={!$session.selectedInstrument}
        >
          <i class="icon icon-minus"></i>
        </button>
      </div>
    </section>
    <section class="navbar-section">
      <div class="column">
        <select 
          class="form-select" 
          value={$session.instruments.indexOf($session.selectedInstrument)}
          on:change={(e) => {
            const idx = parseInt(e.target.value);
            session.selectInstrument($session.instruments[idx]);
          }}
          disabled={$session.instruments.length <= 1}
        >
          {#each $session.instruments as instrument, i}
            <option value={i}>{instrument.name}</option>
          {/each}
        </select>
      </div>
    </section>
  </div>
</div>

<style>
  .toolbar-container {
    border-bottom: 1px solid #dadee4;
  }
</style>
