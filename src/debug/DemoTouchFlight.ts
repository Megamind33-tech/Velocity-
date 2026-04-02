/**
 * DEV-only fake vertical input so automated/manual testing works without a mic.
 * Strip this module's wiring from main.ts when demo phase is over; production builds
 * set import.meta.env.DEV to false so logic is inert.
 */
let demoVertical = 0;

export const DemoTouchFlight = {
    onPointerDown(screenX: number, screenY: number, width: number, height: number): void {
        if (!import.meta.env.DEV) return;
        const edge = width * 0.18;
        if (screenX < edge) {
            demoVertical = -1;
        } else if (screenX > width - edge) {
            demoVertical = 1;
        }
    },

    onPointerUp(): void {
        if (!import.meta.env.DEV) return;
        demoVertical = 0;
    },

    /** -1 = up, 1 = down, 0 = none (matches screen Y / vocal convention) */
    getVertical(): number {
        if (!import.meta.env.DEV) return 0;
        return demoVertical;
    },
};
