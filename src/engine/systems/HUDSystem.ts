import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { VoiceInputManager } from '../input/VoiceInputManager';
import { GameState } from '../GameState';
import { VOICE_FLIGHT } from '../../data/constants';
import { GAME_UI } from '../../ui/theme/GameUITheme';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * System that manages the game HUD, displaying flight metrics and voice feedback.
 */
export class HUDSystem implements System {
    public readonly priority: number = 3000;
    private container: Container;
    private voiceMeter: Graphics;
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

        this.voiceMeter = new Graphics();
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

        // Render Premium Voice Meter
        this.voiceMeter.clear();
        // Background rail
        this.voiceMeter.roundRect(0, 0, 190, 8, 4).fill({ color: 0x1a1035, alpha: 0.9 });
        // Glow layer
        const level = Math.min(1, voice.volume * 4);
        if (!GameState.paused && !voice.isSuspended && level > 0.03) {
            this.voiceMeter.roundRect(0, 0, 190 * level, 8, 4)
                .fill({ color: GAME_UI.accentCool, alpha: 0.85 })
                .stroke({ color: GAME_UI.accentHot, width: 1, alpha: 0.6 });
        }
    }
}
