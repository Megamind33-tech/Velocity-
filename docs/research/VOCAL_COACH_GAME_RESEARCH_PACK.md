# Vocal-coach game research pack — Velocity (phase 2)

**Purpose:** This document informs updates to the existing Velocity game on this branch. It does not replace the current product direction; it grounds additional charts, harmony stages, progression copy, and level pacing in voice pedagogy, motor-learning research, and honest microphone limits.

**Branch reality check:** The current gameplay branch uses `src/data/songs.ts`, `src/levels/LevelGenerator.ts`, `src/engine/systems/LevelSystem.ts`, `src/engine/systems/HUDSystem.ts`, and `src/main.ts` rather than the `charts.ts` / `songsCore.ts` structure referenced in the earlier handoff. This pack maps the same research goals onto those files.

---

## 1. Executive summary

### Product framing

- Velocity is a **vocal-coach game**, not a flight simulator.
- The player moves **forward automatically** and steers **vertically** using voice pitch.
- The most realistic near-term learning goals are **pitch center**, **interval control**, **entry timing**, **register awareness**, **recovery after misses**, and **single-singer harmony drills**.
- The current browser mic path is suitable for **one sung pitch at a time**. It is not a reliable basis for claims about breath support, formants, vibrato quality, or multi-singer harmony separation.

### High-confidence mechanics for the existing build

1. **Stable pitch holds** with wider gates for beginners.
2. **Small interval ladders** that gradually widen into skips.
3. **Phrase planning drills** using slower charts and longer holds.
4. **Register-awareness runs** using higher lanes and cautious copy.
5. **Recovery-first charts** where one miss does not end the run.
6. **Static harmony drills** with longer sustained gates and explicit headphone guidance.
7. **Moving harmony drills** that teach contour tracking without pretending the game hears two voices.
8. **Spiral review** where later levels revisit earlier skills under tighter spacing.

### Main risks

1. **Monophonic input only.** One mic channel does not reliably separate simultaneous harmony parts.
2. **Octave mistakes and harmonic false locks.** Low-cost mics and noisy rooms can bias pitch tracking.
3. **Latency.** Bluetooth and device buffering can shift felt timing relative to gates.
4. **Overclaiming pedagogy.** The app can coach pitch practice, not diagnose vocal technique.
5. **Visual overload.** Concurrent visual feedback can help learning while increasing task load during performance.

---

## 2. Pedagogy foundation

### Evidence-based voice pedagogy

Kari Ragan's evidence-based voice pedagogy framework defines the field as an integration of **teacher expertise**, **student goals**, and **relevant research**, rather than "science only." That framing is the right model for Velocity's learning copy and for any future coaching claims.

### Common sequencing patterns in studio pedagogy

Across standard pedagogy texts and science-informed teaching materials, novice singers are commonly guided through a sequence resembling:

1. Setup and alignment.
2. Breath planning and onset clarity.
3. Steady pitch production.
4. Stepwise intervals.
5. Larger skips and register transitions.
6. Style, dynamics, and more specialized goals.

For a browser game, the strongest direct mappings are:

- **Pitch center** -> long or repeated centered gates.
- **Onset / entry timing** -> phrase-start gates and rhythmic spacing.
- **Interval skill** -> lane-to-lane movement.
- **Register awareness** -> higher or lower target zones plus copy that avoids prescriptive claims.
- **Recovery** -> scoring and chart design that reward re-centering after a miss.

### Harmony pedagogy that maps cleanly to one singer

Single-singer harmony teaching often begins with:

- Singing **thirds** or **fifths** against a reference.
- Singing one **chord tone** at a time.
- Holding a **pedal tone** while harmony context changes elsewhere.
- Echo or call-and-response patterns to reduce overreliance on continuous visual guidance.

Those strategies fit Velocity today because the game can still present **one target pitch at a time**, even before any dedicated guide-track audio layer is added.

---

## 3. Research-backed implementation guidance

### Visual feedback and learning

The literature supports a cautious but useful stance:

- Welch, Howard, and Rush (1989) found real-time visual feedback improved pitch-matching development in children.
- Paney and Tharp (2019) found adult learners improved over time with game-based singing practice, but concurrent visual feedback was not clearly superior to the control condition in all outcomes.
- Berglin, Pfordresher, and Demorest (2022) found visual-plus-auditory feedback can help remediate poor-pitch singing in adults under controlled conditions.

