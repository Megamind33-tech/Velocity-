import { Application, Container, Sprite, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { fitLabelToWidth } from '../menuShared/fitLabelToWidth';
import {
    buildVelocityModal,
    repositionVelocityModal,
    syncModalShellResize,
    velocityModalInnerWidth,
    type VelocityModalLayout,
} from '../velocityModalLayout';
import { createVelocityGameButton } from '../velocityUiButtons';
import { animateModalEntrance, animateModalExit } from '../modalAnimations';
import { AnimationManager } from '../AnimationManager';
import { createShimmer } from '../polishEffects';
import {
    getMainMenuProgress,
    getSelectedPlaneId,
    getUnlockedPlaneIds,
    setSelectedPlaneId,
} from '../../../data/localProgress';
import { getPlayerPlaneTexture } from '../../../game/playerPlanes';

const PLANES: { id: string; label: string; tier: string }[] = [
    { id: 'cadet', label: 'CADET MK-I', tier: 'Starter' },
    { id: 'scout', label: 'SCOUT RAPTOR', tier: 'Unlock L5+' },
    { id: 'interceptor', label: 'INTERCEPTOR', tier: 'Unlock L10+' },
];

export class HangarScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;
    private animManager = AnimationManager.getInstance();
    private cancelEntrance: (() => void) | null = null;
    private cancelPolish: (() => void) | null = null;
    private cancelExit: (() => void) | null = null;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;
        const panelW = Math.min(500, sw - 24);
        const panelH = Math.min(520, sh - 48);

        this.layout = buildVelocityModal(this.container, this.app, 'HANGAR', panelW, panelH);
    }

    private rebuildBody(): void {
        const { body, innerW } = this.layout;
        body.removeChildren();

        const prog = getMainMenuProgress();
        const unlocked = new Set(getUnlockedPlaneIds(prog.maxUnlocked));
        const selected = getSelectedPlaneId();

        const sub = fitLabelToWidth(
            'Select your craft. Unlocks follow route progress.',
            innerW - 16,
            (fs) =>
                new TextStyle({
                    fontFamily: GAME_FONTS.functional,
                    fontSize: fs,
                    fontWeight: '600',
                    fill: GAME_COLORS.text_secondary,
                }),
            13,
            10,
        );
        sub.anchor.set(0.5, 0);
        sub.position.set(innerW / 2, 0);
        body.addChild(sub);

        const btnW = Math.min(280, innerW);
        const btnH = 48;
        const gap = 12;
        let y = GAME_SIZES.spacing.xxl;

        const iconColW = 44;
        const btnInnerW = Math.max(120, btnW - iconColW - 8);

        PLANES.forEach((plane) => {
            const ok = unlocked.has(plane.id);
            const line = ok
                ? `${plane.label}  ·  ${plane.tier}${plane.id === selected ? '  [ACTIVE]' : ''}`
                : `${plane.label}  ·  LOCKED`;
            const fitT = fitLabelToWidth(
                line,
                btnInnerW - 20,
                (fs) =>
                    new TextStyle({
                        fontFamily: GAME_FONTS.functional,
                        fontSize: fs,
                        fontWeight: 'bold',
                        fill: ok ? GAME_COLORS.text_primary : GAME_COLORS.text_muted,
                    }),
                14,
                10,
            );
            const t = fitT.text;
            fitT.destroy();

            const row = new Container();
            row.position.set((innerW - btnW) / 2, y);

            const preview = new Sprite(getPlayerPlaneTexture(plane.id));
            preview.anchor.set(0.5);
            const ph = 38;
            preview.scale.set(ph / Math.max(1, preview.texture.height));
            preview.position.set(iconColW / 2, btnH / 2);
            preview.alpha = ok ? 1 : 0.38;
            row.addChild(preview);

            const itemBtn = createVelocityGameButton(
                t,
                ok ? (plane.id === selected ? 'accent' : 'secondary') : 'secondary',
                () => {
                    if (!ok) return;
                    setSelectedPlaneId(plane.id);
                    this.rebuildBody();
                },
                { width: btnInnerW, height: btnH },
            );
            itemBtn.position.set(iconColW + 4, 0);
            if (!ok) {
                itemBtn.alpha = 0.55;
            }
            row.addChild(itemBtn);
            body.addChild(row);
            y += btnH + gap;
        });

        const backBtn = createVelocityGameButton('BACK', 'secondary', () => this.uiManager.goBack(), {
            width: btnW,
            height: btnH,
        });
        backBtn.position.set((innerW - btnW) / 2, y + 8);
        body.addChild(backBtn);
    }

    show(): void {
        super.show();
        this.rebuildBody();

        this.cancelEntrance?.();
        this.container.alpha = 0;
        this.container.scale.set(0.95, 0.95);
        this.cancelEntrance = animateModalEntrance(this.container, {
            duration: 300,
            onComplete: () => {
                this.cancelPolish?.();
                this.cancelPolish = createShimmer(this.container, { loop: true });
            },
        });
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(500, width - 24);
        const panelH = Math.min(520, height - 48);
        this.layout.panelW = panelW;
        this.layout.panelH = panelH;
        this.layout.innerW = velocityModalInnerWidth(panelW);
        repositionVelocityModal(this.layout, width, height);
    }

    hide(): void {
        this.cancelEntrance?.();
        this.cancelPolish?.();
        this.cancelExit?.();
        this.animManager.cancelGroup('modal-entrance');
        this.animManager.cancelGroup('polish-shimmer');

        this.cancelExit = animateModalExit(this.container, {
            duration: 200,
            onComplete: () => super.hide(),
        });
    }
}
