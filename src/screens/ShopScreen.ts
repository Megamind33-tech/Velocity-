/**
 * ShopScreen
 * Mobile card-based treasure shop interface
 * Clean, minimal design for mobile phones
 */

import { Container, Graphics, Text } from 'pixi.js';
import { UIButton } from '../components/UIButton';
import { ColorTheme } from '../utils/ColorTheme';
import { navigationEvents } from './NavigationEvents';

// Game data structures
interface TreasureData {
  id: string;
  name: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  contents: {
    coins?: number;
    gems?: number;
    xp?: number;
  };
}

interface ItemData {
  id: string;
  name: string;
  type: string;
  stats: {
    power: number;
    attack: number;
    defense: number;
    speed: number;
  };
  icon: string;
}

export class ShopScreen extends Container {
  private treasureData: TreasureData[] = [];
  private itemData: ItemData[] = [];
  private scrollContainer: Container;
  private navigation: Container;

  constructor() {
    super();
    this.loadGameData();
    this.setupBackground();
    this.setupLayout();
  }

  /**
   * Load game data
   */
  private loadGameData(): void {
    // Treasure data
    this.treasureData = [
      {
        id: 'bronze',
        name: 'BRONZE TREASURE',
        price: 260,
        rarity: 'common',
        icon: 'treasure_bronze.png',
        contents: { coins: 100, xp: 50 },
      },
      {
        id: 'silver',
        name: 'SILVER TREASURE',
        price: 350,
        rarity: 'rare',
        icon: 'treasure_silver.png',
        contents: { coins: 250, xp: 100 },
      },
      {
        id: 'gold',
        name: 'GOLD TREASURE',
        price: 450,
        rarity: 'epic',
        icon: 'treasure_gold.png',
        contents: { coins: 500, gems: 50, xp: 200 },
      },
    ];

    // Item data
    this.itemData = [
      {
        id: 'yellow',
        name: 'YELLOW',
        type: 'F-20 TIGERSHARK',
        stats: {
          power: 85,
          attack: 90,
          defense: 70,
          speed: 95,
        },
        icon: 'plane_yellow.png',
      },
    ];
  }

  /**
   * Setup background
   */
  private setupBackground(): void {
    const bg = new Graphics();
    bg.beginFill(ColorTheme.get('background.primary'));
    bg.drawRect(0, 0, 400, 900);
    bg.endFill();
    this.addChildAt(bg, 0);
  }

  /**
   * Setup layout - MOBILE CARD-BASED DESIGN
   * Clean, minimal cards stacked vertically
   */
  private setupLayout(): void {
    // Title
    const title = new Text('SHOP', {
      fontSize: 32,
      fontWeight: 'bold',
      fontFamily: 'Orbitron, Arial',
      fill: ColorTheme.get('brand.primary'),
    });
    title.position.set(16, 16);
    this.addChild(title);

    // Scroll container for cards
    this.scrollContainer = new Container();
    this.scrollContainer.position.set(0, 60);
    this.addChild(this.scrollContainer);

    let yPos = 0;
    const padding = 12;

    // Create treasure cards
    this.treasureData.forEach((treasure) => {
      const card = this.createTreasureCard(treasure);
      card.position.set(padding, yPos);
      this.scrollContainer.addChild(card);
      yPos += 100 + 12; // Card height + gap
    });

    // Navigation bar at bottom
    this.navigation = this.createNavigation();
    this.navigation.position.set(12, 800);
    this.addChild(this.navigation);
  }

  /**
   * Create a treasure card
   */
  private createTreasureCard(treasure: TreasureData): Container {
    const card = new Container();

    // Card background
    const bg = new Graphics();
    bg.beginFill(ColorTheme.get('background.secondary'), 0.7);
    bg.drawRoundedRect(0, 0, 352, 88, 8);
    bg.endFill();
    card.addChild(bg);

    // Treasure name
    const nameText = new Text(treasure.name, {
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Exo 2, Arial',
      fill: ColorTheme.get('text.primary'),
    });
    nameText.position.set(12, 8);
    card.addChild(nameText);

    // Rarity badge
    const rarityBg = new Graphics();
    const rarityColor = treasure.rarity === 'common' ? 0x6b7280 :
                        treasure.rarity === 'rare' ? 0x3b82f6 :
                        treasure.rarity === 'epic' ? 0x8b5cf6 : 0xf59e0b;
    rarityBg.beginFill(rarityColor, 0.8);
    rarityBg.drawRoundedRect(0, 0, 80, 24, 4);
    rarityBg.endFill();
    rarityBg.position.set(12, 28);
    card.addChild(rarityBg);

    const rarityText = new Text(treasure.rarity.toUpperCase(), {
      fontSize: 10,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: 0xffffff,
    });
    rarityText.position.set(16, 32);
    card.addChild(rarityText);

    // Price badge
    const priceBg = new Graphics();
    priceBg.beginFill(ColorTheme.get('brand.success'), 0.8);
    priceBg.drawRoundedRect(0, 0, 80, 24, 4);
    priceBg.endFill();
    priceBg.position.set(256, 28);
    card.addChild(priceBg);

    const priceText = new Text(`$${treasure.price}`, {
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: 0xffffff,
    });
    priceText.position.set(260, 32);
    card.addChild(priceText);

    // Contents row
    const contentsText = new Text(`${treasure.contents.coins || 0} Coins`, {
      fontSize: 12,
      fontFamily: 'Oxanium, Arial',
      fill: ColorTheme.get('text.secondary'),
    });
    contentsText.position.set(12, 60);
    card.addChild(contentsText);

    // Click to purchase
    card.eventMode = 'static';
    card.cursor = 'pointer';

    return card;
  }

  /**
   * Create navigation bar
   */
  private createNavigation(): Container {
    const nav = new Container();

    const navButtons = [
      { label: 'HANGAR', variant: 'primary' as const, action: 'hangar' },
      { label: 'STORE', variant: 'primary' as const, action: 'plane-store' },
      { label: 'PLAY', variant: 'success' as const, action: 'play' },
      { label: 'EXIT', variant: 'danger' as const, action: 'exit' },
    ];

    navButtons.forEach((btnConfig, index) => {
      const button = new UIButton({
        text: btnConfig.label,
        width: 85,
        height: 40,
        variant: btnConfig.variant,
        onClick: () => this.handleNavigation(btnConfig.action),
      });

      button.position.set(index * 92, 0);
      nav.addChild(button);
    });

    return nav;
  }

  /**
   * Handle navigation
   */
  private handleNavigation(action: string): void {
    navigationEvents.navigate(action as any);
  }

  /**
   * Screen lifecycle - fadeIn animation
   */
  async fadeIn(duration: number = 300): Promise<void> {
    this.alpha = 0;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.alpha = progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.alpha = 1;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Screen lifecycle - fadeOut animation
   */
  async fadeOut(duration: number = 300): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.alpha = 1 - progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.alpha = 0;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Cleanup
   */
  destroyScreen(): void {
    this.removeChildren();
  }
}
