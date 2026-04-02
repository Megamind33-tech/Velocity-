import { System, World, Entity } from '../World';
import { getGlobalLeaderboard, UserProfile } from '../../firebase/db';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';

/**
 * System that manages global leaderboard fetching and display logic.
 */
export class LeaderboardSystem implements System {
    public readonly priority: number = 2000;
    private topScores: UserProfile[] = [];
    private lastFetchTime: number = 0;
    private fetchInterval: number = 60000; // 1 minute cache

    public async update(): Promise<void> {
        // Only fetch if enough time has passed
        const now = Date.now();
        if (now - this.lastFetchTime > this.fetchInterval) {
            await this.refresh();
        }
    }

    public async refresh(): Promise<void> {
        try {
            console.log('LeaderboardSystem: Fetching global top 50...');
            this.topScores = await getGlobalLeaderboard();
            this.lastFetchTime = Date.now();
            
            // Notify UI/other systems of updated leaderboard
            EventBus.getInstance().emit(GameEvents.UI_CLICK, this.topScores); // Using UI_CLICK as placeholder or define NEW event
        } catch (error) {
            console.error('LeaderboardSystem: Fetch failed.', error);
        }
    }

    public getScores(): UserProfile[] {
        return this.topScores;
    }
}
