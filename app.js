'use strict';

const CirklonAllowedCharacters = "[-A-Za-z0-9()#. $@!&+{}*]";
const CirklonEmpty = 'Empty';
const CirklonContinuousControl = 'MIDI CC';
const CirklonTrackCtrl = 'Track CTRL';
const trackValues = ['pgm', 'quant%', 'note%', 'noteC', 'velo%', 'veloC', 'leng%', 'tbase', 'xpos', 'octave', 'knob1', 'knob2', 'fts-R', 'fts-S', 'reich'];
const midiPortValues = ['1', '2', '3', '4', '5', 'usb1', 'usb2', 'usb3', 'usb4', 'usb5'];

var RowDefinitionEditor = function(rowDefinition) {
	var self = this;
	self.rowDefinition = ko.observable(rowDefinition || new RowDefinition());
}

var RowDefinition = function(data, name) {
	var self = this;

	self.name = ko.observable(name || 'C 3');
	self.label = ko.observable(data ? data['label'] || 'C 3' : 'C 3');
	self.show = ko.observable(data ? data['always_show'] || false : false);

	return this;
}

var TrackControlEditor = function(trackControl) {
	var self = this;
	self.controlOptions = ko.observableArray([CirklonEmpty, CirklonContinuousControl, CirklonTrackCtrl]);
	self.trackControl = ko.observable(trackControl);
	self.trackValues = ko.observableArray(trackValues);
}

var TrackControl = function(data, continuousControl) {
	var self = this;

	self.name = ko.observable('');
	self.continuousControl = ko.observable();
	self.trackValue = ko.observable('');
	self.option = ko.observable(CirklonEmpty);

	if(continuousControl) {
		self.continuousControl(continuousControl);
	}

	if(data) {
		if(data.hasOwnProperty('MIDI_CC')) {
			self.option(CirklonContinuousControl);
		}

		if(data.hasOwnProperty('track_control')) {
			self.option(CirklonTrackCtrl);
			var keys = Object.keys(data);
			if (keys.indexOf('track_control') > -1) {
				self.trackValue(data['track_control']);
			}
		}
	}

	self.fullName = ko.pureComputed(function() {
		if (self.option() == CirklonEmpty)
			return ' ';
		else if (self.option() == CirklonContinuousControl)
			return 'CC #' + self.continuousControl().cc();
		else if (self.option() == CirklonTrackCtrl)
			return 'CTRL';
		return 'Unknown';
	}, self);

	self.Value = ko.pureComputed(function() {
		if (self.option() == CirklonEmpty)
			return ' ';
		else if (self.option() == CirklonContinuousControl)
			return self.continuousControl().name();
		else if (self.option() == CirklonTrackCtrl)
			return self.trackValue();
		return 'Unknown';
	}, self);

	self.isValid = ko.computed({
		read: function() {
			if (self.option() == CirklonEmpty)
				return true;
			else if (self.option() == CirklonContinuousControl)
				return self.continuousControl != null;
			else if (self.option() == CirklonTrackCtrl)
				return self.isTrackValueValid();
			return 'Unknown';
			
		},
		deferEvaluation: true
	});

	self.isNameValid = ko.computed({
		read: function() {
			var regex = new RegExp('^' + CirklonAllowedCharacters + '{0,6}$');
			return regex.test(self.name());
		},
		deferEvaluation: true
	});

	self.isTrackValueValid = ko.computed({
		read: function() {
			return self.trackValue().length > 0;
		},
		deferEvaluation: true
	});

	return this;
};

var ContinuousControlEditor = function(continuousControl) {
	var self = this;
	self.continuousControl = ko.observable(continuousControl || new ContinuousControl());
}

var ContinuousControl = function(data, num) {
	var self = this;

	self.data = data || {};
	self.cc = ko.observable(num || 1);
	self.name = ko.observable(data ? data['label'] || '' : '');
	self.min = ko.observable(data ? data['min_val'] || 0 : 0);
	self.max = ko.observable(data ? data['max_val'] || 127 : 127);
	self.start = ko.observable(data ? data['start_val'] || 0 : 0);

	self.label = ko.computed(function(){
		return self.cc() + ' ' + self.name();
	});

	return this;
}

