# Handoff prompt: continue vocal-coach game research & implementation

**Use this file as the single prompt** for other agents (Claude, Codex, Cursor, etc.). Attach or `@` this path from the repo:

`docs/research/AGENT_HANDOFF_CONTINUE_RESEARCH.md`

Also attach the existing pack:

`docs/research/VOCAL_COACH_GAME_RESEARCH_PACK.md`

---

## Project context (read first)

- **Product:** Velocity — a **vocal-coach game**, not a flight simulator. A plane moves **left automatically**; **pitch/voice** steers **vertically**. Players pass **gates** tied to musical targets.
- **Stack:** TypeScript, Pixi.js, Vite. Charts live in `src/data/charts.ts` (and `songsCore.ts`). Gates: `src/levels/LevelGenerator.ts`, `src/engine/systems/GatePassSystem.ts`, `LevelSystem`.
- **Goal:** **Improve the current game** — more unique charts, harmony-oriented stages, progression that reflects **learning** (pitch mastery, consistency, recovery), without pretending one mic measures everything.
- **Non-goals:** Replacing the whole game; medical/voice therapy claims; stereotyping regional styles.

---

## What is already done

The file **`docs/research/VOCAL_COACH_GAME_RESEARCH_PACK.md`** contains:

- Executive summary (mechanics + risks)
- Draft **skill graph** table
- **12 harmony archetypes** (single-singer friendly)
- **Chart taxonomy** proposal
- Mic / F0 **reality check**
- Mapping to existing codebase sections

Your job is to **extend and deepen** that work, then (when asked) **implement** in small, reviewable steps.

---

## Agent roles (split work)

### Role A — Researcher / synthesist (e.g. Claude)

**Input:** Both MD files above + optional web access.

**Output:** Update **`docs/research/VOCAL_COACH_GAME_RESEARCH_PACK.md`** *or* add new files under `docs/research/` (e.g. `VOCAL_RESEARCH_PHASE2_CITATIONS.md`) so nothing is lost.

**Deliverables:**

1. **Bibliography upgrade** — Replace blog-heavy pointers with **primary or peer-reviewed** sources where possible: voice pedagogy texts (e.g. McKinney, Miller, textbooks used in studios), **Journal of Singing** / NATS-adjacent summaries, motor learning / feedback studies relevant to **singing + visual or delayed feedback**.
2. **Expand skill graph** to **40–60 rows** or a **compact JSON/YAML** appendix (`docs/research/skill_graph.v1.yaml`) with the same columns as the pack’s table.
3. **Harmony bible** — For each of the 12 archetypes, add: **prerequisite charts**, **headphones required?**, **scoring pseudocode**, **known failure cases** from pedagogy.
4. **Mic & environment** — Short table: phone mic vs earbuds vs USB — **expected failure modes** (octave jump, noise) and **UX mitigations** (copy + settings).
5. **Explicit “do not claim” list** for player-facing strings (breath support, vibrato quality, etc.).

**Constraints:**

- No fabricated citations — if unsure, mark **TBD** and suggest search terms.
- Respect **cultural context** notes; no lazy regional stereotypes in example content.

---

### Role B — Engineer / Codex (code + data)

**Input:** The same MD files + `src/data/songsCore.ts`, `src/data/charts.ts`, `src/player/CareerProgress.ts`, `src/main.ts` (only as needed).

**Output:** Small PR-sized commits on the working branch.

**Deliverables (pick in order; do not do everything in one giant diff):**

1. **Schema extension** — Add optional fields to `Song` in `songsCore.ts` aligned with the taxonomy: e.g. `lessonType`, `primarySkill`, `secondarySkills`, `harmonyRole`, `registerFocus`, `educationalCopyId` (all optional for backward compatibility).
2. **Content batch 1** — Add **10–20 new unique charts** in `charts.ts` using the new tags, spanning training / vsAi / p2p / tour as appropriate, with varied note patterns (reuse `notesSpread` / `notesWave` or add small helpers).
3. **Harmony-oriented charts (no new audio engine required yet)** — Charts tagged `lessonType: 'harmony_static'` with **longer hold gates** and subtitles that instruct: *“Sing a stable harmony pitch; guide track coming in a later build.”* Gate data remains pitch-vs-time as today.
4. **Progress display hook (minimal)** — If low-risk: surface **one** learning metric in `PlayerStatsRoot` or stats storage (e.g. rolling count of `LEVEL_COMPLETE` per `primarySkill`) using `localStorage`. If schema not ready, **skip** and document the ticket in `docs/research/TICKETS_BACKLOG.md`.

**Constraints:**

- Match existing code style; **no drive-by refactors**.
- Every new field optional; existing charts must compile unchanged.
- Run **`npm run build`** before committing.

---

## Shared rules for all agents

1. **Branch:** Work on the project’s current feature branch (e.g. `cursor/game-implementation-audit-e92f`) unless the user says otherwise.
2. **Commits:** Small, descriptive messages; push when the user’s workflow requires it.
3. **Docs only vs code:** Research expansions can be **docs-only**; implementation is **separate commits**.
4. **After Role A finishes:** Role B should read the **updated** research files before changing types or content names.

---

## Success criteria (definition of done for this handoff cycle)

- [ ] Research pack **Phase 2** has stronger citations or a clear **TBD** list with search terms.
- [ ] Skill graph is **machine-readable** or **expanded** for content generation.
- [ ] Code: `Song` supports taxonomy fields; **≥10** new charts merged; build passes.
- [ ] Optional: one **visible** progression hint tied to skills (or a written ticket if deferred).

---

## One-line instruction you can paste if nothing else fits

> Open `docs/research/AGENT_HANDOFF_CONTINUE_RESEARCH.md` and `docs/research/VOCAL_COACH_GAME_RESEARCH_PACK.md`, follow your assigned role (A = research, B = code), extend the research pack with citations and a larger skill graph, then extend `Song` and add new tagged charts in `charts.ts`; keep changes incremental and run `npm run build`.

---

*Created for multi-agent continuation — Velocity vocal-coach game.*
