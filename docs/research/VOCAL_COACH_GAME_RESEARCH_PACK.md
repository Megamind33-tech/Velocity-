# Vocal-coach game research pack — Velocity (update roadmap)

**Purpose:** This document **informs updates to the existing Velocity game** (Pixi.js + mic-driven vertical flight + gate charts). It does **not** replace the product direction; it grounds **new charts, harmony stages, progression UX, and scoring** in pedagogy and in **honest technical limits**.

**Audience:** Designers, content authors, and engineers implementing features on top of the current codebase (`charts.ts`, gate systems, `CareerProgress`, modes).

---

## 1. Executive summary

### Top 10 game-ready mechanics (pedagogy-aligned)

1. **Breath–posture primers** — Short stages with **fewer, longer gates** and on-screen cues (“expand, don’t lift shoulders”) before agility drills; maps to *low rhythmic density, wider timing windows*.
2. **Balanced onset targets** — Gates placed at **phrase starts** with tolerance for **soft attack** vs **hard glottal** (proxy: stability in first 200–400 ms after crossing a “start” plane).
3. **Register awareness tracks** — Charts tagged `register_focus: chest | mix | head` with **narrower pitch bands** near passaggio zones in later tiers.
4. **Interval ladders** — Same contour with **semitone / whole-tone / third** spacing lessons; ear training spiral.
5. **Harmony against reference** — **Drone or guide melody in playback** (future audio layer); player holds **static harmony pitch** or **steps through chord tones** while flying through gates.
6. **Chord-tone hunting** — Sequential gates = **root → 3rd → 5th** (arpeggiated voice leading); classic single-singer harmony pedagogy.
7. **Call-and-response** — **Silent gaps** then gates: memory + pitch recall (reduces reliance on continuous visual).
8. **Vibrato optional tiers** — Later charts use **wider vertical tolerance** over sustained gates; *do not* claim to measure vibrato quality without R&D.
9. **Style modules** — Tags for theatre belt, pop phrasing, R&B melisma **density**, classical legato; same engine, different `difficulty_knobs` and copy.
10. **Recovery-first scoring** — Streaks and **post-miss “reset” gates** so occasional errors do not feel like run failure; matches coach framing (“adjust and continue”).

### Top 10 risks

1. **Monophonic pitch only** — Cannot reliably separate **two simultaneous sung pitches**; harmony stages need **mute guide**, **headphones**, or **sequential** harmony (not true duet detection).
2. **Harmonic false locks** — Cheap mics / rolloff can confuse F0 with **harmonics** (octave errors).
3. **Latency** — Bluetooth audio and Web Audio buffer delay **misalign** self-monitoring vs gates.
4. **Breath “support”** — **No direct measurement** without extra sensors; only **proxies** (phrase length, volume envelope, pause patterns)—label honestly in UI.
5. **Clipping / shouting** — Loud singing distorts; **bad for pitch** and **vocally risky**; need **soft-loud calibration** and health copy.
6. **Concurrent visual feedback overload** — Real-time pitch UI can **hurt** early performance while helping learning; consider **practice vs performance** modes.
7. **Cultural flattening** — “Regional” content must avoid stereotypes; **consult practitioners** per style.
8. **Medical claims** — Avoid promising therapy outcomes; **practice supplement**, not clinical voice rehab.
9. **Star inflation** — If stars are too easy, progression feels fake; tie **meaningful metrics** to unlocks.
10. **Content explosion without taxonomy** — Adding charts without **skill tags** repeats the “game ends” feeling.

---

## 2. Pedagogy foundation (evidence-informed framing)

**Evidence-Based Voice Pedagogy (EBVP)** is described in voice pedagogy literature as integrating **(1) teacher expertise**, **(2) student goals**, and **(3) relevant research** (voice science, motor learning, hearing, psychology)—not “science only.” Use this framing for in-game disclaimers and progression design.

Typical **early sequence** (widely taught, not universal):

1. Posture and **breath management** (diaphragmatic / appoggio-style imagery varies by school).
2. **Onsets** (balanced vs breathy vs glottal).
3. **Registration** and smooth **passaggio** work.
4. **Resonance / vowel** adjustment.
5. **Agility, range extension, dynamics, style**.

**Harmony pedagogy (single singer)** commonly uses:

- **Interval recognition** and singing **thirds / fifths** above or below a reference.
- **Chord mapping** — hear triad, sing one chord tone at a time.
- **Anchoring** — secure **first harmony note** before the melody moves (mental rehearsal / humming).

These map cleanly to **gate sequences** and optional **reference audio**.

---

## 3. Skill graph (implementable draft)

Use this as a **content + engineering** bridge. Extend or import into TypeScript types later (`primarySkill`, `harmonyRole`, etc.).

