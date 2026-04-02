import './index.css';
import { Application, Container, Sprite, Graphics, Texture } from 'pixi.js';
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
import { TransformComponent } from './engine/components/TransformComponent';
import { VelocityComponent } from './engine/components/VelocityComponent';
import { SpriteComponent } from './engine/components/SpriteComponent';
import { FlightDynamicsComponent } from './engine/components/FlightDynamicsComponent';
import { TaskOverlay } from './ui/TaskOverlay';
import { PauseOverlay } from './ui/PauseOverlay';
import { MainMenuRoot } from './ui/MainMenuRoot';
import { PlayerStatsRoot } from './ui/PlayerStatsRoot';
import { MicGateOverlay } from './ui/MicGateOverlay';
import { createDemoTouchZones } from './debug/DemoTouchZones';
import { getSafeAreaInsets } from './ui/safeArea';
import { SONGS, type Song } from './data/songs';
import { LocalPlayerStats } from './player/LocalPlayerStats';
import { VOICE_FLIGHT } from './data/constants';
import { SongSelectRoot } from './ui/SongSelectRoot';
import { loadGameFont } from './ui/loadGameFont';

function showInitFailure(message: string, detail?: string): void {
    const el = document.createElement('div');
    el.setAttribute('role', 'alert');
    el.style.cssText =
        'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:#050510;color:#00f0ff;font-family:system-ui,sans-serif;text-align:center;z-index:99999;';
    el.innerHTML = `<h1 style="margin:0 0 12px;font-size:1.1rem">Velocity</h1><p style="margin:0;opacity:.9;max-width:320px">${message}</p>${detail ? `<pre style="margin-top:16px;font-size:11px;opacity:.6;white-space:pre-wrap;max-width:100%">${detail}</pre>` : ''}`;
    document.body.appendChild(el);
}

