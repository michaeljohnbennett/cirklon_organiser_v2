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
    <input type="radio" id="instrumentSettings" name="tabs" class="tab-locator" hidden bind:group={activeTab} value="settings" />
    <input type="radio" id="instrumentCC" name="tabs" class="tab-locator" hidden bind:group={activeTab} value="cc" />
    <input type="radio" id="instrumentTrackControl" name="tabs" class="tab-locator" hidden bind:group={activeTab} value="trackControl" />
    <input type="radio" id="instrumentRowDefs" name="tabs" class="tab-locator" hidden bind:group={activeTab} value="rowDefs" />
    
    <ul class="tab tab-block">
      <li class="tab-item" class:active={activeTab === 'settings'}>
        <label for="instrumentSettings">
          <i class="icon icon-menu"></i> Settings
        </label>
      </li>
      <li class="tab-item badge" class:active={activeTab === 'cc'} data-badge={$session.selectedInstrument.continuousControls?.length || 0}>
        <label for="instrumentCC">
          <i class="icon icon-bookmark"></i> Midi CC's
        </label>
      </li>
      <li class="tab-item badge" class:active={activeTab === 'trackControl'} data-badge={$session.selectedInstrument.trackControls?.length || 0}>
        <label for="instrumentTrackControl">
          <i class="icon icon-arrow-right"></i> Track Control
        </label>
      </li>
      <li class="tab-item badge" class:active={activeTab === 'rowDefs'} data-badge={$session.selectedInstrument.rowDefinitions?.length || 0}>
        <label for="instrumentRowDefs">
          <i class="icon icon-resize-vert"></i> Row Definitions
        </label>
      </li>
    </ul>

    <div class="tabs">
      {#if activeTab === 'settings'}
        <SettingsTab />
      {:else if activeTab === 'cc'}
        <MidiCCTab />
      {:else if activeTab === 'trackControl'}
        <TrackControlTab />
      {:else if activeTab === 'rowDefs'}
        <RowDefinitionsTab />
      {/if}
    </div>
  </div>
{/if}
