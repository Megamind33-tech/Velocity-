/**
 * PlaneStoreScreen
 * Professional aircraft marketplace with featured showcase and filterable catalog
 * AAA game UI standards with premium presentation
 */

import { Container, Sprite, Graphics, Text, BlurFilter } from 'pixi.js';
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
  private catalogPanel: UIPanel;
  private featuredPanel: UIPanel;
  private filtersBar: Container;
  private currentFilter: string = 'ALL';
  private storeData: StorePlane[] = [];
  private catalogGridContainer: Container;
  private navigation: Container;

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
        description: 'The ultimate weapon in aerial warfare. Undetectable, unstoppable.',
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
        description: 'Cutting-edge fighter jet with superior maneuverability.',
        stats: { power: 85, attack: 90, defense: 70, speed: 95 },
        icon: 'plane_raptor.png',
      },
      {
        id: 'spirit',
        name: 'B-2 SPIRIT',
        type: 'BOMBER',
        price: 3800,
        description: 'Legendary stealth bomber with heavy payload capacity.',
        stats: { power: 90, attack: 85, defense: 75, speed: 70 },
        icon: 'plane_spirit.png',
      },
      {
        id: 'lightning',
        name: 'F-35 LIGHTNING',
        type: 'FIGHTER',
        price: 2900,
        description: 'Advanced multi-role fighter with modern systems.',
        stats: { power: 80, attack: 85, defense: 75, speed: 90 },
        icon: 'plane_lightning.png',
      },
      {
        id: 'su57',
        name: 'SU-57',
        type: 'FIGHTER',
        price: 3100,
        description: 'Russian advanced tactical fighter.',
        stats: { power: 88, attack: 92, defense: 72, speed: 93 },
        icon: 'plane_su57.png',
      },
      {
        id: 'ac130',
        name: 'AC-130',
        type: 'BOMBER',
        price: 3400,
        description: 'Massive gunship with devastating firepower.',
        stats: { power: 100, attack: 95, defense: 65, speed: 60 },
        icon: 'plane_ac130.png',
      },
      {
        id: 'aurora',
        name: 'AURORA',
        type: 'SPECIAL',
        price: 5500,
        description: 'Experimental hypersonic aircraft with cutting-edge technology.',
        stats: { power: 92, attack: 88, defense: 85, speed: 100 },
        icon: 'plane_aurora.png',
      },
      {
        id: 'drone',
        name: 'COMBAT DRONE',
        type: 'SPECIAL',
        price: 1800,
        description: 'Autonomous drone with precision targeting systems.',
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

    // Filters bar
    this.filtersBar = this.createFiltersBar();
    this.filtersBar.position.set(padding, yPos);
    this.addChild(this.filtersBar);

    yPos += 60;

    // Featured plane panel - compact for mobile
    this.featuredPanel = new UIPanel({
      width: panelWidth,
      height: 220,
      hasHeader: true,
      headerText: 'FEATURED',
      style: 'primary',
    });
    this.featuredPanel.position.set(padding, yPos);
    this.addChild(this.featuredPanel);

    const featured = this.createFeaturedCard();
    this.featuredPanel.addContent(featured);

    yPos += 240;

    // Catalog panel
    this.catalogPanel = new UIPanel({
      width: panelWidth,
      height: 400,
      hasHeader: true,
      headerText: 'AVAILABLE PLANES',
      style: 'secondary',
    });
    this.catalogPanel.position.set(padding, yPos);
    this.addChild(this.catalogPanel);

    const catalog = this.createCatalogGrid();
    this.catalogPanel.addContent(catalog);

    yPos += 420;

    // Navigation bar
    this.navigation = this.createNavigation();
    this.navigation.position.set(padding, yPos);
    this.addChild(this.navigation);
  }

  /**
   * Create navigation bar
   */
  private createNavigation(): Container {
    const nav = new Container();

    const navButtons = [
      { label: 'SHOP', variant: 'primary' as const, action: 'shop' },
      { label: 'HANGAR', variant: 'primary' as const, action: 'hangar' },
      { label: 'UPGRADES', variant: 'warning' as const, action: 'upgrade' },
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
    const title = new Text('PLANE STORE', TEXT_STYLES.screenTitle);
    title.position.set(40, 40);
    this.addChild(title);

    // Glow effect
    const glowText = new Text('PLANE STORE', {
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
   * Create filters bar
   */
  private createFiltersBar(): Container {
    const bar = new Container();

    // Background
    const bg = new Graphics();
    bg.beginFill(ColorTheme.get('background.secondary'));
    bg.lineStyle(2, ColorTheme.get('ui.panelBorder'), 0.3);
    bg.drawRoundedRect(0, 0, 1000, 60, 8);
    bg.endFill();
    bar.addChild(bg);

    // Filter buttons
    const filters = ['ALL', 'FIGHTERS', 'BOMBERS', 'SPECIAL'];
    filters.forEach((label, index) => {
      const button = new UIButton({
        text: label,
        width: 180,
        height: 44,
        variant: this.currentFilter === label ? 'primary' : 'secondary',
        onClick: () => this.filterPlanes(label),
      });

      button.position.set(20 + index * 210, 8);
      bar.addChild(button);
    });

    // Sort indicator
    const sortLabel = new Text('SORT BY: PRICE ↑', TEXT_STYLES.small);
    sortLabel.position.set(880, 20);
    bar.addChild(sortLabel);

    return bar;
  }

  /**
   * Create featured plane showcase
   */
  private createFeaturedCard(): Container {
    const card = new Container();
    const contentArea = this.featuredPanel.getContentArea();

    // Left side - Large plane preview
    const previewBg = new Graphics();
    previewBg.beginFill(ColorTheme.get('background.tertiary'));
    previewBg.lineStyle(2, ColorTheme.get('ui.panelBorder'), 0.5);
    previewBg.drawRoundedRect(0, 0, 400, 340, 8);
    previewBg.endFill();
    card.addChild(previewBg);

    const featured = this.storeData.find((p) => p.featured);
    if (featured) {
      // Plane icon
      try {
        const icon = Sprite.from(featured.icon);
        icon.scale.set(1.2);
        icon.anchor.set(0.5);
        icon.position.set(200, 170);
        card.addChild(icon);
      } catch {
        const placeholder = new Graphics();
        placeholder.beginFill(ColorTheme.get('brand.secondary'), 0.3);
        placeholder.drawRect(100, 70, 200, 200);
        placeholder.endFill();
        card.addChild(placeholder);
      }

      // Right side - Details
      const detailsContainer = new Container();
      detailsContainer.x = 430;

      // Discount badge
      if (featured.discount) {
        const discountBadge = new Graphics();
        discountBadge.beginFill(ColorTheme.get('semantic.danger'));
        discountBadge.drawCircle(30, 30, 25);
        discountBadge.endFill();
        detailsContainer.addChild(discountBadge);

        const discountText = new Text(`-${featured.discount}%`, {
          ...TEXT_STYLES.bodyText,
          fontSize: 18,
          fontWeight: 700,
          fill: 0xffffff,
        });
        discountText.anchor.set(0.5);
        discountText.position.set(30, 32);
        detailsContainer.addChild(discountText);
      }

      // Plane name
      const planeName = new Text(featured.name, {
        ...TEXT_STYLES.h2,
        fill: ColorTheme.get('brand.primary'),
      });
      planeName.y = 10;
      detailsContainer.addChild(planeName);

      // Description
      const description = SmartText.wrapped(
        featured.description,
        540,
        undefined,
        TEXT_STYLES.bodyText,
        10
      );
      description.y = 80;
      detailsContainer.addChild(description);

      // Mini stats
      const statsContainer = this.createMiniStatsSection(featured.stats, 540);
      statsContainer.y = 160;
      detailsContainer.addChild(statsContainer);

      // Price section
      const priceContainer = new Container();
      priceContainer.y = 270;

      const specialOfferLabel = new Text('SPECIAL OFFER', {
        ...TEXT_STYLES.small,
        fill: ColorTheme.get('semantic.warning'),
        fontWeight: 700,
      });
      specialOfferLabel.y = 0;
      priceContainer.addChild(specialOfferLabel);

      // Original price (crossed out)
      const originalPrice = new Text(`$ ${Math.floor(featured.price * 1.2)}`, {
        ...TEXT_STYLES.h3,
        fill: ColorTheme.get('text.tertiary'),
      });
      originalPrice.y = 25;
      const strikethrough = new Graphics();
      strikethrough.lineStyle(2, ColorTheme.get('text.tertiary'), 0.7);
      strikethrough.moveTo(0, originalPrice.y + 12);
      strikethrough.lineTo(180, originalPrice.y + 12);
      strikethrough.endFill();
      priceContainer.addChild(strikethrough);
      priceContainer.addChild(originalPrice);

      // New price
      const newPrice = new Text(`$ ${featured.price}`, {
        ...TEXT_STYLES.h2,
        fill: ColorTheme.get('semantic.success'),
      });
      newPrice.y = 55;
      priceContainer.addChild(newPrice);

      // Buy button
      const buyButton = new UIButton({
        text: 'BUY NOW',
        width: 240,
        height: 50,
        variant: 'primary',
        onClick: () => this.purchasePlane(featured),
      });
      buyButton.y = 95;
      priceContainer.addChild(buyButton);

      detailsContainer.addChild(priceContainer);
      card.addChild(detailsContainer);
    }

    return card;
  }

  /**
   * Create mini stats section
   */
  private createMiniStatsSection(stats: PlaneStats, width: number): Container {
    const container = new Container();

    const statConfigs = [
      { label: 'PWR', value: stats.power, color: ColorTheme.get('stats.power') },
      { label: 'ATK', value: stats.attack, color: ColorTheme.get('stats.attack') },
      { label: 'DEF', value: stats.defense, color: ColorTheme.get('stats.defense') },
      { label: 'SPD', value: stats.speed, color: ColorTheme.get('stats.speed') },
    ];

    statConfigs.forEach((config, index) => {
      const label = new Text(config.label, {
        ...TEXT_STYLES.statLabel,
        fontSize: 12,
      });
      label.y = index * 30;
      container.addChild(label);

      const barBg = new Graphics();
      barBg.beginFill(0x000000, 0.3);
      barBg.drawRoundedRect(60, index * 30 + 2, 200, 14, 7);
      barBg.endFill();
      container.addChild(barBg);

      const barFill = new Graphics();
      const fillWidth = (config.value / 100) * 200;
      barFill.beginFill(config.color);
      barFill.drawRoundedRect(60, index * 30 + 2, fillWidth, 14, 7);
      barFill.endFill();
      container.addChild(barFill);
    });

    return container;
  }

  /**
   * Create catalog grid
   */
  private createCatalogGrid(): Container {
    const grid = new Container();

    // Filter planes
    const filteredPlanes = this.getFilteredPlanes();

    filteredPlanes.forEach((plane, index) => {
      const card = this.createCatalogCard(plane);
      const pos = LayoutHelper.getGridPosition(
        index,
        3,
        300,
        380,
        SPACING.gap.grid,
        0,
        0
      );
      card.position.set(pos.x, pos.y);
      grid.addChild(card);
    });

    this.catalogGridContainer = grid;
    return grid;
  }

  /**
   * Create individual catalog card
   */
  private createCatalogCard(plane: StorePlane): Container {
    const card = new Container();

    // Card background
    const bgPanel = new UIPanel({
      width: 300,
      height: 380,
      style: 'dark',
      showGlow: true,
    });
    card.addChild(bgPanel);

    // Type badge
    const typeBadge = this.createTypeBadge(plane.type);
    typeBadge.position.set(20, 20);
    card.addChild(typeBadge);

    // Plane icon
    try {
      const icon = Sprite.from(plane.icon);
      icon.scale.set(0.6);
      icon.anchor.set(0.5);
      icon.position.set(150, 140);
      card.addChild(icon);
    } catch {
      const placeholder = new Graphics();
      placeholder.beginFill(ColorTheme.get('brand.secondary'), 0.2);
      placeholder.drawRect(80, 80, 140, 120);
      placeholder.endFill();
      card.addChild(placeholder);
    }

    // Plane name
    const nameText = SmartText.truncated(
      plane.name,
      260,
      TEXT_STYLES.h4,
      '..'
    );
    nameText.position.set(20, 240);
    card.addChild(nameText);

    // Price
    const priceText = new Text(`$ ${plane.price}`, {
      ...TEXT_STYLES.h3,
      fontSize: 24,
      fill: ColorTheme.get('semantic.success'),
    });
    priceText.position.set(20, 280);
    card.addChild(priceText);

    // Description
    const descText = SmartText.truncated(
      plane.description,
      260,
      {
        ...TEXT_STYLES.small,
        fontSize: 11,
      },
      '...'
    );
    descText.position.set(20, 310);
    card.addChild(descText);

    // Buy button
    const buyButton = new UIButton({
      text: 'BUY',
      width: 260,
      height: 44,
      variant: 'primary',
      onClick: () => this.purchasePlane(plane),
    });
    buyButton.position.set(20, 330);
    card.addChild(buyButton);

    // Hover effect
    card.eventMode = 'static';
    card.cursor = 'pointer';
    card.on('pointerover', () => {
      bgPanel.alpha = 0.8;
    });
    card.on('pointerout', () => {
      bgPanel.alpha = 1;
    });

    return card;
  }

  /**
   * Create type badge
   */
  private createTypeBadge(type: PlaneType): Container {
    const badge = new Container();

    const color =
      type === 'FIGHTER'
        ? ColorTheme.get('brand.secondary')
        : type === 'BOMBER'
          ? ColorTheme.get('semantic.info')
          : ColorTheme.get('semantic.warning');

    const bg = new Graphics();
    bg.beginFill(color);
    bg.drawRoundedRect(0, 0, 120, 28, 14);
    bg.endFill();
    badge.addChild(bg);

    const text = new Text(type, {
      ...TEXT_STYLES.badge,
      fontSize: 12,
    });
    text.anchor.set(0.5);
    text.position.set(60, 14);
    badge.addChild(text);

    return badge;
  }

  /**
   * Get filtered planes
   */
  private getFilteredPlanes(): StorePlane[] {
    if (this.currentFilter === 'ALL') {
      return this.storeData.filter((p) => !p.featured);
    }

    const typeMap: Record<string, PlaneType> = {
      FIGHTERS: 'FIGHTER',
      BOMBERS: 'BOMBER',
      SPECIAL: 'SPECIAL',
    };

    return this.storeData.filter(
      (p) => !p.featured && p.type === typeMap[this.currentFilter]
    );
  }

  /**
   * Handle plane filtering
   */
  private filterPlanes(filter: string): void {
    this.currentFilter = filter;

    // Update filter buttons
    this.filtersBar.children.forEach((child) => {
      if (child instanceof UIButton) {
        // Would update button variants here
      }
    });

    // Re-render catalog
    this.catalogPanel.clearContent();
    const newGrid = this.createCatalogGrid();
    this.catalogPanel.addContent(newGrid);
  }

  /**
   * Handle plane purchase
   */
  private purchasePlane(plane: StorePlane): void {
    const dialog = new ConfirmDialog({
      title: 'PURCHASE PLANE',
      message: `Buy ${plane.name}?\n\nPrice: $ ${plane.price}\n\n${plane.description}`,
      icon: plane.icon,
      confirmText: 'YES, BUY',
      cancelText: 'CANCEL',
      variant: 'default',
      onConfirm: async () => {
        console.log('Purchase confirmed:', plane);
        await ConfirmDialog.success(
          'PURCHASE SUCCESSFUL',
          `${plane.name} has been added to your fleet!`,
          this as any,
          plane.icon
        );
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
    if (this.featuredPanel) this.featuredPanel.destroyPanel();
    if (this.catalogPanel) this.catalogPanel.destroyPanel();

    this.removeChildren();
    this.destroy({ children: true });
  }
}
