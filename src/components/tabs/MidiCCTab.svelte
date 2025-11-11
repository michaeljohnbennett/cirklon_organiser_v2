<script>
  import { session } from "../../stores/session.js";
  import { createContinuousControl } from "../../lib/models.js";

  $: instrument = $session.selectedInstrument;
  $: continuousControls = instrument?.continuousControls || [];
  $: otherInstruments = $session.instruments.filter((i) => i !== instrument);

  let selectedCC = null;
  let editorCC = createContinuousControl();
  let showTemplateMenu = false;
  let showCopyMenu = false;
  let showImportWarning = false;
  let pendingCCs = null;
  let pendingMerge = false;
  let importSource = ""; // For warning message

  const templates = [
    { file: "midi-cc-general.json", name: "General MIDI", count: 13 },
    { file: "midi-cc-synth.json", name: "Synthesizer", count: 11 },
    { file: "midi-cc-syntakt.json", name: "Elektron Syntakt", count: 16 },
    {
      file: "midi-cc-analog-four.json",
      name: "Elektron Analog Four",
      count: 24,
    },
    {
      file: "midi-cc-analog-rytm.json",
      name: "Elektron Analog Rytm",
      count: 28,
    },
    { file: "midi-cc-digitone.json", name: "Elektron Digitone", count: 18 },
    { file: "midi-cc-eventide-space.json", name: "Eventide Space", count: 11 },
    {
      file: "midi-cc-empress-echosystem.json",
      name: "Empress Echosystem",
      count: 10,
    },
  ];

  async function loadTemplate(templateFile, merge = false) {
    try {
      const templateUrl = `${import.meta.env.BASE_URL}templates/${templateFile}`;
      const response = await fetch(templateUrl);
      const template = await response.json();
      const ccs = template.controls.map((c) => ({ ...c }));

      // Get template name for warning
      const templateInfo = templates.find((t) => t.file === templateFile);
      importSource = templateInfo?.name || templateFile;

      importCCs(ccs, merge);
      showTemplateMenu = false;
    } catch (error) {
      alert("Failed to load template: " + error.message);
    }
  }

  function copyFromInstrument(sourceInstrument, merge = false) {
    const ccs = sourceInstrument.continuousControls.map((cc) => ({ ...cc }));
    importSource = sourceInstrument.name;
    importCCs(ccs, merge);
    showCopyMenu = false;
  }

  function importCCs(newCCs, merge = false) {
    // Check if track controls will be affected
    const hasTrackControlCCs = instrument?.trackControls?.some(
      (tc) => tc.option === "MIDI CC" && tc.continuousControl,
    );

    if (hasTrackControlCCs) {
      pendingCCs = newCCs;
      pendingMerge = merge;
      showImportWarning = true;
      return;
    }

    // No track controls affected, proceed directly
    applyCCs(newCCs, merge);
  }

  function applyCCs(newCCs, merge = false) {
    let mergedControls;

    if (merge) {
      // Merge existing and new CCs, removing duplicates by CC number
      const ccMap = new Map();

      // First add existing CCs
      continuousControls.forEach((cc) => {
        ccMap.set(cc.cc, cc);
      });

      // Then add/overwrite with new CCs
      newCCs.forEach((cc) => {
        ccMap.set(cc.cc, cc);
      });

      // Convert back to array and sort by CC number
      mergedControls = Array.from(ccMap.values()).sort(
        (a, b) => parseInt(a.cc) - parseInt(b.cc),
      );
    } else {
      // Replace - just use new controls sorted by CC number
      mergedControls = newCCs.sort((a, b) => parseInt(a.cc) - parseInt(b.cc));
    }

    // Update track controls to link to new CCs where possible
    const updatedTrackControls = instrument.trackControls.map((tc) => {
      if (tc.option === "MIDI CC" && tc.ccNumber !== undefined) {
        // Try to find matching CC in new controls
        const matchingCC = mergedControls.find((cc) => cc.cc === tc.ccNumber);
        return {
          ...tc,
          continuousControl: matchingCC || null,
        };
      }
      return tc;
    });

    session.updateInstrument({
      continuousControls: mergedControls,
      trackControls: updatedTrackControls,
    });
    selectedCC = null;
    editorCC = createContinuousControl();
  }

  function confirmImport() {
    showImportWarning = false;
    applyCCs(pendingCCs, pendingMerge);
    pendingCCs = null;
    pendingMerge = false;
    importSource = "";
  }

  function cancelImport() {
    showImportWarning = false;
    pendingCCs = null;
    pendingMerge = false;
    importSource = "";
  }

  function deleteAllCCs() {
    if (continuousControls.length === 0) return;

    if (
      confirm(
        `Delete all ${continuousControls.length} MIDI CCs? This cannot be undone.`,
      )
    ) {
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
      const newControls = continuousControls.map((c) =>
        c === selectedCC ? { ...editorCC } : c,
      );
      session.updateInstrument({ continuousControls: newControls });
      // Keep selectedCC pointing to the original object so next edit finds it
      selectedCC = newControls.find(
        (c) => c.cc === editorCC.cc && c.name === editorCC.name,
      );
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
    const newControls = continuousControls.filter((c) => c !== selectedCC);
    session.updateInstrument({ continuousControls: newControls });
    editorCC = createContinuousControl();
    selectedCC = null;
  }

  function sortBy(field) {
    const sorted = [...continuousControls].sort((a, b) => {
      if (field === "cc") return parseInt(a.cc) - parseInt(b.cc);
      return a[field].localeCompare(b[field]);
    });
    session.updateInstrument({ continuousControls: sorted });
  }
</script>

<div class="columns">
  <div class="column col-6">
    <div class="cc-table-wrapper">
      <div class="cc-controls-header">
        <div class="cc-footer-controls">
          <div class="cc-footer-left">
            <div class="dropdown" class:active={showTemplateMenu}>
              <button
                class="btn btn-sm btn-primary dropdown-toggle"
                on:click={() => (showTemplateMenu = !showTemplateMenu)}
              >
                Load Template
              </button>
              {#if showTemplateMenu}
                <ul class="menu cc-template-menu">
                  {#each templates as template}
                    <li class="menu-item">
                      <div class="cc-template-item">
                        <div class="cc-template-info">
                          <span class="cc-template-name">{template.name}</span>
                          <span class="cc-template-count"
                            >{template.count} CCs</span
                          >
                        </div>
                        <div class="cc-template-actions">
                          <button
                            class="btn btn-sm"
                            on:click={() => loadTemplate(template.file, true)}
                          >
                            Merge
                          </button>
                          <button
                            class="btn btn-sm"
                            on:click={() => loadTemplate(template.file, false)}
                          >
                            Replace
                          </button>
                        </div>
                      </div>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            <div class="dropdown" class:active={showCopyMenu}>
              <button
                class="btn btn-sm btn-primary dropdown-toggle"
                on:click={() => (showCopyMenu = !showCopyMenu)}
                disabled={otherInstruments.length === 0}
              >
                Copy from Instrument
              </button>
              {#if showCopyMenu}
                <ul class="menu cc-template-menu">
                  {#each otherInstruments as inst}
                    <li class="menu-item">
                      <div class="cc-template-item">
                        <div class="cc-template-info">
                          <span class="cc-template-name">{inst.name}</span>
                          <span class="cc-template-count"
                            >{inst.continuousControls.length} CCs</span
                          >
                        </div>
                        <div class="cc-template-actions">
                          <button
                            class="btn btn-sm"
                            on:click={() => copyFromInstrument(inst, true)}
                          >
                            Merge
                          </button>
                          <button
                            class="btn btn-sm"
                            on:click={() => copyFromInstrument(inst, false)}
                          >
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
          </div>
          <div class="cc-footer-middle">
            <span style="margin-left: 1rem; white-space: nowrap;">CC Total: <strong>{continuousControls.length}</strong></span         >
          </div>
          <div class="cc-footer-right">
            <span style="margin-right: 0.3rem; white-space: nowrap;"
              >Sort by</span
            >
            <div class="btn-group">
              <button class="btn btn-sm" on:click={() => sortBy("cc")}
                >CC num</button
              >
              <button class="btn btn-sm" on:click={() => sortBy("name")}
                >name</button
              >
            </div>
          </div>
        </div>
      </div>
      <table class="table table-striped table-hover">
        <thead class="cc-table-header">
          <tr>
            <th>Name</th>
            <th>CC Num</th>
            <th>Min</th>
            <th>Max</th>
            <th>Start</th>
          </tr>
        </thead>
        <tbody>
          {#if continuousControls.length > 0}
            {#each continuousControls as cc}
              <tr
                on:click={() => selectCC(cc)}
                class:active={cc === selectedCC}
                style="cursor: pointer;"
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
            <td colspan="5"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  <div class="divider-vert col-1"></div>

  <div class="column col-5">
    <form class="form-horizontal" on:submit|preventDefault>
      <legend>{selectedCC ? "Edit" : "New"}</legend>

      <div class="form-group">
        <div class="col-3">
          <label class="form-label" for="midi-cc-name">Name</label>
        </div>
        <div class="col-9">
          <input
            id="midi-cc-name"
            class="form-input"
            type="search"
            maxlength="6"
            placeholder="name"
            bind:value={editorCC.name}
            on:input={(e) => updateEditorField("name", e.target.value)}
          />
        </div>
      </div>

      <div class="form-group">
        <div class="col-3">
          <label class="form-label" for="midi-cc-num">CC Num</label>
        </div>
        <div class="col-2">
          <input
            id="midi-cc-num"
            class="form-input"
            type="text"
            inputmode="numeric"
            min="0"
            max="127"
            placeholder="cc"
            bind:value={editorCC.cc}
            on:input={(e) => {
              const val = e.target.value === "" ? "" : parseInt(e.target.value);
              if (val === "" || (val >= 0 && val <= 127)) {
                updateEditorField("cc", val);
              }
            }}
          />
        </div>
        <div class="col-7">
          <input
            class="slider rangeslider"
            type="range"
            min="0"
            max="127"
            bind:value={editorCC.cc}
            on:input={(e) => updateEditorField("cc", parseInt(e.target.value))}
            aria-label="CC Number slider"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="col-3">
          <label class="form-label" for="midi-cc-min">Min Value</label>
        </div>
        <div class="col-2">
          <input
            id="midi-cc-min"
            class="form-input"
            type="text"
            inputmode="numeric"
            min="0"
            max="127"
            placeholder="min"
            bind:value={editorCC.min}
            on:input={(e) => {
              const val = e.target.value === "" ? "" : parseInt(e.target.value);
              if (val === "" || (val >= 0 && val <= 127)) {
                updateEditorField("min", val);
              }
            }}
          />
        </div>
        <div class="col-7">
          <input
            class="slider rangeslider"
            type="range"
            min="0"
            max="127"
            bind:value={editorCC.min}
            on:input={(e) => updateEditorField("min", parseInt(e.target.value))}
            aria-label="Min Value slider"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="col-3">
          <label class="form-label" for="midi-cc-max">Max Value</label>
        </div>
        <div class="col-2">
          <input
            id="midi-cc-max"
            class="form-input"
            type="text"
            inputmode="numeric"
            min="0"
            max="127"
            placeholder="max"
            bind:value={editorCC.max}
            on:input={(e) => {
              const val = e.target.value === "" ? "" : parseInt(e.target.value);
              if (val === "" || (val >= 0 && val <= 127)) {
                updateEditorField("max", val);
              }
            }}
          />
        </div>
        <div class="col-7">
          <input
            class="slider rangeslider"
            type="range"
            min="0"
            max="127"
            bind:value={editorCC.max}
            on:input={(e) => updateEditorField("max", parseInt(e.target.value))}
            aria-label="Max Value slider"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="col-3">
          <label class="form-label" for="midi-cc-start">Start Value</label>
        </div>
        <div class="col-2">
          <input
            id="midi-cc-start"
            class="form-input"
            type="text"
            inputmode="numeric"
            min="0"
            max="127"
            placeholder="start"
            bind:value={editorCC.start}
            on:input={(e) => {
              const val = e.target.value === "" ? "" : parseInt(e.target.value);
              if (val === "" || (val >= 0 && val <= 127)) {
                updateEditorField("start", val);
              }
            }}
          />
        </div>
        <div class="col-7">
          <input
            class="slider rangeslider"
            type="range"
            min="0"
            max="127"
            bind:value={editorCC.start}
            on:input={(e) =>
              updateEditorField("start", parseInt(e.target.value))}
            aria-label="Start Value slider"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="col-3"></div>
        <div class="col-9">
          {#if selectedCC}
            <button
              type="button"
              class="btn btn-sm btn-error tooltip"
              data-tooltip="Delete selected continuous control from list."
              on:click={deleteCC}>Delete</button
            >
            <button
              type="button"
              class="btn btn-sm tooltip"
              data-tooltip="Clear selection and add new continuous control."
              on:click={() => {
                selectedCC = null;
                editorCC = createContinuousControl();
              }}>Add New</button
            >
          {:else}
            <button
              type="button"
              class="btn btn-sm btn-primary tooltip"
              data-tooltip="Add new continuous control to list."
              on:click={addNewCC}>Add new</button
            >
          {/if}
        </div>
      </div>
    </form>
  </div>
</div>

{#if showImportWarning}
  <div class="modal modal-sm active">
    <button
      class="modal-overlay"
      on:click={cancelImport}
      aria-label="Close modal"
      type="button"
    ></button>
    <div class="modal-container" role="document">
      <div class="modal-header">
        <div class="modal-title h6" style="font-size: 0.8rem;">
          Track Controls Warning
        </div>
      </div>
      <div class="modal-body">
        <div class="content">
          <p style="font-size: 0.75rem; margin-bottom: 0.5rem;">
            Your Track Controls currently use MIDI CCs. Importing from <strong
              >{importSource}</strong
            > will:
          </p>
          <ul
            style="font-size: 0.7rem; margin-left: 1rem; margin-bottom: 0.5rem;"
          >
            <li>
              Re-link Track Controls to matching CC numbers if they exist in the
              import
            </li>
            <li>
              Set Track Controls to null if their CC numbers are not in the
              import
            </li>
            <li>
              Keep Track Control configuration (names and settings) intact
            </li>
          </ul>
          <p style="font-size: 0.75rem; color: #e85600; font-weight: 600;">
            Continue with import?
          </p>
        </div>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-sm btn-primary"
          on:click={confirmImport}
          style="font-size: 0.75rem;"
        >
          Continue
        </button>
        <button
          class="btn btn-sm"
          on:click={cancelImport}
          style="font-size: 0.75rem;"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dropdown.active .menu {
    display: block;
  }

  .cc-table-wrapper {
    position: relative;
  }

  .cc-table-header {
    background-color: #3b4351;
  }

  .cc-table-header th {
    color: white;
    border-color: #2d323d;
    font-weight: 600;
    text-align: center;
  }

  .cc-table-wrapper .table tbody td {
    text-align: center;
  }

  .cc-table-wrapper .table thead,
  .cc-table-wrapper .table tbody,
  .cc-table-wrapper .table tfoot {
    display: block;
  }

  .cc-table-wrapper .table thead {
    padding-right: 0.6rem;
  }

  .cc-table-wrapper .table thead tr,
  .cc-table-wrapper .table tfoot tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .cc-table-wrapper .table tbody {
    max-height: calc(100vh - 350px);
    overflow-y: auto;
  }

  .cc-table-wrapper .table tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .cc-table-wrapper .table {
    margin-top: 0;
  }

  .cc-controls-header {
    background-color: #f5f6f7;
    border-bottom: 1px solid #dadee4;
    padding: 0.5rem 0.5rem;
    flex-shrink: 0;
  }
  .cc-footer-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  .cc-footer-left {
    display: flex;
    gap: 0.3rem;
    align-items: center;
    flex-wrap: nowrap;
  }

  .cc-footer-middle {
    display: flex;
    gap: 0.3rem;
    align-items: center;
    flex-wrap: nowrap;
  }

  .cc-footer-right {
    display: flex;
    align-items: center;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .cc-template-menu {
    min-width: 400px;
    max-height: 400px;
    overflow-y: auto;
    font-size: 0.75rem;
  }

  .cc-template-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.35rem 0.5rem;
    gap: 1rem;
  }

  .cc-template-item:hover {
    background-color: #f7f8f9;
  }

  .cc-template-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .cc-template-name {
    font-weight: 600;
    font-size: 0.75rem;
  }

  .cc-template-count {
    font-size: 0.65rem;
    color: #66758c;
  }

  .cc-template-actions {
    display: flex;
    gap: 0.3rem;
    flex-shrink: 0;
    flex-wrap: nowrap;
  }

  .cc-template-actions .btn {
    min-width: 55px;
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
  }

  .modal.modal-sm .modal-container {
    width: 22rem;
    max-width: 95vw;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.4rem;
    flex-wrap: nowrap;
  }

  .modal-footer .btn {
    flex: 0 0 auto;
    white-space: nowrap;
  }
</style>
