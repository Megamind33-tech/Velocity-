import './index.css';
import { Application, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { WorldMapScene } from './scenes/WorldMapScene';
import { EventBus } from './events/EventBus';
import { GameEvents } from './events/GameEvents';
import { getPlayerIdForSync, startAuthInBackground } from './firebase/auth';
import { syncProfile } from './firebase/db';
import { World } from './engine/World';
import { Engine } from './engine/Engine';
import { MovementSystem } from './engine/systems/MovementSystem';
import { SpriteSystem } from './engine/systems/SpriteSystem';
import { FlightDynamicsSystem } from './engine/systems/FlightDynamicsSystem';
import { VoiceInputSystem } from './engine/systems/VoiceInputSystem';
import { AutoForwardSystem } from './engine/systems/AutoForwardSystem';
import { LevelSystem } from './engine/systems/LevelSystem';
import { ParallaxSystem } from './engine/systems/ParallaxSystem';
import { HUDSystem } from './engine/systems/HUDSystem';
import { VoiceInputManager } from './engine/input/VoiceInputManager';
import { LeaderboardSystem } from './engine/systems/LeaderboardSystem';
import { QuestSystem } from './engine/systems/QuestSystem';
import { GatePlayoutSystem } from './engine/systems/GatePlayoutSystem';
import { BoundsCheckSystem } from './engine/systems/BoundsCheckSystem';
import { DistanceQuestSystem } from './engine/systems/DistanceQuestSystem';
import { TransformComponent } from './engine/components/TransformComponent';
import { VelocityComponent } from './engine/components/VelocityComponent';
import { SpriteComponent } from './engine/components/SpriteComponent';
import { FlightDynamicsComponent } from './engine/components/FlightDynamicsComponent';
import { TaskOverlay } from './ui/TaskOverlay';
import { PauseOverlay } from './ui/PauseOverlay';
import { RunResultOverlay } from './ui/RunResultOverlay';
import { createDemoTouchZones } from './debug/DemoTouchZones';
import { SONGS } from './data/songs';
import { GameState } from './engine/GameState';
import { unlockAfterComplete } from './data/localProgress';

function showInitFailure(message: string, detail?: string): void {
    const el = document.createElement('div');
    el.setAttribute('role', 'alert');
    el.style.cssText =
        'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:#0a0a1a;color:#00ffcc;font-family:system-ui,sans-serif;text-align:center;z-index:99999;';
    el.innerHTML = `<h1 style="margin:0 0 12px;font-size:1.1rem">Velocity</h1><p style="margin:0;opacity:.9;max-width:320px">${message}</p>${detail ? `<pre style="margin-top:16px;font-size:11px;opacity:.6;white-space:pre-wrap;max-width:100%">${detail}</pre>` : ''}`;
    document.body.appendChild(el);
}

async function init() {
    const app = new Application();
    await app.init({
        background: '#0a0a1a',
        resizeTo: window,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        preference: 'webgl',
    });
    const canvas = app.canvas as HTMLCanvasElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.body.appendChild(canvas);

    startAuthInBackground();

    const world = new World();
    const velocityEngine = new Engine(app, world);

    const levelSystem = new LevelSystem(app);
    const parallaxSystem = new ParallaxSystem(app);
    const hudSystem = new HUDSystem(app);
    const gatePlayout = new GatePlayoutSystem();
    const boundsCheck = new BoundsCheckSystem();
    const distanceQuest = new DistanceQuestSystem();

    world.addSystem(new VoiceInputSystem());
    world.addSystem(new AutoForwardSystem());
    world.addSystem(new FlightDynamicsSystem());
    world.addSystem(new MovementSystem());
    world.addSystem(gatePlayout);
    world.addSystem(boundsCheck);
    world.addSystem(distanceQuest);
    world.addSystem(new SpriteSystem());
    world.addSystem(levelSystem);
    world.addSystem(parallaxSystem);
    world.addSystem(hudSystem);
    world.addSystem(new LeaderboardSystem());
    world.addSystem(new QuestSystem());

    const droneGfx = new Graphics();
    droneGfx.poly([-25, 0, -10, -15, 15, -15, 30, 0, 15, 15, -10, 15]);
    droneGfx.fill({ color: 0x222233 });
    droneGfx.stroke({ color: 0x00ffcc, width: 2 });
    droneGfx.circle(-20, 0, 8).fill({ color: 0xff3300, alpha: 0.6 });
    droneGfx.circle(-20, 0, 4).fill({ color: 0xffcc00 });

    const texture = app.renderer.generateTexture(droneGfx);
    const playerSprite = new Sprite(texture);
    playerSprite.anchor.set(0.5);
    playerSprite.visible = false;
    app.stage.addChild(playerSprite);

    const player = world.createEntity();
    world.addComponent(player, new TransformComponent(app.screen.width / 4, app.screen.height / 2));
    world.addComponent(player, new VelocityComponent(200, 0));
    world.addComponent(player, new FlightDynamicsComponent(1.0, 0.05, 3000));
    world.addComponent(player, new SpriteComponent(playerSprite));

    const taskOverlay = new TaskOverlay();
    app.stage.addChild(taskOverlay);

    let worldMap: WorldMapScene | null = null;
    let pauseOverlay: PauseOverlay | null = null;
    let demoZones: Container | null = null;
    let parallaxReady = false;
    let currentLevelId = 1;
    let resultLayer: RunResultOverlay | null = null;

    const bus = EventBus.getInstance();

    bus.on(GameEvents.LEVEL_START, async (levelId: number) => {
        const uid = getPlayerIdForSync();
        try {
            await syncProfile(uid, Number(levelId), 100 * Number(levelId), 3);
        } catch (e) {
            console.warn('Velocity: profile sync on level start skipped.', e);
        }
    });

    bus.on(GameEvents.LEVEL_COMPLETE, async () => {
        endRun();
        unlockAfterComplete(currentLevelId);
        const uid = getPlayerIdForSync();
        try {
            await syncProfile(uid, currentLevelId, 100 * currentLevelId, 3);
        } catch (e) {
            console.warn('Velocity: profile sync skipped.', e);
        }
        showResult('SECTOR CLEAR', `Level ${currentLevelId} complete`, true);
    });

    bus.on(GameEvents.CRASH, () => {
        endRun();
        showResult('CRASH', 'Stay in the corridor — retry or return to map', false);
    });

    function endRun(): void {
        GameState.setRunActive(false);
        gatePlayout.clear();
        boundsCheck.clear();
        distanceQuest.clear();
        VoiceInputManager.getInstance().pauseMic();
        if (pauseOverlay) pauseOverlay.visible = false;
    }

    function showResult(title: string, subtitle: string, _completed: boolean): void {
        if (resultLayer) {
            app.stage.removeChild(resultLayer);
            resultLayer.destroy({ children: true });
            resultLayer = null;
        }
        resultLayer = new RunResultOverlay(
            app,
            title,
            subtitle,
            () => {
                if (resultLayer) {
                    app.stage.removeChild(resultLayer);
                    resultLayer.destroy({ children: true });
                    resultLayer = null;
                }
                void startRunAfterMic(currentLevelId);
            },
            () => {
                if (resultLayer) {
                    app.stage.removeChild(resultLayer);
                    resultLayer.destroy({ children: true });
                    resultLayer = null;
                }
                openWorldMap();
            }
        );
        app.stage.addChild(resultLayer);
    }

    async function ensureParallax(): Promise<void> {
        if (parallaxReady) return;
        const textures = [0x111122, 0x1a1a3a, 0x24244a].map((color) => {
            const g = new Graphics().rect(0, 0, 512, 512).fill({ color });
            for (let i = 0; i < 50; i++) {
                g.circle(Math.random() * 512, Math.random() * 512, 1).fill({ color: 0xffffff, alpha: 0.5 });
            }
            return app.renderer.generateTexture(g);
        });
        await parallaxSystem.init(player, textures);
        parallaxReady = true;
    }

    async function beginRun(levelId: number): Promise<void> {
        currentLevelId = levelId;
        await ensureParallax();

        levelSystem.destroyAllGates(world);

        const tr = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID)!;
        const vel = world.getComponent<VelocityComponent>(player, VelocityComponent.TYPE_ID)!;
        tr.x = app.screen.width / 4;
        tr.y = app.screen.height / 2;
        tr.rotation = 0;
        vel.vx = 200;
        vel.vy = 0;

        levelSystem.initLevel(levelId, SONGS[0], player);
        gatePlayout.configure(player, levelSystem.lastInitializedGateCount);
        boundsCheck.configure(player, app.screen.height);
        distanceQuest.configure(player);
        distanceQuest.syncBaseline(world);

        playerSprite.visible = true;
        if (pauseOverlay) pauseOverlay.visible = true;

        GameState.setPaused(false);
        GameState.setRunActive(true);
        VoiceInputManager.getInstance().resumeMic();

        bus.emit(GameEvents.LEVEL_START, levelId);
    }

    function ensurePlayUi(): void {
        if (!pauseOverlay) {
            pauseOverlay = new PauseOverlay(app);
            pauseOverlay.visible = false;
            app.stage.addChild(pauseOverlay);
        }
        if (!demoZones) {
            const z = createDemoTouchZones(app.screen.width, app.screen.height);
            if (z) {
                demoZones = z;
                app.stage.addChild(z);
                console.warn('[DEV] Demo touch strips active (left=up, right=down). Remove for production.');
            }
        }
        hudSystem.init(player);
    }

    async function startRunAfterMic(levelId: number): Promise<void> {
        const ok = await VoiceInputManager.getInstance().init();
        if (!ok) {
            showMicDeniedOverlay();
            return;
        }
        ensurePlayUi();
        if (demoZones) demoZones.visible = true;
        await beginRun(levelId);
    }

    function showMicGateOverlay(levelId: number): void {
        const overlay = new Graphics();
        overlay.rect(0, 0, app.screen.width, app.screen.height);
        overlay.fill({ color: 0x000000, alpha: 0.85 });
        overlay.eventMode = 'static';
        app.stage.addChild(overlay);

        const startStyle = new TextStyle({
            fill: '#00ffcc',
            fontSize: 28,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Arial',
            dropShadow: { blur: 10, color: '#00ffcc', distance: 0 },
        });

        const startText = new Text({ text: `LEVEL ${levelId}`, style: startStyle });
        const subText = new Text({
            text: 'TAP TO INITIALIZE MIC',
            style: new TextStyle({ ...startStyle, fontSize: 14 }),
        });
        subText.alpha = 0.7;
        startText.anchor.set(0.5);
        subText.anchor.set(0.5);
        startText.position.set(app.screen.width / 2, app.screen.height / 2 - 20);
        subText.position.set(app.screen.width / 2, app.screen.height / 2 + 30);
        app.stage.addChild(startText, subText);

        overlay.on('pointerdown', async () => {
            const success = await VoiceInputManager.getInstance().init();
            app.stage.removeChild(overlay);
            app.stage.removeChild(startText);
            app.stage.removeChild(subText);
            overlay.destroy();
            startText.destroy();
            subText.destroy();

            if (success) {
                ensurePlayUi();
                if (demoZones) demoZones.visible = true;
                await beginRun(levelId);
            } else {
                showMicDeniedOverlay();
            }
        });
    }

    function showMicDeniedOverlay(): void {
        const overlay = new Graphics();
        overlay.rect(0, 0, app.screen.width, app.screen.height);
        overlay.fill({ color: 0x000000, alpha: 0.88 });
        overlay.eventMode = 'static';
        app.stage.addChild(overlay);
        const t = new Text({
            text: 'Microphone required for vocal flight.\nTap to return to map.',
            style: new TextStyle({
                fill: '#ff6666',
                fontSize: 16,
                fontFamily: 'system-ui, sans-serif',
                align: 'center',
            }),
        });
        t.anchor.set(0.5);
        t.position.set(app.screen.width / 2, app.screen.height / 2);
        app.stage.addChild(t);
        overlay.on('pointerdown', () => {
            app.stage.removeChild(overlay, t);
            overlay.destroy();
            t.destroy();
            openWorldMap();
        });
    }

    function openWorldMap(): void {
        endRun();
        playerSprite.visible = false;
        if (pauseOverlay) pauseOverlay.visible = false;
        if (demoZones) demoZones.visible = false;
        levelSystem.destroyAllGates(world);

        if (worldMap) {
            worldMap.destroy();
            worldMap = null;
        }
        worldMap = new WorldMapScene(app, (id) => {
            worldMap?.destroy();
            worldMap = null;
            showMicGateOverlay(id);
        });
    }

    GameState.setPaused(false);
    GameState.setRunActive(false);
    velocityEngine.start();
    openWorldMap();

    console.log('Velocity: World map ready — select a level.');
}

init().catch((err) => {
    console.error('Failed to initialize Velocity Engine:', err);
    const msg = err instanceof Error ? err.message : String(err);
    showInitFailure('Could not start the game engine. Try refreshing or another browser.', msg);
});
