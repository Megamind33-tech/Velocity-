import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { VoiceInputManager } from '../input/VoiceInputManager';
import { GameState } from '../GameState';
import { VOICE_FLIGHT } from '../../data/constants';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';
import { EDUCATIONAL_COPY, Song } from '../../data/songs';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * System that manages the game HUD, displaying flight metrics and voice feedback.
 */
export class HUDSystem implements System {
    public readonly priority: number = 3000;
    private container: Container;
    private voiceMeter: Graphics;
    private courseText: Text;
    private lessonText: Text;
    private tipText: Text;
    private altitudeText: Text;
    private speedText: Text;
    private pitchText: Text;
    private playerEntity: Entity | null = null;
    private currentLessonProgress: string = '0 / 0 GATES';
    private skillProgressLabel: string = 'SKILL: PITCH CENTER';

    constructor(private app: any) {
        this.container = new Container();
        this.app.stage.addChild(this.container);

        const style = new TextStyle({
            fill: '#00ffcc',
            fontSize: 14,
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
        const panel = new Graphics();
        panel.roundRect(10, 10, 340, 186, 15);
        panel.fill({ color: 0x000000, alpha: 0.4 });
        panel.stroke({ color: 0xffffff, width: 1, alpha: 0.2 });
        this.container.addChild(panel);

        // 2. Metrics
        this.altitudeText = new Text({ text: 'ALTITUDE: 000', style });
        this.speedText = new Text({ text: 'FORWARD: 000', style });
        this.pitchText = new Text({ text: 'PITCH: --- Hz', style: { ...style, fontSize: 12 } });
        this.courseText = new Text({ text: 'COURSE 1 / 1 - READY', style: { ...style, fontSize: 11 } });
        this.lessonText = new Text({ text: 'SKILL: PITCH CENTER', style: { ...style, fontSize: 11 } });
        this.tipText = new Text({
            text: 'Sing into the first lane to start the lesson flow.',
            style: new TextStyle({
                ...style,
                fontSize: 10,
                fontWeight: 'normal',
                wordWrap: true,
                wordWrapWidth: 290
            })
        });

        this.altitudeText.position.set(25, 22);
        this.speedText.position.set(25, 46);
        this.pitchText.position.set(25, 68);
        this.courseText.position.set(25, 92);
        this.lessonText.position.set(25, 112);
        this.tipText.position.set(25, 132);
        this.tipText.alpha = 0.9;
        this.container.addChild(this.altitudeText, this.speedText, this.pitchText, this.courseText, this.lessonText, this.tipText);

        // 3. Voice Power Meter
        const labelStyle = new TextStyle({ ...style, fontSize: 10 });
        const meterLabel = new Text({
            text: 'VOCAL LEVEL (GATE)',
            style: labelStyle,
        });
        meterLabel.alpha = 0.7;
        meterLabel.position.set(25, 166);
        this.container.addChild(meterLabel);

        this.voiceMeter = new Graphics();
        this.voiceMeter.position.set(25, 182);
        this.container.addChild(this.voiceMeter);

        const bus = EventBus.getInstance();
        bus.on(GameEvents.LEVEL_START, (payload) => {
            const levelId = Number(payload?.levelId ?? 1);
            const totalLevels = Number(payload?.totalLevels ?? 1);
            const totalGates = Number(payload?.totalGates ?? 0);
            this.currentLessonProgress = `0 / ${totalGates} GATES`;
            this.applySongContext(payload?.song, levelId, totalLevels);
        });

        bus.on(GameEvents.GATE_PASSED, (payload) => {
            const passedGates = Number(payload?.passedGates ?? 0);
            const totalGates = Number(payload?.totalGates ?? 0);
            this.currentLessonProgress = `${passedGates} / ${totalGates} GATES`;
            this.lessonText.text = `${this.skillProgressLabel} | ${this.currentLessonProgress}`;
        });

        bus.on(GameEvents.LEVEL_COMPLETE, (payload) => {
            const passedGates = Number(payload?.passedGates ?? 0);
            const totalGates = Number(payload?.totalGates ?? 0);
            this.currentLessonProgress = `CLEAR ${passedGates} / ${totalGates}`;
            this.lessonText.text = `${this.skillProgressLabel} | ${this.currentLessonProgress}`;
        });
    }

    public init(player: Entity): void {
        this.playerEntity = player;
    }

    public render(entities: Entity[], world: World, interpolation: number): void {
        if (this.playerEntity === null) return;

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

    private applySongContext(song: Song | undefined, levelId: number, totalLevels: number): void {
        const songName = song?.name?.toUpperCase() ?? 'UNNAMED LESSON';
        const skill = this.formatSkill(song?.primarySkill);
        const lessonType = (song?.lessonType ?? 'melody').replace(/_/g, ' ').toUpperCase();
        this.courseText.text = `COURSE ${levelId} / ${totalLevels} - ${songName}`;
        this.skillProgressLabel = `${lessonType}: ${skill}`;
        this.lessonText.text = `${this.skillProgressLabel} | ${this.currentLessonProgress}`;
        this.tipText.text = song?.educationalCopyId
            ? EDUCATIONAL_COPY[song.educationalCopyId]
            : 'Match the lane shape and recover quickly after misses.';
    }

    private formatSkill(skill: string | undefined): string {
        return (skill ?? 'pitch_center').replace(/_/g, ' ').toUpperCase();
    }
}
