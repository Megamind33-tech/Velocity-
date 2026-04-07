import { Component, ComponentRegistry } from '../Component';

export type GateKind = 'pitch' | 'volume';

/**
 * Data-only component for Gates.
 */
export class GateComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('Gate');
    public readonly _typeId = GateComponent.TYPE_ID;

    constructor(
        public width: number = 100,
        public height: number = 200,
        public points: number = 10,
        public passed: boolean = false,
        /** Fixed-player mode: gate X in scroll/world space (before subtracting scrollX). */
        public logicalX: number = 0,
        public kind: GateKind = 'pitch',
        /** Opening height (px); volume gates animate `gapEffectivePx`. */
        public gapMaxPx: number = 120,
        public gapEffectivePx: number = 120,
        /** Vertical center of the gap in screen/world Y. */
        public gapCenterY: number = 0,
        public targetMidi: number = 69,
    ) {}
}
