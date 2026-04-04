/**
 * Single coherent vector icon family — 2px stroke, rounded caps, cockpit geometry.
 */

import { Graphics } from 'pixi.js';

export type IconStroke = { color: number; width: number; alpha: number };

const D: IconStroke = { color: 0x00e6c4, width: 2, alpha: 0.92 };

export function drawIconHome(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = D): void {
    g.moveTo(cx, cy - s * 0.34);
    g.lineTo(cx + s * 0.36, cy - s * 0.02);
    g.lineTo(cx + s * 0.36, cy + s * 0.32);
    g.lineTo(cx - s * 0.36, cy + s * 0.32);
    g.lineTo(cx - s * 0.36, cy - s * 0.02);
    g.closePath();
    g.stroke(st);
}

export function drawIconMap(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = D): void {
    g.roundRect(cx - s * 0.34, cy - s * 0.28, s * 0.28, s * 0.56, 2);
    g.stroke(st);
    g.roundRect(cx - s * 0.02, cy - s * 0.34, s * 0.36, s * 0.42, 2);
    g.stroke(st);
}

export function drawIconHangar(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = D): void {
    g.moveTo(cx - s * 0.38, cy + s * 0.24);
    g.lineTo(cx - s * 0.38, cy - s * 0.02);
    g.lineTo(cx, cy - s * 0.34);
    g.lineTo(cx + s * 0.38, cy - s * 0.02);
    g.lineTo(cx + s * 0.38, cy + s * 0.24);
    g.stroke(st);
}

export function drawIconStore(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = { ...D, color: 0xe8b829 }): void {
    g.moveTo(cx - s * 0.28, cy + s * 0.26);
    g.lineTo(cx + s * 0.28, cy + s * 0.26);
    g.moveTo(cx, cy - s * 0.3);
    g.lineTo(cx, cy + s * 0.26);
    g.stroke(st);
}

export function drawIconProfile(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = D): void {
    g.circle(cx, cy - s * 0.1, s * 0.22);
    g.stroke(st);
    g.arc(cx, cy + s * 0.38, s * 0.32, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke(st);
}

export function drawIconRetry(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = { ...D, color: 0x8a9aaa }): void {
    const r = s * 0.28;
    g.arc(cx - 2, cy - 1, r, -Math.PI * 0.15, Math.PI * 1.25);
    g.stroke(st);
    g.moveTo(cx + r * 0.35, cy - r * 0.85);
    g.lineTo(cx + r * 0.65, cy - r * 0.45);
    g.lineTo(cx + r * 0.15, cy - r * 0.35);
    g.stroke(st);
}

export function drawIconMic(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = D): void {
    g.roundRect(cx - s * 0.1, cy - s * 0.28, s * 0.2, s * 0.36, 3);
    g.stroke(st);
    g.arc(cx, cy + s * 0.2, s * 0.18, 0.3, Math.PI - 0.3);
    g.stroke(st);
}

export function drawIconWing(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = { ...D, color: 0xe8b829 }): void {
    g.moveTo(cx, cy - s * 0.14);
    g.lineTo(cx - s * 0.4, cy + s * 0.24);
    g.lineTo(cx - s * 0.08, cy + s * 0.08);
    g.moveTo(cx, cy - s * 0.14);
    g.lineTo(cx + s * 0.4, cy + s * 0.24);
    g.lineTo(cx + s * 0.08, cy + s * 0.08);
    g.stroke(st);
}

export function drawIconRouteNode(g: Graphics, cx: number, cy: number, r: number, st: IconStroke = D): void {
    g.circle(cx, cy, r);
    g.stroke(st);
    g.moveTo(cx, cy);
    g.lineTo(cx + r * 1.1, cy - r * 0.35);
    g.stroke({ ...st, alpha: st.alpha * 0.5 });
}

export function drawIconLock(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = { ...D, color: 0x6a7a8c }): void {
    g.roundRect(cx - s * 0.22, cy - s * 0.08, s * 0.44, s * 0.36, 3);
    g.stroke(st);
    g.arc(cx, cy - s * 0.16, s * 0.16, Math.PI, 0);
    g.stroke(st);
}

export function drawIconLockOpen(g: Graphics, cx: number, cy: number, s: number, st: IconStroke = { ...D, color: 0x8fd8c7 }): void {
    g.roundRect(cx - s * 0.22, cy - s * 0.08, s * 0.44, s * 0.36, 3);
    g.stroke(st);
    g.arc(cx - s * 0.06, cy - s * 0.16, s * 0.16, Math.PI * 0.86, Math.PI * 1.78);
    g.stroke(st);
}
