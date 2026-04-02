import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { EventBus } from '../events/EventBus';
import { GameEvents } from '../events/GameEvents';
import { Quest, QuestTier } from '../data/questDefinitions';
import { GAME_UI } from './theme/GameUITheme';

/**
 * A sliding UI overlay that notifies the player of quest progress and completions.
 */
export class TaskOverlay extends Container {
    private bg: Graphics;
    private titleText: Text;
    private descText: Text;
    private isVisible: boolean = false;
    private queue: { quest: Quest, tier?: QuestTier, message: string }[] = [];

    constructor() {
        super();
        this.bg = new Graphics();
        this.addChild(this.bg);
        
        const style = new TextStyle({
            fill: '#ffffff',
            fontSize: 18,
            fontWeight: '700',
            fontFamily: GAME_UI.fontBody,
            dropShadow: {
                alpha: 0.5,
                blur: 4,
                color: '#000000',
                distance: 2
            }
        });

        this.titleText = new Text({ text: '', style });
        this.descText = new Text({ text: '', style: { ...style, fontSize: 14, fontWeight: 'normal' } });

        this.titleText.y = 10;
        this.descText.y = 35;
        this.addChild(this.titleText);
        this.addChild(this.descText);

        this.visible = false;
        this.setupListeners();
    }

    private setupListeners() {
        const bus = EventBus.getInstance();

        bus.on(GameEvents.QUEST_COMPLETED, ({ quest, tier }: { quest: Quest, tier: QuestTier }) => {
            this.showNotification(quest, `TIER COMPLETED: ${tier.id.toUpperCase()}`, tier);
        });
    }

    private showNotification(quest: Quest, message: string, tier?: QuestTier) {
        this.queue.push({ quest, tier, message });
        if (!this.isVisible) {
            this.processQueue();
        }
    }

    private async processQueue() {
        if (this.queue.length === 0) return;

        const { quest, message } = this.queue.shift()!;
        this.isVisible = true;
        this.visible = true;

        this.titleText.text = quest.title;
        this.descText.text = message;

        // Draw background based on text width
        const width = Math.max(this.titleText.width, this.descText.width) + 40;
        this.bg.clear()
            .roundRect(0, 0, width, 60, 8)
            .fill({ color: 0x000000, alpha: 0.8 })
            .stroke({ color: 0x00ffcc, width: 2 });

        // Position at the side (to be animated)
        this.x = -width;
        this.y = 100;

        // Simple Slide-in (Lerp logic would be better in a ticker, but we use simple timeout for this demo)
        let t = 0;
        const interval = setInterval(() => {
            t += 0.1;
            this.x = -width + (width + 20) * (1 - Math.pow(1 - t, 3)); // Cubic ease out
            if (t >= 1) {
                this.x = 20;
                clearInterval(interval);
                
                // Hold for 3 seconds then hide
                setTimeout(() => this.hide(), 3000);
            }
        }, 16);
    }

    private hide() {
        let t = 0;
        const width = this.bg.width;
        const interval = setInterval(() => {
            t += 0.1;
            this.x = 20 - (width + 40) * Math.pow(t, 3); // Cubic ease in
            if (t >= 1) {
                this.visible = false;
                this.isVisible = false;
                clearInterval(interval);
                this.processQueue(); // Next in line
            }
        }, 16);
    }
}
