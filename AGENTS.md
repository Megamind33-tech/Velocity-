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

Core gameplay uses browser microphone access (`getUserMedia`). If the mic is unavailable (e.g. headless/cloud), the app automatically falls back to **Demo Mode** which auto-pilots the plane. Every level has a "Demo" button for mic-free play. The complete game loop (World → Song → Level → Gameplay → Results → Profile) works fully in demo mode.

### Game architecture

- `GameEngine.tsx`: Canvas-based game loop. Generates procedural note sequences per song/level, renders waypoints (Mode A) or contour lines (Mode C), handles hit detection, combo, scoring, particles, countdown, and demo auto-pilot.
- `App.tsx`: Central state manager. Routes between screens, manages profile/XP/challenge updates after gameplay.
- Songs data in `songs-extended.ts`: 150+ songs across 5 worlds, Zambian songs in every world.
- Profile persisted to `localStorage` via `profile.ts`.