var Settings = function(data, name) {
	var self = this;

	self.name = ko.observable(name || 'Inst');
	self.midiPort = ko.observable(data ? data['midi_port'] || '1' : '1');
	self.midiChannel = ko.observable(data ? data['midi_chan'] || 1 : 1);
	self.presend_pgm = ko.observable(data ? data['presend_pgm'] || false : false);
	self.default_note = ko.observable(data ? data['default_note'] || 'C 3' : 'C 3');
	self.default_patt = ko.observable(data ? data['default_patt'] || 'P3' : 'P3');
	self.poly_spread = ko.observable((data ? data['poly_spread'] || false : false) == 'on' ? true : false);
	self.no_bankL = ko.observable(data ? data['no_bankL'] || false : false);
	self.no_bankM = ko.observable(data ? data['no_bankM'] || false : false);
	self.no_xpose = ko.observable(data ? data['no_xpose'] || false : false);
	self.no_fts = ko.observable(data ? data['no_fts'] || false : false);
	self.show_note_nums = ko.observable(data ? data['show_note_nums'] || false : false);
	self.multi = ko.observable(data ? data['multi'] || false : false);
	self.no_thru = ko.observable(data ? data['no_thru'] || false : false);

	self.midiPortValues = ko.observableArray(midiPortValues);

	self.isNameValid = ko.computed({
		read: function() {
			var regex = new RegExp('^' + CirklonAllowedCharacters + '{1,9}$');
			return regex.test(self.name());
		},
		deferEvaluation: true
	});

	self.isMidiPortValid = ko.computed({
		read: function() {
			var regex = new RegExp('^[1-6]$');
			return regex.test(self.midiPort());
		},
		deferEvaluation: true
	});

	self.isMidiChannelValid = ko.computed({
		read: function() {
			var regex = new RegExp('^([1-9]|1[0-6])$');
			return regex.test(self.midiChannel());
		},
		deferEvaluation: true
	});

	self.isDefaultNoteValid = ko.computed({
		read: function() {
			return self.default_note().length > 0;
		},
		deferEvaluation: true
	});

	self.isDefaultPattValid = ko.computed({
		read: function() {
			return self.default_patt().length > 0;
		},
		deferEvaluation: true
	});

	self.isValid = ko.computed({
		read: function() {
			return self.isNameValid() && self.isMidiPortValid() && self.isMidiChannelValid();
		}
	});

	return this;
}

