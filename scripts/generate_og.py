#!/usr/bin/env python3
"""Generate public/og-image.png for the onepager portfolio (consistent across sites).

Layout (1200x630), reproduced identically for every site so they match:
- radial dark gradient, dithered so it survives social-platform JPEG recompression
  WITHOUT banding (smooth dark gradients otherwise read as "grainy" in LinkedIn previews)
- Space Grotesk Bold title, LEFT-aligned at x=80, anchored to a fixed BASELINE so the
  full-width accent rule sits just under the text on every site (NOT through the letters)
- centred muted subtitle + centred brand-colour domain
- decorative downward triangles: small accent (top-left) + two slate (top-right, bottom-left)

Usage:  python3 scripts/generate_og.py [site-key]
site-key defaults to this repo's site; one of {compliance, sikkerhed, governance}.
Requires Pillow. Downloads Space Grotesk (OFL) to a local cache on first run.
Re-run after editing title/subtitle/colour here.
"""
import os
import sys
import math
import urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageChops

# This repo's site (override via argv[1]):
DEFAULT_SITE = "compliance"

FONT_URL = "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
FONT_CACHE = os.path.expanduser("~/.cache/onepager-og/SpaceGrotesk.ttf")

W, H, SS = 1200, 630, 2
MARGIN = 80
BASELINE = 333
RULE_TOP, RULE_BOT = 332, 340
SUB_BASE, DOM_BASE = 400, 583
WHITE = (255, 255, 255)
SUBTITLE = (148, 166, 189)
SLATE = (38, 58, 88)
BG_CENTER, BG_EDGE = (23, 35, 61), (8, 14, 28)

SITES = {
    "compliance": dict(title="AI Compliance", accent=(41, 166, 136),
                        subtitle="Praktisk overblik · EU AI Act · ISO 42001 · NIST",
                        domain="ai-compliance.dk"),
    "sikkerhed":  dict(title="AI Sikkerhed", accent=(245, 158, 11),
                        subtitle="AI Risici · MIT AI Risk Repository · OWASP",
                        domain="ai-sikkerhed.dk"),
    "governance": dict(title="AI Governance", accent=(60, 120, 230),
                        subtitle="Organisering · Udvikling · Drift",
                        domain="ai-governance.dk"),
}

# Per-tool titles (slug -> title), kept in sync with toolsMeta in the data file.
# Each becomes public/og-tool-<slug>.png so a shared tool link gets its own preview.
TOOLS = {
    "compliance": {
        "ai-act-tidslinje": "AI Act-tidslinje",
        "sektor-matrix": "Sektor × regulering-matrix",
        "boedestruktur": "Bødestruktur",
        "dokumentations-kort": "Dokumentationskort",
    },
    "sikkerhed": {
        "risiko-adoption": "Risiko × adoptionsfase",
        "trusselsaktoer-matrix": "Trusselsaktør × AI-aktiv",
        "mitigation-radar": "Mitigation-modenhedsradar",
    },
    "governance": {
        "use-case-livscyklus": "Use case-livscyklus",
        "ai-council-raci": "AI Council RACI",
        "agent-runtime-control-plane": "Agent runtime control-plane",
        "governance-modenhed": "Governance-modenhedsradar",
    },
}


def font_path():
    if not os.path.exists(FONT_CACHE):
        os.makedirs(os.path.dirname(FONT_CACHE), exist_ok=True)
        print("downloading Space Grotesk …")
        urllib.request.urlretrieve(FONT_URL, FONT_CACHE)
    return FONT_CACHE


def load(fp, size, wght):
    f = ImageFont.truetype(fp, size)
    try:
        f.set_variation_by_axes([wght])
    except Exception:
        pass
    return f


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def radial_bg(w, h):
    gw, gh = w // 4, h // 4
    g = Image.new("RGB", (gw, gh)); gp = g.load()
    cx, cy = gw / 2, gh / 2; maxd = math.hypot(cx, cy)
    for y in range(gh):
        for x in range(gw):
            d = min(1.0, (math.hypot(x - cx, y - cy) / maxd) ** 1.15)
            gp[x, y] = lerp(BG_CENTER, BG_EDGE, d)
    return g.resize((w, h), Image.BILINEAR)


def tri(d, x0, y0, w, h, fill):
    d.polygon([(x0, y0), (x0 + w, y0), (x0 + w / 2, y0 + h)], fill=fill)


def fit_size(fp, text, target_w, hi=200):
    lo, best = 40, 40
    while lo <= hi:
        mid = (lo + hi) // 2
        if load(fp, mid, 700).getbbox(text)[2] <= target_w:
            best, lo = mid, mid + 1
        else:
            hi = mid - 1
    return best


def render_og(out, fp, accent, title, title_size, subtitle, domain, eyebrow=None):
    """Render one 1200x630 OG image (shared layout for the site image and the
    per-tool images). eyebrow = small uppercase accent line above the title."""
    img = radial_bg(W * SS, H * SS)
    d = ImageDraw.Draw(img, "RGBA")
    def S(v): return int(v * SS)

    tri(d, S(142), S(96), S(66), S(66), accent)
    tri(d, S(1006), S(58), S(164), S(205), SLATE)
    tri(d, S(62), S(416), S(166), S(206), SLATE)

    if eyebrow:
        d.text((S(MARGIN), S(232)), eyebrow, font=load(fp, 24 * SS, 600), fill=accent, anchor="ls")
    d.text((S(MARGIN), S(BASELINE)), title, font=load(fp, title_size * SS, 700), fill=WHITE, anchor="ls")
    d.rectangle([S(MARGIN), S(RULE_TOP), S(W - MARGIN), S(RULE_BOT)], fill=accent)
    d.text((S(W / 2), S(SUB_BASE)), subtitle, font=load(fp, 32 * SS, 500), fill=SUBTITLE, anchor="ms")
    d.text((S(W / 2), S(DOM_BASE)), domain, font=load(fp, 34 * SS, 600), fill=accent, anchor="ms")

    img = img.resize((W, H), Image.LANCZOS)
    noise = Image.merge("RGB", [Image.effect_noise((W, H), 4)] * 3)
    img = ImageChops.add(img.convert("RGB"), noise, 1.0, -128)
    img.save(out, "PNG", optimize=True)


def main():
    key = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SITE
    s = SITES[key]; accent = s["accent"]
    fp = font_path()

    # Site image — one title size shared by all sites (fits the widest title).
    site_size = min(fit_size(fp, st["title"], W - 2 * MARGIN) for st in SITES.values())
    render_og("public/og-image.png", fp, accent, s["title"], site_size, s["subtitle"], s["domain"])
    print(f"✓ {key} -> public/og-image.png (title size {site_size})")

    # Per-tool images — title fit-to-width per tool (titles vary in length).
    sub = f"{s['title']} · interaktivt værktøj"
    for slug, title in TOOLS.get(key, {}).items():
        tsize = fit_size(fp, title, W - 2 * MARGIN, hi=104)
        render_og(f"public/og-tool-{slug}.png", fp, accent, title, tsize, sub, s["domain"], eyebrow="VÆRKTØJ")
        print(f"  ✓ og-tool-{slug}.png (title size {tsize})")


if __name__ == "__main__":
    main()
