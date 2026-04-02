import './index.css';
import { Application, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
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
import { GatePassSystem } from './engine/systems/GatePassSystem';
import { GameState } from './engine/GameState';
import { TransformComponent } from './engine/components/TransformComponent';
import { VelocityComponent } from './engine/components/VelocityComponent';
import { SpriteComponent } from './engine/components/SpriteComponent';
import { FlightDynamicsComponent } from './engine/components/FlightDynamicsComponent';
import { TaskOverlay } from './ui/TaskOverlay';
import { PauseOverlay } from './ui/PauseOverlay';
import { createDemoTouchZones } from './debug/DemoTouchZones';
import { getSongForLevel } from './data/songs';
import { loadMaxUnlockedLevel, saveMaxUnlockedLevel } from './game/localProgress';

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

    const droneGfx = new Graphics();
    droneGfx.poly([-25, 0, -10, -15, 15, -15, 30, 0, 15, 15, -10, 15]);
    droneGfx.fill({ color: 0x222233 });
    droneGfx.stroke({ color: 0x00ffcc, width: 2 });
    droneGfx.circle(-20, 0, 8).fill({ color: 0xff3300, alpha: 0.6 });
    droneGfx.circle(-20, 0, 4).fill({ color: 0xffcc00 });

    const texture = app.renderer.generateTexture(droneGfx);
    const playerSprite = new Sprite(texture);
    playerSprite.anchor.set(0.5);
    app.stage.addChild(playerSprite);

    const player = world.createEntity();
    world.addComponent(player, new TransformComponent(app.screen.width / 4, app.screen.height / 2));
    world.addComponent(player, new VelocityComponent(200, 0));
    world.addComponent(player, new FlightDynamicsComponent(1.0, 0.05, 3000));
    world.addComponent(player, new SpriteComponent(playerSprite));

    const gatePassSystem = new GatePassSystem(player);

    world.addSystem(new VoiceInputSystem());
    world.addSystem(new AutoForwardSystem());
    world.addSystem(new FlightDynamicsSystem());
    world.addSystem(gatePassSystem);
    world.addSystem(new MovementSystem());
    world.addSystem(new SpriteSystem());
    world.addSystem(levelSystem);
    world.addSystem(parallaxSystem);
    world.addSystem(hudSystem);
    world.addSystem(new LeaderboardSystem());
    world.addSystem(new QuestSystem());

    let currentLevelId = 1;
    let parallaxReady = false;
    let demoZonesAdded = false;
    let mapMicHint: Text | null = null;

    function resetPlayerForRun(): void {
        const t = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID);
        const v = world.getComponent<VelocityComponent>(player, VelocityComponent.TYPE_ID);
        if (t) {
            t.x = app.screen.width / 4;
            t.y = app.screen.height / 2;
            t.rotation = 0;
        }
        if (v) {
            v.vx = 200;
            v.vy = 0;
        }
        playerSprite.rotation = 0;
    }

    function returnToMap(): void {
        GameState.setGameplayActive(false);
        GameState.setPaused(false);
        levelSystem.clearLevel(world);
        resetPlayerForRun();
        worldMap.visible = true;
        worldMap.refreshUnlocks();
        pauseOverlay.setGameplayVisible(false);
        VoiceInputManager.getInstance().pauseMic();
    }

    const pauseOverlay = new PauseOverlay(app, { onMap: returnToMap });
    app.stage.addChild(pauseOverlay);
    pauseOverlay.setGameplayVisible(false);

    const worldMap = new WorldMapScene(app, {
        getMaxUnlockedLevel: loadMaxUnlockedLevel,
        onSelectLevel: (levelId) => {
            void startRunFromMap(levelId);
        },
    });
    app.stage.addChild(worldMap);

    const hintStyle = new TextStyle({
        fill: '#ffffff',
        fontSize: 13,
        fontFamily: 'system-ui,sans-serif',
        fontWeight: 'normal',
    });
    mapMicHint = new Text({
        text: 'Tap a glowing node to fly. The browser will ask for microphone access.',
        style: hintStyle,
    });
    mapMicHint.alpha = 0.75;
    mapMicHint.position.set(16, 40);
    worldMap.addChild(mapMicHint);

    async function startRunFromMap(levelId: number): Promise<void> {
        const success = await VoiceInputManager.getInstance().init();
        if (!success) {
            if (mapMicHint) {
                mapMicHint.text = 'Microphone denied — allow access in browser settings, then try again.';
                mapMicHint.style.fill = '#ff6666';
            }
            return;
        }
        if (mapMicHint) {
            mapMicHint.text = 'Tap a glowing node to fly. The browser will ask for microphone access.';
            mapMicHint.style.fill = '#ffffff';
        }

        VoiceInputManager.getInstance().resumeMic();
        currentLevelId = levelId;
        worldMap.visible = false;
        resetPlayerForRun();
        levelSystem.initLevel(world, levelId, getSongForLevel(levelId), player);
        gatePassSystem.setPlayer(player);
        hudSystem.init(player);

        if (!parallaxReady) {
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

        if (!demoZonesAdded) {
            const demoZones = createDemoTouchZones(app.screen.width, app.screen.height);
            if (demoZones) {
                app.stage.addChild(demoZones);
                console.warn('[DEV] Demo touch strips active (left=up, right=down). Remove for production.');
            }
            demoZonesAdded = true;
        }

        pauseOverlay.setGameplayVisible(true);
        GameState.setGameplayActive(true);
        EventBus.getInstance().emit(GameEvents.LEVEL_START, levelId);
    }

    const taskOverlay = new TaskOverlay();
    app.stage.addChild(taskOverlay);

    GameState.setGameplayActive(false);

    const eventBus = EventBus.getInstance();

    eventBus.on(GameEvents.LEVEL_START, async (levelId: unknown) => {
        const uid = getPlayerIdForSync();
        const id = Number(levelId);
        console.log(`WorldMap: Syncing progress for level ${id}`);
        try {
            await syncProfile(uid, id, 100 * id, 3);
        } catch (e) {
            console.warn('Velocity: profile sync skipped.', e);
        }
    });

    eventBus.on(GameEvents.LEVEL_COMPLETE, async () => {
        const uid = getPlayerIdForSync();
        saveMaxUnlockedLevel(currentLevelId + 1);
        try {
            await syncProfile(uid, currentLevelId + 1, 100 * currentLevelId + 500, 4);
        } catch (e) {
            console.warn('Velocity: profile sync skipped.', e);
        }
        returnToMap();
    });

    eventBus.on(GameEvents.CRASH, () => {
        if (!GameState.gameplayActive) return;
        resetPlayerForRun();
        levelSystem.initLevel(world, currentLevelId, getSongForLevel(currentLevelId), player);
    });

    velocityEngine.start();
    console.log('Velocity: World map ready — select a sector to launch.');
}

init().catch((err) => {
    console.error('Failed to initialize Velocity Engine:', err);
    const msg = err instanceof Error ? err.message : String(err);
    showInitFailure('Could not start the game engine. Try refreshing or another browser.', msg);
});