var Instrument = function(data, name) {
	var self = this;

	self.data = data || {};
	self.name = name || '';
	self.settings = ko.observable(new Settings(data, name))
	self.continuousControls = ko.observableArray([]);
	self.continuousControlSelected = ko.observable();
	self.continuousControlEditor = ko.observable(new ContinuousControlEditor());
	self.trackControls = ko.observableArray([]);
	self.trackControlSelected = ko.observable();
	self.trackControlEditor = ko.observable();
	self.rowDefinitions = ko.observableArray([]);
	self.rowDefinitionSelected = ko.observable();
	self.rowDefinitionEditor = ko.observable(new RowDefinitionEditor());

	self.trackValues = ko.observableArray(trackValues);
	
	if(data && data.hasOwnProperty('CC_defs')) {
		var ccs = [], ccdefs = data['CC_defs'];
		for (var i in ccdefs) {
			var ccdef = ccdefs[i];
			var ccnum = i.match(/\d+/g).map(Number);
			ccs.push(new ContinuousControl(ccdef, ccnum));
		}
		self.continuousControls = ko.observableArray(ccs);
	}

	if(data && data.hasOwnProperty('track_values')) {
		var trs = [], trVs = data['track_values'], map = {};

		var max = 0;
		for (var i in trVs) {
			var tr = trVs[i];
			var trnum = i.match(/\d+/g).map(Number);

			var keys = Object.keys(tr);
			if (keys.indexOf('MIDI_CC') > -1) {
				var cc = ko.utils.arrayFirst(self.continuousControls(), function(item) {
					return item.cc() == parseInt(tr['MIDI_CC']);
				});
				if(!cc) {
					var cc = new ContinuousControl( { label: tr['label'] }, parseInt(tr['MIDI_CC']));
					self.continuousControls.push(cc);
				}
				map[trnum] = new TrackControl(tr, cc);
			} else {
				
				map[trnum] = new TrackControl(tr, cc);
			}

			max = Math.max(trnum, max);
		}

		var rows = Math.ceil(max / 6);
		var slots = rows * 6;

		for (var i = 1; i <= slots; i++) {
			trs.push(map[i] ? map[i] : new TrackControl());
		}

		self.trackControls(trs);
	}

	if(data && data.hasOwnProperty('row_defs')) {
		var rds = [], rowDefs = data['row_defs'];
		for (var i in rowDefs) {
			rds.push(new RowDefinition(rowDefs[i], i));
		}
		self.rowDefinitions = ko.observableArray(rds);
	}

	self.selectTrackControl = function(trackControl) {
		if(self.trackControlSelected() == trackControl) {
			self.trackControlSelected(null);
			self.trackControlEditor(new TrackControlEditor(new TrackControl()));
		} else {
			self.trackControlSelected(trackControl);
			self.trackControlEditor(new TrackControlEditor(trackControl));
		}
	}

	self.newTrackControlPage = function() {
		for (var i = 0; i < 6; i++) {
			self.trackControls.push(new TrackControl());
		}
	}

	self.deleteLastTrackControlPage = function() {
		var count = self.trackControls().length;
		self.trackControls.splice(Math.min(count - 6, count), 6);
	}

	self.newContinuousControl = function() {
		var continuousControl = self.continuousControlEditor().continuousControl();
		var hasCC = ko.utils.arrayFirst(self.continuousControls(), function(item) {
			return item.cc() == continuousControl.cc();
		});
		if(!hasCC) {
			self.continuousControls.push(continuousControl);
			self.continuousControlEditor(new ContinuousControlEditor());
		} else {
			var check = window.confirm("Continuous control allready defined!");
			//TODO
		}
	}

	self.selectContinuousControl = function(continuousControl) {
		if(self.continuousControlSelected() == continuousControl) {
			self.continuousControlSelected(null);
			self.continuousControlEditor(new ContinuousControlEditor());
		} else {
			self.continuousControlSelected(continuousControl);
			self.continuousControlEditor(new ContinuousControlEditor(continuousControl));
		}
	}

	self.deleteContinuousControl = function() {
		if(self.continuousControlSelected()) {
			self.continuousControls.remove(self.continuousControlSelected());
			self.continuousControlSelected(null);
			self.continuousControlEditor(null);
		}
	}

	self.sortContinuousControls = function(type, data) {
		if(self.continuousControls()) {
			if(type === 'cc') {
				self.continuousControls.sort(function(left, right) { 
					return left.cc() == right.cc() ? 0 : (parseInt(left.cc()) < parseInt(right.cc()) ? -1 : 1) 
				});
			} else if(type === 'name') {
				self.continuousControls.sort(function(left, right) { 
					return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1) 
				});
			}
		}
	}

	self.newRowDefinition = function() {
		var rowDefinition = self.rowDefinitionEditor().rowDefinition();
		self.rowDefinitions.push(rowDefinition);
		self.rowDefinitionEditor(new RowDefinitionEditor());
	}

	self.editRowDefinition = function(rowDefinition) {
		if(self.rowDefinitionSelected() == rowDefinition) {
			self.rowDefinitionSelected(null);
			self.rowDefinitionEditor(new RowDefinitionEditor());
		} else {
			self.rowDefinitionSelected(rowDefinition);
			self.rowDefinitionEditor(new RowDefinitionEditor(rowDefinition));
		}
	}

	self.deleteRowDefinition = function() {
		if(self.rowDefinitionSelected()) {
			self.rowDefinitions.remove(self.rowDefinitionSelected());
			self.rowDefinitionSelected(null);
			self.rowDefinitionEditor(new RowDefinitionEditor());
		}
	}

	return this;
}

