/**
 * ResponsiveUIManager: Mathematical screen-aware UI positioning and sizing
 *
 * Real Device Dimensions (actual playable area):
 * - iPhone SE (1st gen): 320×568 (oldest)
 * - iPhone SE 2024: 393×852
 * - iPhone 14: 393×852
 * - iPhone 14 Pro: 393×852
 * - iPhone 12 Pro Max: 428×926
 * - Galaxy S21: 360×800
 * - Galaxy S24: 360×800
 * - iPad (10.2"): 810×1080
 * - iPad Pro (11"): 834×1194
 *
 * Breakpoints:
 * - Small Mobile: width < 360px (edge case)
 * - Mobile Portrait: 360 ≤ width < 768px (all phones)
 * - Mobile Landscape: height < 500px (phone rotated)
 * - Tablet: 768 ≤ width < 1024px
 * - Desktop: width ≥ 1024px
 */
export class ResponsiveUIManager {
    private static instance: ResponsiveUIManager;

    private screenWidth: number = 0;
    private screenHeight: number = 0;
    private devicePixelRatio: number = 1;
    private orientation: 'portrait' | 'landscape' = 'portrait';
    private scaleFactor: number = 1;
    private breakpoint: 'small' | 'mobile-portrait' | 'mobile-landscape' | 'tablet' | 'desktop' = 'desktop';

    // Reference dimensions for calculations (1080p mobile)
    private readonly REFERENCE_WIDTH = 1080;
    private readonly REFERENCE_HEIGHT = 1920;

    private constructor() {
        this.updateScreenDimensions();
        window.addEventListener('resize', () => this.updateScreenDimensions());
        window.addEventListener('orientationchange', () => this.updateScreenDimensions());
    }

    public static getInstance(): ResponsiveUIManager {
        if (!ResponsiveUIManager.instance) {
            ResponsiveUIManager.instance = new ResponsiveUIManager();
        }
        return ResponsiveUIManager.instance;
    }

    /**
     * Update screen dimensions and recalculate responsive values
     */
    private updateScreenDimensions(): void {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.calculateOrientation();
        this.calculateBreakpoint();
        this.calculateScaleFactor();
    }

    /**
     * Determine device orientation
     */
    private calculateOrientation(): void {
        this.orientation = this.screenWidth > this.screenHeight ? 'landscape' : 'portrait';
    }

    /**
     * Determine which breakpoint we're in
     */
    private calculateBreakpoint(): void {
        if (this.screenWidth < 360) {
            this.breakpoint = 'small';
        } else if (this.screenHeight < 500) {
            this.breakpoint = 'mobile-landscape';
        } else if (this.screenWidth < 768) {
            this.breakpoint = 'mobile-portrait';
        } else if (this.screenWidth < 1024) {
            this.breakpoint = 'tablet';
        } else {
            this.breakpoint = 'desktop';
        }
    }

    /**
     * Calculate scale factor relative to reference dimensions
     * Formula: scaleFactor = (currentWidth / referenceWidth) * 0.5 + 0.5
     * This provides smooth scaling between 0.5x (small devices) and 1x (desktop)
     */
    private calculateScaleFactor(): void {
        const widthRatio = this.screenWidth / this.REFERENCE_WIDTH;
        // Clamp between 0.5 (small phones) and 1.0 (desktop)
        this.scaleFactor = Math.max(0.5, Math.min(1.0, widthRatio));
    }

    // ============================================================================
    // PUBLIC GETTERS
    // ============================================================================

    public getScreenWidth(): number {
        return this.screenWidth;
    }

    public getScreenHeight(): number {
        return this.screenHeight;
    }

    public getOrientation(): 'portrait' | 'landscape' {
        return this.orientation;
    }

    public getBreakpoint(): string {
        return this.breakpoint;
    }

    public getScaleFactor(): number {
        return this.scaleFactor;
    }

    public isPortrait(): boolean {
        return this.orientation === 'portrait';
    }

    public isLandscape(): boolean {
        return this.orientation === 'landscape';
    }

    public isMobilePortrait(): boolean {
        return this.breakpoint === 'mobile-portrait';
    }

    public isMobileLandscape(): boolean {
        return this.breakpoint === 'mobile-landscape';
    }

    public isSmallScreen(): boolean {
        return this.breakpoint === 'small';
    }

    // ============================================================================
    // RESPONSIVE SIZING CALCULATIONS
    // ============================================================================

