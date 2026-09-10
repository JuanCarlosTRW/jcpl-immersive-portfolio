#!/usr/bin/env python3
"""Compose two fixed-size QA captures with unobtrusive corner labels."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


PANEL = (960, 600)


def font() -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in (
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, 28)
    return ImageFont.load_default()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("left", type=Path)
    parser.add_argument("right", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--left-label", required=True)
    parser.add_argument("--right-label", required=True)
    args = parser.parse_args()

    panels = []
    for source in (args.left, args.right):
        with Image.open(source) as image:
            panels.append(image.convert("RGB").resize(PANEL, Image.Resampling.LANCZOS))

    result = Image.new("RGB", (PANEL[0] * 2, PANEL[1]), "black")
    result.paste(panels[0], (0, 0))
    result.paste(panels[1], (PANEL[0], 0))
    draw = ImageDraw.Draw(result, "RGBA")
    label_font = font()
    for x, label in ((30, args.left_label), (PANEL[0] + 30, args.right_label)):
        bounds = draw.textbbox((x, 30), label, font=label_font)
        draw.rounded_rectangle(
            (bounds[0] - 13, bounds[1] - 9, bounds[2] + 13, bounds[3] + 9),
            radius=5,
            fill=(0, 0, 0, 176),
        )
        draw.text((x, 30), label, font=label_font, fill=(255, 255, 255, 255))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    result.save(args.output, "PNG", optimize=True)


if __name__ == "__main__":
    main()
