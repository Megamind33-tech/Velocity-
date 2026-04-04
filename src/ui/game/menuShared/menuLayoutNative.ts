/**
 * Game-native vertical budget for landscape main menu (not responsive-web flex).
 */

export type LandscapeMainMenuLayout = {
    topBarY: number;
    topBarH: number;
    heroY: number;
    heroH: number;
    tabsY: number;
    tabsH: number;
    listY: number;
    listH: number;
    dockH: number;
    dockY: number;
    rowH: number;
};

const GAP = 12;
const TOP_BAR_H = 64;
const TABS_H = 58;
const DOCK_H = 84;
const MIN_LIST_H = 200;
const MIN_HERO_H = 156;
const MAX_HERO_H = 204;

/**
 * @param contentInnerTop — top of content column (e.g. safeTop + 12)
 */
export function computeLandscapeMainMenuLayout(
    screenH: number,
    safeBottom: number,
    contentInnerTop: number,
): LandscapeMainMenuLayout {
    const topBarY = contentInnerTop;
    const heroY = topBarY + TOP_BAR_H + GAP;
    const dockY = screenH - safeBottom - DOCK_H - GAP;
    const listBottomMax = dockY - GAP;

    // Vertical slice: hero + gap + tabs + gap + list = listBottomMax - heroY
    const available = listBottomMax - heroY;
    const reserved = GAP + TABS_H + GAP; // after hero: tabs + gap before list
    const maxFlex = available - reserved; // heroH + listH

    let listH = Math.max(MIN_LIST_H, Math.floor(maxFlex * 0.52));
    let heroH = maxFlex - listH;
    heroH = Math.min(MAX_HERO_H, Math.max(MIN_HERO_H, heroH));
    listH = maxFlex - heroH;
    if (listH < MIN_LIST_H) {
        listH = MIN_LIST_H;
        heroH = Math.max(MIN_HERO_H, maxFlex - listH);
    }

    const tabsY = heroY + heroH + GAP;
    const listY = tabsY + TABS_H + GAP;
    const rowH = Math.max(100, Math.min(124, Math.floor(listH * 0.21)));

    return {
        topBarY,
        topBarH: TOP_BAR_H,
        heroY,
        heroH,
        tabsY,
        tabsH: TABS_H,
        listY,
        listH,
        dockH: DOCK_H,
        dockY,
        rowH,
    };
}
