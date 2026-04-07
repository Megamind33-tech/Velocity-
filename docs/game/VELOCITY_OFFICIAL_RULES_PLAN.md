# Velocity — Official Game Rules Implementation Plan

This document maps the **Vocal Flight** specification to repository work, in **execution order**. Implementation lives in TypeScript (PixiJS v8 + ECS); HUD remains Pixi-based (not React).

---

## Phase 0 — Baseline audit (done before coding)

| Area | Current state | Spec target |
|------|----------------|-------------|
| Pitch → altitude | `VoiceInputSystem` + MIDI 55–79 | Higher pitch = higher Y (keep) |
| Silence | ~95 px/s sink | **2 px/frame @ 60fps ≈ 120 px/s** |
| Volume | `VOICE_FLIGHT.VOLUME_GATE` only | **Volume gates** open gap by RMS |
| Gates | Single rectangle sprite | **Pitch rings** + **volume pillars** with gap |
| Collision | Bounds only | **Gap collision** + bounds |
| Scoring | +100 × combo every **3** gates | Combo every **5** gates, **perfect** bonus |
| Speed | `scrollSpeed` / audio-derived | **BPM beats-to-cross** + **dynamic scaling** |
| Parallax | `worldLock` + light Y wobble | **Visor 3-layer** scale/speed/fog + **altitude Y shift** |
| Fail | Bounds crash | Hard: **breath penalty** at bounds; **crash particles** |

---

## Phase 1 — Single source of truth for tuning

**Deliverable:** `src/game/vocalFlightRules.ts`

- Difficulty table: spawn interval (frames), gap px, beats-to-cross, score multiplier, breath penalty frames.
- Perfect hit: **30 px** from gap center, **15 cents** pitch deviation.
- Volume gate: RMS open range **0.12–0.22** mapped to gap lerp; closed gap floor **28 px**.
- Combo: multiplier tier every **5** passes, cap **4×**.
- Perfect streak: exponential bonus factor (e.g. `1 + streak * 0.15` capped).
- Collectibles: gold **+500**, purple **+1** combo tier (capped).
- Dynamic speed: scale cruise vx by score, distance, perfect streak; damp on low combo / silence.

**Risk:** Tuning passes needed after playtest; all constants in one file.

---

## Phase 2 — Data model: gates & level definitions

**Deliverable:** `GateComponent`, `LevelGate`, `LevelDefinition`, `LevelGenerator`

- `LevelDefinition.difficulty?: 'easy' | 'medium' | 'hard'` (default **`medium`** for existing levels).
- `LevelGate`: `kind: 'pitch' | 'volume'`, `gapMaxPx`, `targetMidi`, `x`, `y`, `width`.
- Generator: assign **~1 volume gate every 4th** note (deterministic hash); `gapMaxPx` from difficulty.
- Timeline: optional BPM-based spacing using `beatsToCross * (60/BPM)` seconds between spawns when song has `bpm` (still respects `prepareNoteTimeline` end time).

---

## Phase 3 — Rendering & runtime gate behavior

**Deliverable:** `LevelSystem.spawnGate`, `VolumeGateSystem`

- **Pitch gate:** `Graphics` — top + bottom obstacle bars; vertical opening = `gapMaxPx` centered at `y`.
- **Volume gate:** same geometry; `VolumeGateSystem` updates **effective gap** from mic RMS (smooth lerp).
- **Collectibles:** `kind` on `GateComponent` or separate `CollectibleComponent`; small circle sprite, no collision death — **pickup system**.

---

## Phase 4 — Collision & pass detection

**Deliverable:** `GateCollisionSystem`, updates to `GatePlayoutSystem`

- When `playerLogicalX` in `[gate.logicalX - halfThickness, gate.logicalX + halfThickness]`:
  - If `|playerY - gapCenterY| > gapEffective/2 + playerRadius` → **CRASH**.
- **Pass:** centerline crossed with plane inside gap → mark passed (same as today), compute **perfect** (distance + cents), emit enriched `GATE_PASSED` payload.

---

## Phase 5 — Scoring & events

**Deliverable:** `main.ts` handlers, optional `GameEvents` extension

