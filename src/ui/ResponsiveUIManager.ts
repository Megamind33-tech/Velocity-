/**
 * ResponsiveUIManager: Mobile & Tablet First Design
 *
 * Target Devices Only:
 * - iPhone SE (1st gen): 320×568
 * - iPhone SE 2024: 393×852
 * - iPhone 14: 393×852
 * - iPhone 14 Pro: 393×852
 * - iPhone 12 Pro Max: 428×926
 * - Galaxy S21: 360×800
 * - Galaxy S24: 360×800
 * - iPad (10.2"): 810×1080
 * - iPad Pro (11"): 834×1194
 *
 * Breakpoints (Mobile & Tablet Only):
 * - Small Mobile: width < 360px (oldest phones)
 * - Mobile Portrait: 360 ≤ width < 768px (all phones in vertical)
 * - Mobile Landscape: height < 500px (phone rotated)
 * - Tablet: width ≥ 768px (iPad and larger tablets)
 */
export class ResponsiveUIManager {
    private static instance: ResponsiveUIManager;

    private screenWidth: number = 0;
    private screenHeight: number = 0;
    private devicePixelRatio: number = 1;
    private orientation: 'portrait' | 'landscape' = 'portrait';
    private scaleFactor: number = 1;
    private breakpoint: 'small-mobile' | 'mobile-portrait' | 'mobile-landscape' | 'tablet' = 'mobile-portrait';

    // Reference: iPhone 14 (393×852) - typical mobile reference
    private readonly MOBILE_REFERENCE_WIDTH = 393;
    private readonly MOBILE_REFERENCE_HEIGHT = 852;

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
     * Determine which breakpoint we're in (Mobile & Tablet only)
     */
    private calculateBreakpoint(): void {
        if (this.screenWidth < 360) {
            this.breakpoint = 'small-mobile';
        } else if (this.screenHeight < 500) {
            this.breakpoint = 'mobile-landscape';
        } else if (this.screenWidth < 768) {
            this.breakpoint = 'mobile-portrait';
        } else {
            this.breakpoint = 'tablet';
        }
    }

    /**
     * Calculate scale factor relative to mobile reference
     * For mobile/tablet: more aggressive scaling to stay visible
     * Formula: scaleFactor = (currentWidth / referenceWidth) * 0.8 + 0.4
     * This provides scaling between 0.4x (small phones) and 1.2x (tablets)
     */
    private calculateScaleFactor(): void {
        const widthRatio = this.screenWidth / this.MOBILE_REFERENCE_WIDTH;
        // Clamp between 0.4 (small phones) and 1.2 (tablets)
        this.scaleFactor = Math.max(0.4, Math.min(1.2, widthRatio * 0.8 + 0.4));
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
        return this.breakpoint === 'mobile-portrait' || this.breakpoint === 'small-mobile';
    }

    public isMobileLandscape(): boolean {
        return this.breakpoint === 'mobile-landscape';
    }

    public isSmallMobile(): boolean {
        return this.breakpoint === 'small-mobile';
    }

    public isTablet(): boolean {
        return this.breakpoint === 'tablet';
    }

    public isMobile(): boolean {
        return this.breakpoint === 'small-mobile' || this.breakpoint === 'mobile-portrait' || this.breakpoint === 'mobile-landscape';
    }

    // ============================================================================
    // RESPONSIVE SIZING CALCULATIONS (Mobile/Tablet Optimized)
    // ============================================================================

    /**
     * Calculate responsive font size for mobile/tablet
     * Minimum 12px (always readable), no upper limit for tablets
     */
    public calculateFontSize(baseSize: number): number {
        const responsiveSize = baseSize * this.scaleFactor;
        // Minimum readable font on mobile: 12px
        return Math.max(12, responsiveSize);
    }

    /**
     * Calculate responsive value with constraints
     * Used for sizes, padding, margins
     */
    public calculateResponsiveSize(
        baseSize: number,
        minSize: number = baseSize * 0.5,
        maxSize: number = baseSize * 1.2
    ): number {
        const responsiveSize = baseSize * this.scaleFactor;
        return Math.max(minSize, Math.min(maxSize, responsiveSize));
    }

