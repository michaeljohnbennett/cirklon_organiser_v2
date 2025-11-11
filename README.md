# Cirklon Organizer v2

Modernised Svelte/Vite rewrite of the Cirklon instrument organiser, updated for Cirklon v2 workflows and firmware changes.

## Live Demo

- https://michaeljohnbennett.github.io/cirklon_organiser_v2/

## Highlights

- Folder-style instrument tabs with live badge counts for CCs, track controls, and row definitions.
- MIDI CC table tools: template library, cross-instrument copy, merge/replace workflows, and bulk delete safeguards.
- Track control warnings that preserve existing mappings during CC imports.
- Session import/export that preserves naming, MIDI port/channel, row definitions, and track control assignments.
- Session names auto-sync with imported filenames for clearer context while editing.
- Responsive layout updates to keep long CC lists, sliders, and forms ergonomic across screen sizes.

## Local Development

```bash
npm install
npm run dev
```

- Development server: http://localhost:5173 (Vite).
- Build for production: `npm run build`.
- Preview production build: `npm run preview`.

## Tech Stack

- [Svelte](https://svelte.dev/) + [Vite](https://vitejs.dev/)
- [Spectre.css](https://picturepan2.github.io/spectre/) for base styling
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) for browser downloads

## Credits

- Based on the original [Cirklon Instrument Editor](https://github.com/samdoshi/cirklon-instrument-editor) by Sam Doshi.
- Fork lineage from the community project at https://gitlab.com/cirklon-community/cirklon-organizer.