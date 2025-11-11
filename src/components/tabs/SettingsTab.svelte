<script>
  import { session, midiPortValues, isNameValid, isMidiChannelValid } from '../../stores/session.js';

  $: instrument = $session.selectedInstrument;
  
  // Generate note list: C 0 to C 6 (includes all chromatic notes)
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octaves = [0, 1, 2, 3, 4, 5, 6];
  const noteList = octaves.flatMap(oct => notes.map(note => `${note} ${oct}`));
  
  const patternList = ['P3', 'CK'];
  
  function updateInstrument(field, value) {
    session.updateInstrument({ [field]: value });
  }
</script>

{#if instrument}
<form class="form-horizontal columns" on:submit|preventDefault>
    <div class="col-7">
      <div class="form-group" class:error={!isNameValid(instrument.name)}>
        <div class="col-3"><label class="form-label" for="instrument-name">Name</label></div>
        <div class="col-9">
          <input 
            id="instrument-name"
            class="form-input" 
            type="search"
            placeholder="name" 
            maxlength="9" 
            bind:value={instrument.name}
            on:input={(e) => updateInstrument('name', e.target.value)}
          />
        </div>
      </div>
      
      <div class="form-group">
        <div class="col-3"><label class="form-label" for="instrument-midi-port">MIDI port</label></div>
        <div class="col-9">
          <select 
            id="instrument-midi-port"
            class="form-select" 
            bind:value={instrument.midiPort}
            on:change={(e) => updateInstrument('midiPort', e.target.value)}
          >
            {#each midiPortValues as port}
              <option value={port}>{port}</option>
            {/each}
          </select>
        </div>
      </div>
      
      <div class="form-group" class:error={!isMidiChannelValid(instrument.midiChannel)}>
        <div class="col-3"><label class="form-label" for="instrument-midi-channel">MIDI channel</label></div>
        <div class="col-9">
          <select 
            id="instrument-midi-channel"
            class="form-select" 
            bind:value={instrument.midiChannel}
            on:change={(e) => updateInstrument('midiChannel', parseInt(e.target.value))}
          >
            {#each Array(16) as _, i}
              <option value={i + 1}>{i + 1}</option>
            {/each}
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <div class="col-3"><label class="form-label" for="instrument-default-note">Default Note</label></div>
        <div class="col-9">
          <select 
            id="instrument-default-note"
            class="form-select" 
            bind:value={instrument.default_note}
            on:change={(e) => updateInstrument('default_note', e.target.value)}
          >
            {#each noteList as note}
              <option value={note}>{note}</option>
            {/each}
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <div class="col-3"><label class="form-label" for="instrument-default-pattern">Default Pattern</label></div>
        <div class="col-9">
          <select 
            id="instrument-default-pattern"
            class="form-select" 
            bind:value={instrument.default_patt}
            on:change={(e) => updateInstrument('default_patt', e.target.value)}
          >
            {#each patternList as pattern}
              <option value={pattern}>{pattern}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
    
    <div class="divider-vert col-1"></div>
    
    <div class="col-4">
      <div class="form-group">
        <div class="col-12">
          <label class="form-switch">
            <input 
              type="checkbox" 
              bind:checked={instrument.multi}
              on:change={(e) => updateInstrument('multi', e.target.checked)}
            />
            <i class="form-icon"></i> Multi
          </label>
          
          <label class="form-switch">
            <input 
              type="checkbox" 
              bind:checked={instrument.presend_pgm}
              on:change={(e) => updateInstrument('presend_pgm', e.target.checked)}
            />
            <i class="form-icon"></i> Presend pgm
          </label>
          
          <label class="form-switch">
            <input 
              type="checkbox" 
              bind:checked={instrument.poly_spread}
              on:change={(e) => updateInstrument('poly_spread', e.target.checked)}
            />
            <i class="form-icon"></i> Poly Spread
          </label>
          
          <label class="form-switch">
            <input 
              type="checkbox" 
              bind:checked={instrument.no_bankL}
              on:change={(e) => updateInstrument('no_bankL', e.target.checked)}
            />
            <i class="form-icon"></i> No Bank L
          </label>
          
          <label class="form-switch">
            <input 
              type="checkbox" 
              bind:checked={instrument.no_bankM}
              on:change={(e) => updateInstrument('no_bankM', e.target.checked)}
            />
            <i class="form-icon"></i> No Bank M
          </label>
          
          <label class="form-switch">
            <input 
              type="checkbox" 
              bind:checked={instrument.no_xpose}
              on:change={(e) => updateInstrument('no_xpose', e.target.checked)}
            />
            <i class="form-icon"></i> No XPose
          </label>
          
          <label class="form-switch">
            <input 
              type="checkbox" 
              bind:checked={instrument.no_fts}
              on:change={(e) => updateInstrument('no_fts', e.target.checked)}
            />
            <i class="form-icon"></i> No FTS
          </label>
          
          <label class="form-switch">
            <input 
              type="checkbox" 
              bind:checked={instrument.show_note_nums}
              on:change={(e) => updateInstrument('show_note_nums', e.target.checked)}
            />
            <i class="form-icon"></i> Show note nums
          </label>
          
          <label class="form-switch">
            <input 
              type="checkbox" 
              bind:checked={instrument.no_thru}
              on:change={(e) => updateInstrument('no_thru', e.target.checked)}
            />
            <i class="form-icon"></i> No Thru
          </label>
        </div>
      </div>
    </div>
  </form>
{/if}
