/**
 * HangarScreen
 * Professional plane management and customization interface
 * Displays player's fleet, plane details, and upgrade options
 * AAA game UI standards
 */

import { Container, Sprite, Graphics, Text, BlurFilter, DisplayObject } from 'pixi.js';
import { UIPanel } from '../components/UIPanel';
import { UIButton } from '../components/UIButton';
import { StatsBar } from '../components/StatsBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SmartText } from '../components/SmartText';
import { ColorTheme } from '../utils/ColorTheme';
import { TEXT_STYLES } from '../config/typography';
import { SPACING, LayoutHelper } from '../config/spacing';
import { COLORS } from '../config/colors';
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
  private planesPanel: UIPanel;
  private detailsPanel: UIPanel;
  private customizationPanel: UIPanel;
  private planesData: PlaneData[] = [];
  private planesGridContainer: Container;
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
    bg.drawRect(0, 0, 1080, 1920);
    bg.endFill();
    this.addChildAt(bg, 0);
  }

  /**
   * Setup main layout - MOBILE ONLY
   * Vertical scrolling layout optimized for mobile phones
   */
  private setupLayout(): void {
    // Screen title
    this.addScreenTitle();

    // Mobile padding
    const padding = 16;
    const mobileWidth = 360; // Typical mobile width
    const panelWidth = mobileWidth - padding * 2;
    let yPos = 80;

    // Planes fleet panel - compact for mobile
    this.planesPanel = new UIPanel({
      width: panelWidth,
      height: 280,
      hasHeader: true,
      headerText: 'YOUR FLEET',
      style: 'primary',
    });
    this.planesPanel.position.set(padding, yPos);
    this.addChild(this.planesPanel);

    this.planesGridContainer = this.createPlanesGrid();
    this.planesPanel.addContent(this.planesGridContainer);

    yPos += 300;

    // Plane details panel
    this.detailsPanel = new UIPanel({
      width: panelWidth,
      height: 240,
      hasHeader: true,
      headerText: 'PLANE DETAILS',
      style: 'secondary',
    });
    this.detailsPanel.position.set(padding, yPos);
    this.addChild(this.detailsPanel);

    yPos += 260;

    // Upgrades panel
    this.customizationPanel = new UIPanel({
      width: panelWidth,
      height: 200,
      hasHeader: true,
      headerText: 'UPGRADES',
      style: 'dark',
    });
    this.customizationPanel.position.set(padding, yPos);
    this.addChild(this.customizationPanel);

    yPos += 220;

    // Navigation bar
    this.navigation = this.createNavigation();
    this.navigation.position.set(padding, yPos);
    this.addChild(this.navigation);

    // Initial selection
    if (this.selectedPlaneId) {
      this.updateDetailsPanels(this.selectedPlaneId);
    }
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
        width: 220,
        height: 50,
        variant: btnConfig.variant,
        onClick: () => this.handleNavigation(btnConfig.action),
      });

      button.position.set(index * 240 + 10, 0);
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
   * Add animated screen title
   */
  private addScreenTitle(): void {
    const title = new Text('HANGAR', TEXT_STYLES.screenTitle);
    title.position.set(40, 40);
    this.addChild(title);

    // Glow effect
    const glowText = new Text('HANGAR', {
      ...TEXT_STYLES.screenTitle,
      fill: ColorTheme.get('brand.primary'),
      alpha: 0.3,
    });
    glowText.position.set(42, 42);
    const blurFilter = new BlurFilter();
    blurFilter.blur = 8;
    glowText.filters = [blurFilter];
    this.addChildAt(glowText, this.children.indexOf(title));
  }

  /**
   * Create planes grid (2 columns)
   */
  private createPlanesGrid(): Container {
    const grid = new Container();

    this.planesData.forEach((plane, index) => {
      const card = this.createPlaneCard(plane);
      const pos = LayoutHelper.getGridPosition(
        index,
        2,
        280,
        240,
        SPACING.gap.grid,
        0,
        0
      );
      card.position.set(pos.x, pos.y);
      grid.addChild(card);
    });

    return grid;
  }

  /**
   * Create individual plane card
   */
  private createPlaneCard(planeData: PlaneData): Container {
    const card = new Container();

    // Card background
    const bgPanel = new UIPanel({
      width: 280,
      height: 220,
      style: planeData.owned ? 'secondary' : 'dark',
      showGlow: planeData.owned,
    });
    card.addChild(bgPanel);

    // Type badge
    const typeBadge = this.createTypeBadge(planeData.type);
    typeBadge.position.set(20, 20);
    card.addChild(typeBadge);

    // Lock overlay for unowned planes
    if (!planeData.owned) {
      const lockOverlay = new Graphics();
      lockOverlay.beginFill(0x000000, 0.6);
      lockOverlay.drawRoundedRect(0, 0, 280, 220, 8);
      lockOverlay.endFill();
      card.addChild(lockOverlay);

      const lockIcon = new Graphics();
      lockIcon.beginFill(ColorTheme.get('semantic.danger'));
      lockIcon.drawRect(120, 85, 40, 50);
      lockIcon.drawCircle(140, 85, 8);
      lockIcon.endFill();
      lockIcon.position.set(0, 0);
      card.addChild(lockIcon);

      const unlockText = new Text('LOCKED', TEXT_STYLES.buttonText);
      unlockText.anchor.set(0.5);
      unlockText.position.set(140, 170);
      card.addChild(unlockText);
    } else {
      // Plane icon
      try {
        const icon = Sprite.from(planeData.icon);
        icon.scale.set(0.5);
        icon.anchor.set(0.5);
        icon.position.set(140, 80);
        card.addChild(icon);
      } catch {
        const placeholder = new Graphics();
        placeholder.beginFill(ColorTheme.get('brand.secondary'), 0.5);
        placeholder.drawRect(100, 40, 80, 80);
        placeholder.endFill();
        card.addChild(placeholder);
      }

      // Plane name
      const nameText = SmartText.truncated(
        planeData.name,
        240,
        TEXT_STYLES.h4,
        '..'
      );
      nameText.position.set(20, 140);
      card.addChild(nameText);

      // Level badge
      const levelBg = new Graphics();
      levelBg.beginFill(ColorTheme.get('brand.primary'));
      levelBg.drawRoundedRect(0, 0, 80, 28, 14);
      levelBg.endFill();
      levelBg.position.set(20, 180);
      card.addChild(levelBg);

      const levelText = new Text(`LVL ${planeData.level}`, {
        ...TEXT_STYLES.bodyText,
        fontSize: 14,
        fontWeight: 600,
      });
      levelText.position.set(28, 186);
      card.addChild(levelText);
    }

    // Interactivity
    card.eventMode = 'static';
    card.cursor = 'pointer';

    if (planeData.owned) {
      card.on('pointerdown', () => {
        this.selectPlane(planeData.id);
      });
      card.on('pointerover', () => {
        card.scale.set(1.05);
      });
      card.on('pointerout', () => {
        card.scale.set(1);
      });
    } else {
      card.on('pointerdown', () => {
        this.showUnlockDialog(planeData);
      });
    }

    return card;
  }

  /**
   * Create type badge
   */
  private createTypeBadge(type: string): Container {
    const badge = new Container();

    const color =
      type === 'FIGHTER'
        ? ColorTheme.get('brand.secondary')
        : type === 'BOMBER'
          ? ColorTheme.get('semantic.warning')
          : ColorTheme.get('semantic.danger');

    const bg = new Graphics();
    bg.beginFill(color);
    bg.drawRoundedRect(0, 0, 100, 24, 12);
    bg.endFill();
    badge.addChild(bg);

    const text = new Text(type, {
      ...TEXT_STYLES.badge,
      fontSize: 11,
    });
    text.anchor.set(0.5);
    text.position.set(50, 12);
    badge.addChild(text);

    return badge;
  }

  /**
   * Select plane and update details
   */
  private selectPlane(planeId: string): void {
    this.selectedPlaneId = planeId;
    this.updateDetailsPanels(planeId);
  }

  /**
   * Update details and customization panels
   */
  private updateDetailsPanels(planeId: string): void {
    const plane = this.planesData.find((p) => p.id === planeId);
    if (!plane || !plane.owned) return;

    // Clear existing content
    this.detailsPanel.clearContent();
    this.customizationPanel.clearContent();

    // Update details panel
    const detailsContent = this.createPlaneDetailsContent(plane);
    this.detailsPanel.addContent(detailsContent);

    // Update customization panel
    const customizationContent = this.createCustomizationContent(plane);
    this.customizationPanel.addContent(customizationContent);
  }

  /**
   * Create plane details content
   */
  private createPlaneDetailsContent(plane: PlaneData): Container {
    const container = new Container();
    const contentArea = this.detailsPanel.getContentArea();

    // Plane preview
    const previewBg = new Graphics();
    previewBg.beginFill(ColorTheme.get('background.tertiary'));
    previewBg.lineStyle(2, ColorTheme.get('ui.panelBorder'), 0.5);
    previewBg.drawRoundedRect(0, 0, contentArea.width, 150, 8);
    previewBg.endFill();
    container.addChild(previewBg);

    try {
      const icon = Sprite.from(plane.icon);
      icon.scale.set(0.6);
      icon.anchor.set(0.5);
      icon.position.set(contentArea.width / 2, 75);
      container.addChild(icon);
    } catch {
      const placeholder = new Graphics();
      placeholder.beginFill(ColorTheme.get('brand.secondary'), 0.3);
      placeholder.drawRect(contentArea.width / 2 - 40, 35, 80, 80);
      placeholder.endFill();
      container.addChild(placeholder);
    }

    // Plane info
    const nameText = new Text(plane.name, TEXT_STYLES.h3);
    nameText.position.set(10, 160);
    container.addChild(nameText);

    const descText = SmartText.wrapped(
      plane.description,
      contentArea.width - 20,
      undefined,
      TEXT_STYLES.small,
      10
    );
    descText.position.set(10, 195);
    container.addChild(descText);

    // Stats
    const statsContainer = this.createStatsSection(plane.stats, contentArea.width);
    statsContainer.y = 240;
    container.addChild(statsContainer);

    return container;
  }

  /**
   * Create customization content
   */
  private createCustomizationContent(plane: PlaneData): Container {
    const container = new Container();
    const contentArea = this.customizationPanel.getContentArea();

    // Upgrades installed
    const upgradesTitle = new Text('INSTALLED UPGRADES', TEXT_STYLES.statLabel);
    upgradesTitle.position.set(0, 0);
    container.addChild(upgradesTitle);

    if (plane.upgrades && plane.upgrades.length > 0) {
      plane.upgrades.forEach((upgrade, index) => {
        const upgradeBg = new Graphics();
        upgradeBg.beginFill(ColorTheme.get('semantic.success'), 0.2);
        upgradeBg.lineStyle(1, ColorTheme.get('semantic.success'), 0.5);
        upgradeBg.drawRoundedRect(0, 30 + index * 45, contentArea.width - 20, 35, 4);
        upgradeBg.endFill();
        container.addChild(upgradeBg);

        const upgradeText = new Text(upgrade, TEXT_STYLES.bodyText);
        upgradeText.position.set(15, 45 + index * 45);
        container.addChild(upgradeText);
      });
    } else {
      const noUpgradesText = new Text('No upgrades installed', TEXT_STYLES.small);
      noUpgradesText.style.fill = ColorTheme.get('text.tertiary');
      noUpgradesText.position.set(0, 30);
      container.addChild(noUpgradesText);
    }

    // Available upgrades button
    const upgradeButton = new UIButton({
      text: 'VIEW UPGRADES',
      width: contentArea.width - 20,
      height: 44,
      variant: 'primary',
      onClick: () => console.log('View upgrades'),
    });
    upgradeButton.position.set(10, 180);
    container.addChild(upgradeButton);

    return container;
  }

  /**
   * Create stats bars section
   */
  private createStatsSection(stats: PlaneStats, width: number): Container {
    const container = new Container();

    const statConfigs = [
      { label: 'POWER', value: stats.power, color: ColorTheme.get('stats.power') },
      { label: 'ATTACK', value: stats.attack, color: ColorTheme.get('stats.attack') },
      { label: 'DEFENSE', value: stats.defense, color: ColorTheme.get('stats.defense') },
      { label: 'SPEED', value: stats.speed, color: ColorTheme.get('stats.speed') },
    ];

    statConfigs.forEach((config, index) => {
      const bar = new StatsBar({
        label: config.label,
        maxValue: 100,
        color: config.color,
        width: width - 20,
        showValue: true,
        showPercentage: false,
      });

      bar.position.set(10, index * 55);
      bar.setValue(config.value, 100);
      container.addChild(bar);
    });

    return container;
  }

  /**
   * Show unlock dialog for locked planes
   */
  private showUnlockDialog(plane: PlaneData): void {
    const dialog = new ConfirmDialog({
      title: 'UNLOCK PLANE',
      message: `Unlock ${plane.name}?\n\nCost: ${plane.unlockCost} coins\n\n${plane.description}`,
      icon: plane.icon,
      confirmText: 'UNLOCK',
      cancelText: 'CANCEL',
      variant: 'warning',
      onConfirm: () => {
        console.log('Unlock:', plane.id);
      },
    });

    this.addChild(dialog);
    dialog.fadeIn(300);
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
    if (this.planesPanel) this.planesPanel.destroyPanel();
    if (this.detailsPanel) this.detailsPanel.destroyPanel();
    if (this.customizationPanel) this.customizationPanel.destroyPanel();

    this.removeChildren();
    this.destroy({ children: true });
  }
}
