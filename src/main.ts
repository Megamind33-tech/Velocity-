import './index.css';
import { Application, Assets, Sprite, Texture, Graphics, Text, TextStyle } from 'pixi.js';
import { WorldMapScene } from './scenes/WorldMapScene';
import { EventBus } from './events/EventBus';
import { GameEvents } from './events/GameEvents';
import { initAuth } from './firebase/auth';
import { syncProfile } from './firebase/db';
import { World } from './engine/World';
import { Engine } from './engine/Engine';
import { MovementSystem } from './engine/systems/MovementSystem';
import { SpriteSystem } from './engine/systems/SpriteSystem';
import { FlightDynamicsSystem } from './engine/systems/FlightDynamicsSystem';
import { VoiceInputSystem } from './engine/systems/VoiceInputSystem';
import { LevelSystem } from './engine/systems/LevelSystem';
import { VoiceInputManager } from './engine/input/VoiceInputManager';
import { LeaderboardSystem } from './engine/systems/LeaderboardSystem';
import { QuestSystem } from './engine/systems/QuestSystem';
import { TransformComponent } from './engine/components/TransformComponent';
import { VelocityComponent } from './engine/components/VelocityComponent';
import { SpriteComponent } from './engine/components/SpriteComponent';
import { FlightDynamicsComponent } from './engine/components/FlightDynamicsComponent';
import { GateComponent } from './engine/components/GateComponent';
import { TaskOverlay } from './ui/TaskOverlay';
import { SONGS } from './data/songs';

async function init() {
    // 1. Initialize PixiJS Application
    const app = new Application();
    await app.init({ 
        background: '#0a0a1a', // Deep space blue
        resizeTo: window,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });
    document.body.appendChild(app.canvas);

    // 2. Initialize Firebase Auth
    const user = await initAuth();
    console.log(`Velocity Engine: Authenticated as ${user.uid}`);

    // 3. Initialize ECS World
    const world = new World();
    const velocityEngine = new Engine(app, world);

    // 4. Register Systems
    const levelSystem = new LevelSystem(app);
    world.addSystem(new VoiceInputSystem());
    world.addSystem(new FlightDynamicsSystem());
    world.addSystem(new MovementSystem());
    world.addSystem(new SpriteSystem());
    world.addSystem(levelSystem);
    world.addSystem(new LeaderboardSystem());
    world.addSystem(new QuestSystem());

    // 5. Create a "Test Player" Entity
    // (In a real scenario, we'd load a drone sprite. For now, a glowing circle)
    const gfx = new Graphics();
    gfx.circle(0, 0, 20);
    gfx.fill({ color: 0x00ffcc, alpha: 1 });
    gfx.setStrokeStyle({ width: 2, color: 0xffffff });
    gfx.stroke();
    
    // Generate texture from graphics
    const texture = app.renderer.generateTexture(gfx);
    const playerSprite = new Sprite(texture);
    app.stage.addChild(playerSprite);

    const player = world.createEntity();
    world.addComponent(player, new TransformComponent(app.screen.width / 4, app.screen.height / 2));
    world.addComponent(player, new VelocityComponent(200, 0)); // Horizontal engine speed
    world.addComponent(player, new FlightDynamicsComponent(1.0, 0.05, 3000)); // Stronger thrust for voice
    world.addComponent(player, new SpriteComponent(playerSprite));

    // 6. Mobile Voice Start Interaction (Required for AudioContext)
    const overlay = new Graphics();
    overlay.rect(0, 0, app.screen.width, app.screen.height);
    overlay.fill({ color: 0x000000, alpha: 0.7 });
    overlay.interactive = true;
    app.stage.addChild(overlay);

    const startText = new Text({
        text: 'TAP TO START VOICE FLIGHT',
        style: new TextStyle({
            fill: '#00ffcc',
            fontSize: 24,
            fontWeight: 'bold',
            fontFamily: 'Arial'
        })
    });
    startText.anchor.set(0.5);
    startText.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(startText);

    overlay.on('pointerdown', async () => {
        const success = await VoiceInputManager.getInstance().init();
        if (success) {
            app.stage.removeChild(overlay);
            app.stage.removeChild(startText);
            
            // Initialize the level with the first song
            levelSystem.initLevel(1, SONGS[0], player);
            
            // Start components and loop
            velocityEngine.start();
            console.log('Velocity Engine: Voice loop started.');
        } else {
            startText.text = 'MIC PERMISSION DENIED';
            startText.style.fill = '#ff0000';
        }
    });

    // 7. Initialize UI
    const taskOverlay = new TaskOverlay();
    app.stage.addChild(taskOverlay);

    // 7. Initialize World Map (Hidden by default or starts here)
    // const worldMap = new WorldMapScene(app);

    // 8. Setup Persistence Events
    const eventBus = EventBus.getInstance();
    
    eventBus.on(GameEvents.LEVEL_START, async (levelId) => {
        console.log(`WorldMap: Syncing progress for level ${levelId}`);
        await syncProfile(user.uid, Number(levelId), 100 * Number(levelId), 3);
    });

    // 9. Loop is started after user interaction (overlay.on('pointerdown'))
    // velocityEngine.start();

    console.log('Velocity Engine: Full ECS Loop active with test entity.');
}

init().catch((err) => {
    console.error('Failed to initialize Velocity Engine:', err);
});
