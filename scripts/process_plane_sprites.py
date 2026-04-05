#!/usr/bin/env python3
"""
Regenerate public/oga-players/*.png so each craft is an isolated, tight-cropped sprite.

Run from repo root:
  python3 scripts/process_plane_sprites.py
"""

from __future__ import annotations

import os
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "oga-players"


def flood_from_image_border(rgb: np.ndarray, tol: int) -> np.ndarray:
    """
    Flood-fill “background” from every edge pixel, matching average corner colour.
    Cuts UV-map sheets where the hull is one connected region touching the border.
    """
    h, w = rgb.shape[:2]
    corners = np.vstack(
        [rgb[0, 0], rgb[0, w - 1], rgb[h - 1, 0], rgb[h - 1, w - 1]]
    ).astype(np.int16)
    ref = np.mean(corners, axis=0).astype(np.int16)
    vis = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def try_add(y: int, x: int) -> None:
        if y < 0 or x < 0 or y >= h or x >= w or vis[y, x]:
            return
        c = rgb[y, x].astype(np.int16)
        if np.max(np.abs(c - ref)) <= tol:
            vis[y, x] = True
            q.append((y, x))

    for x in range(w):
        try_add(0, x)
        try_add(h - 1, x)
    for y in range(h):
        try_add(y, 0)
        try_add(y, w - 1)
    while q:
        y, x = q.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            try_add(y + dy, x + dx)
    return vis


def alpha_bbox(a: np.ndarray) -> tuple[int, int, int, int] | None:
    ys, xs = np.where(a > 8)
    if xs.size == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def keep_largest_opaque_component(a: np.ndarray, thresh: int = 12) -> np.ndarray:
    """Drop small alpha islands (UV debris); keep the biggest connected silhouette."""
    h, w = a.shape
    vis = np.zeros_like(a, dtype=bool)
    best: list[tuple[int, int]] = []
    for y in range(h):
        for x in range(w):
            if vis[y, x] or a[y, x] <= thresh:
                continue
            comp: list[tuple[int, int]] = []
            q: deque[tuple[int, int]] = deque([(y, x)])
            vis[y, x] = True
            while q:
                cy, cx = q.popleft()
                comp.append((cy, cx))
                for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    ny, nx = cy + dy, cx + dx
                    if (
                        ny < 0
                        or nx < 0
                        or ny >= h
                        or nx >= w
                        or vis[ny, nx]
                        or a[ny, nx] <= thresh
                    ):
                        continue
                    vis[ny, nx] = True
                    q.append((ny, nx))
            if len(comp) > len(best):
                best = comp
    out = np.zeros_like(a)
    for cy, cx in best:
        out[cy, cx] = a[cy, cx]
    return out


def crop_pad_rgba(im: Image.Image, pad: int = 6) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    a = arr[:, :, 3]
    bb = alpha_bbox(a)
    if bb is None:
        return im
    x0, y0, x1, y1 = bb
    h, w = arr.shape[:2]
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(w - 1, x1 + pad)
    y1 = min(h - 1, y1 + pad)
    return Image.fromarray(arr[y0 : y1 + 1, x0 : x1 + 1], "RGBA")


def process_interceptor(src: Path) -> Image.Image:
    """Strip UV-map hull from private-jet texture (border-connected background)."""
    arr = np.array(Image.open(src).convert("RGBA"))
    rgb = arr[:, :, :3]
    bg = flood_from_image_border(rgb, tol=28)
    out = arr.copy()
    out[bg, 3] = 0
    out[:, :, 3] = keep_largest_opaque_component(out[:, :, 3])
    return crop_pad_rgba(Image.fromarray(out, "RGBA"), pad=8)


def process_liner(src: Path) -> Image.Image:
    """Strip white UV hull; keep isolated passenger jet patch."""
    arr = np.array(Image.open(src).convert("RGBA"))
    rgb = arr[:, :, :3]
    bg = flood_from_image_border(rgb, tol=10)
    out = arr.copy()
    out[bg, 3] = 0
    out[:, :, 3] = keep_largest_opaque_component(out[:, :, 3])
    return crop_pad_rgba(Image.fromarray(out, "RGBA"), pad=8)


def process_cartoon(src: Path) -> Image.Image:
    """Isolate colored craft from grey studio backdrop (no sheet separation)."""
    rgb = np.array(Image.open(src).convert("RGB")).astype(np.float32)
    gray = rgb.mean(axis=2)
    chroma = (
        np.abs(rgb[:, :, 0] - gray)
        + np.abs(rgb[:, :, 1] - gray)
        + np.abs(rgb[:, :, 2] - gray)
    )
    mask = chroma > 12.0
    m = (mask.astype(np.uint8) * 255).reshape(mask.shape[0], mask.shape[1])
    m_img = Image.fromarray(m, mode="L")
    # Close small holes, smooth edges
    m_img = m_img.filter(ImageFilter.MaxFilter(3))
    m_img = m_img.filter(ImageFilter.MaxFilter(3))
    m_img = m_img.filter(ImageFilter.MinFilter(3))
    m_arr = np.array(m_img)
    rgba = np.zeros((*m_arr.shape, 4), dtype=np.uint8)
    orig = np.array(Image.open(src).convert("RGBA"))
    rgba[:, :, :3] = orig[:, :, :3]
    rgba[:, :, 3] = m_arr
    # Sheet / debris: keep a single connected aircraft silhouette
    rgba[:, :, 3] = keep_largest_opaque_component(rgba[:, :, 3])
    return crop_pad_rgba(Image.fromarray(rgba, "RGBA"), pad=6)


def process_fighter(src: Path) -> Image.Image:
    """
    WW2 fighter crops sometimes contain TWO stacked planes in one PNG.
    Keep only the largest 4-connected alpha blob so exactly one craft shows.
    """
    arr = np.array(Image.open(src).convert("RGBA"))
    a = arr[:, :, 3].astype(np.float32)
    # Gamma on alpha to reduce muddy halos
    a = np.clip(a / 255.0, 0, 1) ** 1.15 * 255.0
    arr[:, :, 3] = a.astype(np.uint8)
    # Hard cutoff of near-transparent pixels
    arr[arr[:, :, 3] < 14, 3] = 0
    arr[:, :, 3] = keep_largest_opaque_component(arr[:, :, 3])
    return crop_pad_rgba(Image.fromarray(arr, "RGBA"), pad=4)


def main() -> None:
    os.chdir(ROOT)
    jobs = [
        ("plane_interceptor_jet.png", process_interceptor),
        ("plane_liner.png", process_liner),
        ("plane_cartoon.png", process_cartoon),
        ("plane_cadet.png", process_fighter),
        ("plane_scout.png", process_fighter),
    ]
    for name, fn in jobs:
        path = OUT_DIR / name
        if not path.exists():
            print(f"skip missing {path}")
            continue
        out = fn(path)
        out.save(path, optimize=True)
        print(f"ok {name} -> {out.size}")


if __name__ == "__main__":
    main()