**Implication for Velocity:** Use visual lanes confidently for practice, but avoid claiming the feedback is the sole cause of improvement. Keep a distinction between **practice guidance** and **performance challenge** in future updates.

### Intonation claims

Michael and Gilman (2021) caution that intonation is not an isolated objective proxy for total singing quality. Pitch accuracy matters, but it should not be sold as a complete measure of "good singing."

**Implication for Velocity:** The game can say:

- "You matched this target more consistently."
- "You recovered faster after misses."
- "You held the lane more steadily."

It should not say:

- "Your singing is now objectively better overall."
- "We measured your vocal quality."

---

## 4. Machine-readable skill graph

The detailed skill graph is stored in:

- `docs/research/skill_graph.v1.yaml`

Use its `skill_id`, prerequisites, proxy metrics, and gate-pattern notes to drive content tagging and future progression UI.

### Condensed taxonomy for this branch

| Field | Meaning | Current branch mapping |
|------|---------|------------------------|
| `lessonType` | Lesson category | Optional field on `Song` in `src/data/songs.ts` |
| `primarySkill` | Main learning target | Optional field on `Song` |
| `secondarySkills` | Supporting skills | Optional field on `Song` |
| `harmonyRole` | Harmony function | Optional field on `Song` |
| `registerFocus` | Broad range emphasis | Optional field on `Song` |
| `educationalCopyId` | One-line coach tip | Optional field on `Song` plus HUD lookup |
| `difficultyTier` | Course difficulty band | Optional field on `Song` plus generator tuning |

---

## 5. Harmony design bible — 12 archetypes

These remain ordered from lower to higher implementation risk. Each entry includes prerequisites, whether headphones are recommended, scoring direction, and failure cases to watch for.

| # | Archetype | Prerequisites | Headphones? | Scoring direction | Known failure cases |
|---|-----------|---------------|-------------|-------------------|---------------------|
| 1 | Pedal partner | `pitch_center` | Recommended | Time in one stable lane | Drift toward implied melody |
| 2 | Third above | `interval_step` | Recommended | Accuracy to shifted contour | Major/minor confusion |
| 3 | Third below | `interval_step`, `register_chest` | Recommended | Same as above | Low-register instability |
| 4 | Fifth anchor | `interval_skip` | Recommended | Landing accuracy on root/fifth swaps | Overshooting leaps |
| 5 | Chord-tone ladder | `harmony_static` | Recommended | Ordered root-3rd-5th completion | Skipping chord degrees |
| 6 | Echo harmony | `harmony_static` | Helpful | Delayed pitch recall | Memory slips |
| 7 | Counter line slow | `harmony_chord_tone` | Recommended | Contour accuracy over time | Following the imagined melody |
| 8 | Parallel lane | `harmony_moving` | Recommended | Offset contour tracking | Collapsing into unison |
| 9 | Hocket role | `rhythm_consonant` | Helpful | Accurate entry windows | Entering early |
| 10 | Passing-tone bridge | `harmony_moving`, `interval_step` | Helpful | Smooth bridge-note accuracy | Overshoot on passing notes |
| 11 | Modal color lane | `harmony_static`, ear training | Recommended | Stable target against unfamiliar scale feel | Ear pull toward major/minor defaults |
| 12 | Octave double | `pitch_center` | Optional | Correct octave lock | Octave detection confusion |

### Pseudocode guidance

#### Static harmony

- score = percentage of frames within vertical tolerance during sustain
- bonus for stable center after first 300–500 ms
- no penalty for lack of vibrato

#### Chord-tone ladder

- each gate scored independently
- extra bonus if gates are hit in correct harmonic order
- allow recovery on the next chord tone rather than failing the entire phrase

#### Moving harmony

- score by rolling average of lane alignment
- use wider tolerance than melody mode in early harmony stages
- keep instructional copy explicit: "Track the harmony contour, not the melody."

---

## 6. Mic and environment guidance

| Setup | Expected strengths | Expected failure modes | UX mitigation |
|------|--------------------|------------------------|---------------|
| Phone / laptop internal mic | Easiest onboarding | Room noise, distance changes, octave wobble | Ask for quiet room and close position |
| Wired earbuds with mic | Better isolation than open room | Thin frequency response, handling noise | Suggest stable cable position |
| Bluetooth earbuds | Convenient monitoring | Added latency, unstable timing feel | Warn that timing may feel late |
| USB microphone | Best consistency in quiet space | Gain too high can clip; setup friction | Add gain-check guidance |

