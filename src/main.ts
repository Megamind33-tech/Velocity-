import './index.css';
import { Application, Container, Sprite, Graphics, Text, TextStyle, Texture, Ticker } from 'pixi.js';
import { ResponsiveUIManager } from './ui/ResponsiveUIManager';
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
import { createDemoTouchZones } from './debug/DemoTouchZones';
import { SONGS } from './data/songs';
import { GameState } from './engine/GameState';
import { recordMenuHighScore, unlockAfterComplete } from './data/localProgress';
import { getLevelDefinition, getSongForLevel } from './data/levelDefinitions';
import { GameUIManager } from './ui/game/GameUIManager';
import { MainMenuScreen } from './ui/game/screens/MainMenuScreen';
import { InGameHUDScreen } from './ui/game/screens/InGameHUDScreen';
import { PauseMenuScreen } from './ui/game/screens/PauseMenuScreen';
import { GameOverScreen } from './ui/game/screens/GameOverScreen';
import { LevelCompleteScreen } from './ui/game/screens/LevelCompleteScreen';
import { SettingsScreen } from './ui/game/screens/SettingsScreen';
import { LeaderboardScreen } from './ui/game/screens/LeaderboardScreen';
import { AchievementsScreen } from './ui/game/screens/AchievementsScreen';
import { StoreScreen } from './ui/game/screens/StoreScreen';
import { HangarScreen } from './ui/game/screens/HangarScreen';
import { RewardsScreen } from './ui/game/screens/RewardsScreen';
import {
    registerGameFlowCallbacks,
    registerHudDataSource,
    registerPauseHandler,
    registerPauseResume,
    registerRunEndCallbacks,
    setLastRunSummary,
} from './ui/game/gameFlowBridge';
import { getVelocityUiTexture, preloadVelocityUiTextures } from './ui/game/velocityUiArt';

/** Log init failure and show a safe, user-visible alert (no innerHTML interpolation). */
function showInitFailure(message: string, detail?: string): void {
    console.error('Velocity init failure:', message);
    if (detail) {
        console.error('Details:', detail);
    }
    const el = document.createElement('div');
    el.setAttribute('role', 'alert');
    el.style.cssText =
        'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:#0a0a1a;color:#00ffcc;font-family:system-ui,sans-serif;text-align:center;z-index:99999;';
    const h1 = document.createElement('h1');
    h1.style.cssText = 'margin:0 0 12px;font-size:1.1rem';
    h1.textContent = 'Velocity';
    const p = document.createElement('p');
    p.style.cssText = 'margin:0;opacity:.9;max-width:320px';
    p.textContent = message;
    el.appendChild(h1);
    el.appendChild(p);
    if (detail) {
        const pre = document.createElement('pre');
        pre.style.cssText = 'margin-top:16px;font-size:11px;opacity:.6;white-space:pre-wrap;max-width:100%';
        pre.textContent = detail;
        el.appendChild(pre);
    }
    document.body.appendChild(el);
}