    /**
     * Get safe area padding (accounts for notch, home indicator, etc.)
     * iPhone: 44-120px top (notch), 34px bottom (home indicator)
     * Android: varies, typically 0
     */
    public getSafeAreaPadding(): { top: number; bottom: number; left: number; right: number } {
        // When #game-root applies env(safe-area-inset-*) in CSS, Pixi resizes to that inset box.
        // Do not add the same insets again in layout math (double padding shrinks content to zero).
        if (typeof document !== 'undefined' && document.getElementById('game-root')) {
            return { top: 0, bottom: 0, left: 0, right: 0 };
        }

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
            left: 16,
            right: 16,
        };
    }

    // ============================================================================
    // BUTTON SIZING (Touch Targets) - Mobile First
    // ============================================================================

    /**
     * Get minimum touch-safe button dimensions
     * Mobile: 48×48px minimum (Apple/Android standards)
     * Tablet: can be larger for better usability
     */
    public getButtonDimensions(baseWidth: number = 100, baseHeight: number = 40): { width: number; height: number } {
        let minWidth = 44;
        let minHeight = 40;

        // Tablets get larger minimum touch targets
        if (this.isTablet()) {
            minWidth = 56;
            minHeight = 48;
        }

        const responsiveWidth = this.calculateResponsiveSize(baseWidth, minWidth, baseWidth * 1.2);
        const responsiveHeight = this.calculateResponsiveSize(baseHeight, minHeight, baseHeight * 1.2);

        return {
            width: responsiveWidth,
            height: responsiveHeight,
        };
    }

    /**
     * Get pause button specific dimensions
     * Mobile Portrait: 60×32
     * Mobile Landscape: 50×30
     * Tablet: 80×40
     */
    public getPauseButtonDimensions(): { width: number; height: number } {
        if (this.isMobileLandscape()) {
            return { width: 50, height: 30 };
        } else if (this.isSmallMobile()) {
            return { width: 55, height: 30 };
        } else if (this.isMobilePortrait()) {
            return { width: 60, height: 32 };
        } else {
            // Tablet
            return { width: 80, height: 40 };
        }
    }

    /**
     * Get resume button specific dimensions (primary action, larger)
     * Mobile Portrait: 100×40
     * Mobile Landscape: 80×35
     * Tablet: 130×50
     */
    public getResumeButtonDimensions(): { width: number; height: number } {
        if (this.isMobileLandscape()) {
            return { width: 80, height: 35 };
        } else if (this.isSmallMobile()) {
            return { width: 90, height: 38 };
        } else if (this.isMobilePortrait()) {
            return { width: 100, height: 40 };
        } else {
            // Tablet
            return { width: 130, height: 50 };
        }
    }

    // ============================================================================
    // HUD PANEL LAYOUT
    // ============================================================================

    /**
     * Get HUD panel layout based on device type and orientation
     * Mobile Portrait: compact, top-left with safe area
     * Mobile Landscape: compact, bottom-left to avoid controls
     * Tablet: larger, top-left
     */
    public getHUDPanelLayout(): { x: number; y: number; width: number; height: number } {
        const safe = this.getSafeAreaPadding();
        const padding = 10;

        if (this.isMobileLandscape()) {
            // Mobile landscape: compact, positioned bottom-left
            return {
                x: padding + safe.left,
                y: this.screenHeight - 110 - safe.bottom,
                width: 170,
                height: 95,
            };
        } else if (this.isSmallMobile()) {
            // Small phones: very compact
            return {
                x: padding + safe.left,
                y: padding + safe.top,
                width: 160,
                height: 110,
            };
        } else if (this.isMobilePortrait()) {
            // Standard mobile portrait: compact, top-left with safe area offset
            return {
                x: padding + safe.left,
                y: padding + safe.top,
                width: 180,
                height: 120,
            };
        } else {
            // Tablet: larger HUD, still top-left
            return {
                x: padding + safe.left,
                y: padding + safe.top,
                width: 220,
                height: 140,
            };
        }
    }

    /**
     * Get HUD text positioning (relative to panel x, y)
     */
    public getHUDTextPositions(): {
        altitude: { x: number; y: number };
        speed: { x: number; y: number };
        pitch: { x: number; y: number };
        meterLabel: { x: number; y: number };
        meter: { x: number; y: number };
    } {
        if (this.isSmallMobile()) {
            return {
                altitude: { x: 12, y: 10 },
                speed: { x: 12, y: 28 },
                pitch: { x: 12, y: 46 },
                meterLabel: { x: 12, y: 64 },
                meter: { x: 12, y: 82 },
            };
        } else if (this.isMobileLandscape()) {
            return {
                altitude: { x: 12, y: 8 },
                speed: { x: 12, y: 26 },
                pitch: { x: 12, y: 44 },
                meterLabel: { x: 12, y: 62 },
                meter: { x: 12, y: 80 },
            };
        } else if (this.isMobilePortrait()) {
            return {
                altitude: { x: 15, y: 12 },
                speed: { x: 15, y: 32 },
                pitch: { x: 15, y: 50 },
                meterLabel: { x: 15, y: 68 },
                meter: { x: 15, y: 85 },
            };
        } else {
            // Tablet
            return {
                altitude: { x: 20, y: 18 },
                speed: { x: 20, y: 40 },
                pitch: { x: 20, y: 60 },
                meterLabel: { x: 20, y: 80 },
                meter: { x: 20, y: 100 },
            };
        }
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
        } else if (this.isMobilePortrait() || this.isSmallMobile()) {
            // Mobile portrait: below safe area
            return safe.top + 20;
        } else {
            // Tablet: standard position
            return 60;
        }
    }

    /**
     * Get task overlay max width
     * Mobile: 85% of screen, max 320px
     * Tablet: 85% of screen, max 500px
     */
    public getTaskOverlayMaxWidth(): number {
        if (this.isTablet()) {
            return Math.min(this.screenWidth * 0.85, 500);
        } else {
            // Mobile
            return Math.min(this.screenWidth * 0.85, 320);
        }
    }

    // ============================================================================
    // START SCREEN LAYOUT
    // ============================================================================

    /**
     * Get start screen text positioning
     * Optimized for mobile and tablet screens only
     */
    public getStartScreenLayout(): {
        titleY: number;
        subtitleY: number;
        titleSize: number;
        subtitleSize: number;
    } {
        const safe = this.getSafeAreaPadding();

        if (this.isMobileLandscape()) {
            return {
                titleY: this.screenHeight / 2 - 30,
                subtitleY: this.screenHeight / 2 + 20,
                titleSize: 18,
                subtitleSize: 11,
            };
        } else if (this.isSmallMobile()) {
            return {
                titleY: this.screenHeight / 2 - 50 + safe.top,
                subtitleY: this.screenHeight / 2 + 10 + safe.top,
                titleSize: 18,
                subtitleSize: 11,
            };
        } else if (this.isMobilePortrait()) {
            return {
                titleY: this.screenHeight / 2 - 60 + safe.top,
                subtitleY: this.screenHeight / 2 + 10 + safe.top,
                titleSize: 20,
                subtitleSize: 12,
            };
        } else {
            // Tablet
            return {
                titleY: this.screenHeight / 2 - 60,
                subtitleY: this.screenHeight / 2 + 20,
                titleSize: 24,
                subtitleSize: 14,
            };
        }
    }

    // ============================================================================
    // PAUSE BUTTON POSITIONING
    // ============================================================================

    /**
     * Get pause button position (mobile and tablet)
     * Mobile Portrait: top-right
     * Mobile Landscape: top-left (avoid system controls at bottom)
     * Tablet: top-right
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

        // Mobile portrait & Tablet: top-right
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
     * Get debug info for testing
     */
    public getDebugInfo(): string {
        return `Screen: ${this.screenWidth}×${this.screenHeight} | Orientation: ${this.orientation} | Breakpoint: ${this.breakpoint} | Scale: ${this.scaleFactor.toFixed(2)}`;
    }
}