| skill_id | name | Rationale (short) | Prerequisites | Typical errors | Coach-style fix | In-game proxies | Gate patterns | Difficulty knobs |
|----------|------|-------------------|-----------------|----------------|-----------------|-----------------|---------------|------------------|
| `breath_phrase` | Phrase planning | Sustainable lines need planned breaths, not gasps | None | Running out of air mid-gate | Mark breaths; shorter phrases first | Longer gates = longer **required** sustain; optional “breath window” UI | Few gates, wide Y, long duration | Shorter phrases ↑ difficulty |
| `posture_ready` | Alignment check | Tension in neck/jaw breaks pitch | None | Jaw jut, high shoulders | Body scan cues (copy only) | Pre-run **mic check** + static first gate | Single hold gate | N/A |
| `onset_clean` | Clean starts | Onsets affect tone and pitch lock | `breath_phrase` | Hard glottal, breathy scoop | Onset exercises (balanced) | **Stability** in first window after gate entry | Gate at phrase boundary | Narrow time tolerance |
| `pitch_center` | Steady target pitch | Core intonation skill | `onset_clean` | Drift flat/sharp | Slow sustained tones | **Cents deviation** smoothed over N ms | Hold gates | Narrow cents |
| `interval_step` | Stepwise motion | Ear + voice coordination | `pitch_center` | Overshoots | Slow scales | Discrete target Y per gate | Staircase gates | Larger intervals |
| `interval_skip` | Skips / leaps | Harder mapping | `interval_step` | Miss landing pitch | Isolate leap, then add approach | Large Δy between gates | Leap gates | Tempo, distance |
| `register_chest` | Chest coordination | Low/mid stability | `pitch_center` | Pushing high chest | Limit range; mix introduction | Tag + pitch range limits | Mid-low gates | Range ceiling |
| `register_mix` | Mix / bridge | Passaggio navigation | `register_chest` | Crack or flip | Slides, vowel mods | Narrow tolerance mid-range | Dense mid-high | Vowel prompts (text) |
| `register_head` | Head coordination | High extension without strain | `register_mix` | Thin or pressed | Soften onset; space | High pitch targets, wider cents? | High sparse gates | Optional wider tolerance |
| `harmony_static` | Hold harmony note | First harmony skill | `pitch_center` | Pulled toward melody | Drone + hum part | Match **single** F0 vs target | One long gate + reference | Headphones recommended |
| `harmony_chord_tone` | Chord tone choice | Hear harmonic context | `harmony_static` | Wrong chord degree | Arpeggiate chord on piano | Sequence: root/3rd/5th targets | Tone ladder | Key changes |
| `harmony_moving` | Moving harmony line | Real arrangements | `harmony_chord_tone` | Late entries | Simplify rhythm first | Gates follow **harmony** contour not melody | Offset copy of melody contour | Speed |
| `rhythm_consonant` | Rhythm accuracy | Music isn’t only pitch | `pitch_center` | Late/early hits | Clap-sing separation | Gate **time** from note grid | Syncopated spacing | BPM, subdivisions |
| `style_legato` | Smooth connection | Classical / theatre line | `onset_clean` | Breaks between notes | Slides on vowel | **Continuous** gate path feel (close Y) | Overlapping windows in scoring | Allow glide |
| `style_belt_safe` | Contemporary intensity | High energy without harm | `register_mix` | Throat squeeze | Volume cap messaging | **Ceiling** on RMS + copy | Shorter bursts | Strict clip warning |
| `dynamics_pp_ff` | Dynamic contrast | Expression | `pitch_center` | Pitch shifts when loud | Separate pitch vs volume drills | Optional RMS tiers (future) | Alternating wide/narrow | Risk: conflate with pitch |

**Safety notes (UI copy):** Stop if pain, hoarseness, or burning; warm up; this app is **not** a substitute for a qualified teacher when injured.

---

## 4. Harmony mode design bible — 12 archetypes (single-singer friendly)

Each fits **current engine** if gates = targets; **reference track** is a **future audio** dependency.

| # | Archetype | Player goal | Reference audio | Scoring concept | Failure modes | Unlock order |
|---|-----------|-------------|-----------------|-----------------|---------------|--------------|
| 1 | **Pedal partner** | Hold one note while “melody” implied by UI motion | Drone on tonic | Time-in-tolerance % | Drift toward imagined melody | Early |
| 2 | **Third above machine** | Sing a **diatonic third** above each guide pitch | Melody only in headphones | Interval accuracy | Major/minor confusion | After intervals |
| 3 | **Third below** | Same, below | Same | Same | Muddled low register | Mid |
| 4 | **Fifth anchor** | Alternate root and fifth | Sparse piano hits | Chord-tone correctness | Jump fatigue | Mid |
| 5 | **Chord-tone ladder** | Root → 3rd → 5th in order | Chord arpeggio | Sequence completion | Skipping a step | Mid |
| 6 | **Counter line (slow)** | Simpler counter-melody vs guide | Guide + written contour | Same as pitch gates | Rhythm drag | Late mid |
| 7 | **Echo harmony** | Repeat harmony after short gap | Play harmony once | Memory + pitch | Forgetting interval | Mid |
| 8 | **Hocket role** | Sing only on offbeats (rests on melody) | Click + melody muted on player beats | Timing + pitch | Early entry | Advanced |
| 9 | **Passing-tone bridge** | Connect two chord tones through passing notes | Harmonic rhythm in UI | Smooth path | Overshoot passing | Advanced |
| 10 | **Modal color** | Same mechanics, different **scale** explanation | Drone on final | Pitch + education | Ear unfamiliarity | Style branch |
| 11 | **Parallel harmony lane** | Same rhythm as “ghost melody,” offset pitch | Ghost melody optional | Parallel interval lock | Converge to unison | Advanced |
| 12 | **Octave double** | Double melody **at octave** (easier harmony entry) | Melody an octave away visually | Octave error detection | Wrong octave (common mic issue) | Early harmony tutorial |

