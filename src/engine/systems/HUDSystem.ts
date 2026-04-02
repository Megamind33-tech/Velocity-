import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { VoiceInputManager } from '../input/VoiceInputManager';
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
    private playerEntity: Entity | null = null;

    constructor(private app: any) {
        this.container = new Container();
        this.app.stage.addChild(this.container);

        const style = new TextStyle({
            fill: '#00ffcc',
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Arial'
        });

        // Altitude & Speed
        this.altitudeText = new Text({ text: 'ALT: 0', style });
        this.speedText = new Text({ text: 'SPD: 0', style });
        
        this.altitudeText.position.set(20, 20);
        this.speedText.position.set(20, 45);
        this.container.addChild(this.altitudeText, this.speedText);

        // Voice Power Meter
        const meterLabel = new Text({ text: 'VOICE THRUST', style: { ...style, fontSize: 12 } });
        meterLabel.position.set(20, 80);
        this.container.addChild(meterLabel);

        this.voiceMeter = new Graphics();
        this.voiceMeter.position.set(20, 100);
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
            // Altitude is inverse of Y (relative to start)
            const alt = Math.floor((this.app.screen.height / 2 - transform.y) / 10);
            this.altitudeText.text = `ALT: ${alt}m`;
        }

        if (velocity) {
            const spd = Math.floor(Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy) / 10);
            this.speedText.text = `SPD: ${spd}km/h`;
        }

        // Render Voice Meter
        this.voiceMeter.clear();
        this.voiceMeter.rect(0, 0, 200, 10).fill({ color: 0x333333 });
        this.voiceMeter.rect(0, 0, 200 * voice.volume, 10).fill({ color: 0x00ffcc });
        this.voiceMeter.setStrokeStyle({ width: 2, color: 0xffffff });
        this.voiceMeter.stroke();
    }
}
