/**
 * Read safe-area insets (notch / home indicator) for mobile game UI layout.
 */
export function getSafeAreaInsets(): { top: number; bottom: number } {
    let top = 0;
    let bottom = 0;
    try {
        const probe = document.createElement('div');
        probe.style.cssText =
            'position:fixed;left:-99px;width:1px;height:1px;pointer-events:none;visibility:hidden;' +
            'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);';
        document.body.appendChild(probe);
        const s = getComputedStyle(probe);
        top = parseFloat(s.paddingTop) || 0;
        bottom = parseFloat(s.paddingBottom) || 0;
        document.body.removeChild(probe);
    } catch {
        /* ignore */
    }
    return { top, bottom };
}
