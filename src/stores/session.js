import { writable, derived, get } from 'svelte/store';
import { saveAs } from 'file-saver';

// Constants
export const CirklonAllowedCharacters = "[-A-Za-z0-9()#. $@!&+{}*]";
export const CirklonEmpty = 'Empty';
export const CirklonContinuousControl = 'MIDI CC';
export const CirklonTrackCtrl = 'Track CTRL';
export const trackValues = ['pgm', 'quant%', 'note%', 'noteC', 'velo%', 'veloC', 'leng%', 'tbase', 'xpos', 'octave', 'knob1', 'knob2', 'fts-R', 'fts-S', 'reich'];
export const midiPortValues = ['1', '2', '3', '4', '5', 'usb1', 'usb2', 'usb3', 'usb4', 'usb5'];

// Helper function to generate default session name with YYMMDD format and random suffix
function getDefaultSessionName() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `${yy}${mm}${dd}-${randomSuffix} Cirklon Cfg`;
}

// Main session store
function createSession() {
  const { subscribe, set, update } = writable({
    name: getDefaultSessionName(),
    instruments: [],
    selectedInstrument: null,
    importInstrumentData: null
  });

  return {
    subscribe,
    
    reset: () => set({
      name: getDefaultSessionName(),
      instruments: [],
      selectedInstrument: null,
      importInstrumentData: null
    }),

    setName: (name) => update(state => ({
      ...state,
      name: name || 'Untitled Session'
    })),

    addInstrument: (instrument) => update(state => {
      // Check for name conflicts and auto-increment
      let finalName = instrument.name;
      const existingNames = state.instruments.map(i => i.name);
      
      if (existingNames.includes(finalName)) {
        // Check if name ends with a number
        const match = finalName.match(/^(.+?)(\d+)$/);
        if (match) {
          // Name ends with a number, increment it
          const baseName = match[1];
          let number = parseInt(match[2]);
          do {
            number++;
            finalName = `${baseName}${number}`;
          } while (existingNames.includes(finalName));
        } else {
          // No number at end, append "2" and keep incrementing if needed
          let number = 2;
          do {
            finalName = `${instrument.name}${number}`;
            number++;
          } while (existingNames.includes(finalName));
        }
      }
      
      // Create new instrument with potentially updated name
      const instrumentToAdd = { ...instrument, name: finalName };
      const newInstruments = [...state.instruments, instrumentToAdd];
      return {
        ...state,
        instruments: newInstruments,
        selectedInstrument: instrumentToAdd
      };
    }),

    deleteInstrument: (instrument) => update(state => {
      const newInstruments = state.instruments.filter(i => i !== instrument);
      return {
        ...state,
        instruments: newInstruments,
        selectedInstrument: newInstruments.length > 0 ? newInstruments[0] : null
      };
    }),

    selectInstrument: (instrument) => update(state => ({
      ...state,
      selectedInstrument: instrument
    })),

    updateInstrument: (updates) => update(state => {
      if (!state.selectedInstrument) return state;
      
      // Find the index of the selected instrument
      const selectedIndex = state.instruments.findIndex(inst => inst === state.selectedInstrument);
      if (selectedIndex === -1) return state;
      
      // Create updated instrument
      const updatedInstrument = { ...state.selectedInstrument, ...updates };
      
      // Update the instruments array
      const updatedInstruments = [...state.instruments];
      updatedInstruments[selectedIndex] = updatedInstrument;
      
      return {
        ...state,
        instruments: updatedInstruments,
        selectedInstrument: updatedInstruments[selectedIndex]
      };
    }),

    replaceInstrument: (newInstrument) => update(state => {
      if (!state.selectedInstrument) return state;
      
      // Find the index of the selected instrument
      const selectedIndex = state.instruments.findIndex(inst => inst === state.selectedInstrument);
      if (selectedIndex === -1) return state;
      
      // Replace the instrument entirely
      const updatedInstruments = [...state.instruments];
      updatedInstruments[selectedIndex] = newInstrument;
      
      return {
        ...state,
        instruments: updatedInstruments,
        selectedInstrument: updatedInstruments[selectedIndex]
      };
    }),

    setImportData: (data) => update(state => ({
      ...state,
      importInstrumentData: data
    })),

    clearImportData: () => update(state => ({
      ...state,
      importInstrumentData: null
    }))
  };
}

export const session = createSession();

// Modal visibility
export const showImportModal = writable(false);

// Store for multi-instrument import selection
export const pendingImport = writable(null);

// Helper functions for validation
export function isNameValid(name) {
  const regex = new RegExp('^' + CirklonAllowedCharacters + '{0,20}$');
  return regex.test(name);
}

export function isCCValid(cc) {
  return cc >= 0 && cc <= 127;
}

export function isMidiChannelValid(channel) {
  return channel >= 1 && channel <= 16;
}
