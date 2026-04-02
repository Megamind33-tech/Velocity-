import {
    defaultHomeRegion,
    HOME_COUNTRY_TO_REGION,
    type TourRegionId,
} from '../data/worldTour';

const K = {
    homeCountryKey: 'velocity_home_country',
} as const;

export const WorldMapProfile = {
    getHomeCountryKey(): string {
        try {
            return localStorage.getItem(K.homeCountryKey) ?? '';
        } catch {
            return '';
        }
    },

    setHomeCountryKey(key: string): void {
        try {
            localStorage.setItem(K.homeCountryKey, key);
        } catch {
            /* ignore */
        }
    },

    getHomeRegion(): TourRegionId {
        const key = this.getHomeCountryKey().toLowerCase().replace(/\s+/g, '_');
        if (key && HOME_COUNTRY_TO_REGION[key]) {
            return HOME_COUNTRY_TO_REGION[key];
        }
        return defaultHomeRegion();
    },
};