    /**
     * Calculate responsive font size
     * Formula: baseSize * scaleFactor, with min/max constraints
     */
    public calculateFontSize(baseSize: number): number {
        const responsiveSize = baseSize * this.scaleFactor;
        // Minimum readable font size on mobile: 12px
        // Maximum on desktop: no cap (use baseSize)
        return Math.max(12, Math.min(baseSize, responsiveSize));
    }

    /**
     * Calculate responsive value with constraints
     * Used for sizes, padding, margins
     */
    public calculateResponsiveSize(baseSize: number, minSize: number = baseSize * 0.5, maxSize: number = baseSize): number {
        const responsiveSize = baseSize * this.scaleFactor;
        return Math.max(minSize, Math.min(maxSize, responsiveSize));
    }

    /**
     * Get safe area padding (accounts for notch, home indicator, etc.)
     * iPhone: 44-120px top (notch), 34px bottom (home indicator)
     * Android: varies, typically 0
     */
    public getSafeAreaPadding(): { top: number; bottom: number; left: number; right: number } {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        let topPadding = 0;
        let bottomPadding = 0;

        if (isIOS && this.isPortrait()) {
            // Check for notch by looking at screen height
            // iPhone 12-15 (notch): viewport-fit includes safe areas
            topPadding = Math.max(20, this.screenHeight > 800 ? 50 : 20);
            bottomPadding = 34; // Home indicator on modern iPhones
        }

        return {
            top: topPadding,
            bottom: bottomPadding,
            left: 20,
            right: 20,
        };
    }

    // ============================================================================
    // BUTTON SIZING (Touch Targets)
    // ============================================================================

    /**
     * Get minimum touch-safe button dimensions
     * Recommendation: 48×48px (Apple), 50×50px (Android)
     * On small screens: ensure at least 44×44px
     */
    public getButtonDimensions(baseWidth: number = 100, baseHeight: number = 40): { width: number; height: number } {
        const responsiveWidth = this.calculateResponsiveSize(baseWidth, 44, baseWidth);
        const responsiveHeight = this.calculateResponsiveSize(baseHeight, 40, baseHeight);

        return {
            width: Math.max(44, responsiveWidth),
            height: Math.max(40, responsiveHeight),
        };
    }

    /**
     * Get pause button specific dimensions
     * Base: 100×40, Mobile: 60×32, Desktop: 100×40
     */
    public getPauseButtonDimensions(): { width: number; height: number } {
        if (this.isMobilePortrait()) {
            return { width: 60, height: 32 };
        } else if (this.isMobileLandscape()) {
            return { width: 50, height: 30 };
        }
        return { width: 100, height: 40 };
    }

    /**
     * Get resume button specific dimensions (primary action, larger)
     * Base: 120×50, Mobile: 100×40, Desktop: 120×50
     */
    public getResumeButtonDimensions(): { width: number; height: number } {
        if (this.isMobilePortrait()) {
            return { width: 100, height: 40 };
        } else if (this.isMobileLandscape()) {
            return { width: 80, height: 35 };
        }
        return { width: 120, height: 50 };
    }

    // ============================================================================
    // HUD PANEL LAYOUT
    // ============================================================================

    /**
     * Get HUD panel layout based on screen size and orientation
     */
    public getHUDPanelLayout(): { x: number; y: number; width: number; height: number } {
        const safe = this.getSafeAreaPadding();
        const padding = 10;

        if (this.isMobileLandscape()) {
            // Mobile landscape: compact vertical, positioned bottom-left
            return {
                x: padding + safe.left,
                y: this.screenHeight - 120 - safe.bottom,
                width: 180,
                height: 100,
            };
        } else if (this.isMobilePortrait()) {
            // Mobile portrait: compact, top-left with safe area offset
            return {
                x: padding + safe.left,
                y: padding + safe.top,
                width: 180,
                height: 120,
            };
        }

        // Desktop/Tablet: full-size HUD, top-left
        return {
            x: padding,
            y: padding,
            width: 220,
            height: 132,
        };
    }

