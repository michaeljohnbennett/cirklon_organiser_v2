<script>
  import { session, midiPortValues, isNameValid, isMidiChannelValid } from '../../stores/session.js';

  $: instrument = $session.selectedInstrument;
  
  function updateInstrument(field, value) {
    session.updateInstrument({ [field]: value });
  }
</script>

<div class="container">
  <div class="columns">
    <div class="column col-6 col-mx-auto">
      <form class="form-horizontal">
        <div class="form-group">
          <div class="col-3 col-sm-12">
            <label class="form-label" for="instrumentName">Name</label>
          </div>
          <div class="col-9 col-sm-12">
            <input
              class="form-input"
              class:is-error={!isNameValid(instrument.name)}
              type="text"
              id="instrumentName"
              placeholder="Instrument name"
              bind:value={instrument.name}
              on:input={(e) => updateInstrument('name', e.target.value)}
            />
            {#if !isNameValid(instrument.name)}
              <p class="form-input-hint">Name contains invalid characters or is too long (max 20 chars)</p>
            {/if}
          </div>
        </div>

        <div class="form-group">
          <div class="col-3 col-sm-12">
            <label class="form-label" for="midiPort">MIDI Port</label>
          </div>
          <div class="col-9 col-sm-12">
            <select
              class="form-select"
              id="midiPort"
              bind:value={instrument.midiPort}
              on:change={(e) => updateInstrument('midiPort', e.target.value)}
            >
              {#each midiPortValues as port}
                <option value={port}>{port}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="form-group">
          <div class="col-3 col-sm-12">
            <label class="form-label" for="midiChannel">MIDI Channel</label>
          </div>
          <div class="col-9 col-sm-12">
            <select
              class="form-select"
              id="midiChannel"
              bind:value={instrument.midiChannel}
              on:change={(e) => updateInstrument('midiChannel', parseInt(e.target.value))}
            >
              {#each Array(16) as _, i}
                <option value={i + 1}>{i + 1}</option>
              {/each}
            </select>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
