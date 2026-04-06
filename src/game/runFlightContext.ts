import { Application } from 'pixi.js';

let appRef: Application | null = null;

export function setRunFlightApp(app: Application): void {
    appRef = app;
}

export function getPlayfieldHeight(): number {
    return appRef?.screen.height ?? 600;
}
