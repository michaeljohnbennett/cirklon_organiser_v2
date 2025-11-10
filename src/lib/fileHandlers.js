import { saveAs } from 'file-saver';
import { get } from 'svelte/store';
import { session, showImportModal } from '../stores/session.js';
import { createInstrument, createContinuousControl, createTrackControl, createRowDefinition } from './models.js';

// Save entire session as CKI file
export function saveSession(sessionData) {
  if (!sessionData || sessionData.instruments.length === 0) {
    alert('No instruments to export!');
    return;
  }

  const instrumentsData = { instrument_data: {} };
  
  sessionData.instruments.forEach(instrument => {
    const instData = exportInstrumentData(instrument);
    instrumentsData.instrument_data[instrument.name] = instData;
  });

  const output = JSON.stringify(instrumentsData, null, '\t');
  const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
  
  // Use session name for filename, sanitize it
  const filename = (sessionData.name || 'session')
    .replace(/[^a-z0-9_\-]/gi, '_')
    .toLowerCase();
  
  saveAs(blob, `${filename}.CKI`);
  
  // Show confirmation
  setTimeout(() => {
    alert(`Session saved as "${filename}.CKI" with ${sessionData.instruments.length} instrument(s)`);
  }, 100);
}

// Export single instrument data
export function exportInstrumentData(instrument) {
  const inst = {};
  
  // Export CC definitions
  const ccs = inst['CC_defs'] = {};
  instrument.continuousControls.forEach(cc => {
    const ccName = `CC_${cc.cc}`;
    ccs[ccName] = {
      label: cc.name,
      min_val: Number(cc.min),
      max_val: Number(cc.max),
      start_val: Number(cc.min) // Default to min
    };
  });

  // Export track controls
  const trs = inst['track_values'] = {};
  instrument.trackControls.forEach((trackControl, index) => {
    const slot = `slot_${index + 1}`;
    
    if (trackControl.option === 'Track CTRL') {
      trs[slot] = {
        track_control: trackControl.trackValue
      };
    } else if (trackControl.option === 'MIDI CC' && trackControl.continuousControl) {
      trs[slot] = {
        MIDI_CC: Number(trackControl.continuousControl.cc),
        label: trackControl.continuousControl.name
      };
    }
  });

  // Export row definitions
  if (instrument.rowDefinitions && instrument.rowDefinitions.length > 0) {
    const rowDefs = inst['row_defs'] = {};
    instrument.rowDefinitions.forEach(row => {
      rowDefs[row.name] = {
        label: row.label,
        always_show: row.show
      };
    });
  }

  // Export settings
  inst['midi_port'] = instrument.midiPort;
  inst['midi_chan'] = Number(instrument.midiChannel);
  
  return inst;
}

// Load session from file
export function loadSession(file) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      
      // Check if it's a CKI file with instruments
      if (json.hasOwnProperty('instrument_data')) {
        const data = json.instrument_data;
        const instrumentKeys = Object.keys(data);
        
        if (instrumentKeys.length === 0) {
          alert('No instruments found in file!');
          return;
        }

        // Import all instruments
        session.reset();
        instrumentKeys.forEach(key => {
          const instrument = importInstrumentFromCKI(data[key], key);
          session.addInstrument(instrument);
        });
        
        alert(`Loaded ${instrumentKeys.length} instrument(s)`);
      } else {
        alert('Invalid Cirklon instrument file!');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error loading file: ' + error.message);
    }
  };

  reader.readAsText(file);
}

// Load single instrument file and show import modal
export function loadInstrumentFile(file) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      
      // Check if it's a CKI file with instruments
      if (json.hasOwnProperty('instrument_data')) {
        const data = json.instrument_data;
        const instrumentKeys = Object.keys(data);
        
        if (instrumentKeys.length === 0) {
          alert('No instruments found in file!');
          return;
        }

        // Get the first instrument
        const firstKey = instrumentKeys[0];
        const instrumentData = {
          data: data[firstKey],
          name: firstKey
        };

        // Store import data and show modal
        session.setImportData(instrumentData);
        showImportModal.set(true);
        
      } else {
        alert('Invalid Cirklon instrument file!');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error loading file: ' + error.message);
    }
  };

  reader.readAsText(file);
}