var Session = function(name) {
	var self = this;

	self.name = ko.observable(name || 'New session');
	self.instruments = ko.observableArray([]);
	self.selectedInstrument = ko.observable();

	self.newSession = function() {
		self.name('New Session');
		self.instruments([]);
		self.selectedInstrument(null);
	}.bind(this);

	self.newInstrument = function() {
		var length = self.instruments().length;
		var instrument = new Instrument(null, 'CKInst' + length);
		self.instruments.push(instrument);
		self.selectedInstrument(instrument);
	};

	self.deleteSelectedInstrument = function() {
		if(self.selectedInstrument()) {
			self.instruments.remove(self.selectedInstrument());
			if(self.instruments().length > 0)
				self.selectedInstrument(self.instruments()[0]);
			else
				self.selectedInstrument(null);
		}
	};

	self.openSession = function(data) {
		self.newSession();

		if(!data.hasOwnProperty('instrument_data')) {
			window.confirm("This not a valid Cirklon session!");
			return;
		}

		var instData = data['instrument_data'];
		for (var i in instData) {
			self.importInstrument(instData[i], i);
		};
	};

	self.saveSession = function() {
	};

	self.importInstrument = function(data, name) {
		var instrument = null;
		try {
			instrument = new Instrument(data, name);
		} catch (e) {
			console.log(e);
		} finally {
			self.instruments.push(instrument);
		}
		self.selectedInstrument(instrument);
	}

	return this;
}