- Base points × difficulty score mult × combo mult.
- Perfect: apply streak multiplier; optional `GATE_PERFECT` event for VFX hook.
- Collectible pickup: score / combo bump.

---

## Phase 6 — Movement, silence, breath penalty

**Deliverable:** `VoiceInputSystem`, `vocalSilenceState.ts`, `BoundsCheckSystem`

- Silence sink **120 px/s**.
- Track consecutive silent **frames** (fixed dt).
- **Hard:** if silent ≥ **30 frames** and player **at** top/bottom bound (within margin), **CRASH** (stall-out).

---

## Phase 7 — World speed (BPM + dynamic)

**Deliverable:** `worldScroll.ts`, `WorldScrollSystem`, `main.ts` / `runSessionAudio` path

- Target cruise from: `(lastGateX - anchor) / (beatsToCross * (60/BPM) * gateCount)` as **initial** hint when BPM known.
- Each tick: `cruiseVx *= dynamicFactor(score, scroll, combo, silence, perfectStreak)` clamped to sane range.
- Audio-backed runs: blend spec BPM formula with existing duration sync so track end still aligns (use weighted average or cap delta).

---

## Phase 8 — Parallax “visor”

**Deliverable:** `RENDERING.VISOR_PARALLAX_LAYERS`, `ParallaxSystem`

- Three layers: **scale** 0.3 / 0.55 / 0.8 on `tileScale`; **horizontal drift** ~2% / 6% / 10% of scroll (`worldLock` ~0.98 / 0.94 / 0.90).
- **Fog:** alpha 0.55 / 0.72 / 0.88 (far → more fade).
- **Vertical:** `tilePosition.y += (playerY - screenH/2) * (0.1 + layerIndex * 0.1)` (plus existing offset).

**Note:** City level 1 keeps **existing** OGA stack; visor preset applies to **procedural sky** parallax in `ensureParallax` default branch.

---

## Phase 9 — Crash juice

**Deliverable:** `CrashBurstEffect` in `main.ts` or `src/game/crashBurst.ts`

- On `CRASH`: spawn **≥100** simple particles (Graphics circles), outward velocity, fade; **stage shake** on `gameWorldLayer` (tween decay ~300ms).
- Non-blocking; `endRun` still runs after short delay or immediately with effect overlay.

---

## Phase 10 — Validation

- `npm run lint` / `npm run build`.
- Smoke: Easy/Medium/Hard gap sizes; volume gate opens when singing loud; perfect increases streak; hard breath kill at boundary; crash particles visible.

---

## Files touched (expected)

| File | Role |
|------|------|
| `src/game/vocalFlightRules.ts` | Constants & difficulty presets |
| `src/game/vocalSilenceState.ts` | Silent frame counter |
| `src/game/crashBurst.ts` | Particle + shake |
| `src/data/constants.ts` | Visor parallax export |
| `src/data/levelDefinitions.ts` | `difficulty?` on levels |
| `src/engine/components/GateComponent.ts` | kind, gap fields |
| `src/levels/LevelGenerator.ts` | Volume gates, BPM spacing, gap sizes |
| `src/engine/systems/LevelSystem.ts` | Graphics gates, collectibles |
| `src/engine/systems/VolumeGateSystem.ts` | RMS → gap |
| `src/engine/systems/GateCollisionSystem.ts` | Gap crash |
| `src/engine/systems/GatePlayoutSystem.ts` | Perfect + payload |
| `src/engine/systems/BoundsCheckSystem.ts` | Hard breath penalty |
| `src/engine/systems/ParallaxSystem.ts` | Visor mode |
| `src/engine/systems/VoiceInputSystem.ts` | Silence sink, silence frames |
| `src/engine/systems/WorldScrollSystem.ts` | Dynamic cruise assist |
| `src/main.ts` | Register systems, scoring, BPM cruise, crash FX |

---

## Deferred / future

- React glass HUD (spec mentions React; product is Pixi — keep Pixi HUD unless product pivots).
- Full physics engine for debris (current: kinematic particles).
- Procedural endless mode separate from level definitions.
