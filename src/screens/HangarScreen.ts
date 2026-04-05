/**
 * HangarScreen
 * Garage/Workshop where player manages acquired planes
 * Two-panel design: plane list (left) + details (right)
 */

import { Container, Sprite, Graphics, Text, FederatedPointerEvent } from 'pixi.js';
import { UIButton } from '../components/UIButton';
import { StatsBar } from '../components/StatsBar';
import { ColorTheme } from '../utils/ColorTheme';
import { navigationEvents } from './NavigationEvents';

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
  private planesList!: Container;
  private detailsPanel!: Container;
  private navigation!: Container;
  private scrollOffset: number = 0;

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
   * Setup layout - Two panel design
   */
  private setupLayout(): void {
    // Title with glow effect
    const title = new Text('HANGAR', {
      fontSize: 32,
      fontWeight: 'bold',
      fontFamily: 'Orbitron, Arial',
      fill: ColorTheme.get('brand.primary'),
      dropShadow: {
        color: ColorTheme.get('brand.primary'),
        blur: 10,
        distance: 0,
        alpha: 0.6,
        angle: Math.PI / 4,
      },
    });
    title.position.set(16, 12);
    this.addChild(title);

    const padding = 12;
    const panelWidth = 170;
    const leftX = padding;
    const rightX = padding + panelWidth + 12;

    // LEFT PANEL - Planes List with AAA styling
    this.planesList = new Container();
    this.planesList.position.set(leftX, 55);
    this.addChild(this.planesList);

    const leftBg = new Graphics();
    // Glowing cyan border - AAA style
    leftBg.lineStyle(3, ColorTheme.get('brand.primary'), 1);
    leftBg.drawRoundedRect(0, 0, panelWidth, 640, 8);
    leftBg.endFill();

    // Fill with dark semi-transparent background
    leftBg.beginFill(ColorTheme.get('background.secondary'), 0.4);
    leftBg.drawRoundedRect(1, 1, panelWidth - 2, 638, 7);
    leftBg.endFill();
    this.planesList.addChildAt(leftBg, 0);

    let yPos = 8;
    this.planesData.forEach((plane, index) => {
      const planeItem = this.createPlaneListItem(plane, index + 1);
      planeItem.position.set(4, yPos);
      this.planesList.addChild(planeItem);
      yPos += 100;
    });

    // RIGHT PANEL - Details with AAA styling
    this.detailsPanel = new Container();
    this.detailsPanel.position.set(rightX, 55);
    this.addChild(this.detailsPanel);

    const rightBg = new Graphics();
    // Glowing green border - AAA style
    rightBg.lineStyle(3, ColorTheme.get('brand.secondary'), 1);
    rightBg.drawRoundedRect(0, 0, panelWidth, 640, 8);
    rightBg.endFill();

    rightBg.beginFill(ColorTheme.get('background.secondary'), 0.4);
    rightBg.drawRoundedRect(1, 1, panelWidth - 2, 638, 7);
    rightBg.endFill();
    this.detailsPanel.addChildAt(rightBg, 0);

    this.updateDetailsPanel();

    // Navigation bar at bottom - VISIBLE with proper styling
    this.navigation = this.createNavigation();
    this.navigation.position.set(padding, 710);
    this.addChild(this.navigation);
  }

  /**
   * Create plane list item with icon and info
   */
  private createPlaneListItem(plane: PlaneData, index: number): Container {
    const item = new Container();

    // Item background with AAA styling - glowing border on selection
    const isSelected = this.selectedPlaneId === plane.id;

    // Border for selected
    if (isSelected) {
      const border = new Graphics();
      border.lineStyle(2, ColorTheme.get('brand.primary'), 0.8);
      border.drawRoundedRect(0, 0, 162, 96, 4);
      border.endFill();
      item.addChild(border);
    }

    const bg = new Graphics();
    bg.beginFill(
      isSelected ? ColorTheme.get('brand.primary') : ColorTheme.get('background.secondary'),
      isSelected ? 0.3 : 0.2
    );
    bg.drawRoundedRect(1, 1, 160, 94, 3);
    bg.endFill();
    item.addChild(bg);

    // Number badge
    const numBg = new Graphics();
    numBg.beginFill(ColorTheme.get('brand.primary'), 0.8);
    numBg.drawCircle(0, 0, 12);
    numBg.endFill();
    numBg.position.set(14, 14);
    item.addChild(numBg);

    const numText = new Text(String(index), {
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: 0xffffff,
    });
    numText.anchor.set(0.5);
    numText.position.set(14, 14);
    item.addChild(numText);

    // Plane icon placeholder
    const iconBg = new Graphics();
    iconBg.beginFill(ColorTheme.get('brand.secondary'), 0.5);
    iconBg.drawRoundedRect(0, 0, 40, 40, 3);
    iconBg.endFill();
    iconBg.position.set(34, 8);
    item.addChild(iconBg);

    // Plane name
    const nameText = new Text(plane.name, {
      fontSize: 12,
      fontWeight: 'bold',
      fontFamily: 'Exo 2, Arial',
      fill: ColorTheme.get('text.primary'),
      wordWrap: true,
      wordWrapWidth: 130,
    });
    nameText.position.set(8, 52);
    item.addChild(nameText);

    // Type and level on same line
    const typeBg = new Graphics();
    const typeColor = plane.type === 'FIGHTER' ? 0x7c3aed : plane.type === 'BOMBER' ? 0xdc2626 : 0x06b6d4;
    typeBg.beginFill(typeColor, 0.7);
    typeBg.drawRoundedRect(0, 0, 48, 18, 2);
    typeBg.endFill();
    typeBg.position.set(8, 76);
    item.addChild(typeBg);

    const typeText = new Text(plane.type, {
      fontSize: 9,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: 0xffffff,
    });
    typeText.position.set(10, 78);
    item.addChild(typeText);

    const levelBg = new Graphics();
    levelBg.beginFill(ColorTheme.get('brand.secondary'), 0.7);
    levelBg.drawRoundedRect(0, 0, 44, 18, 2);
    levelBg.endFill();
    levelBg.position.set(130, 76);
    item.addChild(levelBg);

    const levelText = new Text(`LVL ${plane.level}`, {
      fontSize: 9,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: 0xffffff,
    });
    levelText.position.set(132, 78);
    item.addChild(levelText);

    // Clickable
    item.eventMode = 'static';
    item.cursor = 'pointer';
    item.on('pointerdown', () => {
      this.selectedPlaneId = plane.id;
      this.setupLayout(); // Refresh to show selection
      this.updateDetailsPanel();
    });

    return item;
  }

  /**
   * Update details panel on the right
   */
  private updateDetailsPanel(): void {
    this.detailsPanel.removeChildren();

    const selected = this.planesData.find((p) => p.id === this.selectedPlaneId);
    if (!selected) return;

    const panelWidth = 180;

    // Panel background
    const bg = new Graphics();
    bg.lineStyle(2, ColorTheme.get('brand.primary'), 0.6);
    bg.drawRoundedRect(0, 0, panelWidth, 680, 6);
    bg.endFill();
    this.detailsPanel.addChild(bg);

    let yPos = 12;

    // Plane name with highlight background - AAA style
    const nameHiBg = new Graphics();
    nameHiBg.beginFill(ColorTheme.get('brand.primary'), 0.2);
    nameHiBg.drawRoundedRect(8, yPos - 2, 156, 32, 3);
    nameHiBg.endFill();
    this.detailsPanel.addChild(nameHiBg);

    const nameText = new Text(selected.name, {
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Exo 2, Arial',
      fill: ColorTheme.get('brand.primary'),
      wordWrap: true,
      wordWrapWidth: 148,
    });
    nameText.position.set(12, yPos);
    this.detailsPanel.addChild(nameText);
    yPos += 36;

    // Description with separator
    const sepLine = new Graphics();
    sepLine.lineStyle(1, ColorTheme.get('brand.primary'), 0.3);
    sepLine.moveTo(12, yPos);
    sepLine.lineTo(160, yPos);
    this.detailsPanel.addChild(sepLine);
    yPos += 8;

    const descText = new Text(selected.description, {
      fontSize: 9,
      fontFamily: 'Arial',
      fill: ColorTheme.get('text.secondary'),
      wordWrap: true,
      wordWrapWidth: 148,
    });
    descText.position.set(12, yPos);
    this.detailsPanel.addChild(descText);
    yPos += 44;

    // Stats header
    const statsTitle = new Text('⚡ STATS', {
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: ColorTheme.get('brand.primary'),
    });
    statsTitle.position.set(12, yPos);
    this.detailsPanel.addChild(statsTitle);
    yPos += 18;

    // Stats bars with AAA styling
    const stats = [
      { label: 'PWR', value: selected.stats.power, color: 0xff6b35 },
      { label: 'ATK', value: selected.stats.attack, color: 0xff2d00 },
      { label: 'DEF', value: selected.stats.defense, color: 0x00d4ff },
      { label: 'SPD', value: selected.stats.speed, color: 0x06ffa5 },
    ];

    stats.forEach((stat) => {
      const label = new Text(stat.label, {
        fontSize: 8,
        fontWeight: 'bold',
        fontFamily: 'Oxanium, Arial',
        fill: 0xffffff,
      });
      label.position.set(12, yPos + 1);
      this.detailsPanel.addChild(label);

      // Stat value on right
      const valueBg = new Graphics();
      valueBg.beginFill(stat.color, 0.3);
      valueBg.drawRoundedRect(138, yPos - 2, 20, 14, 2);
      valueBg.endFill();
      this.detailsPanel.addChild(valueBg);

      const valueText = new Text(String(stat.value), {
        fontSize: 8,
        fontWeight: 'bold',
        fontFamily: 'Oxanium, Arial',
        fill: stat.color,
      });
      valueText.position.set(140, yPos);
      this.detailsPanel.addChild(valueText);

      const bar = new StatsBar({
        label: '',
        maxValue: 100,
        color: stat.color,
        width: 124,
        height: 6,
        showValue: false,
        showLabel: false,
        showPercentage: false,
      });
      bar.position.set(12, yPos + 10);
      bar.setValue(stat.value, 100);
      this.detailsPanel.addChild(bar);

      yPos += 22;
    });

    // Flight stats if owned
    if (selected.owned && selected.flightHours) {
      yPos += 6;

      const sepLine2 = new Graphics();
      sepLine2.lineStyle(1, ColorTheme.get('brand.secondary'), 0.3);
      sepLine2.moveTo(12, yPos);
      sepLine2.lineTo(160, yPos);
      this.detailsPanel.addChild(sepLine2);
      yPos += 8;

      const hoursText = new Text(`✈ ${selected.flightHours}h`, {
        fontSize: 9,
        fontFamily: 'Oxanium, Arial',
        fill: ColorTheme.get('brand.secondary'),
        fontWeight: 'bold',
      });
      hoursText.position.set(12, yPos);
      this.detailsPanel.addChild(hoursText);

      const winsText = new Text(`⭐ ${selected.wins}`, {
        fontSize: 9,
        fontFamily: 'Oxanium, Arial',
        fill: ColorTheme.get('semantic.success'),
        fontWeight: 'bold',
      });
      winsText.position.set(100, yPos);
      this.detailsPanel.addChild(winsText);
      yPos += 20;
    }

    // Upgrades section - AAA style
    if (selected.upgrades && selected.upgrades.length > 0) {
      yPos += 4;

      const upgradesTitle = new Text('🔧 UPGRADES', {
        fontSize: 9,
        fontWeight: 'bold',
        fontFamily: 'Oxanium, Arial',
        fill: ColorTheme.get('semantic.warning'),
      });
      upgradesTitle.position.set(12, yPos);
      this.detailsPanel.addChild(upgradesTitle);
      yPos += 14;

      selected.upgrades.forEach((upgrade) => {
        const upgradeBg = new Graphics();
        upgradeBg.lineStyle(1, ColorTheme.get('semantic.warning'), 0.5);
        upgradeBg.beginFill(ColorTheme.get('semantic.warning'), 0.15);
        upgradeBg.drawRoundedRect(0, 0, 148, 16, 2);
        upgradeBg.endFill();
        upgradeBg.position.set(12, yPos);
        this.detailsPanel.addChild(upgradeBg);

        const upgradeText = new Text(upgrade, {
          fontSize: 8,
          fontFamily: 'Oxanium, Arial',
          fill: ColorTheme.get('semantic.warning'),
          fontWeight: 'bold',
        });
        upgradeText.position.set(14, yPos + 2);
        this.detailsPanel.addChild(upgradeText);

        yPos += 18;
      });
    }
  }

  /**
   * Create navigation bar
   */
  private createNavigation(): Container {
    const nav = new Container();

    const navButtons = [
      { label: 'SHOP', variant: 'primary' as const, action: 'shop' },
      { label: 'PLAY', variant: 'success' as const, action: 'play' },
      { label: 'EXIT', variant: 'danger' as const, action: 'exit' },
    ];

    navButtons.forEach((btnConfig, index) => {
      const button = new UIButton({
        text: btnConfig.label,
        width: 120,
        height: 40,
        variant: btnConfig.variant,
        onClick: () => this.handleNavigation(btnConfig.action),
      });

      button.position.set(index * 128, 0);
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
   * Screen lifecycle - fadeIn
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
   * Screen lifecycle - fadeOut
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
