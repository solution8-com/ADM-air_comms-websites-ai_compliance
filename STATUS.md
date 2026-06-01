# ai-compliance.dk — project status

**Last updated:** 2026-06-01 (post audit + viz + search upgrade)

## At a glance

| | |
|---|---|
| **Live URL** | https://ai-compliance.dk (HTTPS via Let's Encrypt) |
| **Netlify site** | ai-compliance.netlify.app |
| **GitHub repo** | https://github.com/solution8-com/ai-compliance |
| **Brand color** | Teal HSL(168°, 60%, 40%) ≈ #29A688 |
| **Topic** | "What regulations must I follow?" (compliance, not governance) |
| **Status** | ✅ Live, content verified against Digst, OG preview working |

## Content scope

- **3 pillars:** Lovkrav & Sanktioner / Standarder & Bevisførelse / Drift & Governance
- **13 categories**
- **54 sub-items** (most comprehensive on Forbudte AI-praksisser with 8 items covering all of EU AI Act Article 5)
- Source frameworks: EU AI Act, ISO/IEC 42001, NIST AI RMF, GDPR/EDPB Opinion 28/2024, Datatilsynet, Digitaliseringsstyrelsen, NIS2, DORA, OECD, Council of Europe Framework Convention, OWASP, Finanstilsynet

## Key technical bits

- **Stack:** Vite + React + TS + Tailwind + shadcn/ui (Lovable export, modernized)
- **Data file:** `src/data/complianceData.ts` — uses domain-neutral types (Severity, PillarId, Category, Subcategory, actions, sourceLinks)
- **CTAs:** MailerLite form (shared with sikkerhed/governance for now — form id `189012812467536974`) + Calendly `https://calendly.com/ai-raadgivning_jacob/30min?month=2026-06`
- **DNS at GoDaddy:** A `@ → 75.2.60.5`, CNAME `www → ai-compliance.netlify.app`
- **Auto-deploy:** every `git push` to main triggers Netlify rebuild

## Build commands

```bash
npm install              # install deps
npm run dev -- --port 8080   # dev server (this is the standard port for compliance in this workspace)
npm run build            # production build → dist/
```

## Audit-driven refresh (2026-06-01)

Content audit revealed several post-build regulatory developments. All shipped via commits c5b22b0 → 94f12c3 → e619950:

- **AI Omnibus (7 May 2026)** — high-risk deadlines deferred to 2 Dec 2027 (Annex III) / 2 Aug 2028 (Annex I). Hero copy, pillar 1 description, Højrisiko description, and EU AI Act source card all updated.
- **NCII/CSAM** added as 9th forbidden practice (post-Omnibus addition).
- **GPAI Code of Practice** wording corrected — was "forventet", now reflects 10 July 2025 finalisation + 1 Aug 2025 Commission endorsement.
- **Council of Europe Framework Convention** added as new subcategory under Tilstødende lovgivning (the previously orphan `COE_FCAI` constant is now actually used). EU ratified 15 May 2026.
- **ISO/IEC 42005:2025** (AI Impact Assessment, May 2025) added as new subcategory under AI Management System category.
- **NIS2-loven LOV 434/2025** referenced (in force 1 July 2025, registration deadline was 1 October 2025).
- **DORA** updated: Finanstilsynet Register-of-Information deadline 31 March 2026 noted (passed); 2026 theme inspection of forsikring/pension forthcoming.
- **Datatilsynet AI podcast** (Feb 2026) added to konsekvensanalyser sourceLinks.
- **CEN-CENELEC harmoniserede standarder** description updated: Q4 2026 target after Oct 2025 accelerated delivery decision.
- **Translation fix:** "konsentforhold" → "samtykke til træningsdata" (typo from earlier).
- New URL constants added: `ISO_42005`, `NIS2_LOVEN`, `EDPB_EDPS_OMNIBUS`, `DATATILSYNET_PODCAST`, `FINANSTILSYNET_DORA`, `AI_OMNIBUS_AGREEMENT`.

## Known issues / open items

- [ ] **MailerLite form is shared with sikkerhed + governance.** Topic segmentation in MailerLite has to happen post-hoc by signup date. Fix: create a compliance-specific form in MailerLite and swap the `MAILERLITE_ACTION` constant in `src/pages/Index.tsx`.
- [ ] **2 moderate npm dependency vulnerabilities** (transitive, low-risk for a static info site). `npm audit fix` when convenient.
- [ ] **Prerendering not added** — only do this if Google indexing turns out slow. Check `site:ai-compliance.dk` in a few weeks.

## Identified content gaps (next round)

From audit — not yet shipped:
- [ ] Bødestruktur as its own subcategory (€35M/7%, €15M/3%, €7.5M/1.5% tiers)
- [ ] GPAI deployer-pligter ved finetuning (downstream crosses 10²⁵ FLOPs)
- [ ] Sektor-overlay matrix as visualization (sector × regulations)
- [ ] EU AI Act timeline strip visualization (top of page, "you are here")
- [ ] DPIA + FRIA decision tree
- [ ] Penalty tier visual

## Recent commits

```
56f393a Replace og-image with compliance-branded version
5b82ea3 Update favicon to match sikkerhed design with teal brand accent
7741a0e Redesign og-image with clean minimal layout
d4a22db Sharpen og-image text via 2x super-sampling
c078e34 Rename CTA buttons to "Book et møde"
a390373 Initial commit: ai-compliance.dk one-pager
```

## Content audit notes (from Jacob's review cycle on 2026-05-31)

First draft had gaps: 4 of 8 Article 5 prohibited practices, missing risk management system (Art 9) / data governance (Art 10) / technical documentation (Art 11), and the entire Transparency Obligations (Art 50) category. All fixed in commit shipping `Forbudte AI-praksisser` to 8 items, `Højrisiko-systemer` to 7 items, and adding `Gennemsigtighedsforpligtelser` category with 6 items.

## Next-session quick start

```bash
cd /Users/jacobsmacbookair/projects/websites/onepagers/ai-compliance
npm run dev -- --port 8080
# Open http://localhost:8080
```

If touching content, edit `src/data/complianceData.ts`. If touching CTAs, edit `src/pages/Index.tsx`. If touching theme colors, edit `src/index.css`.
