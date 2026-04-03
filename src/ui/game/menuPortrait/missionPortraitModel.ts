/**
 * SECTION B — DATA MODEL (concrete mock + live merge from game state)
 */

export type PortraitStatChip = { id: string; label: string; value: string; accent: 'cyan' | 'gold' };

export type PortraitFeaturedMission = {
    title: string;
    subtitle: string;
    routesCompleted: number;
    routesTotal: number;
    micLive: boolean;
    className: string;
    rewardStars: number;
};

export type PortraitTab = { id: string; label: string };

export type PortraitMissionCard = {
    id: number;
    title: string;
    descriptor: string;
    available: boolean;
    rewardLabel: string;
    elite: boolean;
};

export type PortraitNavItem = { id: string; label: string; icon: 'home' | 'map' | 'hangar' | 'store' };

export type PortraitMissionScreenModel = {
    topStats: PortraitStatChip[];
    featured: PortraitFeaturedMission;
    tabs: PortraitTab[];
    activeTabIndex: number;
    missions: PortraitMissionCard[];
    bottomNav: PortraitNavItem[];
    activeNavIndex: number;
};

/** Mock for tests / Storybook-style isolation (no lorem). */
export const PORTRAIT_MOCK_MODEL: PortraitMissionScreenModel = {
    topStats: [
        { id: 'signal', label: 'SIGNAL', value: '1', accent: 'cyan' },
        { id: 'best', label: 'BEST', value: '12480', accent: 'gold' },
        { id: 'routes', label: 'CLEAR', value: '7', accent: 'cyan' },
    ],
    featured: {
        title: 'VELOCITY',
        subtitle: 'Voice-Powered Flight',
        routesCompleted: 7,
        routesTotal: 20,
        micLive: true,
        className: 'CADET',
        rewardStars: 3,
    },
    tabs: [
        { id: 'missions', label: 'Missions' },
        { id: 'routes', label: 'Routes' },
        { id: 'training', label: 'Training' },
        { id: 'fleet', label: 'Fleet' },
        { id: 'events', label: 'Events' },
    ],
    activeTabIndex: 0,
    missions: [
        {
            id: 1,
            title: 'First Flight',
            descriptor: 'Hold a steady pitch to stay level through the gate line.',
            available: true,
            rewardLabel: 'Reward',
            elite: false,
        },
        {
            id: 2,
            title: 'Gentle Glide',
            descriptor: 'Smooth altitude changes — anticipate the next gate.',
            available: false,
            rewardLabel: 'Locked',
            elite: false,
        },
        {
            id: 3,
            title: 'Sine Wave',
            descriptor: 'Follow the vocal wave without over-correcting.',
            available: false,
            rewardLabel: 'Locked',
            elite: false,
        },
    ],
    bottomNav: [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'missions', label: 'Missions', icon: 'map' },
        { id: 'hangar', label: 'Hangar', icon: 'hangar' },
        { id: 'store', label: 'Store', icon: 'store' },
    ],
    activeNavIndex: 0,
};