### Copy that should appear around harmony lessons

- "Headphones recommended for harmony practice."
- "Quiet room helps pitch tracking."
- "If the lane jumps by an octave, lower volume and move closer to the mic."
- "Bluetooth audio can make timing feel late."

---

## 7. Explicit do-not-claim list

Do not use player-facing strings that imply the current build can directly measure or diagnose:

- breath support
- resonance placement
- formant tuning
- vibrato quality
- larynx position
- vocal health status
- medical progress
- duet-part separation from one live mic

Safe alternatives:

- "steady lane hold"
- "cleaner target entries"
- "more consistent pitch center"
- "better recovery after misses"
- "higher-level lane control"

---

## 8. Suggested progression structure for this branch

This branch now supports a 15-level progression well:

### Tier 1: foundations

- Stable pitch
- Small steps
- Phrase planning

### Tier 2: connection

- Longer ladders
- Mix/bridge awareness
- Recovery under pressure
- Static harmony entry

### Tier 3: coordination

- Larger skips
- Rhythm lock
- Chord-tone movement

### Tier 4: harmony and upper-range control

- Moving harmony
- Counter contour tracking
- Higher register awareness

### Tier 5: review and mastery loops

- Tour review
- Finale combining prior skills

This mirrors established pedagogical sequencing better than a flat list of same-shaped charts.

---

## 9. Branch-specific implementation mapping

| Area | Current branch file | Research-informed update |
|------|----------------------|--------------------------|
| Chart content | `src/data/songs.ts` | Add many tagged songs with progressive skills |
| Gate pacing | `src/levels/LevelGenerator.ts` | Scale width, height, speed, and reachability by lesson type and tier |
| Runtime progression | `src/engine/systems/LevelSystem.ts` and `src/main.ts` | Emit gate pass / level complete and advance through the curriculum |
| Learning UI | `src/engine/systems/HUDSystem.ts` | Show lesson name, skill, tip, and gate progress |
| World map | `src/scenes/WorldMapScene.ts` | Reflect actual course length and broad difficulty bands |

---

## 10. Bibliography and source notes

### Strong references used for this phase

1. Ragan, Kari. "Defining Evidence-Based Voice Pedagogy: A New Framework." *Journal of Singing*, 75(2), 2018.
2. Welch, Graham F., D. M. Howard, and C. Rush. "Real-time Visual Feedback in the Development of Vocal Pitch Accuracy in Singing." *Psychology of Music*, 17(2), 1989.
3. Paney, Andrew S., and Kevin L. Tharp. "The Effect of Concurrent Visual Feedback on Adult Singing Accuracy." *Psychology of Music*, 49(3), 2019.
4. Berglin, Jacob, Peter Q. Pfordresher, and Steven Demorest. "The Effect of Visual and Auditory Feedback on Adult Poor-Pitch Remediation." *Psychology of Music*, 50(4), 2022.
5. Michael, Deirdre D., and Marina Gilman. "The Myth of Intonation as an Objective Measure of Singing Quality." *Journal of Singing*, 77(5), 2021.
6. McKinney, James C. *The Diagnosis and Correction of Vocal Faults: A Manual for Teachers of Singing and for Choir Directors*. Waveland Press, 1994.
7. Miller, Richard. *The Structure of Singing: System and Art in Vocal Technique*. Schirmer Books, 1986.
8. McCoy, Scott. *Your Voice: An Inside View*. 2nd ed., Inside View Press, 2012.
9. National Association of Teachers of Singing. "Science-Informed Voice Pedagogy Resources." NATS, accessed for framework and curriculum materials.

### Still useful follow-up research

- More Journal of Voice studies focused on onset training and feedback schedules.
- Additional harmony-pedagogy method books with explicit beginner sequencing.
- Device-specific F0 robustness studies for browser or mobile microphones.

---

## 11. Recommendations for the next implementation pass

1. Store per-skill completion counts or rolling accuracy in local storage.
2. Add a distinct practice/performance toggle for visual feedback intensity.
3. Add optional guide-tone audio for harmony charts, but keep the monophonic-scoring caveat.
4. Consider a separate gate-tolerance field if the game later needs more chart-specific tuning than `difficultyTier` provides.

---

*Document version: 2.0 — adapted to the gameplay-levels branch and upgraded with stronger citations and implementation mapping.*
