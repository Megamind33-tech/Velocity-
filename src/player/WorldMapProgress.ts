const K = {
    maxClearedNode: 'velocity_map_max_cleared_node',
} as const;

/**
 * Linear route unlock: clearing node N allows selecting node N+1 on the map.
 * Stars still gate individual charts inside song select.
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
     * Advance route only when the player starts the next sector in order
     * (avoids skipping by playing a harder chart first).
     */
    recordSequentialClear(nodeId: number): void {
        if (nodeId < 1) return;
        const next = this.getMaxClearedNode() + 1;
        if (nodeId === next) {
            this.recordNodeCleared(nodeId);
        }
    },

    /** First playable node on the route (always at least 1). */
    getFurthestSelectableNode(totalNodes: number): number {
        const cleared = this.getMaxClearedNode();
        return Math.min(totalNodes, Math.max(1, cleared + 1));
    },
};