// Import instrument from CKI data
export function importInstrumentFromCKI(data, name) {
  const instrument = createInstrument(null, name);
  
  // Import settings
  instrument.name = name;
  instrument.midiPort = String(data.midi_port || '1');
  instrument.midiChannel = Number(data.midi_chan || 1);

  console.log('Importing instrument:', name, 'with midiPort:', instrument.midiPort, 'and midiChannel:', instrument.midiChannel);

  // Import CC definitions
  if (data.CC_defs) {
    const ccs = [];
    Object.keys(data.CC_defs).forEach(key => {
      const ccdef = data.CC_defs[key];
      const ccnum = parseInt(key.match(/\d+/g)[0]);
      ccs.push(createContinuousControl(ccdef, ccnum));
    });
    instrument.continuousControls = ccs;
  }

  // Import track controls
  if (data.track_values) {
    const trs = [];
    const trVs = data.track_values;
    const map = {};
    let max = 0;

    Object.keys(trVs).forEach(key => {
      const tr = trVs[key];
      const trnum = parseInt(key.match(/\d+/g)[0]);
      
      let cc = null;
      if (tr.MIDI_CC !== undefined) {
        cc = instrument.continuousControls.find(c => c.cc === parseInt(tr.MIDI_CC));
        if (!cc) {
          cc = createContinuousControl({ label: tr.label }, parseInt(tr.MIDI_CC));
          instrument.continuousControls.push(cc);
        }
      }

      map[trnum] = createTrackControl(tr, cc);
      max = Math.max(trnum, max);
    });

    const rows = Math.ceil(max / 6);
    const slots = rows * 6;

    for (let i = 1; i <= slots; i++) {
      trs.push(map[i] || createTrackControl());
    }

    instrument.trackControls = trs;
  } else {
    // Default to 6 empty controls
    instrument.trackControls = Array(6).fill(null).map(() => createTrackControl());
  }

  // Import row definitions
  if (data.row_defs) {
    const rds = [];
    Object.keys(data.row_defs).forEach(key => {
      rds.push(createRowDefinition(data.row_defs[key], key));
    });
    instrument.rowDefinitions = rds;
  }

  return instrument;
}

// Import instrument and show modal for merge/new
export function importInstrumentFromData(importData, mode) {
  if (!importData || !importData.data) return null;
  
  if (mode === 'new') {
    return importInstrumentFromCKI(importData.data, importData.name);
  } else if (mode === 'merge') {
    // Get current session data
    const currentSession = get(session);
    
    if (!currentSession.selectedInstrument) {
      alert('No instrument selected to merge with!');
      return null;
    }
    
    // Import the new instrument data
    const importedInstrument = importInstrumentFromCKI(importData.data, importData.name);
    
    // Merge logic: Add CCs and track controls that don't exist
    const currentInst = currentSession.selectedInstrument;
    
    // Merge continuous controls
    importedInstrument.continuousControls.forEach(importedCC => {
      const exists = currentInst.continuousControls.some(cc => cc.cc === importedCC.cc);
      if (!exists) {
        currentInst.continuousControls.push(importedCC);
      }
    });
    
    // Merge row definitions
    if (importedInstrument.rowDefinitions) {
      importedInstrument.rowDefinitions.forEach(importedRow => {
        const exists = currentInst.rowDefinitions.some(row => row.name === importedRow.name);
        if (!exists) {
          currentInst.rowDefinitions.push(importedRow);
        }
      });
    }
    
    // Return the merged instrument (which is the current one, modified)
    return currentInst;
  }
  
  return null;
}
