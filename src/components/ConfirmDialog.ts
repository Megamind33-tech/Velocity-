/**
 * ConfirmDialog Component
 * Game-quality modal dialog for confirmations, alerts, and notifications
 */

import {
  Container,
  Graphics,
  Text,
  Sprite,
  BlurFilter,
} from 'pixi.js';
import { UIPanel } from './UIPanel';
import { UIButton } from './UIButton';
import { ColorTheme } from '../utils/ColorTheme';
import { TEXT_STYLES } from '../config/typography';
import { SPACING } from '../config/spacing';
import { COLORS } from '../config/colors';

interface ConfirmDialogConfig {
  title: string;
  message: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
  showCancelButton?: boolean;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

export class ConfirmDialog extends Container {
  private overlay!: Graphics;
  private panel!: UIPanel;
  private config: ConfirmDialogConfig;
  private isAnimating: boolean = false;

  constructor(config: ConfirmDialogConfig) {
    super();
    this.config = {
      confirmText: 'CONFIRM',
      cancelText: 'CANCEL',
      width: 640,
      height: 480,
      showCancelButton: true,
      variant: 'default',
      ...config,
    };

    this.setupOverlay();
    this.setupPanel();
    this.setupContent();
    this.setupButtons();
  }

  /**
   * Setup fullscreen overlay
   */
  private setupOverlay(): void {
    // Get canvas size (assuming 1080x1920)
    const canvasWidth = 1080;
    const canvasHeight = 1920;

    this.overlay = new Graphics();

    // Semi-transparent dark overlay
    this.overlay.beginFill(0x000000, 0.7);
    this.overlay.drawRect(0, 0, canvasWidth, canvasHeight);
    this.overlay.endFill();

    // Make overlay interactive to prevent clicks through
    this.overlay.eventMode = 'static';
    this.overlay.on('pointerdown', (e) => e.stopPropagation());

    this.addChild(this.overlay);
  }

  /**
   * Setup dialog panel
   */
  private setupPanel(): void {
    this.panel = new UIPanel({
      width: this.config.width!,
      height: this.config.height!,
      hasHeader: true,
      headerText: this.config.title,
      style: this.config.variant === 'danger' ? 'dark' : 'primary',
      showGlow: true,
      glowIntensity: 0.4,
    });

    // Center dialog on screen
    this.panel.x = (1080 - this.config.width!) / 2;
    this.panel.y = (1920 - this.config.height!) / 2;

    this.addChild(this.panel);
  }

  /**
   * Setup dialog content (icon + message)
   */
  private setupContent(): void {
    const contentContainer = new Container();
    const contentArea = this.panel.getContentArea();

    // Icon (if provided)
    if (this.config.icon) {
      try {
        const icon = Sprite.from(this.config.icon);
        icon.scale.set(0.8);
        icon.anchor.set(0.5);
        icon.x = contentArea.width / 2;
        icon.y = 40;

        // Tint based on variant
        switch (this.config.variant) {
          case 'danger':
            icon.tint = ColorTheme.get('semantic.danger');
            break;
          case 'warning':
            icon.tint = ColorTheme.get('semantic.warning');
            break;
          case 'success':
            icon.tint = ColorTheme.get('semantic.success');
            break;
          default:
            icon.tint = ColorTheme.get('brand.primary');
        }

        contentContainer.addChild(icon);
      } catch (error) {
        console.warn(`Failed to load dialog icon: ${this.config.icon}`, error);
      }
    }

    // Message text
    const messageStyle = {
      ...TEXT_STYLES.dialogBody,
      wordWrapWidth: contentArea.width - 40,
      align: 'center' as const,
    };

    const messageText = new Text(this.config.message, messageStyle);
    messageText.anchor.set(0.5, 0);
    messageText.x = contentArea.width / 2;
    messageText.y = this.config.icon ? 120 : 40;

    // Apply variant color to message
    switch (this.config.variant) {
      case 'danger':
        messageText.style.fill = ColorTheme.get('semantic.danger');
        break;
      case 'warning':
        messageText.style.fill = ColorTheme.get('semantic.warning');
        break;
      case 'success':
        messageText.style.fill = ColorTheme.get('semantic.success');
        break;
      default:
        messageText.style.fill = ColorTheme.get('text.secondary');
    }

    contentContainer.addChild(messageText);

    this.panel.addContent(contentContainer);
  }

