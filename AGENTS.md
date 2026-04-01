# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Velocity is a client-side-only SPA (React 19 + Vite 6 + TypeScript + Tailwind CSS v4). There is no backend, no database, and no external API calls wired up. All persistence uses browser `localStorage`.

### Commands

Standard commands are in `package.json`:
- **Dev server:** `npm run dev` (Vite on port 3000, host 0.0.0.0)
- **Lint:** `npm run lint` (runs `tsc --noEmit`)
- **Build:** `npm run build` (Vite production build)
- **Preview:** `npm run preview` (serves the production build)

### Known issues

- `npm run lint` exits with pre-existing TypeScript errors in `src/App.tsx` (missing props on several component usages). These are not regressions — they exist on `main`.
- The `express`, `@google/genai`, and `dotenv` packages in `package.json` are unused dead dependencies (artifacts from the AI Studio template). Do not remove them without user request.
- The `GEMINI_API_KEY` env var is configured in `vite.config.ts` but never consumed by any source file.

### Gameplay testing

Core gameplay requires browser microphone access (`getUserMedia`). In headless/cloud environments the "PLAY NOW" button may not launch a game session because the microphone permission prompt cannot be granted. All other navigation and UI features work without a microphone.