    /**
     * Get HUD text positioning (relative to panel x, y)
     */
    public getHUDTextPositions(): { altitude: { x: number; y: number }; speed: { x: number; y: number }; pitch: { x: number; y: number }; meterLabel: { x: number; y: number }; meter: { x: number; y: number } } {
        const isCompact = this.isMobilePortrait() || this.isMobileLandscape();

        if (isCompact) {
            return {
                altitude: { x: 15, y: 12 },
                speed: { x: 15, y: 32 },
                pitch: { x: 15, y: 50 },
                meterLabel: { x: 15, y: 68 },
                meter: { x: 15, y: 85 },
            };
        }

        // Desktop layout
        return {
            altitude: { x: 25, y: 25 },
            speed: { x: 25, y: 50 },
            pitch: { x: 25, y: 68 },
            meterLabel: { x: 25, y: 92 },
            meter: { x: 25, y: 112 },
        };
    }

    // ============================================================================
    // TASK OVERLAY LAYOUT
    // ============================================================================

    /**
     * Get task overlay positioning
     * Slides in from left, positioned to avoid UI elements
     */
    public getTaskOverlayYPosition(): number {
        const safe = this.getSafeAreaPadding();

        if (this.isMobileLandscape()) {
            // Mobile landscape: position higher to avoid bottom controls
            return Math.max(20, this.screenHeight / 4);
        } else if (this.isMobilePortrait()) {
            // Mobile portrait: below safe area
            return safe.top + 20;
        }

        // Desktop: standard position
        return 100;
    }

    /**
     * Get task overlay max width
     */
    public getTaskOverlayMaxWidth(): number {
        if (this.isMobilePortrait() || this.isMobileLandscape()) {
            // Mobile: 85% of screen, max 320px
            return Math.min(this.screenWidth * 0.85, 320);
        }
        // Desktop: max 400px
        return 400;
    }

    // ============================================================================
    // START SCREEN LAYOUT
    // ============================================================================

    /**
     * Get start screen text positioning
     */
    public getStartScreenLayout(): { titleY: number; subtitleY: number; titleSize: number; subtitleSize: number } {
        const safe = this.getSafeAreaPadding();

        if (this.isMobilePortrait()) {
            return {
                titleY: this.screenHeight / 2 - 60 + safe.top,
                subtitleY: this.screenHeight / 2 + 10 + safe.top,
                titleSize: 20,
                subtitleSize: 12,
            };
        } else if (this.isMobileLandscape()) {
            return {
                titleY: this.screenHeight / 2 - 30,
                subtitleY: this.screenHeight / 2 + 20,
                titleSize: 18,
                subtitleSize: 11,
            };
        }

        // Desktop
        return {
            titleY: this.screenHeight / 2 - 20,
            subtitleY: this.screenHeight / 2 + 30,
            titleSize: 28,
            subtitleSize: 14,
        };
    }

    // ============================================================================
    // PAUSE BUTTON POSITIONING
    // ============================================================================

    /**
     * Get pause button position
     * Top-right on portrait, top-left on landscape (avoid system controls at bottom)
     */
    public getPauseButtonPosition(): { x: number; y: number } {
        const buttonDims = this.getPauseButtonDimensions();
        const safe = this.getSafeAreaPadding();
        const padding = 16;

        if (this.isMobileLandscape()) {
            // Landscape: top-left (avoid bottom system controls)
            return {
                x: padding + safe.left,
                y: padding,
            };
        }

        // Portrait & Desktop: top-right
        return {
            x: this.screenWidth - buttonDims.width - padding - safe.right,
            y: padding + safe.top,
        };
    }

    /**
     * Get pause menu resume button position (centered)
     */
    public getPauseMenuResumeButtonPosition(): { x: number; y: number } {
        const buttonDims = this.getResumeButtonDimensions();

        return {
            x: this.screenWidth / 2 - buttonDims.width / 2,
            y: this.screenHeight / 2 + 20,
        };
    }

    /**
     * Get pause menu paused label position
     */
    public getPauseMenuLabelPosition(): { x: number; y: number } {
        return {
            x: this.screenWidth / 2,
            y: this.screenHeight / 2 - 60,
        };
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    /**
     * Check if we're on a phone (not tablet/desktop)
     */
    public isPhone(): boolean {
        return this.breakpoint === 'small' || this.breakpoint === 'mobile-portrait' || this.breakpoint === 'mobile-landscape';
    }

    /**
     * Check if device is in a small viewport (< 400px width)
     */
    public isVerySmallScreen(): boolean {
        return this.screenWidth < 400;
    }

    /**
     * Get debug info for testing
     */
    public getDebugInfo(): string {
        return `Screen: ${this.screenWidth}×${this.screenHeight} | Orientation: ${this.orientation} | Breakpoint: ${this.breakpoint} | Scale: ${this.scaleFactor.toFixed(2)}`;
    }
}
