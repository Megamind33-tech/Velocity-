/**
 * Wait for the self-hosted VelocityGame face so Pixi Text measures correctly on first paint.
 * Does not throw if files are missing (build/deploy still runs).
 */
export async function loadGameFont(): Promise<void> {
    if (typeof document === 'undefined' || !document.fonts) return;
    try {
        await document.fonts.load("700 42px 'VelocityGame'");
        await document.fonts.load("600 16px 'VelocityGame'");
        await document.fonts.ready;
    } catch (e) {
        console.warn(
            'VelocityGame font not loaded — add VelocityGame.woff2 or VelocityGame.ttf under public/fonts/ (see public/fonts/README.txt).',
            e
        );
    }
}
