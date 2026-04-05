/**
 * Daily Rewards screen — Kenney UI Pack chrome with rich reward card hierarchy.
 * Includes professional popup animations and celebration effects.
 *
 * DESIGN RULES (Reward Richness):
 *   - Each reward day is a Kenney-framed card, not a stat row
 *   - Day index, star icon, token value form a clear left→center→right hierarchy
 *   - Token value: 22px gold — creates desire at a glance
 *   - Current (claimable) day: accent (yellow) chrome — stands apart structurally
 *   - Past days: secondary (grey) chrome — present but subordinate
 *   - CLAIM REWARD: gold accent Kenney button, full panel width — dominant CTA
 *   - BACK: secondary, visually subordinate
 *   - No stat dashboard energy. No flat list. No plain text rows.
 */

import { Application, Container, Graphics, NineSliceSprite, Sprite, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { getVelocityUiTexture, velocityUiArtReady } from '../velocityUiArt';
import {
    buildVelocityModal,
    repositionVelocityModal,
    syncModalShellResize,
    velocityModalInnerWidth,
    type VelocityModalLayout,
} from '../velocityModalLayout';
import { createKenneyFramedPanelWithContent } from '../kenneyNineSlice';
import { createVelocityGameButton } from '../velocityUiButtons';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';
import { animateModalEntrance, animateModalExit } from '../modalAnimations';
import { AnimationManager } from '../AnimationManager';
import { createShimmer, createSuccessFlash, createPulseScale } from '../polishEffects';
import { animateScoreCountUp, animateTextReveal } from '../contentAnimations';
import { animateAlpha } from '../animationHelpers';

// ─── Token data ───────────────────────────────────────────────────────────────

const REWARD_DAYS = [
    { day: 1, label: 'DAY 1', tokens: 100,  stars: 1, claimed: true  },
    { day: 2, label: 'DAY 2', tokens: 250,  stars: 2, claimed: true  },
    { day: 3, label: 'DAY 3', tokens: 500,  stars: 3, claimed: false },
] as const;

// Current active day (day 3 = claimable in this example)
const ACTIVE_DAY = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BS = VELOCITY_UI_SLICE.button;
const PS = VELOCITY_UI_SLICE.panel;

function ts(fill: number, size: number, weight: '400'|'600'|'700'|'800' = '700', spacing = 0): TextStyle {
    return new TextStyle({
        fill,
        fontSize: size,
        fontWeight: weight,
        fontFamily: GAME_FONTS.functional,
        letterSpacing: spacing,
        dropShadow: size >= 18
            ? { alpha: 0.55, blur: 2, color: 0x000000, distance: 1 }
            : undefined,
    });
}

/**
 * Reward card element references for animation.
 */
interface RewardCardElements {
    root: Container;
    valueText: Text;
    unitLabel: Text;
}

/**
 * Build a single reward card.
 *
 * Layout (left→right):
 *   [ DAY N label ]  [ ★★★ star icons ]  [ +NNN TOKENS value ]
 *
 * Active day gets accent (yellow) chrome + larger token value.
 * Claimed days get grey chrome + reduced alpha.
 */
function buildRewardCard(
    innerW: number,
    cardH: number,
    day: number,
    label: string,
    tokens: number,
    stars: number,
    claimed: boolean,
    isActive: boolean,
): RewardCardElements {
    const root = new Container();

    // ── Card chrome ─────────────────────────────────────────────────────────
    const useKenney = velocityUiArtReady();
    const btnKey = isActive ? 'button_accent' : 'button_secondary';
    const tex = useKenney ? getVelocityUiTexture(btnKey) : null;

    if (tex) {
        const bg = new NineSliceSprite({
            texture: tex,
            leftWidth: BS.L, rightWidth: BS.R,
            topHeight: BS.T, bottomHeight: BS.B,
            width: innerW, height: cardH,
        });
        if (isActive) {
            bg.alpha = 1.0;
        } else if (claimed) {
            bg.alpha = 0.6;
            bg.tint = 0xaabbcc;
        } else {
            bg.alpha = 0.78;
        }
        root.addChild(bg);
    } else {
        // Vector fallback
        const g = new Graphics();
        g.roundRect(0, 0, innerW, cardH, 10);
        if (isActive) {
            g.fill({ color: 0x2a1e00, alpha: 1 });
            g.stroke({ color: GAME_COLORS.accent_gold, width: 2, alpha: 0.9 });
        } else {
            g.fill({ color: GAME_COLORS.bg_medium, alpha: claimed ? 0.55 : 0.88 });
            g.stroke({ color: GAME_COLORS.border_secondary, width: 1, alpha: 0.5 });
        }
        root.addChild(g);
    }

    // ── Day label (left column) ──────────────────────────────────────────────
    const dayColor  = isActive ? 0xfff0a0 : (claimed ? 0x88a0b8 : 0xddeeff);
    const dayLabel  = new Text({ text: label, style: ts(dayColor, 11, '700', 1.5) });
    dayLabel.anchor.set(0, 0.5);
    dayLabel.position.set(14, cardH / 2);
    root.addChild(dayLabel);

    // ── Star icons (center) ──────────────────────────────────────────────────
    const starTex         = getVelocityUiTexture('icon_star');
    const starOutlineTex  = getVelocityUiTexture('icon_star_outline');
    const starSize        = isActive ? 22 : 18;
    const starGap         = 4;
    const totalStars      = 3;
    const starRowW        = totalStars * starSize + (totalStars - 1) * starGap;
    const starStartX      = (innerW - starRowW) / 2;

    for (let i = 0; i < totalStars; i++) {
        const sx = starStartX + i * (starSize + starGap);
        const sy = (cardH - starSize) / 2;

        const earned = i < stars;
        const useTex = earned ? starTex : starOutlineTex;

        if (useTex) {
            const s = new Sprite(useTex);
            s.anchor.set(0, 0);
            s.width  = starSize;
            s.height = starSize;
            s.position.set(sx, sy);
            if (!earned) s.alpha = 0.35;
            else if (isActive) s.tint = 0xffe040;
            root.addChild(s);
        } else {
            // Vector star fallback
            const g = new Graphics();
            g.circle(sx + starSize / 2, sy + starSize / 2, starSize * 0.42);
            g.fill({ color: earned ? GAME_COLORS.accent_gold : 0x444455, alpha: earned ? 0.9 : 0.3 });
            root.addChild(g);
        }
    }

    // ── Token value (right column) ───────────────────────────────────────────
    const valSize  = isActive ? GAME_SIZES.font.reward_value : 16;
    const valColor = isActive ? GAME_COLORS.accent_gold : (claimed ? 0x6688aa : GAME_COLORS.text_secondary);
    const valText  = new Text({
        text: `+${tokens}`,
        style: ts(valColor, valSize, '800'),
    });
    valText.anchor.set(1, 0.5);
    valText.position.set(innerW - 14, cardH / 2);
    root.addChild(valText);

    const unitLabel = new Text({
        text: 'TOKENS',
        style: ts(isActive ? 0xddaa30 : 0x556677, 9, '600', 1),
    });
    unitLabel.anchor.set(1, 0);
    unitLabel.position.set(innerW - 14, cardH / 2 + valSize * 0.52);
    root.addChild(unitLabel);

    // ── Active card shimmer strip — top highlight for "claim me" pull ───────
    if (isActive) {
        const shimmer = new Graphics();
        shimmer.roundRect(8, 2, innerW - 16, 3, 1);
        shimmer.fill({ color: 0xffee88, alpha: 0.55 });
        root.addChild(shimmer);
        // Corner accent pips for premium feel
        const pips = new Graphics();
        const cs = 6;
        pips.moveTo(0, cs); pips.lineTo(0, 0); pips.lineTo(cs, 0);
        pips.moveTo(innerW - cs, 0); pips.lineTo(innerW, 0); pips.lineTo(innerW, cs);
        pips.moveTo(innerW, cardH - cs); pips.lineTo(innerW, cardH); pips.lineTo(innerW - cs, cardH);
        pips.moveTo(cs, cardH); pips.lineTo(0, cardH); pips.lineTo(0, cardH - cs);
        pips.stroke({ color: GAME_COLORS.accent_gold, width: 1.5, alpha: 0.55 });
        root.addChild(pips);
    }

    // ── Claimed badge (top-right corner) ────────────────────────────────────
    if (claimed) {
        const chkTex = getVelocityUiTexture('icon_checkmark');
        if (chkTex) {
            const badge = new Sprite(chkTex);
            badge.width  = 14;
            badge.height = 14;
            badge.tint   = 0x44cc88;
            badge.alpha  = 0.8;
            badge.position.set(innerW - 18, 4);
            root.addChild(badge);
        }
    }

    // Dim entire card if claimed (past) and not active
    if (claimed && !isActive) root.alpha = 0.68;

    return { root, valueText: valText, unitLabel };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export class RewardsScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;
    private animManager = AnimationManager.getInstance();
    private cancelEntrance: (() => void) | null = null;
    private cancelPolish: (() => void) | null = null;
    private cancelExit: (() => void) | null = null;
    private cardAnimations: Array<() => void> = [];
    private cardRefs: Array<{ root: Container; delay: number }> = [];
    private calloutText: Text | null = null;
    private activeCardElements: RewardCardElements | null = null;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw      = this.app.screen.width;
        const sh      = this.app.screen.height;
        const panelW  = Math.min(450, sw - 24);
        const panelH  = Math.min(480, sh - 48);

        this.layout = buildVelocityModal(
            this.container,
            this.app,
            'DAILY REWARDS',
            panelW,
            panelH,
            GAME_COLORS.accent_gold,
        );
        const { body, innerW } = this.layout;

        let y = 4;

        // ── Streak line ────────────────────────────────────────────────────
        const streakLabel = new Text({
            text: 'STREAK  ·  3 DAYS',
            style: ts(GAME_COLORS.accent_gold, 11, '700', 2),
        });
        streakLabel.anchor.set(0.5, 0);
        streakLabel.position.set(innerW / 2, y);
        body.addChild(streakLabel);
        y += 20;

        // Divider line
        const div = new Graphics();
        div.rect(0, y, innerW, 1);
        div.fill({ color: GAME_COLORS.accent_gold, alpha: 0.22 });
        body.addChild(div);
        y += 10;

        // ── Reward cards ────────────────────────────────────────────────────
        const cardGap = 8;
        const cardH   = 72;

        this.cardRefs = [];
        REWARD_DAYS.forEach((r, index) => {
            const isActive = r.day === ACTIVE_DAY;
            const cardEl = buildRewardCard(
                innerW,
                isActive ? cardH + 8 : cardH,
                r.day,
                r.label,
                r.tokens,
                r.stars,
                r.claimed,
                isActive,
            );
            cardEl.root.position.set(0, y);
            body.addChild(cardEl.root);

            // Store card reference for staggered reveal animation
            this.cardRefs.push({ root: cardEl.root, delay: index * 100 });

            // Store active card for celebration animations
            if (isActive) {
                this.activeCardElements = cardEl;
            }

            y += (isActive ? cardH + 8 : cardH) + cardGap;
        });

        y += 4;

        // ── Come back callout ───────────────────────────────────────────────
        const callout = new Text({
            text: 'Return tomorrow to keep your streak!',
            style: ts(GAME_COLORS.text_muted, 10, '600', 0.5),
        });
        callout.anchor.set(0.5, 0);
        callout.position.set(innerW / 2, y);
        callout.alpha = 0; // Start invisible for reveal animation
        body.addChild(callout);
        this.calloutText = callout;
        y += 18;

        // ── Claim button — gold accent, dominant CTA ────────────────────────
        const btnW = innerW;
        const btnH = 52;
        const claimBtn = createVelocityGameButton(
            'CLAIM REWARD',
            'accent',
            () => {
                this.uiManager.goBack();
            },
            { width: btnW, height: btnH },
        );
        claimBtn.position.set(0, y);
        body.addChild(claimBtn);
        y += btnH + 8;

        // ── Back button — secondary, subordinate ────────────────────────────
        const backBtn = createVelocityGameButton(
            'BACK',
            'secondary',
            () => this.uiManager.goBack(),
            { width: btnW, height: 40 },
        );
        backBtn.position.set(0, y);
        body.addChild(backBtn);
    }

    show(): void {
        super.show();

        // Animate modal entrance with celebration feel
        this.cancelEntrance?.();
        this.container.alpha = 0;
        this.container.scale.set(0.95, 0.95);

        this.cancelEntrance = animateModalEntrance(this.container, {
            duration: 300,
            onComplete: () => {
                // Apply shimmer effect to modal after entrance (attention-drawing)
                this.cancelPolish?.();
                this.cancelPolish = createShimmer(this.container, { loop: true });

                // Animate reward card and token values after entrance
                this.animateRewardCards();
            },
        });
    }

    private animateRewardCards(): void {
        // Clean up any previous animations
        this.cardAnimations.forEach((cancel) => cancel?.());
        this.cardAnimations = [];

        // Staggered reveal animation for all reward cards
        this.cardRefs.forEach(({ root, delay }) => {
            const timeout = setTimeout(() => {
                root.alpha = 0;
                const fadeIn = animateAlpha(root, 0, 1, {
                    duration: 300,
                });
                this.cardAnimations.push(fadeIn);
            }, delay);
            this.cardAnimations.push(() => clearTimeout(timeout));
        });

        // Text reveal animation for callout
        if (this.calloutText) {
            const timeout = setTimeout(() => {
                this.calloutText!.alpha = 1;
                const reveal = animateTextReveal(this.calloutText!, 'Return tomorrow to keep your streak!', {
                    duration: 500,
                    letterDelay: 15,
                });
                this.cardAnimations.push(reveal);
            }, this.cardRefs.length * 100 + 100);
            this.cardAnimations.push(() => clearTimeout(timeout));
        }

        if (this.activeCardElements) {
            const { valueText, unitLabel, root } = this.activeCardElements;

            // Celebrate active card with scale pulse (after stagger completes)
            const timeout = setTimeout(() => {
                const cardPulse = createPulseScale(root, 0.98, 1.02, 1200, { loop: true });
                this.cardAnimations.push(cardPulse);
            }, 500);
            this.cardAnimations.push(() => clearTimeout(timeout));

            // Token count-up animation: 0 → value over 800ms (after stagger)
            const fromTokens = 0;
            const toTokens = parseInt(valueText.text.replace('+', ''), 10) || 0;

            // Store original token text
            const originalTokenText = valueText.text;
            valueText.text = '+0';

            const countTimeout = setTimeout(() => {
                const countUp = animateScoreCountUp(
                    valueText as any,
                    fromTokens,
                    toTokens,
                    {
                        duration: 800,
                        onComplete: () => {
                            // Restore proper format after count-up
                            valueText.text = originalTokenText;
                        },
                    }
                );
                this.cardAnimations.push(countUp);
            }, 500);
            this.cardAnimations.push(() => clearTimeout(countTimeout));

            // Success flash on the active card (subtle highlight)
            const flashTimeout = setTimeout(() => {
                const flash = createSuccessFlash(root, 400, {});
                this.cardAnimations.push(flash);
            }, 500);
            this.cardAnimations.push(() => clearTimeout(flashTimeout));
        }
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(450, width - 24);
        const panelH = Math.min(480, height - 48);
        this.layout.panelW = panelW;
        this.layout.panelH = panelH;
        this.layout.innerW = velocityModalInnerWidth(panelW);
        repositionVelocityModal(this.layout, width, height);
    }

    hide(): void {
        this.cancelEntrance?.();
        this.cancelPolish?.();
        this.cancelExit?.();
        this.cardAnimations.forEach((cancel) => cancel?.());
        this.cardAnimations = [];
        this.animManager.cancelGroup('modal-entrance');
        this.animManager.cancelGroup('polish-shimmer');
        this.animManager.cancelGroup('content-score');
        this.animManager.cancelGroup('polish-flash');
        this.animManager.cancelGroup('polish-pulse');

        // Smooth exit animation before hiding
        this.cancelExit = animateModalExit(this.container, {
            duration: 200,
            onComplete: () => super.hide(),
        });
    }
}
