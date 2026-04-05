/**
 * PlaneStoreScreen
 * Mobile card-based plane marketplace interface
 * Clean, minimal design for mobile phones
 */

import { Container, Graphics, Text } from 'pixi.js';
import { UIButton } from '../components/UIButton';
import { ColorTheme } from '../utils/ColorTheme';
import { navigationEvents } from './NavigationEvents';

// Game data structures
type PlaneType = 'FIGHTER' | 'BOMBER' | 'SPECIAL';

interface PlaneStats {
  power: number;
  attack: number;
  defense: number;
  speed: number;
}

interface StorePlane {
  id: string;
  name: string;
  type: PlaneType;
  price: number;
  description: string;
  stats: PlaneStats;
  icon: string;
  featured?: boolean;
  discount?: number;
}

export class PlaneStoreScreen extends Container {
  private storeData: StorePlane[] = [];
  private scrollContainer!: Container;
  private navigation!: Container;

  constructor() {
    super();
    this.loadStoreData();
    this.setupBackground();
    this.setupLayout();
  }

  /**
   * Load store data
   */
  private loadStoreData(): void {
    this.storeData = [
      {
        id: 'stealth',
        name: 'STEALTH BOMBER',
        type: 'BOMBER',
        price: 4999,
        description: 'The ultimate weapon in aerial warfare.',
        stats: { power: 95, attack: 100, defense: 80, speed: 75 },
        icon: 'plane_stealth.png',
        featured: true,
        discount: 15,
      },
      {
        id: 'raptor',
        name: 'F-22 RAPTOR',
        type: 'FIGHTER',
        price: 2500,
        description: 'Cutting-edge fighter jet.',
        stats: { power: 85, attack: 90, defense: 70, speed: 95 },
        icon: 'plane_raptor.png',
      },
      {
        id: 'spirit',
        name: 'B-2 SPIRIT',
        type: 'BOMBER',
        price: 3800,
        description: 'Legendary stealth bomber.',
        stats: { power: 90, attack: 85, defense: 75, speed: 70 },
        icon: 'plane_spirit.png',
      },
      {
        id: 'lightning',
        name: 'F-35 LIGHTNING',
        type: 'FIGHTER',
        price: 2900,
        description: 'Advanced multi-role fighter.',
        stats: { power: 80, attack: 85, defense: 75, speed: 90 },
        icon: 'plane_lightning.png',
      },
      {
        id: 'aurora',
        name: 'AURORA',
        type: 'SPECIAL',
        price: 5500,
        description: 'Experimental hypersonic aircraft.',
        stats: { power: 92, attack: 88, defense: 85, speed: 100 },
        icon: 'plane_aurora.png',
      },
      {
        id: 'drone',
        name: 'COMBAT DRONE',
        type: 'SPECIAL',
        price: 1800,
        description: 'Autonomous drone with precision.',
        stats: { power: 65, attack: 75, defense: 55, speed: 85 },
        icon: 'plane_drone.png',
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
    const title = new Text('PLANE STORE', {
      fontSize: 28,
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

    // Create plane cards
    this.storeData.forEach((plane) => {
      const card = this.createPlaneCard(plane);
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
   * Create a plane card
   */
  private createPlaneCard(plane: StorePlane): Container {
    const card = new Container();

    // Card background
    const bg = new Graphics();
    bg.beginFill(ColorTheme.get('background.secondary'), 0.7);
    bg.drawRoundedRect(0, 0, 352, 88, 8);
    bg.endFill();
    card.addChild(bg);

    // Plane name
    const nameText = new Text(plane.name, {
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Exo 2, Arial',
      fill: ColorTheme.get('text.primary'),
    });
    nameText.position.set(12, 8);
    card.addChild(nameText);

    // Type badge
    const typeBg = new Graphics();
    const typeColor = plane.type === 'FIGHTER' ? 0x7c3aed : plane.type === 'BOMBER' ? 0xdc2626 : 0x06b6d4;
    typeBg.beginFill(typeColor, 0.8);
    typeBg.drawRoundedRect(0, 0, 64, 24, 4);
    typeBg.endFill();
    typeBg.position.set(12, 28);
    card.addChild(typeBg);

    const typeText = new Text(plane.type, {
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: 0xffffff,
    });
    typeText.position.set(16, 32);
    card.addChild(typeText);

    // Price badge
    const priceBg = new Graphics();
    priceBg.beginFill(ColorTheme.get('semantic.success'), 0.8);
    priceBg.drawRoundedRect(0, 0, 100, 24, 4);
    priceBg.endFill();
    priceBg.position.set(240, 28);
    card.addChild(priceBg);

    const priceText = new Text(`$${plane.price}`, {
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: 0xffffff,
    });
    priceText.position.set(244, 32);
    card.addChild(priceText);

    // Stats row
    const statsText = new Text(`⚡ ${plane.stats.power}  ⬆ ${plane.stats.speed}`, {
      fontSize: 12,
      fontFamily: 'Oxanium, Arial',
      fill: ColorTheme.get('text.secondary'),
    });
    statsText.position.set(12, 60);
    card.addChild(statsText);

    // Featured indicator
    if (plane.featured) {
      const featuredText = new Text('⭐ FEATURED', {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Oxanium, Arial',
        fill: ColorTheme.get('semantic.warning'),
      });
      featuredText.position.set(240, 62);
      card.addChild(featuredText);
    }

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
      { label: 'SHOP', variant: 'primary' as const, action: 'shop' },
      { label: 'HANGAR', variant: 'primary' as const, action: 'hangar' },
      { label: 'BUY', variant: 'success' as const, action: 'upgrade' },
      { label: 'BACK', variant: 'secondary' as const, action: 'back' },
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
