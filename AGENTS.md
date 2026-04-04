# AGENTS.md — Velocity

## Mission

Velocity is a mobile-first game UI, not a website, not a dashboard, and not a generic app shell.

Your job in this repository is to produce a **real game product screen**, not a respectable prototype.

You must aggressively reject:
- generic sci-fi UI
- repeated dark-card formulas
- app-like navigation
- dashboard-like stats
- disabled-row locked states
- clean-but-boring layouts
- AI-looking skin language
- vague “improvements” that do not materially change player perception

A task is only successful if the result feels:
- game-native
- tactile
- premium
- authored
- readable under motion
- progression-driven
- visually intentional

## Non-negotiable product truths

Velocity has already improved in structure and organization.
That is not enough.

The remaining risk is **product-grade genericness**:
- hero is stronger than the rest
- mission/event cards still feel too list-like
- locked cards still feel like disabled rows
- bottom nav still risks feeling app-like
- too many surfaces still share one formula
- the skin still risks looking AI-generated instead of authored

Do not stop at neatness.
Do not optimize only for consistency.
Do not ship another below-par “clean prototype.”

## Core visual direction

Use a **Kenney-family UI language** as the anchor.

Primary asset families:
- Kenney UI Pack
- Kenney UI Pack RPG Expansion
- Kenney Input Prompts
- Kenney Game Icons

Support if needed:
- Kenney Background Elements
- Kenney Platformer Art Deluxe
- Kenney Abstract Platformer

Rules:
- Kenney-family first
- one fallback icon family only if truly needed
- no generic web UI assets
- no app UI kits
- no mixed random icon packs
- no stock-looking decorative textures
- no dashboard DNA

## Surface role map

These surfaces must feel related, but NOT identical:

1. Hero card
2. Top metric chips
3. Selected tab
4. Inactive tab
5. Primary CTA
6. Playable mission/event card
7. Locked mission/event card
8. Locked badge
9. Reward callout
10. Bottom nav active
11. Bottom nav inactive

If these still look like one repeated panel formula, the task has failed.

## State rules

Only one dominant state per dominant state zone.

Priority example:
1. Claimable / Ready
2. Playable / Available
3. Locked
4. Completed
5. Bonus / Elite / Special as subordinate metadata only

Rules:
- no contradictory state pileups
- no “LOCKED + COMPLETE” in the same primary badge zone
- helper text must be subordinate
- primary state must fit cleanly
- locked state must feel aspirational, not dead

## Locked content rules

Locked content must never feel like a disabled list row.

Locked cards must feel:
- premium
- withheld
- structured
- mysterious
- worth unlocking

Do not solve locked states by merely darkening active cards.
Do not let locked badges look cramped.
Do not let requirement text collide with the primary state.

## Navigation rules

Bottom navigation and tabs must feel like game controls, not app controls.

Reject:
- app-footer energy
- segmented-control energy
- flat tab rows
- low-authority selected states

Require:
- tactile active state
- clear inactive state
- game-system-grade materials
- strong readability
- visual integration with the rest of the screen

## Reward / progression rules

Missions, events, and rewards must feel like progression units, not rows in a list.

Require:
- stronger internal zoning
- clearer action priority
- clearer reward hierarchy
- more meaningful card skins
- progression appetite
- state drama

## Anti-generic skin rules

Reject these patterns:
- same border treatment everywhere
- same glow treatment everywhere
- same shadow treatment everywhere
- same dark rectangle repeated across all roles
- decorative sci-fi lines with no structural purpose
- “dark + cyan + futuristic font” as a substitute for authored skin design

Require:
- role-based material logic
- selective highlights
- believable depth differences
- differentiated face treatments
- controlled motif repetition
- one world, one product language

## Text-fit rules

All text must fit elegantly.

Applies to:
- buttons
- tabs
- badges
- chips
- titles
- subtitles
- reward labels
- locked labels
- bottom nav labels

Rules:
- no clipping
- no wall-touching text
- no weak emergency shrinking
- no ugly ellipsis unless unavoidable
- optical centering matters
- helper text must never compete with primary state text

## Layout rules

Use disciplined spacing and sizing.

Base unit:
- `U = clamp(8px, min(viewportWidth, viewportHeight) * 0.009, 14px)`

General constraints:
- edge-safe spacing
- touch targets never below 44px
- button text must breathe
- badge text must breathe
- gameplay-related UI must remain readable and authoritative
- hero must remain the strongest zone without exposing the rest as weak

## Motion rules

Use motion only to improve:
- tactility
- state clarity
- selected-state confidence
- CTA press feel
- reward feel

Reject:
- web choreography
- theatrical transitions
- motion spam
- glow spam

## Working method

For every task:
1. Find the real files first.
2. Identify the actual source of the weakness.
3. Make a deliberate role-differentiation decision.
4. Implement.
5. Validate visually and structurally.
6. Reject your own work if it is still generic.

Do not ask for permission to fix obvious weak points.
Do not stop at “better.”
Stop only when the result is materially less generic.

## File discovery expectations

Before editing, locate the actual files responsible for:
- app entry
- home/menu screen
- hero card
- top metric chips
- tabs
- mission/event/reward cards
- state badges / locked pills
- CTA buttons
- bottom nav
- theme/tokens/styles
- asset mapping / icon usage
- motion helpers if present

Report exact file paths in every task response.

## Validation expectations

For each task, report:
- exact files inspected
- exact files changed
- the role of each changed component
- what generic pattern was removed
- what state/hierarchy rule was introduced
- what remains weak, if anything

Do not respond with vague design commentary.
Do not stop at analysis.
Do not make tiny cosmetic changes and call it done.

## Preferred implementation behavior

Keep dependencies minimal.
Do not add heavy UI libraries.
Do not introduce dashboard-oriented component kits.

Allowed only if truly useful and consistent with the existing stack:
- `framer-motion` for subtle tactile motion
- `clsx`
- `class-variance-authority`
- `tailwind-merge`

Only add something if it materially improves implementation and fits the codebase.

## Final bar

A task fails if the screen still feels:
- generic
- AI-generated
- app-like
- list-based
- prototype-level
- below par

A task succeeds only if the screen feels more:
- authored
- tactile
- game-native
- premium
- rewarding
- intentional
