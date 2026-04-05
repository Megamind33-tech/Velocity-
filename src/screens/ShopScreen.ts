/**
 * ShopScreen
 * Unified shop with tabs for Tokens, Power Ups, Fuel, and Planes
 * Two-panel design: products grid (left) + details (right)
 */

import { Container, Graphics, Text } from 'pixi.js';
import { UIButton } from '../components/UIButton';
import { StatsBar } from '../components/StatsBar';
import { ColorTheme } from '../utils/ColorTheme';
import { navigationEvents } from './NavigationEvents';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  category: 'tokens' | 'powerups' | 'fuel' | 'planes';
  icon: string;
  description: string;
  bonus?: string;
}

interface PlaneItem extends ShopItem {
  stats: {
    power: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

type TabType = 'tokens' | 'powerups' | 'fuel' | 'planes';

export class ShopScreen extends Container {
  private currentTab: TabType = 'tokens';
  private selectedItemId: string | null = null;
  private items: ShopItem[] = [];
  private tabButtons: Container;
  private itemsGrid: Container;
  private detailsPanel: Container;
  private navigation: Container;

  constructor() {
    super();
    this.loadShopData();
    this.setupBackground();
    this.setupLayout();
  }

  /**
   * Load shop data
   */
  private loadShopData(): void {
    this.items = [
      // TOKENS
      {
        id: 'tokens-100',
        name: '100 TOKENS',
        price: 2.99,
        category: 'tokens',
        icon: 'token.png',
        description: 'Get 100 tokens to unlock premium content',
        bonus: '+10 bonus tokens',
      },
      {
        id: 'tokens-500',
        name: '500 TOKENS',
        price: 9.99,
        category: 'tokens',
        icon: 'token.png',
        description: 'Great value pack with bonus tokens',
        bonus: '+100 bonus tokens',
      },
      {
        id: 'tokens-1000',
        name: '1000 TOKENS',
        price: 16.99,
        category: 'tokens',
        icon: 'token.png',
        description: 'Best value premium token bundle',
        bonus: '+300 bonus tokens',
      },
      // POWER UPS
      {
        id: 'shield-5',
        name: 'SHIELD x5',
        price: 4.99,
        category: 'powerups',
        icon: 'shield.png',
        description: 'Protect your plane from damage',
      },
      {
        id: 'boost-10',
        name: 'SPEED BOOST x10',
        price: 6.99,
        category: 'powerups',
        icon: 'boost.png',
        description: 'Temporary speed enhancement',
      },
      {
        id: 'invincible-3',
        name: 'INVINCIBLE x3',
        price: 9.99,
        category: 'powerups',
        icon: 'star.png',
        description: 'Complete invulnerability for 10 seconds',
      },
      // FUEL
      {
        id: 'fuel-50',
        name: 'FUEL 50 LITERS',
        price: 1.99,
        category: 'fuel',
        icon: 'fuel.png',
        description: 'Keep your plane flying longer',
      },
      {
        id: 'fuel-200',
        name: 'FUEL 200 LITERS',
        price: 5.99,
        category: 'fuel',
        icon: 'fuel.png',
        description: 'Extended range missions',
      },
      {
        id: 'fuel-unlimited',
        name: 'UNLIMITED FUEL',
        price: 19.99,
        category: 'fuel',
        icon: 'fuel.png',
        description: 'Never run out of fuel',
      },
      // PLANES
      {
        id: 'raptor',
        name: 'F-22 RAPTOR',
        price: 24.99,
        category: 'planes',
        icon: 'plane_raptor.png',
        description: 'Cutting-edge fighter jet',
        bonus: 'Advanced maneuverability',
      },
      {
        id: 'spirit',
        name: 'B-2 SPIRIT',
        price: 34.99,
        category: 'planes',
        icon: 'plane_spirit.png',
        description: 'Legendary stealth bomber',
        bonus: 'Heavy payload capacity',
      },
      {
        id: 'aurora',
        name: 'AURORA',
        price: 49.99,
        category: 'planes',
        icon: 'plane_aurora.png',
        description: 'Experimental hypersonic',
        bonus: 'Max speed capability',
      },
    ];

    if (this.items.length > 0) {
      this.selectedItemId = this.items[0].id;
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
   * Setup layout
   */
  private setupLayout(): void {
    // Title
    const title = new Text('SHOP', {
      fontSize: 28,
      fontWeight: 'bold',
      fontFamily: 'Orbitron, Arial',
      fill: ColorTheme.get('brand.primary'),
    });
    title.position.set(16, 12);
    this.addChild(title);

    // TAB BUTTONS at top
    this.tabButtons = this.createTabButtons();
    this.tabButtons.position.set(16, 44);
    this.addChild(this.tabButtons);

    const padding = 12;
    const panelWidth = 188;
    const leftX = padding;
    const rightX = padding + panelWidth + 8;

    // LEFT PANEL - Items Grid
    this.itemsGrid = new Container();
    this.itemsGrid.position.set(leftX, 95);
    this.addChild(this.itemsGrid);

    const leftBg = new Graphics();
    leftBg.lineStyle(2, ColorTheme.get('brand.primary'), 0.6);
    leftBg.drawRoundedRect(0, 0, panelWidth, 600, 6);
    leftBg.endFill();
    this.itemsGrid.addChildAt(leftBg, 0);

    this.updateItemsGrid();

    // RIGHT PANEL - Details
    this.detailsPanel = new Container();
    this.detailsPanel.position.set(rightX, 95);
    this.addChild(this.detailsPanel);

    this.updateDetailsPanel();

    // Navigation bar
    this.navigation = this.createNavigation();
    this.navigation.position.set(padding, 750);
    this.addChild(this.navigation);
  }

  /**
   * Create tab buttons
   */
  private createTabButtons(): Container {
    const tabs = new Container();

    const tabList: { label: string; id: TabType }[] = [
      { label: 'TOKENS', id: 'tokens' },
      { label: 'POWER UPS', id: 'powerups' },
      { label: 'FUEL', id: 'fuel' },
      { label: 'PLANES', id: 'planes' },
    ];

    let xPos = 0;
    tabList.forEach((tab) => {
      const button = new UIButton({
        text: tab.label,
        width: 92,
        height: 32,
        variant: this.currentTab === tab.id ? 'primary' : 'secondary',
        onClick: () => {
          this.currentTab = tab.id;
          this.setupLayout();
        },
      });

      button.position.set(xPos, 0);
      tabs.addChild(button);
      xPos += 96;
    });

    return tabs;
  }

  /**
   * Update items grid
   */
  private updateItemsGrid(): void {
    // Remove existing items (keep background)
    while (this.itemsGrid.children.length > 1) {
      this.itemsGrid.removeChildAt(1);
    }

    const filtered = this.items.filter((item) => item.category === this.currentTab);

    let yPos = 8;
    filtered.forEach((item) => {
      const itemCard = this.createItemCard(item);
      itemCard.position.set(6, yPos);
      this.itemsGrid.addChild(itemCard);
      yPos += 130;
    });
  }

  /**
   * Create item card for grid
   */
  private createItemCard(item: ShopItem): Container {
    const card = new Container();

    // Card background
    const bg = new Graphics();
    const isSelected = this.selectedItemId === item.id;
    bg.beginFill(
      isSelected ? ColorTheme.get('brand.primary') : ColorTheme.get('background.secondary'),
      isSelected ? 0.4 : 0.3
    );
    bg.drawRoundedRect(0, 0, 176, 120, 4);
    bg.endFill();
    card.addChild(bg);

    // Item icon placeholder
    const iconBg = new Graphics();
    iconBg.beginFill(ColorTheme.get('brand.secondary'), 0.5);
    iconBg.drawRoundedRect(0, 0, 60, 60, 4);
    iconBg.endFill();
    iconBg.position.set(58, 8);
    card.addChild(iconBg);

    // Item name
    const nameText = new Text(item.name, {
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'Exo 2, Arial',
      fill: ColorTheme.get('text.primary'),
      wordWrap: true,
      wordWrapWidth: 160,
    });
    nameText.position.set(8, 72);
    card.addChild(nameText);

    // Price - highlighted
    const priceBg = new Graphics();
    priceBg.beginFill(ColorTheme.get('brand.success'), 0.7);
    priceBg.drawRoundedRect(0, 0, 160, 20, 2);
    priceBg.endFill();
    priceBg.position.set(8, 96);
    card.addChild(priceBg);

    const priceText = new Text(`$${item.price}`, {
      fontSize: 12,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: 0xffffff,
    });
    priceText.position.set(12, 98);
    card.addChild(priceText);

    // Clickable
    card.eventMode = 'static';
    card.cursor = 'pointer';
    card.on('pointerdown', () => {
      this.selectedItemId = item.id;
      this.setupLayout();
    });

    return card;
  }

  /**
   * Update details panel
   */
  private updateDetailsPanel(): void {
    this.detailsPanel.removeChildren();

    const selected = this.items.find((i) => i.id === this.selectedItemId);
    if (!selected) return;

    const panelWidth = 180;

    // Panel background
    const bg = new Graphics();
    bg.lineStyle(2, ColorTheme.get('brand.primary'), 0.6);
    bg.drawRoundedRect(0, 0, panelWidth, 600, 6);
    bg.endFill();
    this.detailsPanel.addChild(bg);

    let yPos = 12;

    // Item name - big
    const nameText = new Text(selected.name, {
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'Exo 2, Arial',
      fill: ColorTheme.get('brand.primary'),
      wordWrap: true,
      wordWrapWidth: 160,
    });
    nameText.position.set(12, yPos);
    this.detailsPanel.addChild(nameText);
    yPos += 40;

    // Description
    const descText = new Text(selected.description, {
      fontSize: 10,
      fontFamily: 'Arial',
      fill: ColorTheme.get('text.secondary'),
      wordWrap: true,
      wordWrapWidth: 160,
    });
    descText.position.set(12, yPos);
    this.detailsPanel.addChild(descText);
    yPos += 50;

    // Bonus if exists
    if (selected.bonus) {
      const bonusBg = new Graphics();
      bonusBg.beginFill(ColorTheme.get('semantic.success'), 0.3);
      bonusBg.drawRoundedRect(0, 0, 156, 28, 3);
      bonusBg.endFill();
      bonusBg.position.set(12, yPos);
      this.detailsPanel.addChild(bonusBg);

      const bonusText = new Text(`✨ ${selected.bonus}`, {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Oxanium, Arial',
        fill: ColorTheme.get('semantic.success'),
      });
      bonusText.position.set(14, yPos + 6);
      this.detailsPanel.addChild(bonusText);

      yPos += 40;
    }

    // For planes: show stats
    if (selected.category === 'planes') {
      const plane = selected as any as PlaneItem;
      if (plane.stats) {
        yPos += 8;

        const stats = [
          { label: 'POWER', value: plane.stats.power },
          { label: 'ATTACK', value: plane.stats.attack },
          { label: 'DEFENSE', value: plane.stats.defense },
          { label: 'SPEED', value: plane.stats.speed },
        ];

        stats.forEach((stat) => {
          const label = new Text(stat.label, {
            fontSize: 9,
            fontWeight: 'bold',
            fontFamily: 'Oxanium, Arial',
            fill: ColorTheme.get('text.tertiary'),
          });
          label.position.set(12, yPos);
          this.detailsPanel.addChild(label);

          const bar = new StatsBar({
            width: 156,
            height: 8,
            showValue: false,
            showLabel: false,
            showPercentage: false,
          });
          bar.position.set(12, yPos + 12);
          bar.setValue(stat.value, 100);
          this.detailsPanel.addChild(bar);

          yPos += 28;
        });
      }
    }

    // BUY button
    yPos += 20;
    const buyButton = new UIButton({
      text: 'BUY NOW',
      width: 156,
      height: 36,
      variant: 'success',
      onClick: () => {
        console.log('Purchasing:', selected.name);
      },
    });
    buyButton.position.set(12, yPos);
    this.detailsPanel.addChild(buyButton);
  }

  /**
   * Create navigation bar
   */
  private createNavigation(): Container {
    const nav = new Container();

    const navButtons = [
      { label: 'HANGAR', variant: 'primary' as const, action: 'hangar' },
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