  /**
   * Setup dialog buttons
   */
  private setupButtons(): void {
    const buttonContainer = new Container();
    const contentArea = this.panel.getContentArea();

    const confirmButton = new UIButton({
      text: this.config.confirmText!,
      width: 200,
      variant: this.config.variant === 'danger' ? 'danger' : 'primary',
      onClick: () => this.confirm(),
    });

    if (this.config.showCancelButton) {
      // Two button layout
      const cancelButton = new UIButton({
        text: this.config.cancelText!,
        width: 200,
        variant: 'secondary',
        onClick: () => this.cancel(),
      });

      // Distribute buttons
      const gap = 20;
      const totalWidth = confirmButton.getDimensions().width + cancelButton.getDimensions().width + gap;

      confirmButton.x = (contentArea.width - totalWidth) / 2 + 20;
      confirmButton.y = contentArea.height - 80;

      cancelButton.x = confirmButton.x + confirmButton.getDimensions().width + gap;
      cancelButton.y = confirmButton.y;

      buttonContainer.addChild(confirmButton);
      buttonContainer.addChild(cancelButton);
    } else {
      // Single button (centered)
      confirmButton.x = (contentArea.width - confirmButton.getDimensions().width) / 2;
      confirmButton.y = contentArea.height - 80;

      buttonContainer.addChild(confirmButton);
    }

    this.panel.addContent(buttonContainer);
  }

  /**
   * Confirm action
   */
  private confirm(): void {
    this.config.onConfirm();
    this.close();
  }

  /**
   * Cancel action
   */
  private cancel(): void {
    this.config.onCancel?.();
    this.close();
  }

  /**
   * Close dialog with fade-out animation
   */
  async close(duration: number = 300): Promise<void> {
    if (this.isAnimating) return;

    this.isAnimating = true;

    await this.fadeOut(duration);

    this.destroy({ children: true });
    this.isAnimating = false;
  }

  /**
   * Fade in dialog
   */
  async fadeIn(duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      this.alpha = 0;
      const startTime = Date.now();

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
   * Fade out dialog
   */
  async fadeOut(duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();

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
   * Shake animation (for warnings/errors)
   */
  async shake(magnitude: number = 10, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startX = this.panel.x;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          // Random shake
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.sin(progress * Math.PI) * magnitude;

          this.panel.x = startX + Math.cos(angle) * distance;

          requestAnimationFrame(animate);
        } else {
          this.panel.x = startX;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Pulse animation
   */
  async pulse(intensity: number = 0.1, duration: number = 500): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const cycles = 2;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const cycleDuration = duration / cycles;
        const progress = (elapsed % cycleDuration) / cycleDuration;

        // Sine wave
        const pulse = Math.sin(progress * Math.PI);
        const scale = 1 + pulse * intensity;

        this.panel.scale.set(scale);

        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          this.panel.scale.set(1);
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Static method to create and show a confirmation dialog
   */
  static async show(config: ConfirmDialogConfig, parentContainer: Container): Promise<boolean> {
    return new Promise((resolve) => {
      const dialog = new ConfirmDialog({
        ...config,
        onConfirm: () => {
          config.onConfirm();
          resolve(true);
        },
        onCancel: () => {
          config.onCancel?.();
          resolve(false);
        },
      });

      parentContainer.addChild(dialog);
      dialog.fadeIn(300);
    });
  }

  /**
   * Static method for alert dialog
   */
  static async alert(
    title: string,
    message: string,
    parentContainer: Container,
    icon?: string
  ): Promise<void> {
    return new Promise((resolve) => {
      const dialog = new ConfirmDialog({
        title,
        message,
        icon,
        confirmText: 'OK',
        showCancelButton: false,
        onConfirm: () => resolve(),
        variant: 'default',
      });

      parentContainer.addChild(dialog);
      dialog.fadeIn(300);
    });
  }

  /**
   * Static method for warning dialog
   */
  static async warning(
    title: string,
    message: string,
    parentContainer: Container,
    icon?: string
  ): Promise<boolean> {
    return ConfirmDialog.show(
      {
        title,
        message,
        icon,
        confirmText: 'PROCEED',
        cancelText: 'CANCEL',
        variant: 'warning',
        onConfirm: () => {},
      },
      parentContainer
    );
  }

  /**
   * Static method for danger/error dialog
   */
  static async danger(
    title: string,
    message: string,
    parentContainer: Container,
    icon?: string
  ): Promise<boolean> {
    return ConfirmDialog.show(
      {
        title,
        message,
        icon,
        confirmText: 'CONFIRM',
        cancelText: 'CANCEL',
        variant: 'danger',
        onConfirm: () => {},
      },
      parentContainer
    );
  }

  /**
   * Static method for success dialog
   */
  static async success(
    title: string,
    message: string,
    parentContainer: Container,
    icon?: string
  ): Promise<void> {
    return new Promise((resolve) => {
      const dialog = new ConfirmDialog({
        title,
        message,
        icon,
        confirmText: 'AWESOME',
        showCancelButton: false,
        variant: 'success',
        onConfirm: () => resolve(),
      });

      parentContainer.addChild(dialog);
      dialog.fadeIn(300);
    });
  }
}
