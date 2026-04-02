const K = {
    maxClearedNode: 'velocity_map_max_cleared_node',
} as const;

/**
 * World tour legs cleared (1..7). Node k playable when k <= maxCleared + 1.
 */
export const WorldMapProgress = {
    getMaxClearedNode(): number {
        try {
            const v = localStorage.getItem(K.maxClearedNode);
            if (v == null) return 0;
            const n = Number(v);
            return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
        } catch {
            return 0;
        }
    },

    /** nodeId is 1-based (first stage = 1). */
    recordNodeCleared(nodeId: number): void {
        if (nodeId < 1) return;
        const cur = this.getMaxClearedNode();
        if (nodeId > cur) {
            try {
                localStorage.setItem(K.maxClearedNode, String(nodeId));
            } catch {
                /* ignore */
            }
        }
    },

    /**
     * Advance when the player begins a run on the next tour leg (map flow).
     */
    recordSequentialClear(legIndex: number): void {
        if (legIndex < 1) return;
        const next = this.getMaxClearedNode() + 1;
        if (legIndex === next) {
            this.recordNodeCleared(legIndex);
        }
    },

    /** First playable node on the route (always at least 1). */
    getFurthestSelectableNode(totalNodes: number): number {
        const cleared = this.getMaxClearedNode();
        return Math.min(totalNodes, Math.max(1, cleared + 1));
    },
};
