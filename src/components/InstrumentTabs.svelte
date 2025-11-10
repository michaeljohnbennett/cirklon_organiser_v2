<script>
  import { session } from '../stores/session.js';
  import SettingsTab from './tabs/SettingsTab.svelte';
  import MidiCCTab from './tabs/MidiCCTab.svelte';
  import TrackControlTab from './tabs/TrackControlTab.svelte';
  import RowDefinitionsTab from './tabs/RowDefinitionsTab.svelte';

  let activeTab = 'settings';
</script>

{#if $session.selectedInstrument}
  <div>
    <input type="radio" id="instrumentSettings" name="tabs" class="tab-locator" hidden bind:group={activeTab} value="settings" checked />
    <input type="radio" id="instrumentCC" name="tabs" class="tab-locator" hidden bind:group={activeTab} value="cc" />
    <input type="radio" id="instrumentTrackControl" name="tabs" class="tab-locator" hidden bind:group={activeTab} value="trackControl" />
    <input type="radio" id="instrumentRowDefs" name="tabs" class="tab-locator" hidden bind:group={activeTab} value="rowDefs" />
    
    <ul class="tab tab-block">
      <li class="tab-item">
        <label for="instrumentSettings">
          <a href="#settings">Settings</a>
        </label>
      </li>
      <li class="tab-item">
        <label for="instrumentCC">
          <a href="#cc" class="badge" data-badge={$session.selectedInstrument.continuousControls?.length || 0}>Midi CC´s</a>
        </label>
      </li>
      <li class="tab-item">
        <label for="instrumentTrackControl">
          <a href="#trackControl" class="badge" data-badge={$session.selectedInstrument.trackControls?.length || 0}>Track controls</a>
        </label>
      </li>
      <li class="tab-item">
        <label for="instrumentRowDefs">
          <a href="#rowDefs" class="badge" data-badge={$session.selectedInstrument.rowDefinitions?.length || 0}>Row Defintions</a>
        </label>
      </li>
    </ul>

    <div class="tabs">
      <section class="tab-content">
        <SettingsTab />
      </section>
      
      <section class="tab-content">
        <MidiCCTab />
      </section>
      
      <section class="tab-content">
        <TrackControlTab />
      </section>
      
      <section class="tab-content">
        <RowDefinitionsTab />
      </section>
    </div>
  </div>
{/if}
