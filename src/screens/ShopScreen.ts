/**
 * ShopScreen
 * Professional game shop interface for purchasing treasures and items
 * AAA game UI standards with professional polish and animations
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
  private mainPanel: UIPanel;
  private itemsPanel: UIPanel;
  private treasureGrid: Container;
  private selectedItemPanel: Container;
  private progressPanel: UIPanel;
  private navigation: Container;

  private treasureData: TreasureData[] = [];
  private itemData: ItemData[] = [];
  private selectedTreasureId: string | null = null;
  private selectedItemId: string | null = null;

  constructor() {
    super();
    this.loadGameData();
    this.setupBackground();
    this.setupLayout();
  }

  /**
   * Load game data (would come from Firebase in production)
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

    // Item data (example: Yellow plane)
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

    // Set first treasure and item as selected
    if (this.treasureData.length > 0) {
      this.selectedTreasureId = this.treasureData[0].id;
    }
    if (this.itemData.length > 0) {
      this.selectedItemId = this.itemData[0].id;
    }
  }

  /**
   * Setup background with gradient or starfield
   */
  private setupBackground(): void {
    // Create subtle gradient background
    const bg = new Graphics();

    // Deep space purple gradient effect
    const bgColor = ColorTheme.get('background.primary');
    bg.beginFill(bgColor);
    bg.drawRect(0, 0, 1080, 1920);
    bg.endFill();

    this.addChildAt(bg, 0);
  }

  /**
   * Setup main screen layout
   */
  private setupLayout(): void {
    // Screen title with glow
    this.addScreenTitle();

    // Left panel - Treasures
    this.mainPanel = new UIPanel({
      width: 640,
      height: 1200,
      hasHeader: true,
      headerText: 'TREASURES',
      style: 'primary',
    });
    this.mainPanel.position.set(40, 120);
    this.addChild(this.mainPanel);

    // Treasure grid
    this.treasureGrid = this.createTreasureGrid();
    this.mainPanel.addContent(this.treasureGrid);

    // Right panel - Items
    this.itemsPanel = new UIPanel({
      width: 360,
      height: 1200,
      hasHeader: true,
      headerText: 'ITEMS',
      style: 'secondary',
    });
    this.itemsPanel.position.set(720, 120);
    this.addChild(this.itemsPanel);

    // Selected item display
    this.selectedItemPanel = this.createSelectedItemDisplay();
    this.itemsPanel.addContent(this.selectedItemPanel);

    // Progress section
    this.progressPanel = new UIPanel({
      width: 360,
      height: 500,
      hasHeader: true,
      headerText: 'PROGRESS',
      style: 'dark',
    });
    this.progressPanel.position.set(720, 1360);
    this.addChild(this.progressPanel);

    const progressContent = this.createProgressContent();
    this.progressPanel.addContent(progressContent);

    // Navigation bar (3 rows now: gameplay + navigation)
    this.navigation = this.createNavigation();
    this.navigation.position.set(40, 1620);
    this.addChild(this.navigation);
  }

  /**
   * Add animated screen title
   */
  private addScreenTitle(): void {
    const title = new Text('SHOP', TEXT_STYLES.screenTitle);
    title.position.set(40, 40);
    this.addChild(title);

    // Add glow effect to title
    const glowText = new Text('SHOP', {
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
   * Create treasure card grid (3 items)
   */
  private createTreasureGrid(): Container {
    const grid = new Container();

    this.treasureData.forEach((treasure, index) => {
      const card = this.createTreasureCard(treasure);
      const pos = LayoutHelper.getGridPosition(
        index,
        3,
        180,
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
   * Create individual treasure card
   */
  private createTreasureCard(treasureData: TreasureData): Container {
    const card = new Container();

    // Card background panel
    const rarityColor = this.getRarityColor(treasureData.rarity);
    const cardPanel = new UIPanel({
      width: 180,
      height: 240,
      style: 'secondary',
      showGlow: true,
    });
    card.addChild(cardPanel);

    // Rarity ribbon/banner (top-right corner)
    const rarityBanner = this.createRarityBanner(treasureData.rarity);
    rarityBanner.position.set(120, 0);
    card.addChild(rarityBanner);

    // Treasure icon
    try {
      const icon = Sprite.from(treasureData.icon);
      icon.scale.set(0.6);
      icon.anchor.set(0.5);
      icon.position.set(90, 70);
      card.addChild(icon);
    } catch (error) {
      // Placeholder if icon not found
      const placeholder = new Graphics();
      placeholder.beginFill(rarityColor);
      placeholder.drawCircle(90, 70, 30);
      placeholder.endFill();
      card.addChild(placeholder);
    }

    // Price display with coins icon
    const priceContainer = new Container();
    priceContainer.y = 130;

    const coinIcon = new Graphics();
    coinIcon.beginFill(ColorTheme.get('semantic.warning'));
    coinIcon.drawCircle(20, 10, 8);
    coinIcon.endFill();
    priceContainer.addChild(coinIcon);

    const priceText = new Text(`$ ${treasureData.price}`, TEXT_STYLES.statValue);
    priceText.position.set(35, 5);
    priceContainer.addChild(priceText);

    card.addChild(priceContainer);

    // Buy button
    const buyButton = new UIButton({
      text: 'BUY',
      width: 140,
      height: 40,
      variant: 'primary',
      onClick: () => this.purchaseTreasure(treasureData),
    });
    buyButton.position.set(20, 190);
    card.addChild(buyButton);

    // Interactivity
    card.eventMode = 'static';
    card.cursor = 'pointer';
    card.on('pointerover', () => {
      card.scale.set(1.05);
    });
    card.on('pointerout', () => {
      card.scale.set(1);
    });

    return card;
  }

  /**
   * Get rarity color
   */
  private getRarityColor(rarity: string): number {
    const rarityColors: Record<string, number> = {
      common: ColorTheme.get('semantic.info'),
      rare: ColorTheme.get('brand.secondary'),
      epic: ColorTheme.get('semantic.warning'),
      legendary: ColorTheme.get('semantic.success'),
    };
    return rarityColors[rarity] || ColorTheme.get('text.secondary');
  }

  /**
   * Create rarity banner
   */
  private createRarityBanner(rarity: string): Container {
    const banner = new Container();

    const bg = new Graphics();
    bg.beginFill(this.getRarityColor(rarity));
    bg.drawRect(0, 0, 60, 25);
    bg.endFill();
    banner.addChild(bg);

    const text = new Text(rarity.toUpperCase(), TEXT_STYLES.badge);
    text.anchor.set(0.5);
    text.position.set(30, 12);
    banner.addChild(text);

    return banner;
  }

  /**
   * Create selected item display panel
   */
  private createSelectedItemDisplay(): Container {
    const container = new Container();

    if (!this.selectedItemId || !this.itemData[0]) {
      return container;
    }

    const item = this.itemData[0];
    const contentArea = this.itemsPanel.getContentArea();

    // Item preview box
    const previewBg = new Graphics();
    previewBg.beginFill(ColorTheme.get('background.tertiary'));
    previewBg.lineStyle(2, ColorTheme.get('ui.panelBorder'), 0.5);
    previewBg.drawRoundedRect(0, 0, contentArea.width, 180, 8);
    previewBg.endFill();
    container.addChild(previewBg);

    // Item icon
    try {
      const itemIcon = Sprite.from(item.icon);
      itemIcon.scale.set(0.7);
      itemIcon.anchor.set(0.5);
      itemIcon.position.set(contentArea.width / 2, 90);
      container.addChild(itemIcon);
    } catch {
      // Placeholder
      const placeholder = new Graphics();
      placeholder.beginFill(ColorTheme.get('brand.secondary'), 0.5);
      placeholder.drawRect(contentArea.width / 2 - 40, 50, 80, 80);
      placeholder.endFill();
      container.addChild(placeholder);
    }

    // Item name
    const itemName = new Text(item.name, TEXT_STYLES.h3);
    itemName.position.set(10, 200);
    container.addChild(itemName);

    // Item type
    const itemType = SmartText.truncated(
      item.type,
      contentArea.width - 20,
      TEXT_STYLES.bodyText,
      '...'
    );
    itemType.position.set(10, 235);
    container.addChild(itemType);

    // Stats section
    const statsContainer = this.createStatsSection(item.stats, contentArea.width);
    statsContainer.y = 270;
    container.addChild(statsContainer);

    return container;
  }

  /**
   * Create stats bars section
   */
  private createStatsSection(
    stats: Record<string, number>,
    width: number
  ): Container {
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
      container.addChild(bar);

      // Animate bars on display
      setTimeout(() => {
        bar.animateValue(config.value, 100, 600, 'easeOut');
      }, index * 100);
    });

    return container;
  }

  /**
   * Create progress/achievements content
   */
  private createProgressContent(): Container {
    const container = new Container();
    const contentArea = this.progressPanel.getContentArea();

    // Progress bar (level/experience)
    const progressLabel = new Text('CURRENT LEVEL', TEXT_STYLES.statLabel);
    progressLabel.position.set(0, 0);
    container.addChild(progressLabel);

    const levelNumber = new Text('12', TEXT_STYLES.h2);
    levelNumber.position.set(0, 25);
    container.addChild(levelNumber);

    // XP bar
    const xpBar = new StatsBar({
      label: 'NEXT LEVEL',
      maxValue: 1000,
      color: ColorTheme.get('semantic.success'),
      width: contentArea.width - 20,
      showValue: false,
      showPercentage: true,
    });
    xpBar.position.set(0, 80);
    xpBar.setValue(650, 1000);
    container.addChild(xpBar);

    // Achievement section
    const achievementTitle = new Text('RECENT ACHIEVEMENT', TEXT_STYLES.statLabel);
    achievementTitle.position.set(0, 150);
    container.addChild(achievementTitle);

    // Achievement badge
    const achievementBg = new Graphics();
    achievementBg.beginFill(ColorTheme.get('semantic.warning'), 0.2);
    achievementBg.lineStyle(2, ColorTheme.get('semantic.warning'), 0.6);
    achievementBg.drawRoundedRect(0, 170, contentArea.width - 20, 100, 8);
    achievementBg.endFill();
    container.addChild(achievementBg);

    const achievementName = new Text('TREASURE COLLECTOR I', TEXT_STYLES.h4);
    achievementName.position.set(15, 185);
    container.addChild(achievementName);

    const achievementDesc = SmartText.truncated(
      'Purchased 5 treasure chests',
      contentArea.width - 50,
      TEXT_STYLES.small,
      '...'
    );
    achievementDesc.position.set(15, 220);
    container.addChild(achievementDesc);

    const unlockedBadge = new Text('✓ UNLOCKED', {
      ...TEXT_STYLES.badge,
      fill: ColorTheme.get('semantic.success'),
    });
    unlockedBadge.position.set(contentArea.width - 60, 240);
    container.addChild(unlockedBadge);

    return container;
  }

  /**
   * Create navigation bar (8 buttons in 2 rows)
   */
  private createNavigation(): Container {
    const nav = new Container();

    const navButtons = [
      { label: 'PLAY', variant: 'primary' as const, action: 'play' },
      { label: 'RESUME', variant: 'primary' as const, action: 'resume' },
      { label: 'SAVE', variant: 'primary' as const, action: 'save' },
      { label: 'RESTART', variant: 'primary' as const, action: 'restart' },
      { label: 'ARCADE', variant: 'secondary' as const, action: 'arcade' },
      { label: 'CLASSIC', variant: 'secondary' as const, action: 'classic' },
      { label: 'UPGRADE', variant: 'warning' as const, action: 'upgrade' },
      { label: 'EXIT', variant: 'danger' as const, action: 'exit' },
      { label: 'HANGAR', variant: 'primary' as const, action: 'hangar' },
      { label: 'PLANE STORE', variant: 'primary' as const, action: 'plane-store' },
    ];

    navButtons.forEach((btnConfig, index) => {
      const button = new UIButton({
        text: btnConfig.label,
        width: 220,
        height: 50,
        variant: btnConfig.variant,
        onClick: () => this.handleNavigation(btnConfig.action),
      });

      const col = index % 4;
      const row = Math.floor(index / 4);

      button.position.set(col * 240 + 10, row * 70);
      nav.addChild(button);
    });

    return nav;
  }

  /**
   * Handle treasure purchase
   */
  private purchaseTreasure(treasureData: TreasureData): void {
    const dialog = new ConfirmDialog({
      title: 'PURCHASE TREASURE',
      message: `Buy ${treasureData.name} for $${treasureData.price}?`,
      icon: treasureData.icon,
      confirmText: 'YES, BUY',
      cancelText: 'CANCEL',
      variant: 'default',
      onConfirm: async () => {
        // Handle purchase
        console.log('Purchase confirmed:', treasureData);
        await ConfirmDialog.success(
          'PURCHASE COMPLETE',
          `${treasureData.name} purchased successfully!`,
          this as any,
          'coin.png'
        );
      },
    });

    this.addChild(dialog);
    dialog.fadeIn(300);
  }

  /**
   * Handle navigation actions
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
    if (this.mainPanel) this.mainPanel.destroyPanel();
    if (this.itemsPanel) this.itemsPanel.destroyPanel();
    if (this.progressPanel) this.progressPanel.destroyPanel();

    this.removeChildren();
    this.destroy({ children: true });
  }
}
