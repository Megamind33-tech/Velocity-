import './index.css';
import { Application } from 'pixi.js';
import { WorldMapScene } from './scenes/WorldMapScene';
import { EventBus } from './events/EventBus';
import { GameEvents } from './events/GameEvents';
import { initAuth } from './firebase/auth';
import { syncProfile } from './firebase/db';
import { World } from './engine/World';
import { LeaderboardSystem } from './engine/systems/LeaderboardSystem';
import { QuestSystem } from './engine/systems/QuestSystem';
import { TaskOverlay } from './ui/TaskOverlay';

async function init() {
    // 1. Initialize PixiJS Application
    const app = new Application();
    await app.init({ 
        background: '#000000',
        resizeTo: window,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });
    document.body.appendChild(app.canvas);

    // 2. Initialize Firebase Auth
    const user = await initAuth();
    console.log(`Velocity Engine: Authenticated as ${user.uid}`);

    // 3. Initialize ECS World, Leaderboard & Quests
    const world = new World();
    const leaderboard = new LeaderboardSystem();
    const questSystem = new QuestSystem();
    
    world.addSystem(leaderboard);
    world.addSystem(questSystem);

    // 4. Initialize UI
    const taskOverlay = new TaskOverlay();
    app.stage.addChild(taskOverlay);

    // 5. Initialize Scenes
    const worldMap = new WorldMapScene(app);

    // 6. Setup Persistence Events
    const eventBus = EventBus.getInstance();
    
    // Automatically sync profile when a level is "completed" (simulated by LEVEL_START here)
    eventBus.on(GameEvents.LEVEL_START, async (levelId) => {
        console.log(`WorldMap: Syncing progress for level ${levelId}`);
        await syncProfile(user.uid, Number(levelId), 100 * Number(levelId), 3);
        await leaderboard.refresh(); // Refresh leaderboard after sync
        
        // Mock a gate pass to test Quest system
        setTimeout(() => {
            console.log('QuestSystem Mock: Emit GATE_PASSED x5');
            for (let i = 0; i < 5; i++) {
                eventBus.emit(GameEvents.GATE_PASSED, {});
            }
        }, 2000);
    });

    console.log('Velocity Engine (Firebase, Quests & Map) initialized successfully.');
}

init().catch((err) => {
    console.error('Failed to initialize Velocity Engine:', err);
});
