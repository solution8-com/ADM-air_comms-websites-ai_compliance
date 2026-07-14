#!/usr/bin/env python3
"""Generate the SIGNAL OG images for an onepager site (main + per-tool previews).

SIGNAL layout (1200x630), identical across sites:
- flat Sort (#0A0A0A) background (no gradient/triangles)
- Archivo 800 wordmark; the site card renders "AI" in Signalrod + the topic in Hvid,
  the tool cards render a grey "VAERKTOJ" eyebrow + the tool title in Hvid
- thin graa-linje rule under the title
- IBM Plex Mono grey descriptor + grey domain (bottom-left)
- SOLUTION8.ai lockup bottom-right (".ai" in Signalrod)
- subtle luminance dither so smooth darks survive social-platform JPEG recompression

Fonts are converted at runtime from this repo's own public/fonts/*.woff2 (no external
download), so the output matches the deployed site exactly and is fully reproducible.

Usage (site key inferred from the repo folder name, e.g. ai-compliance -> compliance):
    uv run --with fonttools --with brotli --with pillow python scripts/generate_og.py [site-key]
Re-run after editing a title/subtitle/tool here.
"""
import os
import sys
import tempfile
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageChops

W, H, SS = 1200, 630, 2
MARGIN = 80
SORT = (10, 10, 10)
HVID = (255, 255, 255)
ROED = (227, 36, 27)
GRAA = (138, 138, 138)
LINJE = (38, 38, 38)

SITES = {
    "compliance": dict(title="AI Compliance", subtitle="Praktisk overblik  ·  EU AI Act  ·  ISO 42001  ·  NIST", domain="ai-compliance.dk"),
    "sikkerhed":  dict(title="AI Sikkerhed",  subtitle="AI-risici  ·  MIT AI Risk Repository  ·  OWASP", domain="ai-sikkerhed.dk"),
    "governance": dict(title="AI Governance", subtitle="Organisering  ·  Udvikling  ·  Drift", domain="ai-governance.dk"),
}

# Per-tool titles (slug -> title), kept in sync with the data file. Each becomes
# public/og-tool-<slug>.png so a shared tool link gets its own preview.
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


def _to_ttf(woff2, tmp):
    f = TTFont(woff2)
    f.flavor = None
    out = os.path.join(tmp, os.path.basename(woff2) + ".ttf")
    f.save(out)
    return out


def infer_key():
    if len(sys.argv) > 1:
        return sys.argv[1]
    base = os.path.basename(os.getcwd())
    return base[3:] if base.startswith("ai-") else base


def archivo(fp, size, wght=800):
    f = ImageFont.truetype(fp, size)
    try:
        f.set_variation_by_axes([wght])
    except Exception:
        pass
    return f


def fit(draw, fp, text, target_w, hi):
    lo, best = 48, 48
    while lo <= hi:
        mid = (lo + hi) // 2
        if draw.textlength(text, font=archivo(fp, mid)) <= target_w:
            best, lo = mid, mid + 1
        else:
            hi = mid - 1
    return best


def render(out, arch, monop, title, size, subtitle, domain, wordmark=False, eyebrow=None):
    img = Image.new("RGB", (W * SS, H * SS), SORT)
    d = ImageDraw.Draw(img)

    def S(v):
        return int(v * SS)

    mono = lambda px: ImageFont.truetype(monop, int(px * SS))
    base_y = 315 if eyebrow else 300

    if eyebrow:
        d.text((S(MARGIN), S(base_y - 74)), eyebrow, font=mono(22), fill=GRAA, anchor="ls")

    tf = archivo(arch, size * SS)
    if wordmark and title.startswith("AI "):
        d.text((S(MARGIN), S(base_y)), "AI", font=tf, fill=ROED, anchor="ls")
        ai_w = d.textlength("AI", font=tf)
        d.text((S(MARGIN) + ai_w, S(base_y)), title[2:], font=tf, fill=HVID, anchor="ls")
    else:
        d.text((S(MARGIN), S(base_y)), title, font=tf, fill=HVID, anchor="ls")

    d.rectangle([S(MARGIN), S(base_y + 26), S(W - MARGIN), S(base_y + 30)], fill=LINJE)
    d.text((S(MARGIN), S(base_y + 78)), subtitle, font=mono(30), fill=GRAA, anchor="ls")

    # bottom row: domain (left) + SOLUTION8.ai lockup (right)
    d.text((S(MARGIN), S(H - 60)), domain, font=mono(30), fill=GRAA, anchor="ls")
    lock = archivo(arch, int(30 * SS), 800)
    dot_w = d.textlength(".ai", font=lock)
    s8_w = d.textlength("SOLUTION8", font=lock)
    right = S(W - MARGIN)
    d.text((right - dot_w, S(H - 60)), ".ai", font=lock, fill=ROED, anchor="ls")
    d.text((right - dot_w - s8_w, S(H - 60)), "SOLUTION8", font=lock, fill=HVID, anchor="ls")

    img = img.resize((W, H), Image.LANCZOS)
    noise = Image.merge("RGB", [Image.effect_noise((W, H), 3)] * 3)
    img = ImageChops.add(img.convert("RGB"), noise, 1.0, -128)
    img.save(out, "PNG", optimize=True)


def main():
    key = infer_key()
    s = SITES[key]
    with tempfile.TemporaryDirectory() as tmp:
        arch = _to_ttf("public/fonts/archivo-latin.woff2", tmp)
        monop = _to_ttf("public/fonts/ibm-plex-mono-400-latin.woff2", tmp)
        d0 = ImageDraw.Draw(Image.new("RGB", (10, 10)))

        # Site card: one wordmark size shared across the three site titles.
        site_size = min(fit(d0, arch, st["title"], W - 2 * MARGIN, hi=140) for st in SITES.values())
        render("public/og-image.png", arch, monop, s["title"], site_size,
               s["subtitle"], s["domain"], wordmark=True)
        print(f"✓ {key} -> public/og-image.png (size {site_size})")

        # Tool cards: title fit per tool; grey VÆRKTØJ eyebrow; site name in the descriptor.
        sub = f"{s['title']}  ·  interaktivt værktøj"
        for slug, title in TOOLS.get(key, {}).items():
            tsize = fit(d0, arch, title, W - 2 * MARGIN, hi=96)
            render(f"public/og-tool-{slug}.png", arch, monop, title, tsize,
                   sub, s["domain"], wordmark=False, eyebrow="VÆRKTØJ")
            print(f"  ✓ og-tool-{slug}.png (size {tsize})")


if __name__ == "__main__":
    main()
