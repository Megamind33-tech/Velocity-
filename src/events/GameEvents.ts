export const GameEvents = {
    GATE_PASSED: 'GATE_PASSED',
    CRASH: 'CRASH',
    UI_CLICK: 'UI_CLICK',
    LEVEL_START: 'LEVEL_START',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    OBSTACLE_DODGED: 'OBSTACLE_DODGED',
    DISTANCE_DELTA: 'DISTANCE_DELTA',
    QUEST_PROGRESS: 'QUEST_PROGRESS',
    QUEST_COMPLETED: 'QUEST_COMPLETED'
} as const;

export type GameEvent = typeof GameEvents[keyof typeof GameEvents];
