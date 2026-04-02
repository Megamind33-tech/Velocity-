/**
 * World vocal tour — continental legs (not a linear Candy Crush path).
 * Home country picks starting region; tour continues around the world.
 */
export type TourRegionId =
    | 'north_america'
    | 'south_america'
    | 'europe'
    | 'africa'
    | 'middle_east'
    | 'asia'
    | 'oceania';

export interface TourRegion {
    id: TourRegionId;
    /** Short map label */
    label: string;
    /** What players train here (drives future chart packs) */
    vocalFocus: string;
    /** Normalized position on stylized map (0–1), origin top-left */
    mapU: number;
    mapV: number;
    /** Accent for continent blob */
    landColor: number;
    landColor2: number;
}

/** Default geographic order (Americas → Atlantic → Africa → …) */
export const TOUR_REGIONS: TourRegion[] = [
    {
        id: 'north_america',
        label: 'NORTH AMERICA',
        vocalFocus: 'Pop belt · studio phrasing',
        mapU: 0.18,
        mapV: 0.28,
        landColor: 0x2a4a6a,
        landColor2: 0x1a3555,
    },
    {
        id: 'south_america',
        label: 'SOUTH AMERICA',
        vocalFocus: 'Rhythm · warmth · sustained vowels',
        mapU: 0.28,
        mapV: 0.62,
        landColor: 0x2d6a4a,
        landColor2: 0x1d5038,
    },
    {
        id: 'europe',
        label: 'EUROPE',
        vocalFocus: 'Opera lines · classical support',
        mapU: 0.48,
        mapV: 0.22,
        landColor: 0x5a4a7a,
        landColor2: 0x3a3058,
    },
    {
        id: 'africa',
        label: 'AFRICA',
        vocalFocus: 'Call-and-response · groove',
        mapU: 0.52,
        mapV: 0.48,
        landColor: 0x7a5a3a,
        landColor2: 0x584028,
    },
    {
        id: 'middle_east',
        label: 'MIDDLE EAST',
        vocalFocus: 'Ornament · microtonal awareness',
        mapU: 0.58,
        mapV: 0.38,
        landColor: 0x7a5040,
        landColor2: 0x553830,
    },
    {
        id: 'asia',
        label: 'ASIA',
        vocalFocus: 'Pitch precision · breath streams',
        mapU: 0.78,
        mapV: 0.32,
        landColor: 0x4a6a7a,
        landColor2: 0x304858,
    },
    {
        id: 'oceania',
        label: 'OCEANIA',
        vocalFocus: 'Open vowels · coastal pop',
        mapU: 0.88,
        mapV: 0.68,
        landColor: 0x3a7a6a,
        landColor2: 0x285848,
    },
];

/** Country / territory → starting region (expand with CMS later) */
export const HOME_COUNTRY_TO_REGION: Record<string, TourRegionId> = {
    zambia: 'africa',
    south_africa: 'africa',
    nigeria: 'africa',
    kenya: 'africa',
    egypt: 'africa',
    italy: 'europe',
    france: 'europe',
    germany: 'europe',
    uk: 'europe',
    spain: 'europe',
    usa: 'north_america',
    canada: 'north_america',
    mexico: 'north_america',
    brazil: 'south_america',
    argentina: 'south_america',
    japan: 'asia',
    korea: 'asia',
    india: 'asia',
    china: 'asia',
    australia: 'oceania',
    new_zealand: 'oceania',
    uae: 'middle_east',
    israel: 'middle_east',
};

export const HOME_PRESET_OPTIONS: { key: string; label: string }[] = [
    { key: 'usa', label: 'United States' },
    { key: 'zambia', label: 'Zambia' },
    { key: 'italy', label: 'Italy' },
    { key: 'uk', label: 'United Kingdom' },
    { key: 'brazil', label: 'Brazil' },
    { key: 'japan', label: 'Japan' },
    { key: 'nigeria', label: 'Nigeria' },
    { key: 'australia', label: 'Australia' },
];

export function getRegionById(id: TourRegionId): TourRegion | undefined {
    return TOUR_REGIONS.find((r) => r.id === id);
}

/**
 * Tour order: start at `homeRegion`, then follow the ring through `TOUR_REGIONS`.
 */
export function getTourOrder(homeRegionId: TourRegionId): TourRegion[] {
    const idx = TOUR_REGIONS.findIndex((r) => r.id === homeRegionId);
    const start = idx >= 0 ? idx : 0;
    const out: TourRegion[] = [];
    for (let i = 0; i < TOUR_REGIONS.length; i++) {
        out.push(TOUR_REGIONS[(start + i) % TOUR_REGIONS.length]);
    }
    return out;
}

export function defaultHomeRegion(): TourRegionId {
    return 'north_america';
}
