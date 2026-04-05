/**
 * HangarScreen
 * Mobile card-based plane management interface
 * Clean, minimal design for mobile phones
 */

import { Container, Sprite, Graphics, Text } from 'pixi.js';
import { UIButton } from '../components/UIButton';
import { ColorTheme } from '../utils/ColorTheme';
import { navigationEvents } from './NavigationEvents';

// Game data structures
interface PlaneStats {
  power: number;
  attack: number;
  defense: number;
  speed: number;
}

interface PlaneData {
  id: string;
  name: string;
  type: 'FIGHTER' | 'BOMBER' | 'SPECIAL';
  level: number;
  owned: boolean;
  unlockCost?: number;
  stats: PlaneStats;
  icon: string;
  description: string;
  flightHours?: number;
  wins?: number;
  upgrades?: string[];
}

export class HangarScreen extends Container {
  private selectedPlaneId: string | null = null;
  private planesData: PlaneData[] = [];
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
    this.planesData = [
      {
        id: '1',
        name: 'RED JET',
        type: 'FIGHTER',
        level: 5,
        owned: true,
        stats: { power: 85, attack: 90, defense: 70, speed: 95 },
        icon: 'plane_red.png',
        description: 'Fast interceptor with balanced stats',
        flightHours: 120,
        wins: 48,
        upgrades: ['Weapons-II', 'Engine-Turbo'],
      },
      {
        id: '2',
        name: 'BLUE A1',
        type: 'FIGHTER',
        level: 3,
        owned: true,
        stats: { power: 75, attack: 80, defense: 75, speed: 85 },
        icon: 'plane_blue.png',
        description: 'All-rounder fighter',
        flightHours: 45,
        wins: 18,
        upgrades: ['Armor-I'],
      },
      {
        id: '3',
        name: 'YELLOW',
        type: 'FIGHTER',
        level: 4,
        owned: true,
        stats: { power: 80, attack: 75, defense: 65, speed: 100 },
        icon: 'plane_yellow.png',
        description: 'Agile speedster',
        flightHours: 78,
        wins: 32,
        upgrades: [],
      },
      {
        id: '4',
        name: 'PURPLE BOMBER',
        type: 'BOMBER',
        level: 0,
        owned: false,
        unlockCost: 1500,
        stats: { power: 95, attack: 85, defense: 60, speed: 70 },
        icon: 'plane_purple.png',
        description: 'Heavy bomber with devastating power',
      },
      {
        id: '5',
        name: 'STEALTH',
        type: 'SPECIAL',
        level: 0,
        owned: false,
        unlockCost: 2500,
        stats: { power: 90, attack: 80, defense: 80, speed: 90 },
        icon: 'plane_stealth.png',
        description: 'Advanced stealth technology',
      },
      {
        id: '6',
        name: 'GREEN GUARDIAN',
        type: 'FIGHTER',
        level: 1,
        owned: true,
        stats: { power: 70, attack: 65, defense: 90, speed: 75 },
        icon: 'plane_green.png',
        description: 'Tank with heavy armor',
        flightHours: 12,
        wins: 5,
        upgrades: [],
      },
    ];

    // Set first owned plane as selected
    const firstOwned = this.planesData.find((p) => p.owned);
    if (firstOwned) {
      this.selectedPlaneId = firstOwned.id;
    }
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
    const title = new Text('HANGAR', {
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

    // Create plane cards
    this.planesData.forEach((plane) => {
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
   * Create a simple plane card
   */
  private createPlaneCard(plane: PlaneData): Container {
    const card = new Container();

    // Card background - simple rounded rect
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

    // Level badge
    const levelBg = new Graphics();
    levelBg.beginFill(ColorTheme.get('brand.secondary'), 0.8);
    levelBg.drawRoundedRect(0, 0, 56, 24, 4);
    levelBg.endFill();
    levelBg.position.set(280, 28);
    card.addChild(levelBg);

    const levelText = new Text(`LVL ${plane.level}`, {
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: 0xffffff,
    });
    levelText.position.set(284, 32);
    card.addChild(levelText);

    // Stats row - Power, Speed
    const statsText = new Text(`⚡ ${plane.stats.power}  ⬆ ${plane.stats.speed}`, {
      fontSize: 12,
      fontFamily: 'Oxanium, Arial',
      fill: ColorTheme.get('text.secondary'),
    });
    statsText.position.set(12, 60);
    card.addChild(statsText);

    // Status indicator
    if (!plane.owned) {
      const lockText = new Text('LOCKED', {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Oxanium, Arial',
        fill: ColorTheme.get('semantic.warning'),
      });
      lockText.position.set(280, 62);
      card.addChild(lockText);
    }

    // Click to select
    card.eventMode = 'static';
    card.cursor = 'pointer';
    card.on('pointerdown', () => {
      this.selectedPlaneId = plane.id;
    });

    return card;
  }

  /**
   * Create navigation bar
   */
  private createNavigation(): Container {
    const nav = new Container();

    const navButtons = [
      { label: 'SHOP', variant: 'primary' as const, action: 'shop' },
      { label: 'STORE', variant: 'primary' as const, action: 'plane-store' },
      { label: 'UPGRADE', variant: 'warning' as const, action: 'upgrade' },
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
