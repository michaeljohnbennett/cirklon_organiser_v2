<script>
  import { session, showImportModal } from '../stores/session.js';
  import { saveSession, loadSession, loadInstrumentFile } from '../lib/fileHandlers.js';
  import { createInstrument } from '../lib/models.js';

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
  <!-- Session controls row -->
  <div class="navbar toolbar-row">
    <section class="navbar-section">
      <span class="text-bold" style="margin-right: 1rem;">Session:</span>
      <button class="btn btn-sm btn-primary" on:click={handleNewSession}>New</button>
      <button class="btn btn-sm" on:click={handleSaveSession}>Save</button>
      <button class="btn btn-sm" on:click={handleLoadSession}>Load</button>
    </section>
  </div>

  <!-- Instrument controls row -->
  <div class="navbar toolbar-row">
    <section class="navbar-section">
      <span class="text-bold" style="margin-right: 1rem;">Instrument:</span>
      <button class="btn btn-sm btn-primary" on:click={handleNewInstrument}>New</button>
      <button class="btn btn-sm" on:click={handleImportInstrument}>Import</button>
      <button 
        class="btn btn-sm" 
        on:click={handleDuplicateInstrument}
        disabled={!$session.selectedInstrument}
      >
        Duplicate
      </button>
      <button 
        class="btn btn-sm" 
        on:click={handleDeleteInstrument}
        disabled={!$session.selectedInstrument}
      >
        Delete
      </button>
    </section>
    
    {#if $session.selectedInstrument}
      <section class="navbar-center">
        <select 
          class="form-select select-sm" 
          value={$session.instruments.indexOf($session.selectedInstrument)}
          on:change={(e) => {
            const idx = parseInt(e.target.value);
            session.selectInstrument($session.instruments[idx]);
          }}
        >
          {#each $session.instruments as instrument, i}
            <option value={i}>{instrument.name}</option>
          {/each}
        </select>
      </section>
      
      <section class="navbar-section">
        <span class="label label-secondary">
          Port: {$session.selectedInstrument.midiPort}
        </span>
        <span class="label label-secondary">
          Ch: {$session.selectedInstrument.midiChannel}
        </span>
      </section>
    {/if}
  </div>
</div>

<style>
  .toolbar-container {
    border-bottom: 1px solid #dadee4;
  }
  
  .toolbar-row {
    padding: 0.4rem 0.8rem;
    border-bottom: 1px solid #f1f3f5;
  }
  
  .toolbar-row:last-child {
    border-bottom: none;
  }
  
  .navbar-section .btn {
    margin-right: 0.4rem;
  }
  
  .navbar-section .label {
    margin-left: 0.4rem;
  }
</style>
