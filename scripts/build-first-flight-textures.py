#!/usr/bin/env python3
"""Build web-ready, tileable base-color, OpenGL normal and roughness maps."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps


SIZE = 1024
SEAM_WIDTH = 88


def smoothstep(value: float) -> float:
    return value * value * (3.0 - 2.0 * value)


def close_seams(image: Image.Image) -> Image.Image:
    """Blend opposing border pairs while keeping the texture center untouched."""
    output = image.copy()
    pixels = output.load()
    width, height = output.size

    for y in range(height):
        for x in range(SEAM_WIDTH):
            weight = smoothstep(x / (SEAM_WIDTH - 1))
            left = pixels[x, y]
            right = pixels[width - 1 - x, y]
            mean = tuple(round((a + b) * 0.5) for a, b in zip(left, right))
            pixels[x, y] = tuple(
                round(mean[channel] * (1 - weight) + left[channel] * weight)
                for channel in range(3)
            )
            pixels[width - 1 - x, y] = tuple(
                round(mean[channel] * (1 - weight) + right[channel] * weight)
                for channel in range(3)
            )

    for x in range(width):
        for y in range(SEAM_WIDTH):
            weight = smoothstep(y / (SEAM_WIDTH - 1))
            top = pixels[x, y]
            bottom = pixels[x, height - 1 - y]
            mean = tuple(round((a + b) * 0.5) for a, b in zip(top, bottom))
            pixels[x, y] = tuple(
                round(mean[channel] * (1 - weight) + top[channel] * weight)
                for channel in range(3)
            )
            pixels[x, height - 1 - y] = tuple(
                round(mean[channel] * (1 - weight) + bottom[channel] * weight)
                for channel in range(3)
            )

    return output


def normal_map(height: Image.Image, strength: float) -> Image.Image:
    source = height.load()
    width, height_px = height.size
    output = Image.new("RGB", height.size)
    target = output.load()

    for y in range(height_px):
        up = (y - 1) % height_px
        down = (y + 1) % height_px
        for x in range(width):
            left = (x - 1) % width
            right = (x + 1) % width
            dx = (source[right, y] - source[left, y]) / 255.0
            dy = (source[x, down] - source[x, up]) / 255.0
            nx = -dx * strength
            ny = dy * strength
            nz = 1.0
            length = math.sqrt(nx * nx + ny * ny + nz * nz)
            target[x, y] = (
                round((nx / length * 0.5 + 0.5) * 255),
                round((ny / length * 0.5 + 0.5) * 255),
                round((nz / length * 0.5 + 0.5) * 255),
            )

    return output


def roughness_map(gray: Image.Image, matte_bias: int) -> Image.Image:
    broad = gray.filter(ImageFilter.GaussianBlur(8.0))
    detail = ImageChops.difference(gray, broad)
    gray_pixels = gray.load()
    detail_pixels = detail.load()
    output = Image.new("L", gray.size)
    target = output.load()

    for y in range(gray.height):
        for x in range(gray.width):
            mineral = (128 - gray_pixels[x, y]) * 0.1
            micro = detail_pixels[x, y] * 0.45
            value = round(matte_bias + mineral + micro)
            target[x, y] = max(155, min(244, value))

    return output


def build(source: Path, destination: Path, name: str, *, rock: bool) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as loaded:
        base = ImageOps.fit(
            loaded.convert("RGB"),
            (SIZE, SIZE),
            method=Image.Resampling.LANCZOS,
        )
    base = close_seams(base)
    base = ImageEnhance.Color(base).enhance(0.72 if rock else 0.62)
    base = ImageEnhance.Contrast(base).enhance(0.96)
    base = ImageEnhance.Brightness(base).enhance(1.04 if rock else 1.1)
    base.save(destination / f"{name}-basecolor.webp", "WEBP", quality=88, method=6)

    gray = ImageOps.autocontrast(base.convert("L"), cutoff=2)
    height = gray.filter(ImageFilter.GaussianBlur(0.55 if rock else 0.8))
    normal_map(height, 4.3 if rock else 3.2).save(
        destination / f"{name}-normal-gl.png", optimize=True
    )
    roughness_map(gray, 218 if rock else 205).save(
        destination / f"{name}-roughness.png", optimize=True
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("name")
    parser.add_argument("--rock", action="store_true")
    args = parser.parse_args()
    build(args.source, args.destination, args.name, rock=args.rock)


if __name__ == "__main__":
    main()
