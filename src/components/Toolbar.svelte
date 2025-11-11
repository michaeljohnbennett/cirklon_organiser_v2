<script>
  import { session, showImportModal } from '../stores/session.js';
  import { saveSession, loadSession, loadInstrumentFile, exportInstrumentData } from '../lib/fileHandlers.js';
  import { createInstrument } from '../lib/models.js';
  import { saveAs } from 'file-saver';
  import { onMount, onDestroy } from 'svelte';

  let sessionFileInput;
  let instrumentFileInput;
  
  // Instrument templates
  const templates = [
    { file: 'instrument-template.CKI', name: 'Template - Full Setup', description: 'Complete instrument with 38 CCs and track controls' }
  ];
  
  let showTemplateDropdown = false;

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
  
  async function loadInstrumentTemplate(filename) {
    console.log('Loading template:', filename);
    try {
      const templateUrl = `${import.meta.env.BASE_URL}templates/${filename}`;
      const response = await fetch(templateUrl);
      console.log('Response:', response);
      const template = await response.json();
      console.log('Template data:', template);
      
      // Create and add the new instrument from template
      const newInstrument = createInstrument(template);
      console.log('New instrument:', newInstrument);
      session.addInstrument(newInstrument);
      console.log('Template loaded successfully');
    } catch (error) {
      console.error('Failed to load instrument template:', error);
      alert('Failed to load template: ' + error.message);
    } finally {
      showTemplateDropdown = false;
    }
  }
  
  function toggleTemplateDropdown(event) {
    event.stopPropagation();
    console.log('Toggle dropdown, current state:', showTemplateDropdown);
    showTemplateDropdown = !showTemplateDropdown;
  }
  
  function handleClickOutside(event) {
    if (showTemplateDropdown && !event.target.closest('.dropdown')) {
      showTemplateDropdown = false;
    }
  }
  
  onMount(() => {
    window.addEventListener('click', handleClickOutside);
  });
  
  onDestroy(() => {
    window.removeEventListener('click', handleClickOutside);
  });

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
          <span class="label label-rounded label-primary instrument-label">{$session.selectedInstrument.name}</span>
        {/if}
      </div>
    </section>
    <section class="navbar-center">
      <div class="btn-group btn-group-block">
        <div class="dropdown" class:active={showTemplateDropdown}>
          <button 
            class="btn tooltip dropdown-toggle" 
            data-tooltip="Load instrument template"
            on:click={toggleTemplateDropdown}
            type="button"
          >
            <i class="icon icon-bookmark"></i>
          </button>
          <ul class="menu template-menu">
            {#each templates as template}
              <li class="menu-item">
                <button 
                  type="button" 
                  on:click={(e) => {
                    e.stopPropagation();
                    console.log('Template button clicked:', template.file);
                    loadInstrumentTemplate(template.file);
                  }} 
                  class="template-button"
                >
                  <div class="template-name">{template.name}</div>
                  <div class="template-desc">{template.description}</div>
                </button>
              </li>
            {/each}
          </ul>
        </div>
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
    position: sticky;
    top: 0;
    z-index: 100;
    /* background: white; */
  }

  .toolbar-container .tooltip {
    z-index: 9999 !important;
  }

  .toolbar-container .tooltip::after{
    z-index: 9999 !important;
  }
  
  .template-menu {
    min-width: 400px;
    font-size: 0.75rem;
  }
  
  .template-button {
    width: 100%;
    text-align: left;
    padding: 0.4rem 0.6rem;
    border: none;
    background: transparent;
    cursor: pointer;
    display: block;
    line-height: 1.2;
  }
  
  .template-button:hover {
    background-color: #f7f8f9;
  }
  
  .template-name {
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 0.1rem;
  }
  
  .template-desc {
    font-size: 0.7rem;
    color: #66758c;
  }

  .instrument-label {
    font-size: 1rem;
    padding: 0.3rem 1rem;  }
</style>
