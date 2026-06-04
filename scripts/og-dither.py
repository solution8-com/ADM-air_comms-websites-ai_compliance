#!/usr/bin/env python3
"""Make public/og-image.png robust to social-platform JPEG recompression.

LinkedIn/Twitter/etc. re-encode shared images to JPEG. Smooth *dark* gradients
band badly under JPEG quantization, which reads as "grainy" / blotchy previews.
Adding a faint luminance dither before they compress gives JPEG uniform
high-frequency texture instead of sharp band edges, so the recompressed result
stays smooth. The grain is imperceptible at 1:1 (sigma ~4 on 0-255).

Run from the site root:  python3 scripts/og-dither.py
Idempotent enough for a one-shot fix; re-running just adds more grain.
"""
from PIL import Image, ImageChops
from pathlib import Path

SIGMA = 4  # luminance dither std-dev (0-255). Enough to defeat banding, stays invisible.
TARGET = Path("public/og-image.png")


def main() -> None:
    base = Image.open(TARGET).convert("RGB")
    w, h = base.size
    noise = Image.effect_noise((w, h), SIGMA)          # 'L', gaussian centred on 128
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    # result = base + (noise - 128): same noise on R/G/B = film-grain dither, no chroma speckle
    dithered = ImageChops.add(base, noise_rgb, 1.0, -128)
    dithered.save(TARGET, "PNG", optimize=True)
    print(f"✓ dithered {TARGET} ({w}x{h}, sigma={SIGMA})")


if __name__ == "__main__":
    main()
