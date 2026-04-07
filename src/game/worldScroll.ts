/**
 * Fixed-player, moving-world: horizontal progress is `scrollX` (world slides past the plane).
 * The plane's TransformComponent.x stays at PLAYER_WORLD_X; gates use logicalX - scrollX.
 */

import { VOICE_FLIGHT } from '../data/constants';

/** World-space X where the plane lives — set from screen width at run start (≈ 27% width). */
let playerWorldX = 400;

export function setPlayerWorldX(x: number): void {
    playerWorldX = x;
}

export function getPlayerWorldX(): number {
    return playerWorldX;
}

let scrollX = 0;
let cruiseVx = VOICE_FLIGHT.CRUISE_SPEED_X;
/** Baseline before dynamic scaling each tick */
let baseCruiseVx = VOICE_FLIGHT.CRUISE_SPEED_X;

export function getWorldScrollX(): number {
    return scrollX;
}

export function setWorldScrollX(x: number): void {
    scrollX = x;
}

export function resetWorldScroll(): void {
    scrollX = 0;
    cruiseVx = VOICE_FLIGHT.CRUISE_SPEED_X;
    baseCruiseVx = VOICE_FLIGHT.CRUISE_SPEED_X;
}

export function advanceWorldScroll(delta: number): void {
    scrollX += cruiseVx * delta;
}

export function setCruiseVx(v: number): void {
    cruiseVx = v;
    baseCruiseVx = v;
}

export function getBaseCruiseVx(): number {
    return baseCruiseVx;
}

export function applyCruiseMultiplier(mult: number): void {
    cruiseVx = baseCruiseVx * mult;
}

export function getCruiseVx(): number {
    return cruiseVx;
}
