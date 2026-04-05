/**
 * ShopScreen
 * Unified shop with tabs for Tokens, Power Ups, Fuel, and Planes
 * Two-panel design: products grid (left) + details (right)
 */

import { Container, Graphics, Rectangle, Sprite, Text, TextStyle } from 'pixi.js';
import { navigationEvents } from './NavigationEvents';
import { getPlayerPlaneTexture } from '../game/playerPlanes';
import {
  getMainMenuProgress,
  getShopTokens,
  getUnlockedPlaneIds,
  spendShopTokens,
  unlockHangarPlane,
} from '../data/localProgress';
import { GAME_COLORS } from '../ui/game/GameUITheme';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  category: 'tokens' | 'powerups' | 'fuel' | 'planes';
  icon: string;
  description: string;
  bonus?: string;
  planeAssetId?: string;
  stats?: {
    power: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

interface PlaneItem extends ShopItem {
  stats?: {
    power: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

type TabType = 'tokens' | 'powerups' | 'fuel' | 'planes';

const C = {
  bgBase: GAME_COLORS.bg_base,
  bgSurface: GAME_COLORS.bg_surface,
  bgElevated: GAME_COLORS.bg_elevated,
  cyan: GAME_COLORS.accent_cyan,
  gold: GAME_COLORS.accent_gold,
  green: GAME_COLORS.success,
  danger: GAME_COLORS.danger,
  textPrimary: GAME_COLORS.text_primary,
  textSec: GAME_COLORS.text_secondary,
  textMuted: GAME_COLORS.text_muted,
};

export class ShopScreen extends Container {
  private currentTab: TabType = 'tokens';
  private selectedItemId: string | null = null;
  private items: ShopItem[] = [];
  private tabButtons!: Container;
  private itemsGrid!: Container;
  private itemsScrollContent!: Container;
  private detailsPanel!: Container;
  private navigation!: Container;
  private itemsScrollY = 0;
  private itemsMaxScroll = 0;

  constructor() {
    super();
    this.loadShopData();
    this.setupLayout();
  }

  /** Dock “Plane store” — open unified shop on PLANES tab. */
  openToPlanesTab(): void {
    this.currentTab = 'planes';
    const firstPlane = this.items.find((i) => i.category === 'planes');
    this.selectedItemId = firstPlane?.id ?? this.selectedItemId;
    this.setupLayout();
  }

  private isPlaneOwned(planeAssetId: string | undefined): boolean {
    if (!planeAssetId) return false;
    const prog = getMainMenuProgress();
    return getUnlockedPlaneIds(prog.maxUnlocked).includes(planeAssetId);
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
      // PLANES — OGA-derived craft (token unlock → hangar + runs)
      {
        id: 'plane-cadet',
        name: 'CADET MK-I',
        price: 0,
        category: 'planes',
        icon: 'plane_cadet.png',
        planeAssetId: 'cadet',
        description: 'Starter craft — WW2 fighter crop (OGA)',
        bonus: 'Always available',
        stats: { power: 70, attack: 65, defense: 72, speed: 68 },
      },
      {
        id: 'plane-cartoon',
        name: 'STUNT FOX',
        price: 450,
        category: 'planes',
        icon: 'plane_cartoon.png',
        planeAssetId: 'cartoon',
        description: 'Low-poly cartoon plane (OGA CC0)',
        bonus: 'Playful silhouette',
        stats: { power: 62, attack: 55, defense: 58, speed: 88 },
      },
      {
        id: 'plane-scout',
        name: 'SCOUT RAPTOR',
        price: 650,
        category: 'planes',
        icon: 'plane_scout.png',
        planeAssetId: 'scout',
        description: 'WW2 fighter crop — second livery',
        bonus: 'Balanced sortie craft',
        stats: { power: 78, attack: 82, defense: 70, speed: 80 },
      },
      {
        id: 'plane-liner',
        name: 'SKY LINER',
        price: 900,
        category: 'planes',
        icon: 'plane_liner.png',
        planeAssetId: 'liner',
        description: 'Jet liner texture crop (OGA CC0)',
        bonus: 'Heavy presence',
        stats: { power: 72, attack: 60, defense: 88, speed: 62 },
      },
      {
        id: 'plane-interceptor',
        name: 'INTERCEPTOR',
        price: 1200,
        category: 'planes',
        icon: 'plane_interceptor_jet.png',
        planeAssetId: 'interceptor',
        description: 'Private jet texture crop (OGA CC0)',
        bonus: 'Premium profile',
        stats: { power: 88, attack: 85, defense: 78, speed: 92 },
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
    bg.beginFill(C.bgBase);
    bg.drawRect(0, 0, 400, 900);
    bg.endFill();
    this.addChildAt(bg, 0);

    const grid = new Graphics();
    for (let x = -900; x < 1200; x += 44) {
      grid.moveTo(x, 0);
      grid.lineTo(x + 900, 900);
    }
    grid.stroke({ color: C.cyan, width: 0.6, alpha: 0.05 });
    this.addChild(grid);
  }

  /**
   * Setup layout
   */
  private setupLayout(): void {
    this.removeChildren();
    this.setupBackground();

    // Title
    const title = new Text('SHOP', {
      fontSize: 28,
      fontWeight: 'bold',
      fontFamily: 'Orbitron, Arial',
      fill: C.cyan,
      dropShadow: { color: C.cyan, alpha: 0.7, blur: 10, distance: 0 },
    });
    title.position.set(16, 12);
    this.addChild(title);

    // TAB BUTTONS at top
    this.tabButtons = this.createTabButtons();
    this.tabButtons.position.set(16, 44);
    this.addChild(this.tabButtons);

    const padding = 12;
    const panelWidth = 188;
    const listViewportHeight = 600;
    const leftX = padding;
    const rightX = padding + panelWidth + 8;

    // LEFT PANEL - Items Grid
    this.itemsGrid = new Container();
    this.itemsGrid.position.set(leftX, 95);
    this.addChild(this.itemsGrid);

    const leftBg = new Graphics();
    leftBg.beginFill(C.bgSurface, 0.85);
    leftBg.drawRoundedRect(0, 0, panelWidth, 600, 6);
    leftBg.endFill();
    leftBg.lineStyle(2, C.cyan, 0.6);
    leftBg.drawRoundedRect(0, 0, panelWidth, 600, 6);
    leftBg.endFill();
    this.itemsGrid.addChildAt(leftBg, 0);

    this.itemsScrollContent = new Container();
    this.itemsScrollContent.position.set(0, 0);
    this.itemsGrid.addChild(this.itemsScrollContent);

    const listMask = new Graphics();
    listMask.drawRoundedRect(2, 2, panelWidth - 4, listViewportHeight - 4, 6);
    listMask.fill({ color: 0xffffff, alpha: 1 });
    this.itemsGrid.addChild(listMask);
    this.itemsScrollContent.mask = listMask;

    this.bindListScroll(panelWidth, listViewportHeight);

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
      const isActive = this.currentTab === tab.id;
      const button = this.createHangerStyleButton(
        tab.label,
        92,
        32,
        isActive ? C.cyan : C.bgElevated,
        () => {
          this.currentTab = tab.id;
          this.setupLayout();
        },
        isActive,
      );

      button.position.set(xPos, 0);
      tabs.addChild(button);
      xPos += 96;
    });

    return tabs;
  }

  private createHangerStyleButton(
    label: string,
    width: number,
    height: number,
    accent: number,
    onClick: () => void,
    active = false,
  ): Container {
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8);
    bg.fill({ color: active ? C.bgElevated : C.bgSurface, alpha: active ? 1 : 0.92 });
    bg.roundRect(0, 0, width, height, 8);
    bg.stroke({ color: accent, width: active ? 2 : 1.5, alpha: 0.9 });
    bg.roundRect(3, 3, width - 6, Math.max(8, Math.floor(height * 0.34)), 5);
    bg.fill({ color: 0xffffff, alpha: active ? 0.13 : 0.06 });
    root.addChild(bg);

    const text = new Text({
      text: label,
      style: new TextStyle({
        fontSize: 12,
        fontFamily: 'Orbitron, monospace',
        fontWeight: 'bold',
        fill: active ? accent : C.textPrimary,
      }),
    });
    text.anchor.set(0.5);
    text.position.set(width / 2, height / 2);
    root.addChild(text);

    root.eventMode = 'static';
    root.cursor = 'pointer';
    root.on('pointerdown', () => root.scale.set(0.97));
    root.on('pointerup', () => {
      root.scale.set(1);
      onClick();
    });
    root.on('pointerupoutside', () => root.scale.set(1));
    root.on('pointercancel', () => root.scale.set(1));

    return root;
  }

  /**
   * Update items grid
   */
  private updateItemsGrid(): void {
    this.itemsScrollContent.removeChildren();

    const filtered = this.items.filter((item) => item.category === this.currentTab);

    let yPos = 8;
    const cardStep = 104;
    filtered.forEach((item) => {
      const itemCard = this.createItemCard(item);
      itemCard.position.set(6, yPos);
      this.itemsScrollContent.addChild(itemCard);
      yPos += cardStep;
    });

    const contentHeight = yPos + 4;
    const viewportHeight = 600;
    this.itemsMaxScroll = Math.max(0, contentHeight - viewportHeight);
    this.itemsScrollY = Math.max(0, Math.min(this.itemsScrollY, this.itemsMaxScroll));
    this.itemsScrollContent.y = -this.itemsScrollY;
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
      isSelected ? C.bgElevated : C.bgSurface,
      isSelected ? 1 : 0.74
    );
    bg.drawRoundedRect(0, 0, 176, 94, 4);
    bg.endFill();
    bg.lineStyle(1.5, isSelected ? C.cyan : C.textMuted, isSelected ? 0.9 : 0.45);
    bg.drawRoundedRect(0, 0, 176, 94, 4);
    bg.endFill();
    bg.lineStyle(1.5, isSelected ? C.cyan : C.textMuted, isSelected ? 0.9 : 0.45);
    bg.drawRoundedRect(0, 0, 176, 120, 4);
    bg.endFill();
    card.addChild(bg);

    const iconBg = new Graphics();
    iconBg.beginFill(C.bgElevated, 1);
    iconBg.drawRoundedRect(0, 0, 52, 52, 4);
    iconBg.endFill();
    iconBg.lineStyle(1.2, C.cyan, 0.55);
    iconBg.drawRoundedRect(0, 0, 52, 52, 4);
    iconBg.endFill();
    iconBg.position.set(62, 6);
    card.addChild(iconBg);

    if (item.planeAssetId) {
      try {
        const spr = new Sprite(getPlayerPlaneTexture(item.planeAssetId));
        spr.anchor.set(0.5);
        const box = 46;
        const sc = box / Math.max(spr.texture.height, 1);
        spr.scale.set(sc);
        spr.position.set(62 + 26, 6 + 26);
        card.addChild(spr);
      } catch {
        /* texture fallback */
      }
    }

    // Item name
    const nameText = new Text(item.name, {
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'Exo 2, Arial',
      fill: isSelected ? C.cyan : C.textPrimary,
      wordWrap: true,
      wordWrapWidth: 160,
    });
    nameText.position.set(8, 60);
    card.addChild(nameText);

    // Price - highlighted
    const priceBg = new Graphics();
    const priceTone = item.category === 'planes' ? C.gold : C.green;
    priceBg.beginFill(C.bgElevated, 0.95);
    priceBg.drawRoundedRect(0, 0, 160, 20, 2);
    priceBg.endFill();
    priceBg.lineStyle(1.2, priceTone, 0.85);
    priceBg.drawRoundedRect(0, 0, 160, 20, 2);
    priceBg.endFill();
    priceBg.position.set(8, 72);
    card.addChild(priceBg);

    const priceLabel =
      item.category === 'planes'
        ? item.price <= 0
          ? 'FREE'
          : `${Math.floor(item.price)} TOKENS`
        : `$${item.price}`;
    const priceText = new Text(priceLabel, {
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: priceTone,
    });
    priceText.position.set(12, 74);
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

  private bindListScroll(panelWidth: number, viewportHeight: number): void {
    this.itemsGrid.eventMode = 'static';
    this.itemsGrid.hitArea = new Rectangle(0, 0, panelWidth, viewportHeight);
    this.itemsGrid.removeAllListeners('wheel');
    this.itemsGrid.on('wheel', (event) => {
      const delta = (event as WheelEvent).deltaY || 0;
      this.scrollListBy(delta * 0.6);
    });

    let dragging = false;
    let dragStartY = 0;
    let scrollStart = 0;
    this.itemsGrid.removeAllListeners('pointerdown');
    this.itemsGrid.removeAllListeners('pointermove');
    this.itemsGrid.removeAllListeners('pointerup');
    this.itemsGrid.removeAllListeners('pointerupoutside');
    this.itemsGrid.removeAllListeners('pointercancel');
    this.itemsGrid.on('pointerdown', (e) => {
      dragging = true;
      dragStartY = e.global.y;
      scrollStart = this.itemsScrollY;
      this.itemsGrid.cursor = 'grabbing';
    });
    this.itemsGrid.on('pointermove', (e) => {
      if (!dragging) return;
      const dy = e.global.y - dragStartY;
      this.scrollListTo(scrollStart - dy);
    });
    const finish = () => {
      dragging = false;
      this.itemsGrid.cursor = this.itemsMaxScroll > 0 ? 'grab' : 'default';
    };
    this.itemsGrid.on('pointerup', finish);
    this.itemsGrid.on('pointerupoutside', finish);
    this.itemsGrid.on('pointercancel', finish);
    this.itemsGrid.cursor = this.itemsMaxScroll > 0 ? 'grab' : 'default';
  }

  private scrollListBy(delta: number): void {
    this.scrollListTo(this.itemsScrollY + delta);
  }

  private scrollListTo(value: number): void {
    this.itemsScrollY = Math.max(0, Math.min(value, this.itemsMaxScroll));
    if (this.itemsScrollContent) {
      this.itemsScrollContent.y = -this.itemsScrollY;
    }
    if (this.itemsGrid) {
      this.itemsGrid.cursor = this.itemsMaxScroll > 0 ? 'grab' : 'default';
    }
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
    bg.beginFill(C.bgSurface, 0.9);
    bg.drawRoundedRect(0, 0, panelWidth, 600, 6);
    bg.endFill();
    bg.lineStyle(2, C.cyan, 0.7);
    bg.drawRoundedRect(0, 0, panelWidth, 600, 6);
    bg.endFill();
    this.detailsPanel.addChild(bg);

    let yPos = 12;

    // Item name - big
    const nameText = new Text(selected.name, {
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'Exo 2, Arial',
      fill: C.cyan,
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
      fill: C.textSec,
      wordWrap: true,
      wordWrapWidth: 160,
    });
    descText.position.set(12, yPos);
    this.detailsPanel.addChild(descText);
    yPos += 50;

    // Bonus if exists
    if (selected.bonus) {
      const bonusBg = new Graphics();
      bonusBg.beginFill(C.bgElevated, 0.86);
      bonusBg.drawRoundedRect(0, 0, 156, 28, 3);
      bonusBg.endFill();
      bonusBg.lineStyle(1, C.green, 0.75);
      bonusBg.drawRoundedRect(0, 0, 156, 28, 3);
      bonusBg.endFill();
      bonusBg.position.set(12, yPos);
      this.detailsPanel.addChild(bonusBg);

      const bonusText = new Text(`✨ ${selected.bonus}`, {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Oxanium, Arial',
        fill: C.green,
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
            fill: C.textSec,
          });
          label.position.set(12, yPos);
          this.detailsPanel.addChild(label);

          const track = new Graphics();
          track.roundRect(12, yPos + 12, 156, 8, 4);
          track.fill({ color: C.bgBase, alpha: 0.9 });
          this.detailsPanel.addChild(track);

          const fill = new Graphics();
          fill.roundRect(12, yPos + 12, 156 * (stat.value / 100), 8, 4);
          fill.fill({ color: C.cyan });
          this.detailsPanel.addChild(fill);

          yPos += 28;
        });
      }
    }

    const bal = getShopTokens();
    const balLine = new Text(`Your tokens: ${bal}`, {
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'Oxanium, Arial',
      fill: C.gold,
    });
    balLine.position.set(12, yPos);
    this.detailsPanel.addChild(balLine);
    yPos += 22;

    yPos += 8;
    const planeId = selected.planeAssetId;
    const owned = planeId ? this.isPlaneOwned(planeId) : false;
    const tokenCost = selected.category === 'planes' ? Math.floor(selected.price) : 0;
    const canBuyPlane =
      selected.category === 'planes' &&
      planeId &&
      !owned &&
      tokenCost > 0 &&
      bal >= tokenCost;

    let buyLabel = 'BUY NOW';
    let buyVariant: 'success' | 'secondary' | 'danger' = 'success';
    if (selected.category === 'planes' && planeId) {
      if (owned || tokenCost <= 0) {
        buyLabel = 'OWNED';
        buyVariant = 'secondary';
      } else if (!canBuyPlane) {
        buyLabel = 'NOT ENOUGH TOKENS';
        buyVariant = 'danger';
      } else {
        buyLabel = `UNLOCK — ${tokenCost} TOKENS`;
      }
    }

    const buyAccent = buyVariant === 'danger' ? C.danger : buyVariant === 'secondary' ? C.textMuted : C.gold;
    const buyButton = this.createHangerStyleButton(buyLabel, 168, 36, buyAccent, () => {
      if (selected.category !== 'planes' || !planeId) {
        console.log('Purchasing:', selected.name);
        return;
      }
      if (owned || tokenCost <= 0) return;
      if (spendShopTokens(tokenCost)) {
        unlockHangarPlane(planeId);
        this.setupLayout();
      }
    }, buyVariant === 'success');
    buyButton.position.set(12, yPos);
    this.detailsPanel.addChild(buyButton);
  }

  /**
   * Create navigation bar
   */
  private createNavigation(): Container {
    const nav = new Container();

    const navButtons = [
      { label: 'HANGAR', accent: C.cyan, action: 'hangar' },
      { label: 'PLAY', accent: C.green, action: 'play' },
      { label: 'EXIT', accent: C.danger, action: 'exit' },
    ];

    navButtons.forEach((btnConfig, index) => {
      const button = this.createHangerStyleButton(btnConfig.label, 120, 40, btnConfig.accent, () =>
        this.handleNavigation(btnConfig.action),
      );

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
