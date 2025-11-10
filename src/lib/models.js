// Model classes and factory functions for Cirklon Organizer

export function createInstrument(data = null, name = '') {
  // Process continuous controls first
  const continuousControls = data?.continuousControls || [];
  
  // Process track controls if they exist
  let trackControls = Array(6).fill(null).map(() => createTrackControl());
  if (data?.trackControls && Array.isArray(data.trackControls)) {
    trackControls = data.trackControls.map(tc => {
      const control = createTrackControl(tc);
      
      // Link MIDI CC to continuousControl if ccNumber is set
      if (control.ccNumber !== undefined && continuousControls.length > 0) {
        const matchingCC = continuousControls.find(cc => cc.cc === control.ccNumber);
        if (matchingCC) {
          control.continuousControl = matchingCC;
        }
      }
      
      return control;
    });
  }
  
  return {
    name: name || 'New Instrument',
    midiPort: data?.midiPort || data?.midi_port || '1',
    midiChannel: data?.midiChannel || data?.midi_chan || 1,
    default_note: data?.default_note || 'C 3',
    default_patt: data?.default_patt || 'P3',
    multi: data?.multi === 'true' || data?.multi === true || false,
    presend_pgm: data?.presend_pgm === 'on' || data?.presend_pgm === true || false,
    poly_spread: data?.poly_spread === 'on' || data?.poly_spread === true || false,
    no_bankL: data?.no_bankL || false,
    no_bankM: data?.no_bankM || false,
    no_xpose: data?.no_xpose || false,
    no_fts: data?.no_fts || false,
    show_note_nums: data?.show_note_nums || false,
    no_thru: data?.no_thru || false,
    continuousControls: continuousControls,
    trackControls: trackControls,
    rowDefinitions: data?.rowDefinitions || [],
    settings: data?.settings || createSettings(data, name)
  };
}

export function createSettings(data = null, name = '') {
  return {
    name: data?.name || name || 'New Instrument',
    midiPort: data?.midiPort || data?.midi_port || '1',
    midiChannel: data?.midiChannel || data?.midi_channel || 1
  };
}

export function createContinuousControl(data = null, cc = null) {
  return {
    cc: cc !== null ? cc : (data?.cc || 0),
    name: data?.name || data?.label || '',
    min: data?.min !== undefined ? data.min : 0,
    max: data?.max !== undefined ? data.max : 127,
    start: data?.start !== undefined ? data.start : 0
  };
}

export function createTrackControl(data = null, continuousControl = null) {
  const control = {
    name: data?.name || '',
    continuousControl: continuousControl || null,
    trackValue: '',
    option: 'Empty'
  };

  if (data) {
    if (data.hasOwnProperty('MIDI_CC')) {
      control.option = 'MIDI CC';
      // Store the CC number so it can be linked later
      control.ccNumber = data.MIDI_CC;
    } else if (data.hasOwnProperty('track_control') && data.track_control !== null) {
      control.option = 'Track CTRL';
      control.trackValue = data.track_control;
    } else {
      control.option = 'Empty';
    }
  }

  return control;
}

export function createRowDefinition(data = null, name = 'C 3') {
  return {
    name: name,
    label: data?.label || name,
    show: data?.always_show || false
  };
}
