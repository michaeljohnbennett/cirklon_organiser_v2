<script>
  import { session } from '../stores/session.js';
  
  let isEditingName = false;
  let editNameValue = '';

  function startEditName() {
    editNameValue = $session.name;
    isEditingName = true;
  }

  function saveName() {
    if (editNameValue.trim()) {
      session.setName(editNameValue.trim());
    }
    isEditingName = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      saveName();
    } else if (e.key === 'Escape') {
      isEditingName = false;
    }
  }
</script>

<header class="navbar">
  <section class="navbar-section">
    <div class="btn-group-block">
      <button class="btn btn-sm active badge" data-badge={$session.instruments.length}>
        Instruments
      </button>
      <!-- TODO: Implement Songviewer functionality -->
      <!-- <button class="btn btn-sm disabled">Songviewer</button> -->
    </div>
  </section>
  <section class="navbar-center">
    {#if isEditingName}
      <input 
        type="search"
        class="form-input input-sm"
        style="width: 200px; display: inline-block;"
        bind:value={editNameValue}
        on:blur={saveName}
        on:keydown={handleKeydown}
      />
    {:else}
      <button 
        style="cursor: pointer; border: none; background: transparent; padding: 0;"
        on:click={startEditName}
        on:keydown={(e) => e.key === 'Enter' && startEditName()}
        title="Click to edit session name"
        type="button"
      >
        <span class="label label-rounded logo session-label">{$session.name}</span>
      </button>
    {/if}
  </section>
  <section class="navbar-section">
    <a href="https://github.com/michaeljohnbennett/cirklon_organiser_v2" class="btn btn-sm">GitHub</a>
  </section>
</header>

<style>
  .logo {
    user-select: none;
  }

  .session-label {
    font-size: 1rem;
    padding: 0.2rem 1rem !important;
  }

  header.navbar {
    z-index: 10;
  }
</style>
