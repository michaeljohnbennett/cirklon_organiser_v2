// Model classes and factory functions for Cirklon Organizer

export function createInstrument(data = null, name = '') {
  return {
    name: name || 'New Instrument',
    midiPort: data?.midiPort || '1',
    midiChannel: data?.midiChannel || 1,
    continuousControls: data?.continuousControls || [],
    trackControls: data?.trackControls || Array(6).fill(null).map(() => createTrackControl()),
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
    max: data?.max !== undefined ? data.max : 127
  };
}

export function createTrackControl(data = null, continuousControl = null) {
  const control = {
    name: data?.name || '',
    continuousControl: continuousControl || null,
    trackValue: data?.track_control || '',
    option: 'Empty'
  };

  if (data) {
    if (data.hasOwnProperty('MIDI_CC')) {
      control.option = 'MIDI CC';
    } else if (data.hasOwnProperty('track_control')) {
      control.option = 'Track CTRL';
      control.trackValue = data.track_control;
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
