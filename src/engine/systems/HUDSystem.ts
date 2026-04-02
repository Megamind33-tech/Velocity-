import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { VoiceInputManager } from '../input/VoiceInputManager';
import { GameState } from '../GameState';
import { VOICE_FLIGHT } from '../../data/constants';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ResponsiveUIManager } from '../../ui/ResponsiveUIManager';

/**
 * System that manages the game HUD, displaying flight metrics and voice feedback.
 * UI is fully responsive to screen size and orientation.
 */
export class HUDSystem implements System {
    public readonly priority: number = 3000;
    private container: Container;
    private panel: Graphics;
    private voiceMeter: Graphics;
    private altitudeText: Text;
    private speedText: Text;
    private pitchText: Text;
    private meterLabel: Text;
    private playerEntity: Entity | null = null;
    private responsiveManager: ResponsiveUIManager;

    constructor(private app: any) {
        this.responsiveManager = ResponsiveUIManager.getInstance();
        this.container = new Container();
        this.app.stage.addChild(this.container);

        // Create base text style (will be resized responsively)
        const baseFontSize = this.responsiveManager.calculateFontSize(14);
        const style = new TextStyle({
            fill: '#00ffcc',
            fontSize: baseFontSize,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Arial',
            dropShadow: {
                alpha: 0.8,
                blur: 4,
                color: '#000000',
                distance: 2
            }
        });

        // 1. Glassmorphism Background Panel
        const layout = this.responsiveManager.getHUDPanelLayout();
        this.panel = new Graphics();
        this.panel.roundRect(0, 0, layout.width, layout.height, 15);
        this.panel.fill({ color: 0x000000, alpha: 0.4 });
        this.panel.stroke({ color: 0xffffff, width: 1, alpha: 0.2 });
        this.panel.position.set(layout.x, layout.y);
        this.container.addChild(this.panel);

        // 2. Metrics Text
        this.altitudeText = new Text({ text: 'ALTITUDE: 000', style });
        this.speedText = new Text({ text: 'FORWARD: 000', style });
        const pitchStyle = new TextStyle({
            fill: style.fill,
            fontSize: this.responsiveManager.calculateFontSize(12),
            fontWeight: style.fontWeight,
            fontFamily: style.fontFamily,
            dropShadow: style.dropShadow
        });
        this.pitchText = new Text({ text: 'PITCH: --- Hz', style: pitchStyle });

        // Position metrics relative to container
        const textPositions = this.responsiveManager.getHUDTextPositions();
        this.altitudeText.position.set(layout.x + textPositions.altitude.x, layout.y + textPositions.altitude.y);
        this.speedText.position.set(layout.x + textPositions.speed.x, layout.y + textPositions.speed.y);
        this.pitchText.position.set(layout.x + textPositions.pitch.x, layout.y + textPositions.pitch.y);
        this.container.addChild(this.altitudeText, this.speedText, this.pitchText);

        // 3. Voice Power Meter Label
        const labelFontSize = this.responsiveManager.calculateFontSize(10);
        const labelStyle = new TextStyle({
            fill: style.fill,
            fontSize: labelFontSize,
            fontWeight: style.fontWeight,
            fontFamily: style.fontFamily,
            dropShadow: style.dropShadow
        });
        this.meterLabel = new Text({
            text: 'VOCAL LEVEL (GATE)',
            style: labelStyle,
        });
        this.meterLabel.alpha = 0.7;
        this.meterLabel.position.set(layout.x + textPositions.meterLabel.x, layout.y + textPositions.meterLabel.y);
        this.container.addChild(this.meterLabel);

        // 4. Voice Power Meter
        this.voiceMeter = new Graphics();
        this.voiceMeter.position.set(layout.x + textPositions.meter.x, layout.y + textPositions.meter.y);
        this.container.addChild(this.voiceMeter);

        // Listen for screen resize to reposition UI
        window.addEventListener('resize', () => this.onScreenResize());
        window.addEventListener('orientationchange', () => this.onScreenResize());
    }

    public init(player: Entity): void {
        this.playerEntity = player;
    }

    /**
     * Handle screen resize and orientation changes
     */
    private onScreenResize(): void {
        const layout = this.responsiveManager.getHUDPanelLayout();
        const textPositions = this.responsiveManager.getHUDTextPositions();

        // Reposition panel
        this.panel.position.set(layout.x, layout.y);
        this.panel.clear();
        this.panel.roundRect(0, 0, layout.width, layout.height, 15);
        this.panel.fill({ color: 0x000000, alpha: 0.4 });
        this.panel.stroke({ color: 0xffffff, width: 1, alpha: 0.2 });

        // Reposition and resize text elements
        const baseFontSize = this.responsiveManager.calculateFontSize(14);
        this.altitudeText.style.fontSize = baseFontSize;
        this.speedText.style.fontSize = baseFontSize;
        this.pitchText.style.fontSize = this.responsiveManager.calculateFontSize(12);
        this.meterLabel.style.fontSize = this.responsiveManager.calculateFontSize(10);

        this.altitudeText.position.set(layout.x + textPositions.altitude.x, layout.y + textPositions.altitude.y);
        this.speedText.position.set(layout.x + textPositions.speed.x, layout.y + textPositions.speed.y);
        this.pitchText.position.set(layout.x + textPositions.pitch.x, layout.y + textPositions.pitch.y);
        this.meterLabel.position.set(layout.x + textPositions.meterLabel.x, layout.y + textPositions.meterLabel.y);
        this.voiceMeter.position.set(layout.x + textPositions.meter.x, layout.y + textPositions.meter.y);
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
        this.voiceMeter.roundRect(0, 0, 190, 8, 4).fill({ color: 0x222222, alpha: 0.8 });
        // Glow layer
        const level = Math.min(1, voice.volume * 4);
        if (!GameState.paused && !voice.isSuspended && level > 0.03) {
            this.voiceMeter.roundRect(0, 0, 190 * level, 8, 4)
                .fill({ color: 0x00ffcc, alpha: 0.8 })
                .stroke({ color: 0xffffff, width: 1, alpha: 0.5 });
        }
    }
}
