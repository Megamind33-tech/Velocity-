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
import { WorldScrollSystem } from './engine/systems/WorldScrollSystem';
import { CameraFollowSystem } from './engine/systems/CameraFollowSystem';
import { TransformComponent } from './engine/components/TransformComponent';
import { VelocityComponent } from './engine/components/VelocityComponent';
import { SpriteComponent } from './engine/components/SpriteComponent';
import { FlightDynamicsComponent } from './engine/components/FlightDynamicsComponent';
import { PlayerFlightComponent } from './engine/components/PlayerFlightComponent';
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
import { HangarScreen as PixiHangarScreen } from './ui/game/screens/HangarScreen';
import { RewardsScreen } from './ui/game/screens/RewardsScreen';
// Import new professional AAA screens and navigation
import { ScreenManager } from './screens/ScreenManager';
import { navigationEvents } from './screens/NavigationEvents';
import { requestPlaneStoreOpen } from './screens/shopNavigationIntent';
import {
    registerGameFlowCallbacks,
    registerHudDataSource,
    registerPauseHandler,
    registerPauseResume,
    registerRunEndCallbacks,
    setLastRunSummary,
} from './ui/game/gameFlowBridge';
import { getVelocityUiTexture, preloadVelocityUiTextures } from './ui/game/velocityUiArt';
import { applyPlayerPlaneVisual, preloadPlayerPlaneTextures } from './game/playerPlanes';
import {
    resetWorldScroll,
    setPlayerWorldX,
    getPlayerWorldX,
    getCruiseVx,
    getWorldScrollX,
    setCruiseVx,
} from './game/worldScroll';
import { setSongPitchRangeFromNotes, screenYToAltitude01 } from './game/vocalFlightState';
import { setRunFlightApp } from './game/runFlightContext';
import { getTuningCentsFromSungHz } from './game/gateTargetTelemetry';
import { loadCityParallaxTextures } from './game/cityParallaxAssets';
import { buildLevel1DistantSkylineTexture } from './game/level1SkylineTexture';
import { RENDERING, VOICE_FLIGHT } from './data/constants';
import { preloadWorldMapBackground } from './scenes/WorldMapScene';

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
        background: '#2e86c1',  // mid sky-blue — matches Layer 0 so no dark flash on load
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
    await preloadPlayerPlaneTextures();
    await preloadWorldMapBackground();

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
    uiManager.registerScreen('hangar', new PixiHangarScreen(app));
    uiManager.registerScreen('rewards', new RewardsScreen(app));

    // Initialize professional AAA screens with ScreenManager
    const screenManager = ScreenManager.getInstance();
    screenManager.init(app, uiManager.getUILayer());
    screenManager.createAllScreens();

    // Setup navigation event listener
    navigationEvents.onNavigate(async (action) => {
        switch (action) {
            case 'shop':
                await screenManager.showScreen('shop', 'slide-left');
                break;
            case 'hangar':
                await screenManager.showScreen('hangar', 'slide-left');
                break;
            case 'plane-store':
                requestPlaneStoreOpen();
                await screenManager.showScreen('shop', 'slide-left');
                break;
            case 'main-menu':
                // Return to main menu from hangar / store without disposing ScreenManager
                screenManager.hideAll();
                uiManager.bringToFront();
                await uiManager.showScreen('main-menu', true, 'crossfade');
                break;
            case 'back':
                await screenManager.goBack();
                break;
            case 'play':
            case 'resume':
                // Start gameplay - hide screens
                screenManager.dispose();
                navigationEvents.clearListeners();
                break;
            case 'exit':
                // Return to main menu
                screenManager.dispose();
                navigationEvents.clearListeners();
                await uiManager.showScreen('main-menu', true, 'crossfade');
                break;
            default:
                console.log('Navigation action:', action);
        }
    });

    const world = new World();
    const velocityEngine = new Engine(app, world);

    setRunFlightApp(app);

    const levelSystem = new LevelSystem(app);
    let currentLevelId = 1;
    let runScore = 0;
    let comboStreak = 0;
    let parallaxReady = false;
    /** Reload parallax when switching level theme (L1 city vs default sky). */
    let parallaxThemeKey: 'city_l1' | 'default' | null = null;
    let demoZones: Container | null = null;
    let worldMap: WorldMapScene | null = null;

    /** Camera layer: follows player so ship stays fixed on screen. */
    const gameWorldLayer = new Container();
    gameWorldLayer.name = 'game-world-layer';
    app.stage.addChildAt(gameWorldLayer, 1);
    /** Gates/obstacles: X = logical scroll position; this container shifts by `-scrollX` for visible L→R flow. */
    const worldScrollRoot = new Container();
    worldScrollRoot.name = 'world-scroll-root';
    gameWorldLayer.addChild(worldScrollRoot);
    levelSystem.setWorldParent(worldScrollRoot);

    const parallaxSystem = new ParallaxSystem(app);
    parallaxSystem.reparentToWorldScroll(worldScrollRoot);
    const gatePlayout = new GatePlayoutSystem();
    const boundsCheck = new BoundsCheckSystem();
    const distanceQuest = new DistanceQuestSystem();

    world.addSystem(new VoiceInputSystem());
    world.addSystem(new AutoForwardSystem());
    world.addSystem(new WorldScrollSystem());
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

    const playerSprite = new Sprite(Texture.WHITE);
    playerSprite.visible = false;
    // Apply texture + compute scale. All OGA textures are top-down (nose-up);
    // we correct orientation via SpriteComponent.visualRotationOffset (Math.PI/2 = nose right).
    const initPlaneScale = applyPlayerPlaneVisual(playerSprite);
    // Player above scroll content so rings render behind the craft.
    gameWorldLayer.addChild(playerSprite);

    const player = world.createEntity();
    // World-space start position: camera anchor is 27% from left, so plane
    // world-x = anchorX means worldLayer.x = 0 at startup (no initial offset).
    const anchorPx = Math.round(app.screen.width * 0.27);
    setPlayerWorldX(anchorPx);
    const playerTransformInit = new TransformComponent(
        anchorPx,
        app.screen.height / 2,
        0,
        initPlaneScale,  // scaleX — synced so SpriteSystem doesn't clobber it
        initPlaneScale   // scaleY
    );
    world.addComponent(player, playerTransformInit);
    world.addComponent(player, new PlayerFlightComponent());
    world.addComponent(player, new VelocityComponent(0, 0));
    // gravityScale kept at 0 — FlightDynamicsSystem trims to level; voice input steers vertically.
    world.addComponent(player, new FlightDynamicsComponent(1.0, 0.05, 3000, 0.1, 0));
    // visualRotationOffset = Math.PI/2 rotates the top-down (nose-up) sprite so the nose faces right.
    world.addComponent(player, new SpriteComponent(playerSprite, 0.5, 0.5, 0xFFFFFF, Math.PI / 2));

    const cameraFollow = new CameraFollowSystem(app, gameWorldLayer, player);

    const syncGameplayViewport = (): void => {
        setPlayerWorldX(Math.round(app.screen.width * 0.27));
        const ptr = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID);
        if (ptr) ptr.x = getPlayerWorldX();
        if (GameState.runActive) {
            cameraFollow.snapToPlayer(world);
        }
        if (parallaxReady) {
            parallaxSystem.resizeToScreen();
        }
    };
    window.addEventListener('resize', syncGameplayViewport);
    window.addEventListener('orientationchange', syncGameplayViewport);

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
            return Math.round(screenYToAltitude01(tr.y, app.screen.height, 56) * 100);
        },
        getForwardSpeed: () => {
            if (!GameState.runActive) return 0;
            return Math.round(getCruiseVx());
        },
        getAltitude01: () => {
            const tr = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID);
            if (!tr) return 0.5;
            return screenYToAltitude01(tr.y, app.screen.height, 56);
        },
        getTuningCents: () => {
            if (!GameState.runActive || GameState.paused) return null;
            const v = VoiceInputManager.getInstance();
            return getTuningCentsFromSungHz(v.pitchHz, v.volume, VOICE_FLIGHT.VOLUME_GATE);
        },
        getComboMultiplier: () => {
            if (!GameState.runActive) return 1;
            return Math.min(4, 1 + Math.floor(comboStreak / 3));
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
        comboStreak += 1;
        const mult = Math.min(4, 1 + Math.floor(comboStreak / 3));
        runScore += 100 * mult;
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
        comboStreak = 0;
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
        comboStreak = 0;
        GameState.setRunActive(false);
        parallaxThemeKey = null;
        resetWorldScroll();
        setCruiseVx(VOICE_FLIGHT.CRUISE_SPEED_X);
        gatePlayout.clear();
        boundsCheck.clear();
        distanceQuest.clear();
        cameraFollow.reset();
        VoiceInputManager.getInstance().pauseMic();
        uiManager.hideScreen('in-game-hud');
        uiManager.hideScreen('pause');
    }

    async function ensureParallax(levelId: number): Promise<void> {
        const useCity = levelId === 1;
        const nextKey: 'city_l1' | 'default' = useCity ? 'city_l1' : 'default';
        if (parallaxReady && parallaxThemeKey === nextKey) return;
        parallaxThemeKey = nextKey;

        if (useCity) {
            /**
             * Level 1 — OGA City Parallax (Gustavo Saraiva, CC0).
             * Zip `City.zip`: four 240×135 RGBA strips, back→front.
             * @see public/oga-parallax-city/SOURCES.md
             */
            const skylineTex = buildLevel1DistantSkylineTexture(app.renderer);
            const cityTextures = await loadCityParallaxTextures();
            await parallaxSystem.init(player, [skylineTex, ...cityTextures], {
                alphas: [0.88, 1, 1, 1, 1],
                layersConfig: [...RENDERING.LEVEL1_CITY_PARALLAX_LAYERS],
                tilePixelHeight: RENDERING.LEVEL1_CITY_TILE_HEIGHT_PX,
            });
            parallaxSystem.resizeToScreen();
            parallaxReady = true;
            return;
        }

        /**
         * Default sky — three parallax layers (tiling textures).
         * Layer 0: gradient sky + sun + soft haze (fully opaque base).
         * Layer 1: distant wispy clouds (was broken: drew on wrong Graphics).
         * Layer 2: nearer volumetric cloud masses + light atmospheric haze.
         */
        const SIZE = 512;
        const hash01 = (n: number) => {
            const x = Math.sin(n * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        };

        // --- Layer 0: sky gradient, sun disc, subtle high-altitude speckle ---
        const skyGfx = new Graphics();
        const steps = 24;
        for (let s = 0; s < steps; s++) {
            const t = s / (steps - 1);
            const y0 = (SIZE * t * 0.62) | 0;
            const y1 = (SIZE * ((s + 1) / (steps - 1)) * 0.62) | 0;
            const r = Math.round(18 + t * 28);
            const g = Math.round(52 + t * 70);
            const b = Math.round(110 + t * 55);
            const col = (r << 16) | (g << 8) | b;
            skyGfx.rect(0, y0, SIZE, Math.max(1, y1 - y0)).fill({ color: col });
        }
        skyGfx.rect(0, SIZE * 0.62, SIZE, SIZE * 0.38).fill({ color: 0x87ceeb });
        // Hazy horizon band
        skyGfx.rect(0, SIZE * 0.78, SIZE, SIZE * 0.22).fill({ color: 0xb8dce8, alpha: 0.45 });
        // Sun (soft)
        skyGfx.circle(SIZE * 0.78, SIZE * 0.2, 48).fill({ color: 0xfff8e7, alpha: 0.35 });
        skyGfx.circle(SIZE * 0.78, SIZE * 0.2, 28).fill({ color: 0xffefd5, alpha: 0.55 });
        for (let i = 0; i < 140; i++) {
            const px = hash01(i * 3.1) * SIZE;
            const py = hash01(i * 7.7) * SIZE * 0.55;
            const a = 0.08 + hash01(i * 11) * 0.12;
            skyGfx.circle(px, py, 0.8 + hash01(i * 13) * 1.2).fill({ color: 0xffffff, alpha: a });
        }
        const skyTex = app.renderer.generateTexture(skyGfx);

        // --- Layer 1: distant clouds (own transparent base — do not reuse skyGfx) ---
        const cloudGfx = new Graphics();
        cloudGfx.rect(0, 0, SIZE, SIZE).fill({ color: 0x000000, alpha: 0 });
        const cloudSeeds1: [number, number][] = [
            [60, 90],
            [200, 60],
            [350, 110],
            [480, 80],
            [130, 200],
            [300, 180],
            [440, 210],
        ];
        for (const [cx, cy] of cloudSeeds1) {
            cloudGfx.circle(cx, cy, 28).fill({ color: 0xffffff, alpha: 0.72 });
            cloudGfx.circle(cx + 22, cy + 4, 22).fill({ color: 0xf0f8ff, alpha: 0.62 });
            cloudGfx.circle(cx - 18, cy + 6, 18).fill({ color: 0xffffff, alpha: 0.55 });
        }
        const cloudTex1 = app.renderer.generateTexture(cloudGfx);

        // --- Layer 2: near clouds + soft lower haze ---
        const cloud2Gfx = new Graphics();
        cloud2Gfx.rect(0, 0, SIZE, SIZE).fill({ color: 0x000000, alpha: 0 });
        const cloudSeeds2: [number, number][] = [
            [80, 130],
            [280, 100],
            [430, 150],
            [40, 280],
            [360, 320],
        ];
        for (const [cx, cy] of cloudSeeds2) {
            cloud2Gfx.circle(cx, cy, 42).fill({ color: 0xffffff, alpha: 0.82 });
            cloud2Gfx.circle(cx + 34, cy + 6, 32).fill({ color: 0xf5faff, alpha: 0.75 });
            cloud2Gfx.circle(cx - 28, cy + 8, 26).fill({ color: 0xffffff, alpha: 0.68 });
            cloud2Gfx.circle(cx + 10, cy - 20, 24).fill({ color: 0xffffff, alpha: 0.72 });
        }
        cloud2Gfx.rect(0, SIZE * 0.72, SIZE, SIZE * 0.28).fill({ color: 0xd4e8f0, alpha: 0.22 });
        const cloudTex2 = app.renderer.generateTexture(cloud2Gfx);

        await parallaxSystem.init(player, [skyTex, cloudTex1, cloudTex2], {
            alphas: [1.0, 0.88, 0.72],
        });
        parallaxSystem.resizeToScreen();
        parallaxReady = true;
    }

    async function beginRun(levelId: number): Promise<void> {
        currentLevelId = levelId;
        runScore = 0;
        comboStreak = 0;
        resetWorldScroll();
        await ensureParallax(levelId);

        levelSystem.destroyAllGates(world);

        const tr = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID)!;
        const vel = world.getComponent<VelocityComponent>(player, VelocityComponent.TYPE_ID)!;
        const anchorPx = Math.round(app.screen.width * 0.27);
        setPlayerWorldX(anchorPx);
        tr.x = anchorPx;
        tr.y = app.screen.height / 2;
        tr.rotation = 0;
        vel.vx = 0;
        vel.vy = 0;
        cameraFollow.snapToPlayer(world);

        const def = getLevelDefinition(levelId);
        let songForRange = SONGS[0];
        if (def) {
            const song = getSongForLevel(def);
            if (song) {
                songForRange = song;
                levelSystem.initLevelFromDefinition(def, song, player);
                console.log(`Velocity: Started level ${def.id} — "${def.name}" (${def.zone})`);
            } else {
                levelSystem.initLevel(levelId, SONGS[0], player);
            }
        } else {
            levelSystem.initLevel(levelId, SONGS[0], player);
        }
        setSongPitchRangeFromNotes(songForRange);

        const cruise = def?.scrollSpeed ?? VOICE_FLIGHT.CRUISE_SPEED_X;
        setCruiseVx(cruise);

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

        // Re-apply plane visual and sync scale back into TransformComponent so
        // SpriteSystem uses the texture-derived scale, not the default (1,1).
        const newPlaneScale = applyPlayerPlaneVisual(playerSprite);
        const playerTr = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID)!;
        playerTr.scaleX = newPlaneScale;
        playerTr.scaleY = newPlaneScale;
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
        // Physical L→R: scroll root moves with accumulated world distance (gates use logical X only).
        worldScrollRoot.position.x = -getWorldScrollX();
        // After Engine.onTick (same Ticker), camera layer follows player.
        cameraFollow.apply(world);
    });

    console.log('Velocity: Main menu ready.');
}

init().catch((err) => {
    console.error('Failed to initialize Velocity Engine:', err);
    const msg = err instanceof Error ? err.message : String(err);
    showInitFailure('Could not start the game engine. Try refreshing or another browser.', msg);
});