var ViewModel = function() {
	var self = this;

	self.session = ko.observable(new Session());
	self.importInstrumentKey = ko.observable('');
	self.importInstrumentKeys = ko.observableArray([]);
	self.instrumentKeys = ko.observableArray([]);

	self.uploadSession = function(data, event) {
		var reader = new FileReader();
		var files = event.target.files;
		if (files.length < 1) {
			window.confirm("Something wrong here!"); 
			return;
		}

		if(files.length > 1) {
			window.confirm("Only single file upload allowed!"); 
			return;
		}

		reader.onload = function(e) {
			var json = JSON.parse(e.target.result);
			//TODO
			self.session().openSession(json);
		}

		reader.readAsText(files[0]);
	}

	self.uploadInstrument = function(data, event) {
		var reader = new FileReader();
		var files = event.target.files;
		if (files.length < 1) {
			window.confirm("Something wrong here!"); 
			return;
		}

		if(files.length > 1) {
			window.confirm("Only single file upload allowed!"); 
			return;
		}

		reader.onload = function(e) {
			var json = JSON.parse(e.target.result);
			if(!json.hasOwnProperty('instrument_data')) {
				window.confirm("This not a valid Cirklon instrument!"); 
				return;
			}

			var data = json['instrument_data'];
			var instrumentKeys = Object.keys(data);
			var instrumentCount = instrumentKeys.length;

			if(instrumentCount === 0) {
				window.confirm("This not a valid Cirklon instrument!"); 
				return;
			} 

			self.instrumentJSON = json;
			self.importInstrumentKeys(instrumentKeys);
			self.importInstrumentKey(instrumentCount === 1 ? instrumentKeys[0] : '');

			window.location.hash = '#importInstrumentSelection';
		}

		reader.readAsText(files[0]);
	}

	self.importSelectedInstrument = function() {
		var data = self.instrumentJSON.instrument_data;
		var instrument = data[self.importInstrumentKey()];
		var name = self.importInstrumentKey();
		if(instrument && name) {
			self.importInstrument(instrument, name);
		} else {
			window.confirm("Something wrong!"); 
		}		

		self.importInstrumentKey('');
		window.location.hash = null;
	}

	self.importInstrument = function(data, name) {
		//TODO check if allready there
		if(self.session()) {
			self.session().importInstrument(data, name);
		}
	}
	
	self.newSession = function() {
		if(self.session()) {
			self.session().newSession();
		}
	}

	self.exportInstrument = function() {
		if(!self.session()) {
			window.confirm("Nothing to export!"); 
			return;
		}

		if(!self.session().selectedInstrument()) {
			window.confirm("No instruments to export here!"); 
			return;
		}

		var instrumentsData = { instrument_data: {} };
		var instrumentsObject = instrumentsData['instrument_data'] = {};

		var instrument = self.session().selectedInstrument();
		var inst = self.getInstrumentData(instrument);
		instrumentsObject[inst.name] = inst.data;
		self.save(instrumentsData, inst.name + '.CKI');
	}

	self.getInstrumentData = function(instrument) {
		var inst = {};
		var ccs = inst['CC_defs'] = {};
		var trs = inst['track_values'] = {};

		var settings = instrument.settings();
		var name = settings.name();

		var continuousControls = instrument.continuousControls();
		ko.utils.arrayForEach(continuousControls, function (continuousControl) {
			var cc = {};
			var ccName = "CC_" + continuousControl.cc();

			cc['label'] = continuousControl.name();
			cc['min_val'] = Number(continuousControl.min());
			cc['max_val'] = Number(continuousControl.max());
			cc['start_val'] = Number(continuousControl.start());

			ccs[ccName] = cc;
		});

		var trackControls = instrument.trackControls();
		ko.utils.arrayForEach(trackControls, function (trackControl, index) {
			var tr = {};
			var slot = 'slot_' + (index + 1);
			var option = trackControl.option();

			if(option == CirklonTrackCtrl) {
				tr['track_control'] = trackControl.trackValue();
				trs[slot] = tr;

			} else if(option == CirklonContinuousControl) {
				tr['MIDI_CC'] = Number(trackControl.continuousControl().cc());
				tr['label'] = trackControl.continuousControl().name();
				trs[slot] = tr;
			}
		});

		inst['midi_port'] = settings.midiPort();
		inst['midi_chan'] = Number(settings.midiChannel());
		inst['multi'] = Boolean(settings.multi());
		inst['presend_pgm'] = settings.presend_pgm();
		inst['default_note'] = settings.default_note();
		inst['default_patt'] = settings.default_patt();
		inst['poly_spread'] = settings.poly_spread() ? 'on' : 'off';
		inst['no_bankL'] = settings.no_bankL();
		inst['no_bankM'] = settings.no_bankM();
		inst['no_xpose'] = settings.no_xpose();
		inst['no_fts'] = settings.no_fts();
		inst['show_note_nums'] = settings.no_fts();
		inst['no_thru'] = settings.no_thru();

		return { data: inst, name: name };
	}

	self.saveSession = function() {
		if(!self.session()) {
			window.confirm("Nothing to export!"); 
			return;
		}

		if(self.session().instruments().length == 0) {
			window.confirm("No instruments to export here!"); 
			return;
		}

		var instrumentsData = { instrument_data: {} };
		var instrumentsObject = instrumentsData['instrument_data'] = {};

		var instruments = self.session().instruments();
		ko.utils.arrayForEach(instruments, function (instrument) {
			var inst = self.getInstrumentData(instrument);
			instrumentsObject[inst.name] = inst.data;
		});

		self.save(instrumentsData, 'INSTS.CKI');
	}

	self.save = function(data, name) {
		try {
			var output = JSON.stringify(data, null, '\t');  
			var blob = new Blob([output], { 'type': 'text\/plain;charset=' + document.characterSet });
			window.saveAs(blob, name || 'INSTS.CKI');
		} catch (e) {
			console.log(e);
		} finally {
			return true;
		}

		return false;
	}
};

function getNode (element) {
	var i = element.length;
	while (i--) {
		if (element[i].nodeType == 1) {
			return element[i];
		}
	}
	return element;
}

ko.observableArray.fn.swap = function(index1, index2) {
	this.valueWillMutate();
	var temp = this()[index1];
	this()[index1] = this()[index2];
	this()[index2] = temp;
	this.valueHasMutated();
}

ko.bindingHandlers.foreachsort = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
		var array = ko.utils.unwrapObservable(valueAccessor());
		var extendedContext = context.extend({"$length" : array.length });
		return ko.bindingHandlers.foreach.init(element, valueAccessor, allBindingsAccessor, viewModel, extendedContext);
	},
	update: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
		var value = ko.unwrap(valueAccessor());
		var newValue = function () {
			return {
				data: value,
				afterRender: function (el, data) {
					sortable(getNode(el), function(a, b) {
						valueAccessor().swap(a, b);
					});
				}
			};
		};

		ko.bindingHandlers.foreach.update(element, newValue, allBindingsAccessor, viewModel, context);
		return { controlsDescendantBindings: true };
	}
};

document.addEventListener("DOMContentLoaded", function(event) {
	ko.applyBindings(new ViewModel());
});
