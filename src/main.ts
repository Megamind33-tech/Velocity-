import './index.css';
import { Application, Assets, Sprite, Texture, Graphics } from 'pixi.js';
import { WorldMapScene } from './scenes/WorldMapScene';
import { EventBus } from './events/EventBus';
import { GameEvents } from './events/GameEvents';
import { initAuth } from './firebase/auth';
import { syncProfile } from './firebase/db';
import { World } from './engine/World';
import { Engine } from './engine/Engine';
import { MovementSystem } from './engine/systems/MovementSystem';
import { SpriteSystem } from './engine/systems/SpriteSystem';
import { LeaderboardSystem } from './engine/systems/LeaderboardSystem';
import { QuestSystem } from './engine/systems/QuestSystem';
import { TransformComponent } from './engine/components/TransformComponent';
import { VelocityComponent } from './engine/components/VelocityComponent';
import { SpriteComponent } from './engine/components/SpriteComponent';
import { FlightDynamicsComponent } from './engine/components/FlightDynamicsComponent';
import { FlightDynamicsSystem } from './engine/systems/FlightDynamicsSystem';
import { TaskOverlay } from './ui/TaskOverlay';

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
    world.addSystem(new FlightDynamicsSystem());
    world.addSystem(new MovementSystem());
    world.addSystem(new SpriteSystem());
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
    world.addComponent(player, new VelocityComponent(300, 0)); // Initial horizontal speed
    world.addComponent(player, new FlightDynamicsComponent(1.0, 0.02, 1200));
    world.addComponent(player, new SpriteComponent(playerSprite));

    // 6. Thrust Simulation (Spacebar)
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            const vel = world.getComponent<VelocityComponent>(player, VelocityComponent.TYPE_ID);
            const flight = world.getComponent<FlightDynamicsComponent>(player, FlightDynamicsComponent.TYPE_ID);
            if (vel && flight) {
                // Apply upward burst
                vel.vy -= flight.thrustPower * 0.1; 
                console.log('Thrust applied!');
            }
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

    // 9. Start Game Loop
    velocityEngine.start();

    console.log('Velocity Engine: Full ECS Loop active with test entity.');
}

init().catch((err) => {
    console.error('Failed to initialize Velocity Engine:', err);
});
