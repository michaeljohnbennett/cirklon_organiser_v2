<script>
  import { session } from '../../stores/session.js';
  import { createContinuousControl } from '../../lib/models.js';

  $: instrument = $session.selectedInstrument;
  $: continuousControls = instrument?.continuousControls || [];
  
  let selectedCC = null;
  let editorCC = createContinuousControl();
  let showTemplateMenu = false;

  const templates = [
    { file: 'midi-cc-general.json', name: 'General MIDI', count: 13 },
    { file: 'midi-cc-synth.json', name: 'Synthesizer', count: 11 },
    { file: 'midi-cc-syntakt.json', name: 'Elektron Syntakt', count: 16 },
    { file: 'midi-cc-analog-four.json', name: 'Elektron Analog Four', count: 24 },
    { file: 'midi-cc-analog-rytm.json', name: 'Elektron Analog Rytm', count: 28 },
    { file: 'midi-cc-digitone.json', name: 'Elektron Digitone', count: 18 },
    { file: 'midi-cc-eventide-space.json', name: 'Eventide Space', count: 11 },
    { file: 'midi-cc-empress-echosystem.json', name: 'Empress Echosystem', count: 10 }
  ];

  async function loadTemplate(templateFile, merge = false) {
    try {
      const response = await fetch(`/templates/${templateFile}`);
      const template = await response.json();
      
      let mergedControls;
      
      if (merge) {
        // Merge existing and template CCs, removing duplicates by CC number
        const ccMap = new Map();
        
        // First add existing CCs
        continuousControls.forEach(cc => {
          ccMap.set(cc.cc, cc);
        });
        
        // Then add/overwrite with template CCs
        template.controls.forEach(cc => {
          ccMap.set(cc.cc, { ...cc });
        });
        
        // Convert back to array and sort by CC number
        mergedControls = Array.from(ccMap.values()).sort((a, b) => parseInt(a.cc) - parseInt(b.cc));
      } else {
        // Replace - just use template controls sorted by CC number
        mergedControls = template.controls.map(c => ({ ...c })).sort((a, b) => parseInt(a.cc) - parseInt(b.cc));
      }
      
      session.updateInstrument({ 
        continuousControls: mergedControls
      });
      selectedCC = null;
      editorCC = createContinuousControl();
      showTemplateMenu = false;
    } catch (error) {
      alert('Failed to load template: ' + error.message);
    }
  }

  function deleteAllCCs() {
    if (continuousControls.length === 0) return;
    
    if (confirm(`Delete all ${continuousControls.length} MIDI CCs? This cannot be undone.`)) {
      session.updateInstrument({ continuousControls: [] });
      selectedCC = null;
      editorCC = createContinuousControl();
    }
  }

  function selectCC(cc) {
    selectedCC = cc;
    editorCC = { ...cc };
  }

  function updateEditorField(field, value) {
    editorCC = { ...editorCC, [field]: value };
    
    // Auto-save if editing existing CC
    if (selectedCC) {
      const newControls = continuousControls.map(c => c === selectedCC ? { ...editorCC } : c);
      session.updateInstrument({ continuousControls: newControls });
      selectedCC = editorCC;
    }
  }

  function addNewCC() {
    const newControls = [...continuousControls, { ...editorCC }];
    session.updateInstrument({ continuousControls: newControls });
    editorCC = createContinuousControl();
    selectedCC = null;
  }

  function deleteCC() {
    if (!selectedCC) return;
    const newControls = continuousControls.filter(c => c !== selectedCC);
    session.updateInstrument({ continuousControls: newControls });
    editorCC = createContinuousControl();
    selectedCC = null;
  }

  function sortBy(field) {
    const sorted = [...continuousControls].sort((a, b) => {
      if (field === 'cc') return parseInt(a.cc) - parseInt(b.cc);
      return a[field].localeCompare(b[field]);
    });
    session.updateInstrument({ continuousControls: sorted });
  }
</script>

