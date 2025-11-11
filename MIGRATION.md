# Cirklon Organizer v2 - Svelte Migration

This branch contains the migration from Knockout.js to Svelte.

## Development

### Prerequisites
- Node.js 18+ and npm

### Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## What Changed

### Framework Migration
- **Before**: Knockout.js with jQuery-like observables
- **After**: Svelte with reactive stores and component-based architecture

### Project Structure
```
src/
├── App.svelte              # Main application component
├── main.js                 # Application entry point
├── app.css                 # Global styles
├── components/             # Svelte components
│   ├── Header.svelte
│   ├── Toolbar.svelte
│   ├── InstrumentSelector.svelte
│   ├── ImportModal.svelte
│   └── tabs/
│       ├── SettingsTab.svelte
│       ├── MidiCCTab.svelte
│       ├── TrackControlTab.svelte
│       └── RowDefinitionsTab.svelte
├── stores/                 # Svelte stores (state management)
│   └── session.js
└── lib/                    # Utilities
    ├── models.js           # Data model constructors
    └── fileHandlers.js     # CKI parsing and file I/O
```

### Key Improvements
- ✅ Modern build tooling (Vite)
- ✅ Component-based architecture
- ✅ Better TypeScript support (if needed)
- ✅ Smaller bundle size
- ✅ Faster reactivity
- ✅ Better developer experience

### Preserved Features
- All CKI file parsing logic
- FileSaver.js for file exports
- Spectre.css for UI styling
- Sortable.js for drag-and-drop
- All existing functionality

## Deployment

The app deploys automatically to GitHub Pages when pushed to `master` or `feature/svelte-migration` branch.

The GitHub Actions workflow:
1. Installs dependencies
2. Runs `npm run build`
3. Deploys the `dist/` folder to GitHub Pages

## Migration Notes

### Breaking Changes
None - the app maintains the same functionality and file format compatibility.

### File Format
The `.CKI` file format remains unchanged. Existing session files will work with the new version.

### Browser Support
- Modern browsers with ES6 module support
- Same browser requirements as before

## Testing Checklist

- [ ] Import CKI files
- [ ] Create new instruments
- [ ] Edit instrument settings
- [ ] Add/edit MIDI CCs
- [ ] Add/edit track controls
- [ ] Add/edit row definitions
- [ ] Save session to JSON
- [ ] Load session from JSON
- [ ] Export CKI files
- [ ] Drag-and-drop reordering

## Original App

The original Knockout.js version is preserved in:
- `app.js` (original application logic)
- `index-old.html` (original HTML template)

## Questions?

See the [original README](README.md) for application usage documentation.
