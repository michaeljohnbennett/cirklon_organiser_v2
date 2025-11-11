<script>
  import { session, showImportModal } from './stores/session.js';
  import Header from './components/Header.svelte';
  import Toolbar from './components/Toolbar.svelte';
  import InstrumentTabs from './components/InstrumentTabs.svelte';
  import ImportModal from './components/ImportModal.svelte';
  import Footer from './components/Footer.svelte';
</script>

<Header />

<Toolbar />

<main>
  {#if $session.selectedInstrument}
    <InstrumentTabs />
  {/if}

  {#if $showImportModal}
    <ImportModal />
  {/if}
</main>

<Footer />

<style>
  :global(body) {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  :global(#app) {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  :global(main) {
    flex: 1;
    overflow-y: auto;
  }

  :global(.tooltip) {
    z-index: 9999 !important;
  }

  :global(.tooltip::after) {
    z-index: 9999 !important;
  }
</style>