<div class="columns">
    <div class="column col-6">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>CC Num</th>
            <th>Min</th>
            <th>Max</th>
            <th>Start</th>
          </tr>
        </thead>
        <tbody style="display: block; max-height: 20rem; overflow-y: auto;">
          {#if continuousControls.length > 0}
            {#each continuousControls as cc}
              <tr 
                on:click={() => selectCC(cc)}
                class:active={cc === selectedCC}
                style="cursor: pointer; display: table; width: 100%; table-layout: fixed;"
              >
                <td>{cc.name}</td>
                <td>{cc.cc}</td>
                <td>{cc.min}</td>
                <td>{cc.max}</td>
                <td>{cc.start}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">
              <span class="text-primary">{continuousControls.length}</span> Midi CC´s
            </td>
            <td colspan="3" style="text-align: right;">
              <div class="dropdown" class:active={showTemplateMenu}>
                <button class="btn btn-sm btn-primary dropdown-toggle" on:click={() => showTemplateMenu = !showTemplateMenu}>
                  Load Template
                </button>
                {#if showTemplateMenu}
                  <ul class="menu">
                    {#each templates as template}
                      <li class="menu-item">
                        <div style="padding: 0.2rem 0.4rem;">
                          <strong>{template.name}</strong> <span class="label">{template.count} CCs</span>
                          <div class="btn-group btn-group-block" style="margin-top: 0.2rem;">
                            <button class="btn btn-sm" on:click={() => loadTemplate(template.file, true)}>
                              Merge
                            </button>
                            <button class="btn btn-sm" on:click={() => loadTemplate(template.file, false)}>
                              Replace
                            </button>
                          </div>
                        </div>
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>
              <button 
                class="btn btn-sm btn-error" 
                on:click={deleteAllCCs}
                disabled={continuousControls.length === 0}
              >
                Delete All
              </button>
              <span style="margin: 0 0.5rem;">Sort by</span>
              <div class="btn-group">
                <button class="btn btn-sm" on:click={() => sortBy('cc')}>CC num</button>
                <button class="btn btn-sm" on:click={() => sortBy('name')}>name</button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div class="divider-vert col-1"></div>
    
    <div class="column col-5">
      <form class="form-horizontal" on:submit|preventDefault>
        <legend>{selectedCC ? 'Edit' : 'New'}</legend>
        
        <div class="form-group">
          <div class="col-3"><label class="form-label">Name</label></div>
          <div class="col-9">
            <input 
              class="form-input" 
              type="text" 
              maxlength="6" 
              placeholder="name" 
              bind:value={editorCC.name}
              on:input={(e) => updateEditorField('name', e.target.value)}
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="col-3"><label class="form-label">CC Num</label></div>
          <div class="col-2">
            <input 
              class="form-input" 
              type="number" 
              min="0" 
              max="127" 
              placeholder="cc" 
              bind:value={editorCC.cc}
              on:input={(e) => updateEditorField('cc', parseInt(e.target.value))}
            />
          </div>
          <div class="col-7">
            <input 
              class="slider rangeslider" 
              type="range" 
              min="0" 
              max="127" 
              bind:value={editorCC.cc}
              on:input={(e) => updateEditorField('cc', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="col-3"><label class="form-label">Min Value</label></div>
          <div class="col-2">
            <input 
              class="form-input" 
              type="number" 
              min="0" 
              max="127" 
              placeholder="min" 
              bind:value={editorCC.min}
              on:input={(e) => updateEditorField('min', parseInt(e.target.value))}
            />
          </div>
          <div class="col-7">
            <input 
              class="slider rangeslider" 
              type="range" 
              min="0" 
              max="127" 
              bind:value={editorCC.min}
              on:input={(e) => updateEditorField('min', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="col-3"><label class="form-label">Max Value</label></div>
          <div class="col-2">
            <input 
              class="form-input" 
              type="number" 
              min="0" 
              max="127" 
              placeholder="max" 
              bind:value={editorCC.max}
              on:input={(e) => updateEditorField('max', parseInt(e.target.value))}
            />
          </div>
          <div class="col-7">
            <input 
              class="slider rangeslider" 
              type="range" 
              min="0" 
              max="127" 
              bind:value={editorCC.max}
              on:input={(e) => updateEditorField('max', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="col-3"><label class="form-label">Start Value</label></div>
          <div class="col-2">
            <input 
              class="form-input" 
              type="number" 
              min="0" 
              max="127" 
              placeholder="start" 
              bind:value={editorCC.start}
              on:input={(e) => updateEditorField('start', parseInt(e.target.value))}
            />
          </div>
          <div class="col-7">
            <input 
              class="slider rangeslider" 
              type="range" 
              min="0" 
              max="127" 
              bind:value={editorCC.start}
              on:input={(e) => updateEditorField('start', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="col-3"></div>
          <div class="col-9">
            {#if selectedCC}
              <a class="btn btn-sm btn-error tooltip" data-tooltip="Delete selected continuous control from list." on:click={deleteCC}>Delete</a>
              <a class="btn btn-sm tooltip" data-tooltip="Clear selection and add new continuous control." on:click={() => { selectedCC = null; editorCC = createContinuousControl(); }}>Add New</a>
            {:else}
              <a class="btn btn-sm btn-primary tooltip" data-tooltip="Add new continuous control to list." on:click={addNewCC}>Add new</a>
            {/if}
          </div>
        </div>
      </form>
    </div>
  </div>

<style>
  .dropdown.active .menu {
    display: block;
  }
</style>