async function init() {
    const app = new Application();
    await app.init({
        background: '#050510',
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

    await loadGameFont();

    startAuthInBackground();

    const world = new World();
    const velocityEngine = new Engine(app, world);
    velocityEngine.start();
    velocityEngine.setSimulationEnabled(false);

    const gameLayer = new Container();
    gameLayer.visible = false;
    app.stage.addChild(gameLayer);

    const levelSystem = new LevelSystem(app, gameLayer);
    const parallaxSystem = new ParallaxSystem(app, gameLayer);
    const hudSystem = new HUDSystem(app, gameLayer);

    world.addSystem(new VoiceInputSystem());
    world.addSystem(new AutoForwardSystem());
    world.addSystem(new FlightDynamicsSystem());
    world.addSystem(new MovementSystem());
    world.addSystem(new SpriteSystem());
    world.addSystem(levelSystem);
    world.addSystem(parallaxSystem);
    world.addSystem(hudSystem);
    world.addSystem(new LeaderboardSystem());
    world.addSystem(new QuestSystem());

    const droneGfx = new Graphics();
    droneGfx.poly([-25, 0, -10, -15, 15, -15, 30, 0, 15, 15, -10, 15]);
    droneGfx.fill({ color: 0x222233 });
    droneGfx.stroke({ color: 0x00f0ff, width: 2 });
    droneGfx.circle(-20, 0, 8).fill({ color: 0xff3d9a, alpha: 0.55 });
    droneGfx.circle(-20, 0, 4).fill({ color: 0xffdd44 });

    const texture = app.renderer.generateTexture(droneGfx);
    const playerSprite = new Sprite(texture);
    playerSprite.anchor.set(0.5);
    gameLayer.addChild(playerSprite);

    const player = world.createEntity();
    world.addComponent(player, new TransformComponent(app.screen.width / 4, app.screen.height / 2));
    world.addComponent(player, new VelocityComponent(VOICE_FLIGHT.CRUISE_SPEED_X, 0));
    world.addComponent(player, new FlightDynamicsComponent(1.0, 0.05, 3000));
    world.addComponent(player, new SpriteComponent(playerSprite));

    const taskOverlay = new TaskOverlay();
    app.stage.addChild(taskOverlay);

    let pauseOverlay: PauseOverlay | null = null;
    let demoZones: Container | null = null;
    let runPrepared = false;
    let preparedSongId: string | null = null;
    let selectedSong: Song | null = null;

    const mainMenu = new MainMenuRoot(app, {
        onPlay: () => beginPlayFlow(),
        onStats: () => showStatsScreen(),
    });
    app.stage.addChild(mainMenu);

    const songSelect = new SongSelectRoot(app, {
        onBack: () => showMainMenu(),
        onConfirm: (song) => {
            selectedSong = song;
            songSelect.hide();
            gameLayer.visible = true;
            micGate.visible = true;
            micGate.clearDenied();
            layoutAll();
        },
    });
    songSelect.setTracks(SONGS);
    songSelect.visible = false;
    app.stage.addChild(songSelect);

    const statsRoot = new PlayerStatsRoot(app, () => showMainMenu());
    statsRoot.visible = false;
    app.stage.addChild(statsRoot);

    const micGate = new MicGateOverlay(app, {
        onEnableMic: async () => {
            const ok = await VoiceInputManager.getInstance().init();
            if (ok) {
                await startRun();
            } else {
                micGate.showDenied();
            }
        },
        onBack: () => showMainMenu(),
    });
    micGate.visible = false;
    app.stage.addChild(micGate);

    function layoutAll(): void {
        const { top } = getSafeAreaInsets();
        const w = app.screen.width;
        const h = app.screen.height;
        mainMenu.layout(w, h, top);
        songSelect.layout(w, h, top);
        statsRoot.layout(w, h, top);
        micGate.layout(w, h, top);
        pauseOverlay?.layout(w, h);
    }

    function showMainMenu(): void {
        mainMenu.show();
        statsRoot.hide();
        songSelect.hide();
        micGate.visible = false;
        gameLayer.visible = false;
        velocityEngine.setSimulationEnabled(false);
        if (pauseOverlay) {
            app.stage.removeChild(pauseOverlay);
            pauseOverlay.destroy();
            pauseOverlay = null;
        }
        if (demoZones) {
            app.stage.removeChild(demoZones);
            demoZones.destroy();
            demoZones = null;
        }
        levelSystem.reset(world);
        const tr = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID)!;
        const vel = world.getComponent<VelocityComponent>(player, VelocityComponent.TYPE_ID)!;
        tr.x = app.screen.width / 4;
        tr.y = app.screen.height / 2;
        vel.vx = VOICE_FLIGHT.CRUISE_SPEED_X;
        vel.vy = 0;
        runPrepared = false;
        preparedSongId = null;
        selectedSong = null;
        layoutAll();
    }

    function showStatsScreen(): void {
        mainMenu.hide();
        songSelect.hide();
        statsRoot.show();
        layoutAll();
    }

    function beginPlayFlow(): void {
        mainMenu.hide();
        statsRoot.hide();
        songSelect.setTracks(SONGS);
        songSelect.show();
        gameLayer.visible = false;
        micGate.visible = false;
        layoutAll();
    }

    function levelIdForSong(song: Song): number {
        let h = 0;
        for (let i = 0; i < song.id.length; i++) {
            h = (h * 31 + song.id.charCodeAt(i)) >>> 0;
        }
        return (h % 9) + 1;
    }

    async function startRun(): Promise<void> {
        micGate.visible = false;
        LocalPlayerStats.recordRunStarted();

        const song = selectedSong ?? SONGS[0];
        const levelId = levelIdForSong(song);
        const needNewWorld = !runPrepared || preparedSongId !== song.id;

        if (needNewWorld) {
            parallaxSystem.reset();
            levelSystem.reset(world);
            levelSystem.initLevel(levelId, song, player);
            hudSystem.init(player);
            const textures = [0x111122, 0x1a1a3a, 0x24244a].map((color) => {
                const g = new Graphics().rect(0, 0, 512, 512).fill({ color });
                for (let i = 0; i < 50; i++) {
                    g.circle(Math.random() * 512, Math.random() * 512, 1).fill({ color: 0xffffff, alpha: 0.5 });
                }
                return app.renderer.generateTexture(g);
            });
            await parallaxSystem.init(player, textures);
            runPrepared = true;
            preparedSongId = song.id;
        }

        if (!demoZones) {
            const dz = createDemoTouchZones(app.screen.width, app.screen.height);
            if (dz) {
                demoZones = dz;
                app.stage.addChild(dz);
                console.warn('[DEV] Demo touch strips active.');
            }
        }

        if (!pauseOverlay) {
            pauseOverlay = new PauseOverlay(app, {
                onQuitToMenu: () => showMainMenu(),
            });
            app.stage.addChild(pauseOverlay);
        }
        pauseOverlay.layout(app.screen.width, app.screen.height);

        velocityEngine.setSimulationEnabled(true);
        VoiceInputManager.getInstance().resumeMic();
        EventBus.getInstance().emit(GameEvents.LEVEL_START, levelId);
    }

    window.addEventListener('resize', () => layoutAll());

    const eventBus = EventBus.getInstance();
    eventBus.on(GameEvents.LEVEL_START, async (levelId) => {
        const uid = getPlayerIdForSync();
        try {
            await syncProfile(uid, Number(levelId), 100 * Number(levelId), 3);
        } catch (e) {
            console.warn('Velocity: profile sync skipped.', e);
        }
    });

    showMainMenu();
    console.log('Velocity: menu ready');
}

init().catch((err) => {
    console.error('Failed to initialize Velocity Engine:', err);
    const msg = err instanceof Error ? err.message : String(err);
    showInitFailure('Could not start the game engine. Try refreshing or another browser.', msg);
});
