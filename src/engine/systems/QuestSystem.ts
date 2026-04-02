import { System } from '../World';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';
import { QUEST_DEFINITIONS, Quest, QuestTier } from '../../data/questDefinitions';
import { syncProfile } from '../../firebase/db';
import { auth } from '../../firebase/firebaseConfig';

export interface QuestProgress {
    questId: string;
    currentValue: number;
    completedTiers: string[];
}

/**
 * ECS System that tracks gameplay achievements and updates quest progress.
 */
export class QuestSystem implements System {
    public readonly priority: number = 3000;
    private progress: Map<string, QuestProgress> = new Map();

    constructor() {
        this.initProgress();
        this.setupListeners();
    }

    private initProgress() {
        QUEST_DEFINITIONS.forEach(q => {
            this.progress.set(q.id, {
                questId: q.id,
                currentValue: 0,
                completedTiers: []
            });
        });
    }

    private setupListeners() {
        const bus = EventBus.getInstance();

        bus.on(GameEvents.GATE_PASSED, () => this.increment('the_sky_is_falling'));
        bus.on(GameEvents.OBSTACLE_DODGED, () => this.increment('velocity_junkie'));
        bus.on(GameEvents.LEVEL_COMPLETE, () => this.increment('learner_pilot'));
        bus.on(GameEvents.STARS_AWARDED, (data: any) => {
            if (data && typeof data.stars === 'number') {
                this.incrementBy('star_collector', data.stars);
            }
        });
    }

    private increment(questId: string) {
        this.incrementBy(questId, 1);
    }

    private incrementBy(questId: string, amount: number) {
        const p = this.progress.get(questId);
        if (!p) return;

        const definition = QUEST_DEFINITIONS.find(q => q.id === questId);
        if (!definition) return;

        p.currentValue += amount;

        definition.tiers.forEach(tier => {
            if (p.currentValue >= tier.requirement && !p.completedTiers.includes(tier.id)) {
                this.completeTier(definition, tier, p);
            }
        });

        EventBus.getInstance().emit(GameEvents.QUEST_PROGRESS, { questId, progress: p });
    }

    private async completeTier(quest: Quest, tier: QuestTier, progress: QuestProgress) {
        progress.completedTiers.push(tier.id);
        console.log(`QuestSystem: Tier Completed! ${quest.title} - ${tier.id}`);

        EventBus.getInstance().emit(GameEvents.QUEST_COMPLETED, { quest, tier });

        const user = auth.currentUser;
        if (user) {
            await syncProfile(user.uid, 0, tier.rewardXP, tier.rewardStars);
        }
    }

    public update(): void {
        // QuestSystem is mostly event-driven
    }

    public getProgress(questId: string): QuestProgress | undefined {
        return this.progress.get(questId);
    }
}