---

## 5. Chart / lesson taxonomy (for authors)

Suggested **required tags** on every new chart row (YAML or TS object fields):

- `primary_skill` — from skill graph IDs.
- `secondary_skills` — array.
- `lesson_type` — `melody` | `harmony_static` | `harmony_moving` | `interval` | `rhythm` | `registration` | `style`.
- `register_focus` — `low` | `mid` | `high` | `mixed`.
- `harmony_role` — `none` | `root` | `third` | `fifth` | `moving` | `pedal`.
- `reference_audio` — `none` | `drone` | `guide_melody` | `metronome_only` (future).
- `bpm`, `stage` (existing), `game_mode` (existing).
- `pitch_tolerance_cents` — design-time (scoring R&D).
- `educational_copy_id` — key into strings table for coach tip (1 sentence).
- `cultural_context_notes` — avoid stereotype; cite consulted tradition if real-world named.
- `accessibility` — `color_only` issues, **headphones recommended**, **quiet space** flag.

---

## 6. Mic & signal reality check (engineering)

**Works reasonably today (typical monophonic path):**

- **F0 tracking** via autocorrelation (already common in browser games).
- **Relative pitch** goals (gates as targets).
- **Smoothed pitch stability** metrics over windows.

**Hard or misleading without extra work:**

- **True breath support** measurement.
- **Vowel quality / formant teaching** (needs more analysis than F0).
- **Simultaneous two-voice scoring** from one mic.
- **Perfect cents** on cheap buds in noisy rooms.

**Mitigations for updates:**

- **Calibration** flow + “headphones recommended” for harmony stages.
- **Tolerance bands** and **rolling accuracy** instead of binary fail.
- **Octave jump detection** warnings when algorithm confidence low.

Research on **real-time pitch for creative games** exists in HCI literature (algorithm choice matters); **microphone quality** affects harmonic false locks—communicate in onboarding.

**Auditory / visual feedback:** Studies suggest **immediate visual pitch feedback** can improve pitch accuracy for learners but may add **cognitive load** during concurrent performance—good candidate for **Practice** toggle vs **Perform** toggle in a future update.

---

## 7. Progression UX (learning side, not just stars)

Design goals for **updates**:

- Show **consistency** (e.g. last 10 runs rolling accuracy), not only totals.
- **Spiral review**: recycle `primary_skill` with new `difficulty_knobs`.
- **Breadcrumbs**: “You’re working on **clean onsets**” based on tags.
- Avoid implying **perfection**; use **bands** (solid / good / retry) and **recovery streaks**.

Mode chain (training → VS AI → P2P → tour) can remain; **sub-progress** per skill_id fills the “never done learning” feeling.

---

## 8. Bibliography & pointers (non-exhaustive)

- Evidence-based voice pedagogy framing: McKinney, Ragan, et al. (EBVP framework; see e.g. *Journal of Singing* / voice pedagogy summaries).
- Onsets overview: pedagogical articles (e.g. Operaversity-style onset spectrum: glottal / balanced / aspirate).
- Harmony learning: interval practice, chord-tone work (multiple pedagogy blogs aggregate standard exercises—validate against a method book for production).
- Pitch detection limitations: harmonic energy vs fundamental; mic frequency response (industry pitch-detector explainers).
- Creative music interaction: GI / HCI work on **real-time pitch estimation for games** (algorithm evaluation).

*Note:* Replace blog sources with **primary texts** (NATS resources, textbooks such as *Your Voice: An Inside View*, McKinney, Miller, Estill course materials) when preparing **player-facing** educational claims.

---

## 9. How this plugs into the **current** Velocity codebase

| Area | Today | Research-informed update |
|------|--------|---------------------------|
| Content | `ALL_CHARTS` in `charts.ts` | Add many charts using **taxonomy**; generator scripts optional |
| Gates | `LevelGenerator` + `GatePassSystem` | Optional **tolerance** metadata per song; harmony lesson types |
| Progress | Stars, modes, tour map | Add **skill stats** in local storage keyed by `skill_id` |
| Audio | Placeholder / future | **Drone + guide** tracks for harmony archetypes |
| Copy | Menu strings | **Coach tips** per `educational_copy_id` |

---

## 10. Suggested next research pass (human / Opus)

1. Mine **3–5 standard textbooks** for exercise names + ordering (cite pages).
2. Produce **50-row** skill graph with **style modules** (musical theatre vs pop vs classical).
3. **Lit review** on **visual pitch feedback** and **fading feedback** schedules for motor learning.
4. **Table of mic profiles** (phone internal, AirPods, USB) vs expected F0 error bands (approximate).

---

*Document version: 1.0 — synthesized for Velocity game updates.*
