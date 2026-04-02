import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { VoiceInputManager } from '../input/VoiceInputManager';
import { GameState } from '../GameState';
import { VOICE_FLIGHT } from '../../data/constants';
import { GAME_UI } from '../../ui/theme/GameUITheme';
import { ProgressBar } from '@pixi/ui';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * System that manages the game HUD, displaying flight metrics and voice feedback.
 */
export class HUDSystem implements System {
    public readonly priority: number = 3000;
    private container: Container;
    private voiceMeter: ProgressBar;
    private altitudeText: Text;
    private speedText: Text;
    private pitchText: Text;
    private playerEntity: Entity | null = null;

    constructor(private app: any, parent: Container) {
        this.container = new Container();
        parent.addChild(this.container);

        const style = new TextStyle({
            fill: '#00f0ff',
            fontSize: 13,
            fontWeight: '700',
            fontFamily: GAME_UI.fontBody,
            dropShadow: {
                alpha: 0.8,
                blur: 4,
                color: '#000000',
                distance: 2
            }
        });

        // 1. Glassmorphism Background Panel
        const panel = new Graphics();
        panel.roundRect(10, 10, 220, 132, 14);
        panel.fill({ color: GAME_UI.bgPanel, alpha: 0.88 });
        panel.stroke({ color: GAME_UI.strokeNeon, width: 2, alpha: 0.65 });
        this.container.addChild(panel);

        // 2. Metrics
        this.altitudeText = new Text({ text: 'ALTITUDE: 000', style });
        this.speedText = new Text({ text: 'FORWARD: 000', style });
        this.pitchText = new Text({ text: 'PITCH: --- Hz', style: { ...style, fontSize: 12 } });

        this.altitudeText.position.set(25, 25);
        this.speedText.position.set(25, 50);
        this.pitchText.position.set(25, 68);
        this.container.addChild(this.altitudeText, this.speedText, this.pitchText);

        // 3. Voice Power Meter
        const labelStyle = new TextStyle({ ...style, fontSize: 10 });
        const meterLabel = new Text({
            text: 'VOCAL LEVEL (GATE)',
            style: labelStyle,
        });
        meterLabel.alpha = 0.7;
        meterLabel.position.set(25, 92);
        this.container.addChild(meterLabel);

        const barW = 190;
        const barH = 10;
        const bgG = new Graphics();
        bgG.roundRect(0, 0, barW, barH, 4);
        bgG.fill({ color: 0x1a1035, alpha: 0.95 });
        bgG.stroke({ width: 1, color: GAME_UI.strokeNeon, alpha: 0.35 });
        const fillG = new Graphics();
        fillG.roundRect(0, 0, barW, barH, 4);
        fillG.fill({ color: GAME_UI.accentCool, alpha: 0.9 });
        this.voiceMeter = new ProgressBar({
            bg: bgG,
            fill: fillG,
            progress: 0,
        });
        this.voiceMeter.setSize(barW, barH);
        this.voiceMeter.position.set(25, 112);
        this.container.addChild(this.voiceMeter);
    }

    public init(player: Entity): void {
        this.playerEntity = player;
    }

    public render(entities: Entity[], world: World, interpolation: number): void {
        if (!this.playerEntity) return;

        const transform = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        const velocity = world.getComponent<VelocityComponent>(this.playerEntity, VelocityComponent.TYPE_ID);
        const voice = VoiceInputManager.getInstance();

        if (transform) {
            const alt = Math.floor(Math.max(0, (this.app.screen.height / 2 - transform.y) / 2));
            this.altitudeText.text = `ALTITUDE: ${alt.toString().padStart(3, '0')}m`;
        }

        if (velocity) {
            this.speedText.text = `FORWARD: ${Math.round(velocity.vx)} px/s`;
        }

        if (GameState.paused) {
            this.pitchText.text = 'PITCH: (paused)';
        } else if (voice.isSuspended) {
            this.pitchText.text = 'PITCH: --- Hz';
        } else if (voice.volume > VOICE_FLIGHT.VOLUME_GATE && voice.pitchHz > 0) {
            this.pitchText.text = `PITCH: ${Math.round(voice.pitchHz)} Hz`;
        } else {
            this.pitchText.text = 'PITCH: (sing)';
        }

        const level = Math.min(1, voice.volume * 4);
        const pct =
            GameState.paused || voice.isSuspended
                ? 0
                : level > 0.03
                  ? Math.round(level * 100)
                  : 0;
        this.voiceMeter.progress = pct;
    }
}
