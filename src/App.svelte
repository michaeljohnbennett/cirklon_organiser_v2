<script>
  import { session, showImportModal } from './stores/session.js';
  import Header from './components/Header.svelte';
  import Toolbar from './components/Toolbar.svelte';
  import InstrumentTabs from './components/InstrumentTabs.svelte';
  import ImportModal from './components/ImportModal.svelte';
  import Footer from './components/Footer.svelte';
</script>

<Header />

<main style="padding-bottom: 3rem;">
  <Toolbar />
  
  {#if $session.selectedInstrument}
    <InstrumentTabs />
  {/if}

  {#if $showImportModal}
    <ImportModal />
  {/if}
</main>

<Footer />