async function init() {
    const gameRoot = document.getElementById('game-root') ?? document.body;

    const app = new Application();
    await app.init({
        background: '#0a0a1a',
        // Match CSS layout box: safe-area padding lives on #game-root, not body.
        resizeTo: gameRoot,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        preference: 'webgl',
    });
    const canvas = app.canvas as HTMLCanvasElement;
    // Canvas styling is handled by CSS (index.css) — no need to duplicate here
    gameRoot.appendChild(canvas);

    startAuthInBackground();

    await preloadVelocityUiTextures();

    const uiManager = GameUIManager.init(app);
    uiManager.registerScreen('main-menu', new MainMenuScreen(app));
    uiManager.registerScreen('in-game-hud', new InGameHUDScreen(app));
    uiManager.registerScreen('pause', new PauseMenuScreen(app));
    uiManager.registerScreen('game-over', new GameOverScreen(app));
    uiManager.registerScreen('level-complete', new LevelCompleteScreen(app));
    uiManager.registerScreen('settings', new SettingsScreen(app));
    uiManager.registerScreen('leaderboard', new LeaderboardScreen(app));
    uiManager.registerScreen('achievements', new AchievementsScreen(app));
    uiManager.registerScreen('store', new StoreScreen(app));
    uiManager.registerScreen('hangar', new HangarScreen(app));
    uiManager.registerScreen('rewards', new RewardsScreen(app));

    const world = new World();
    const velocityEngine = new Engine(app, world);

    const levelSystem = new LevelSystem(app);
    let currentLevelId = 1;
    let runScore = 0;
    let parallaxReady = false;
    let demoZones: Container | null = null;
    let worldMap: WorldMapScene | null = null;

    const parallaxSystem = new ParallaxSystem(app);
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

    registerHudDataSource({
        getScore: () => runScore,
        getLevelId: () => currentLevelId,
        getVocal01: () => {
            if (GameState.paused || !GameState.runActive) return 0;
            const v = VoiceInputManager.getInstance();
            return Math.min(1, v.volume * 4);
        },
        getAltitudeDisplay: () => {
            const tr = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID);
            if (!tr) return 0;
            return Math.floor(Math.max(0, (app.screen.height / 2 - tr.y) / 2));
        },
        getForwardSpeed: () => {
            const vel = world.getComponent<VelocityComponent>(player, VelocityComponent.TYPE_ID);
            return vel ? Math.round(vel.vx) : 0;
        },
    });

    const responsiveManager = ResponsiveUIManager.getInstance();
    const overlay = new Graphics();
    overlay.rect(0, 0, app.screen.width, app.screen.height);
    overlay.fill({ color: 0x000000, alpha: 0.85 });
    overlay.eventMode = 'static';
    app.stage.addChild(overlay);

    const startScreenLayout = responsiveManager.getStartScreenLayout();
    const startStyle = new TextStyle({
        fill: '#00ffcc',
        fontSize: startScreenLayout.titleSize,
        fontWeight: 'bold',
        fontFamily: 'Orbitron, Arial',
        dropShadow: { blur: 10, color: '#00ffcc', distance: 0 },
    });

    const startText = new Text({ text: 'VELOCITY: VOICE-FLIGHT', style: startStyle });
    const subStyle = new TextStyle({
        fill: '#00ffcc',
        fontSize: startScreenLayout.subtitleSize,
        fontWeight: 'bold',
        fontFamily: 'Orbitron, Arial',
        dropShadow: { blur: 10, color: '#00ffcc', distance: 0 },
    });
    const subText = new Text({
        text: 'TAP SCREEN TO INITIALIZE MIC',
        style: subStyle,
    });
    subText.alpha = 0.7;

    startText.anchor.set(0.5);
    subText.anchor.set(0.5);
    startText.position.set(app.screen.width / 2, startScreenLayout.titleY);
    subText.position.set(app.screen.width / 2, startScreenLayout.subtitleY);

    app.stage.addChild(startText, subText);

    const bus = EventBus.getInstance();

    function openMainMenuFromFlow(): void {
        endRun();
        playerSprite.visible = false;
        if (demoZones) demoZones.visible = false;
        if (worldMap) {
            worldMap.destroy();
            worldMap = null;
        }
        levelSystem.destroyAllGates(world);
        uiManager.hideAllScreens();
        uiManager.showScreen('main-menu');
        uiManager.bringToFront();
    }

    function openWorldMap(): void {
        endRun();
        playerSprite.visible = false;
        if (demoZones) demoZones.visible = false;
        levelSystem.destroyAllGates(world);

        if (worldMap) {
            worldMap.destroy();
            worldMap = null;
        }
        uiManager.hideAllScreens();
        worldMap = new WorldMapScene(
            app,
            (id) => {
                worldMap?.destroy();
                worldMap = null;
                showMicGateOverlay(id);
            },
            () => {
                worldMap?.destroy();
                worldMap = null;
                uiManager.showScreen('main-menu');
                uiManager.bringToFront();
            }
        );
        uiManager.bringToFront();
    }

    registerGameFlowCallbacks({
        openMissionSelect: () => openWorldMap(),
        openMainMenu: () => openMainMenuFromFlow(),
        startLevelWithMicGate: (levelId: number) => showMicGateOverlay(levelId),
        openAchievements: () => uiManager.showScreen('achievements', true),
    });

    registerPauseHandler(() => {
        if (!GameState.runActive) return;
        GameState.setPaused(true);
        VoiceInputManager.getInstance().pauseMic();
        uiManager.showScreen('pause', true);
        uiManager.bringToFront();
    });

    registerPauseResume(() => {
        GameState.setPaused(false);
        VoiceInputManager.getInstance().resumeMic();
    });

    registerRunEndCallbacks({
        onRetryRun: () => {
            void startRunAfterMic(currentLevelId);
        },
        onNextLevel: () => {
            void startRunAfterMic(currentLevelId + 1);
        },
    });

    bus.on(GameEvents.GATE_PASSED, (payload?: { gatesPassed?: number; totalGates?: number }) => {
        runScore += 100;
        if (payload && typeof payload.gatesPassed === 'number') {
            setLastRunSummary({
                score: runScore,
                gatesPassed: payload.gatesPassed,
                totalGates: payload.totalGates ?? levelSystem.lastInitializedGateCount,
            });
        }
    });

    bus.on(GameEvents.LEVEL_START, async (levelId: number) => {
        const uid = getPlayerIdForSync();
        try {
            await syncProfile(uid, Number(levelId), 100 * Number(levelId), 3);
        } catch (e) {
            console.warn('Velocity: profile sync on level start skipped.', e);
        }
    });

    bus.on(
        GameEvents.LEVEL_COMPLETE,
        async (payload?: { stars?: number; gatesPassed?: number; totalGates?: number; levelId?: number }) => {
            endRun();
            unlockAfterComplete(currentLevelId);
            const uid = getPlayerIdForSync();
            try {
                await syncProfile(uid, currentLevelId, 100 * currentLevelId, 3);
            } catch (e) {
                console.warn('Velocity: profile sync skipped.', e);
            }
            const stars = payload?.stars ?? 0;
            const gp = payload?.gatesPassed ?? 0;
            const tg = payload?.totalGates ?? levelSystem.lastInitializedGateCount;
            setLastRunSummary({ score: runScore, stars, gatesPassed: gp, totalGates: tg });
            uiManager.showScreen('level-complete');
            uiManager.bringToFront();
        }
    );

    bus.on(GameEvents.CRASH, () => {
        endRun();
        setLastRunSummary({
            score: runScore,
            stars: 0,
            gatesPassed: 0,
            totalGates: levelSystem.lastInitializedGateCount,
        });
        uiManager.showScreen('game-over');
        uiManager.bringToFront();
    });

    function endRun(): void {
        if (runScore > 0) {
            recordMenuHighScore(runScore);
        }
        GameState.setRunActive(false);
        gatePlayout.clear();
        boundsCheck.clear();
        distanceQuest.clear();
        VoiceInputManager.getInstance().pauseMic();
        uiManager.hideScreen('in-game-hud');
        uiManager.hideScreen('pause');
    }

    async function ensureParallax(): Promise<void> {
        if (parallaxReady) return;
        const slide = getVelocityUiTexture('slide_track');
        const fill = getVelocityUiTexture('panel_fill');
        let textures: Texture[];
        if (slide && fill) {
            const t1 = slide;
            const t2 = fill;
            const g = new Graphics().rect(0, 0, 512, 512).fill({ color: 0x0a0a18 });
            for (let i = 0; i < 80; i++) {
                g.circle(Math.random() * 512, Math.random() * 512, 1).fill({ color: 0xffffff, alpha: 0.35 });
            }
            const t3 = app.renderer.generateTexture(g);
            textures = [t1, t2, t3];
        } else {
            textures = [0x111122, 0x1a1a3a, 0x24244a].map((color) => {
                const gr = new Graphics().rect(0, 0, 512, 512).fill({ color });
                for (let i = 0; i < 50; i++) {
                    gr.circle(Math.random() * 512, Math.random() * 512, 1).fill({ color: 0xffffff, alpha: 0.5 });
                }
                return app.renderer.generateTexture(gr);
            });
        }
        await parallaxSystem.init(player, textures);
        parallaxReady = true;
    }

    async function beginRun(levelId: number): Promise<void> {
        currentLevelId = levelId;
        runScore = 0;
        await ensureParallax();

        levelSystem.destroyAllGates(world);

        const tr = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID)!;
        const vel = world.getComponent<VelocityComponent>(player, VelocityComponent.TYPE_ID)!;
        tr.x = app.screen.width / 4;
        tr.y = app.screen.height / 2;
        tr.rotation = 0;
        vel.vx = 200;
        vel.vy = 0;

        const def = getLevelDefinition(levelId);
        if (def) {
            const song = getSongForLevel(def);
            if (song) {
                levelSystem.initLevelFromDefinition(def, song, player);
                console.log(`Velocity: Started level ${def.id} — "${def.name}" (${def.zone})`);
            } else {
                levelSystem.initLevel(levelId, SONGS[0], player);
            }
        } else {
            levelSystem.initLevel(levelId, SONGS[0], player);
        }

        setLastRunSummary({
            score: 0,
            stars: 0,
            gatesPassed: 0,
            totalGates: levelSystem.lastInitializedGateCount,
        });

        gatePlayout.configure(player, levelSystem.lastInitializedGateCount);
        boundsCheck.configure(player, app.screen.height);
        distanceQuest.configure(player);
        distanceQuest.syncBaseline(world);

        playerSprite.visible = true;

        GameState.setPaused(false);
        GameState.setRunActive(true);
        VoiceInputManager.getInstance().resumeMic();

        uiManager.showScreen('in-game-hud');
        uiManager.bringToFront();

        bus.emit(GameEvents.LEVEL_START, levelId);
    }

    function ensurePlayUi(): void {
        if (!demoZones) {
            const z = createDemoTouchZones(app.screen.width, app.screen.height);
            if (z) {
                demoZones = z;
                app.stage.addChild(z);
                console.warn('[DEV] Demo touch strips active (left=up, right=down). Remove for production.');
            }
        }
    }

    async function startRunAfterMic(levelId: number): Promise<void> {
        uiManager.hideScreen('game-over');
        uiManager.hideScreen('level-complete');
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
        const gateOverlay = new Graphics();
        gateOverlay.rect(0, 0, app.screen.width, app.screen.height);
        gateOverlay.fill({ color: 0x000000, alpha: 0.85 });
        gateOverlay.eventMode = 'static';
        app.stage.addChild(gateOverlay);

        const gateStyle = new TextStyle({
            fill: '#00ffcc',
            fontSize: 28,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Arial',
            dropShadow: { blur: 10, color: '#00ffcc', distance: 0 },
        });

        const gateTitle = new Text({ text: `LEVEL ${levelId}`, style: gateStyle });
        const gateSub = new Text({
            text: 'TAP TO INITIALIZE MIC',
            style: new TextStyle({ ...gateStyle, fontSize: 14 }),
        });
        gateSub.alpha = 0.7;
        gateTitle.anchor.set(0.5);
        gateSub.anchor.set(0.5);
        gateTitle.position.set(app.screen.width / 2, app.screen.height / 2 - 20);
        gateSub.position.set(app.screen.width / 2, app.screen.height / 2 + 30);
        app.stage.addChild(gateTitle, gateSub);
        uiManager.bringToFront();

        gateOverlay.on('pointerdown', async () => {
            const success = await VoiceInputManager.getInstance().init();
            app.stage.removeChild(gateOverlay);
            app.stage.removeChild(gateTitle);
            app.stage.removeChild(gateSub);
            gateOverlay.destroy();
            gateTitle.destroy();
            gateSub.destroy();

            if (success) {
                ensurePlayUi();
                if (demoZones) demoZones.visible = true;
                await beginRun(levelId);
            } else {
                showMicDeniedOverlay();
            }
        });
    }

    function showMicDeniedOverlay(onDismiss: () => void = openWorldMap): void {
        const denyOverlay = new Graphics();
        denyOverlay.rect(0, 0, app.screen.width, app.screen.height);
        denyOverlay.fill({ color: 0x000000, alpha: 0.88 });
        denyOverlay.eventMode = 'static';
        app.stage.addChild(denyOverlay);
        const t = new Text({
            text: 'Microphone required for vocal flight.\nTap to continue.',
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
        denyOverlay.on('pointerdown', () => {
            app.stage.removeChild(denyOverlay, t);
            denyOverlay.destroy();
            t.destroy();
            onDismiss();
        });
        uiManager.bringToFront();
    }

    overlay.on('pointerdown', async () => {
        const ok = await VoiceInputManager.getInstance().init();
        app.stage.removeChild(overlay, startText, subText);
        overlay.destroy();
        startText.destroy();
        subText.destroy();

        if (ok) {
            uiManager.showScreen('main-menu');
            uiManager.bringToFront();
        } else {
            showMicDeniedOverlay(() => {
                uiManager.showScreen('main-menu');
                uiManager.bringToFront();
            });
        }
    });

    GameState.setPaused(false);
    GameState.setRunActive(false);
    velocityEngine.start();

    Ticker.shared.add((ticker) => {
        uiManager.update(ticker.deltaMS / 1000);
    });

    console.log('Velocity: Main menu ready.');
}

init().catch((err) => {
    console.error('Failed to initialize Velocity Engine:', err);
    const msg = err instanceof Error ? err.message : String(err);
    showInitFailure('Could not start the game engine. Try refreshing or another browser.', msg);
});
