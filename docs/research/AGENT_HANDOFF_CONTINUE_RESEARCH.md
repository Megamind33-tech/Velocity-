# Handoff prompt: continue vocal-coach game research & implementation

Use this file as the single prompt for follow-on agents working on Velocity's learning progression.

Attach or reference:

- `docs/research/AGENT_HANDOFF_CONTINUE_RESEARCH.md`
- `docs/research/VOCAL_COACH_GAME_RESEARCH_PACK.md`
- `docs/research/skill_graph.v1.yaml`

---

## Project context

- Product: Velocity is a vocal-coach game, not a flight simulator.
- Current branch reality: gameplay content lives in `src/data/songs.ts`; gates are generated in `src/levels/LevelGenerator.ts`; runtime progression is handled by `src/engine/systems/LevelSystem.ts` and `src/main.ts`.
- Goal: improve the existing game with more levels, learning-aware chart pacing, and progression that feels like practice and review rather than a one-song demo.
- Non-goals: replacing the game loop, making medical claims, or introducing unsupported mic-analysis promises.

---

## What this branch now contains

- A research pack upgraded with stronger citations, device guidance, and explicit "do not claim" copy rules.
- A machine-readable skill graph in YAML for future content generation.
- An expanded in-game curriculum in `src/data/songs.ts`.
- Existing runtime progression updated to step through those charts sequentially using the current ECS architecture.

---

## Recommended next roles

### Role A — Research / content synthesis

Read the research pack and skill graph, then deepen any gaps still marked as `TBD`.

Deliverables:

1. Replace remaining secondary-source placeholders with primary or peer-reviewed citations where possible.
2. Extend the skill graph with style-specific modules if the game adds genre branches.
3. Add a chart authoring guide that maps each skill to note-pattern templates in the current `songs.ts` format.
4. Keep all player-facing phrasing honest about what a single microphone can and cannot infer.

### Role B — Engineer / content implementation

Work only in the existing files on this branch unless the user asks for broader scope.

Deliverables in order:

1. Add more tagged charts in `src/data/songs.ts` using the current optional schema.
2. If needed, tune `src/levels/LevelGenerator.ts` for additional lesson types while keeping backward compatibility.
3. Expand HUD or world-map progression only if it remains low-risk and tied to the current ECS systems.
4. Run `npm run lint` and `npm run build` before committing.

---

## Constraints

- No drive-by refactors.
- Keep optional song metadata backward-compatible.
- Do not claim to measure breath support, vibrato quality, resonance quality, diagnosis, or vocal health from the current mic pipeline.
- Prefer small commits and test after each meaningful gameplay/content iteration.

---

## Success criteria for the next continuation

- Research docs stay ahead of the implementation and remain trustworthy.
- New charts map clearly onto learning goals.
- The current branch keeps compiling and the run loop still advances through the curriculum cleanly.
