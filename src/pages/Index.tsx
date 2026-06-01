import { useState, useMemo, useRef, useEffect, type FormEvent } from "react";
import logo from "@/assets/logo.png";
import { ExternalLink, ChevronRight, ChevronDown, ArrowLeft, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  pillars,
  categories,
  getCategoriesByPillar,
  getSeverityColor,
  getSeverityBg,
  type PillarId,
  type Category,
  type Subcategory,
  type SourceType,
} from "@/data/complianceData";

type View = "dashboard" | "pillar" | "category" | "subcategory";

const CALENDLY_URL = "https://calendly.com/ai-raadgivning_jacob/30min?month=2026-06";

const getSourceBadgeClass = (source: SourceType): string => {
  switch (source) {
    case "EU AI Act":
    case "Digst":
      return "bg-primary/15 text-primary";
    case "ISO":
    case "NIST":
      return "bg-info/15 text-info";
    case "GDPR/EDPB":
    case "Datatilsynet":
      return "bg-warning/15 text-warning";
    case "DORA":
    case "NIS2":
    case "CoE":
    default:
      return "bg-secondary text-foreground";
  }
};

const pillarName = (id: PillarId) => pillars.find((p) => p.id === id)?.name ?? id;

type SearchResult =
  | { kind: "category"; item: Category }
  | { kind: "subcategory"; item: Subcategory; parent: Category };

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded bg-primary/25 px-0.5 text-foreground">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const Index = () => {
  const [view, setView] = useState<View>("dashboard");
  const [selectedPillar, setSelectedPillar] = useState<PillarId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = (
    newView: View,
    pillar?: PillarId,
    category?: Category,
    subcategory?: Subcategory
  ) => {
    setView(newView);
    if (pillar !== undefined) setSelectedPillar(pillar);
    if (category !== undefined) setSelectedCategory(category);
    if (subcategory !== undefined) setSelectedSubcategory(subcategory);
  };

  const goBack = () => {
    if (view === "subcategory") navigate("category");
    else if (view === "category") navigate("pillar");
    else if (view === "pillar") navigate("dashboard");
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const out: SearchResult[] = [];
    categories.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        out.push({ kind: "category", item: c });
      }
      c.subcategories.forEach((s) => {
        if (
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
        ) {
          out.push({ kind: "subcategory", item: s, parent: c });
        }
      });
    });
    return out;
  }, [searchQuery]);
  const categoryHits = searchResults.filter((r) => r.kind === "category");
  const subcategoryHits = searchResults.filter((r) => r.kind === "subcategory");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("dashboard")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <img src={logo} alt="AI Compliance" className="h-14" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Søg i compliance-krav..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 rounded-md border border-border bg-secondary pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground sm:flex">⌘K</kbd>
            </div>
            <div className="flex gap-2">
              <a
                href="https://digst.dk/tilsyn/ai-forordningen/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Digst <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://www.datatilsynet.dk/regler-og-vejledning/kunstig-intelligens"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Datatilsynet <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Book et møde
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Søgeresultater */}
        {searchQuery && (
          <div className="fade-in mb-8">
            <h2 className="mb-4 font-display text-lg text-foreground">
              Søgeresultater for "{searchQuery}"
              <span className="ml-2 text-sm text-muted-foreground">
                ({categoryHits.length} områder · {subcategoryHits.length} krav)
              </span>
            </h2>
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen compliance-krav matcher din søgning.</p>
            ) : (
              <>
                {categoryHits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Områder ({categoryHits.length})</h3>
                    <div className="grid gap-3">
                      {categoryHits.map((r) => r.kind === "category" && (
                        <button
                          key={r.item.id}
                          onClick={() => {
                            setSearchQuery("");
                            navigate("category", r.item.pillar, r.item);
                          }}
                          className="card-hover flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left"
                        >
                          <span className="text-2xl">{r.item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-semibold text-foreground">
                              <Highlight text={r.item.name} query={searchQuery} />
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              <Highlight text={r.item.description} query={searchQuery} />
                            </p>
                          </div>
                          <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            {pillarName(r.item.pillar)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {subcategoryHits.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Konkrete krav ({subcategoryHits.length})</h3>
                    <div className="grid gap-2">
                      {subcategoryHits.map((r) => r.kind === "subcategory" && (
                        <button
                          key={`${r.parent.id}-${r.item.id}`}
                          onClick={() => {
                            setSearchQuery("");
                            navigate("subcategory", r.parent.pillar, r.parent, r.item);
                          }}
                          className="card-hover flex items-center gap-4 rounded-lg border border-border bg-card/60 p-3 text-left"
                        >
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${getSeverityColor(r.item.severity)}`}>
                            {r.item.severity === "critical" ? "kritisk" : r.item.severity === "high" ? "høj" : r.item.severity === "medium" ? "middel" : "lav"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-medium text-foreground">
                              <Highlight text={r.item.name} query={searchQuery} />
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {r.parent.icon} {r.parent.name} · <Highlight text={r.item.description} query={searchQuery} />
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Dashboard */}
        {!searchQuery && view === "dashboard" && <DashboardView onNavigate={navigate} />}
        {!searchQuery && view === "pillar" && selectedPillar && (
          <PillarView pillar={selectedPillar} onNavigate={navigate} onBack={goBack} />
        )}
        {!searchQuery && view === "category" && selectedCategory && (
          <CategoryView category={selectedCategory} onNavigate={navigate} onBack={goBack} />
        )}
        {!searchQuery && view === "subcategory" && selectedSubcategory && selectedCategory && (
          <SubcategoryView
            subcategory={selectedSubcategory}
            category={selectedCategory}
            onBack={goBack}
          />
        )}
      </main>

      {/* Newsletter + CTA strip */}
      <NewsletterCTA />

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-6">
        <div className="container mx-auto px-6 text-center text-xs text-muted-foreground">
          <p>
            Compliance-data baseret på{" "}
            <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EU AI Act (2024/1689)</a>,{" "}
            <a href="https://digst.dk/tilsyn/ai-forordningen/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Digitaliseringsstyrelsen</a>,{" "}
            <a href="https://www.datatilsynet.dk/regler-og-vejledning/kunstig-intelligens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Datatilsynet</a>,{" "}
            <a href="https://www.iso.org/standard/81230.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ISO/IEC 42001</a> og{" "}
            <a href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NIST AI RMF</a>.
          </p>
          <p className="mt-3">
            En oversigt fra{" "}
            <a href="https://ai-raadgivning.dk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AI Rådgivning</a>{" "}
            — opdateret maj 2026.
          </p>
        </div>
      </footer>
    </div>
  );
};

// ── Dashboard View ──
function DashboardView({ onNavigate }: { onNavigate: (v: View, p?: PillarId) => void }) {
  const totalItems = categories.reduce((sum, c) => sum + c.subcategories.length, 0);
  const criticalCount = categories.reduce(
    (sum, c) => sum + c.subcategories.filter((s) => s.severity === "critical").length,
    0
  );

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold text-foreground">
          AI Compliance <span className="text-primary text-glow">Overblik</span>
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Praktisk overblik over AI-compliance for danske organisationer — opdelt i Lovkrav, Standarder og Drift. Baseret på EU AI Act (Regulation 2024/1689), Digitaliseringsstyrelsens vejledninger, Datatilsynet, ISO/IEC 42001, NIST AI RMF og tilstødende EU-lovgivning. <span className="text-primary font-medium">AI Omnibus (7. maj 2026)</span> udskød højrisiko-fristerne til 2. december 2027 (Annex III) og 2. august 2028 (Annex I) — forpligtelserne består, kun timing ændres.
        </p>
      </div>

      {/* EU AI Act + tilstødende lovgivning — tidslinje */}
      <AiActTimeline />

      {/* Statistik */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: "Compliance-områder", value: categories.length, color: "text-foreground" },
          { label: "Sporede krav", value: totalItems, color: "text-info" },
          { label: "Kritiske krav", value: criticalCount, color: "text-danger" },
          { label: "Kilder", value: 7, color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-5 border-glow">
            <p className={`font-display text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Søjler */}
      <div className="grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => {
          const pillarCats = getCategoriesByPillar(pillar.id);
          const criticals = pillarCats.reduce(
            (sum, c) => sum + c.subcategories.filter((s) => s.severity === "critical").length,
            0
          );
          return (
            <button
              key={pillar.id}
              onClick={() => onNavigate("pillar", pillar.id)}
              className="card-hover group rounded-xl border border-border bg-card p-6 text-left"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl">{pillar.icon}</span>
                {criticals > 0 && (
                  <span className="risk-pulse rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-medium text-danger">
                    {criticals} kritiske
                  </span>
                )}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {pillar.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-primary/70">{pillar.subtitle}</p>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{pillar.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{pillarCats.length} områder</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Primære kilder */}
      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Primære kilder</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj"
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover flex items-start gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-[10px] font-bold text-primary text-center leading-tight">
              EU<br/>AI Act
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-foreground">EU AI Act</p>
              <p className="mt-1 text-xs text-muted-foreground">Regulation (EU) 2024/1689. Risiko-baseret regulering: forbudte, højrisiko, GPAI, transparens. Højrisiko-frister udskudt af AI Omnibus til 2. dec 2027 / 2. aug 2028.</p>
            </div>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
          <a
            href="https://digst.dk/tilsyn/ai-forordningen/"
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover flex items-start gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-[10px] font-bold text-primary text-center leading-tight">
              Digst
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-foreground">Digitaliseringsstyrelsen</p>
              <p className="mt-1 text-xs text-muted-foreground">Dansk koordinerende markedsovervågningsmyndighed for AI Act. DK var første EU-land med supplerende national AI-lov (maj 2025).</p>
            </div>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
          <a
            href="https://www.datatilsynet.dk/regler-og-vejledning/kunstig-intelligens"
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover flex items-start gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-warning/10 font-display text-[10px] font-bold text-warning text-center leading-tight">
              DT
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-foreground">Datatilsynet</p>
              <p className="mt-1 text-xs text-muted-foreground">GDPR-overlap, konsekvensanalyse-skabeloner, regulatorisk sandkasse (sammen med Digst). Markedsovervågningsmyndighed på databeskyttelses-områderne.</p>
            </div>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
          <a
            href="https://www.iso.org/standard/81230.html"
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover flex items-start gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-info/10 font-display text-[10px] font-bold text-info text-center leading-tight">
              ISO<br/>42001
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-foreground">ISO/IEC 42001:2023</p>
              <p className="mt-1 text-xs text-muted-foreground">Certificerbar standard for AI Management Systems (AIMS). De facto compliance-bevis over for tilsyn og kunder.</p>
            </div>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
          <a
            href="https://www.nist.gov/itl/ai-risk-management-framework"
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover flex items-start gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-info/10 font-display text-[10px] font-bold text-info text-center leading-tight">
              NIST<br/>RMF
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-foreground">NIST AI RMF</p>
              <p className="mt-1 text-xs text-muted-foreground">Govern–Map–Measure–Manage. GenAI-profil (NIST AI 600-1) tilføjer 200+ kontroller for LLM-systemer.</p>
            </div>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
          <a
            href="https://www.edpb.europa.eu/our-work-tools/our-documents/opinion-board-art-64/opinion-282024-certain-data-protection-aspects_en"
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover flex items-start gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-warning/10 font-display text-[10px] font-bold text-warning text-center leading-tight">
              EDPB<br/>Op28
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-foreground">EDPB Opinion 28/2024</p>
              <p className="mt-1 text-xs text-muted-foreground">Lovligt retsgrundlag for AI-træning, anonymitet af trænede modeller og konsekvenser af ulovlig træningsdata.</p>
            </div>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── EU AI Act + tilstødende lovgivning — horizontal timeline ──
type TimelineEvent = {
  date: string;
  label: string;
  title: string;
  note: string;
  detail: string;
  sources: { label: string; url: string }[];
};

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    date: "2025-02-02",
    label: "2. feb 2025",
    title: "Forbudte praksisser + AI-literacy",
    note: "Art. 4 + 5 i kraft",
    detail: "Artikel 5 (forbudte AI-praksisser — social scoring, manipulation, biometrisk fjernidentifikation til retshåndhævelse m.fl.) og Artikel 4 (AI-literacy-krav til alle udbydere og idriftsættere) trådte i kraft som de første dele af AI-forordningen. Overtrædelse af Art. 5 udløser den højeste bødeklasse: op til 35 mio. EUR eller 7 % af global omsætning. AI-literacy-kravet er allerede håndhævet — Datatilsynet og Digst kan bede om dokumentation for at medarbejdere har modtaget træning.",
    sources: [
      { label: "EU AI Act Art. 5", url: "https://artificialintelligenceact.eu/article/5/" },
      { label: "EU AI Act Art. 4", url: "https://artificialintelligenceact.eu/article/4/" },
      { label: "Digst: Forbudte praksisser", url: "https://digst.dk/tilsyn/ai-forordningen/reglerne-i-ai-forordningen/forbudte-former-for-ai-praksis/" },
    ],
  },
  {
    date: "2025-08-02",
    label: "2. aug 2025",
    title: "GPAI + governance + bøder",
    note: "Kap. V + sanktionsregime",
    detail: "Kapitel V (General-Purpose AI) trådte i kraft for nye GPAI-modeller. Omfatter teknisk dokumentation, træningsdata-resumé, copyright-policy. Samtidig blev sanktionsregimet og governance-strukturen (AI Office, AI Board, national tilsyn) operationelt. Den frivillige GPAI Code of Practice blev finaliseret 10. juli 2025 og endosseret af Kommissionen 1. august.",
    sources: [
      { label: "EU AI Act Kapitel V (Art. 51-56)", url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj" },
      { label: "GPAI Code of Practice", url: "https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai" },
      { label: "Digst: AI-modeller til almen brug", url: "https://digst.dk/tilsyn/ai-forordningen/reglerne-i-ai-forordningen/ai-modeller-til-almen-brug/" },
    ],
  },
  {
    date: "2026-03-31",
    label: "31. mar 2026",
    title: "DORA Register-of-Information",
    note: "Finanstilsynet-frist (passeret)",
    detail: "Første indleveringsfrist for finansielle virksomheders DORA Register of Information til Finanstilsynet. Registret skal eksplicit dække alle ICT-third-party-leverandører — herunder AI-leverandører. Forsikrings- og pensionssektor får temainspektion publiceret forår 2026. For danske banker er DORA ofte mere kortsigtet kritisk end AI Act.",
    sources: [
      { label: "DORA Regulation 2022/2554", url: "https://eur-lex.europa.eu/eli/reg/2022/2554/oj" },
      { label: "Finanstilsynet: DORA-tilsyn", url: "https://www.finanstilsynet.dk/finansielle-temaer/tilsyn-med-ikt-og-datasikkerhed/" },
    ],
  },
  {
    date: "2026-05-07",
    label: "7. maj 2026",
    title: "AI Omnibus-aftale",
    note: "Højrisiko-deadlines udskudt",
    detail: "EU Council og Parlament nåede politisk aftale om AI Omnibus 7. maj 2026. Højrisiko-fristerne blev udskudt: Annex III standalone-systemer til 2. december 2027 (var aug 2026); Annex I indlejrede systemer til 2. august 2028 (var aug 2027). NCII/CSAM (\"nudifiers\") blev tilføjet som ny forbudt praksis. Formel vedtagelse forventes primo juni 2026. Forpligtelserne består — kun timing ændres.",
    sources: [
      { label: "Council of EU: AI Omnibus pressemeddelelse", url: "https://www.consilium.europa.eu/en/press/press-releases/2026/05/07/artificial-intelligence-council-and-parliament-agree-to-simplify-and-streamline-rules/" },
      { label: "Digst: AI-tilsyn (med Omnibus-banner)", url: "https://digst.dk/tilsyn/ai-forordningen/" },
    ],
  },
  {
    date: "2026-08-02",
    label: "2. aug 2026",
    title: "Gennemsigtighedskrav (Art. 50)",
    note: "Chatbot + deepfake + AI-mærkning",
    detail: "Artikel 50 træder i kraft. Krav om: chatbot-disclosure (\"du taler med en AI\"), maskinlæsbar mærkning af AI-genereret indhold (watermarks / C2PA / SynthID), underretning ved følelsesgenkendelse og biometrisk kategorisering, deepfake-disclosure i marketing-content, og mærkning af AI-genereret offentlig tekst (medmindre redaktionelt gennemgået).",
    sources: [
      { label: "EU AI Act Art. 50", url: "https://artificialintelligenceact.eu/article/50/" },
      { label: "Digst: Gennemsigtighedsforpligtelser", url: "https://digst.dk/tilsyn/ai-forordningen/reglerne-i-ai-forordningen/gennemsigtighedsforpligtelser-for-visse-ai-systemer/" },
    ],
  },
  {
    date: "2027-12-02",
    label: "2. dec 2027",
    title: "Annex III højrisiko",
    note: "Hovedparten af art. 26-pligter",
    detail: "Annex III højrisiko-systemer (8 områder: biometri/følelsesgenkendelse, kritisk infrastruktur, uddannelse, beskæftigelse, væsentlige tjenester, retshåndhævelse, migration, justits/demokrati) bliver fuldt regulerede. Deployer-pligter under Art. 26 (menneskelig oversight, FRIA hvor relevant, EU-database registrering, hændelsesrapportering) bliver håndhævelige. CE-mærkning, conformity assessment og kvalitetsstyringssystem skal være på plads. Bødeloft €15M / 3 % global omsætning.",
    sources: [
      { label: "EU AI Act Art. 26", url: "https://artificialintelligenceact.eu/article/26/" },
      { label: "EU AI Act Annex III", url: "https://artificialintelligenceact.eu/annex/3/" },
      { label: "Digst: Højrisiko AI-systemer", url: "https://digst.dk/tilsyn/ai-forordningen/reglerne-i-ai-forordningen/hoejrisiko-ai-systemer/" },
    ],
  },
  {
    date: "2028-08-02",
    label: "2. aug 2028",
    title: "Annex I højrisiko",
    note: "Indlejrede systemer + GPAI legacy",
    detail: "Annex I-systemer (AI som sikkerhedskomponenter i regulerede produkter: medicinsk udstyr, maskiner, legetøj, biler, etc.) bliver underlagt AI Act. Også GPAI-modeller markedsført før 2. august 2025 skal være compliant senest denne dato. Annex I-systemer skal CE-mærkes både efter eksisterende produktlovgivning OG AI Act.",
    sources: [
      { label: "EU AI Act Annex I", url: "https://artificialintelligenceact.eu/annex/1/" },
      { label: "EU AI Act Art. 113 (datoer)", url: "https://artificialintelligenceact.eu/article/113/" },
    ],
  },
];

function AiActTimeline() {
  // Auto-refresh "today" once an hour so the marker doesn't drift on long sessions
  const [today, setToday] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setToday(new Date()), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const [selected, setSelected] = useState<TimelineEvent | null>(null);

  // Compute "today" position on a column-center scale (events are equally spaced)
  // Each event center sits at (i + 0.5) / N * 100%
  const events = TIMELINE_EVENTS;
  const N = events.length;
  const eventCenter = (i: number) => ((i + 0.5) / N) * 100;
  const todayTs = today.getTime();
  const firstTs = new Date(events[0].date).getTime();
  const lastTs = new Date(events[N - 1].date).getTime();
  let todayPercent: number;
  if (todayTs <= firstTs) {
    todayPercent = eventCenter(0);
  } else if (todayTs >= lastTs) {
    todayPercent = eventCenter(N - 1);
  } else {
    // Find which two events we're between, then interpolate between their centers
    let idx = 0;
    for (let i = 0; i < N - 1; i++) {
      const a = new Date(events[i].date).getTime();
      const b = new Date(events[i + 1].date).getTime();
      if (todayTs >= a && todayTs < b) {
        idx = i;
        const frac = (todayTs - a) / (b - a);
        todayPercent = eventCenter(i) + frac * (eventCenter(i + 1) - eventCenter(i));
        break;
      }
    }
    todayPercent = todayPercent! ?? eventCenter(idx);
  }

  return (
    <div className="mb-8 rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-baseline justify-between">
        <h3 className="font-display text-base font-semibold text-foreground">EU AI Act & tilstødende — tidslinje</h3>
        <span className="text-xs text-muted-foreground">Du er her: {today.toLocaleDateString("da-DK", { month: "long", year: "numeric" })}</span>
      </div>
      <div className="relative">
        {/* Line */}
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-border" />
        {/* "Today" marker */}
        <div
          className="absolute top-0 z-10 flex flex-col items-center"
          style={{ left: `${todayPercent}%`, transform: "translateX(-50%)" }}
          aria-label="Du er her"
        >
          <div className="h-6 w-0.5 bg-primary" />
          <span className="-mt-px rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">i dag</span>
        </div>
        {/* Events */}
        <div className="relative grid grid-cols-7 gap-2">
          {events.map((ev) => {
            const past = new Date(ev.date) < today;
            return (
              <button
                key={ev.date}
                onClick={() => setSelected(ev)}
                className="group flex flex-col items-center rounded-lg p-1 text-center transition-colors hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label={`Detaljer om ${ev.label}: ${ev.title}`}
              >
                <div className={`h-6 w-6 rounded-full border-2 transition-transform group-hover:scale-110 ${past ? "bg-muted border-muted-foreground/40" : "bg-primary border-primary"}`} />
                <p className={`mt-2 text-[10px] font-medium ${past ? "text-muted-foreground" : "text-primary"}`}>{ev.label}</p>
                <p className={`mt-1 text-[11px] leading-tight ${past ? "text-muted-foreground" : "text-foreground"}`}>{ev.title}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground/80">{ev.note}</p>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">Klik på en milepæl for detaljer og kildehenvisninger.</p>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">{selected.label}</p>
                <DialogTitle className="font-display">{selected.title}</DialogTitle>
                <DialogDescription>{selected.note}</DialogDescription>
              </DialogHeader>
              <p className="text-sm text-foreground/90 leading-relaxed">{selected.detail}</p>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kildehenvisninger</p>
                <div className="grid gap-2">
                  {selected.sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md border border-border p-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <span className="flex-1">{s.label}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Pillar View ──
function PillarView({
  pillar,
  onNavigate,
  onBack,
}: {
  pillar: PillarId;
  onNavigate: (v: View, p?: PillarId, c?: Category) => void;
  onBack: () => void;
}) {
  const pillarData = pillars.find((p) => p.id === pillar)!;
  const pillarCats = getCategoriesByPillar(pillar);

  return (
    <div className="fade-in">
      <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Tilbage til overblik
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{pillarData.icon}</span>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">{pillarData.name}</h2>
            <p className="text-sm text-primary/70">{pillarData.subtitle}</p>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{pillarData.description}</p>
      </div>

      <div className="grid gap-4">
        {pillarCats.map((cat) => {
          const criticals = cat.subcategories.filter((s) => s.severity === "critical").length;
          const highs = cat.subcategories.filter((s) => s.severity === "high").length;
          return (
            <button
              key={cat.id}
              onClick={() => onNavigate("category", pillar, cat)}
              className="card-hover flex items-center gap-5 rounded-lg border border-border bg-card p-5 text-left"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold text-foreground">{cat.name}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                <div className="mt-2 flex gap-2">
                  {criticals > 0 && (
                    <span className="rounded bg-danger/15 px-2 py-0.5 text-[10px] font-medium text-danger">
                      {criticals} kritiske
                    </span>
                  )}
                  {highs > 0 && (
                    <span className="rounded bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                      {highs} høje
                    </span>
                  )}
                  <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                    {cat.subcategories.length} krav
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Category View ──
function CategoryView({
  category,
  onNavigate,
  onBack,
}: {
  category: Category;
  onNavigate: (v: View, p?: PillarId, c?: Category, s?: Subcategory) => void;
  onBack: () => void;
}) {
  const [expandedSource, setExpandedSource] = useState(false);

  return (
    <div className="fade-in">
      <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Tilbage
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">{category.name}</h2>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {pillarName(category.pillar)}
            </span>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{category.description}</p>
      </div>

      {/* Underkategorier */}
      <div className="mb-8 grid gap-4">
        {category.subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onNavigate("subcategory", category.pillar, category, sub)}
            className={`card-hover rounded-lg border p-5 text-left ${getSeverityBg(sub.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-semibold text-foreground">{sub.name}</p>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${getSeverityColor(sub.severity)}`}>
                    {sub.severity === "critical" ? "kritisk" : sub.severity === "high" ? "høj" : sub.severity === "medium" ? "middel" : "lav"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{sub.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sub.tags.map((tag) => (
                    <span key={tag} className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="ml-4 mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      {/* Kildelinks */}
      <div className="rounded-lg border border-border bg-card p-5">
        <button
          onClick={() => setExpandedSource(!expandedSource)}
          className="flex w-full items-center justify-between"
        >
          <h3 className="font-display text-sm font-semibold text-foreground">
            📎 Kildereferencer ({category.sourceLinks.length})
          </h3>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSource ? "rotate-180" : ""}`} />
        </button>
        {expandedSource && (
          <div className="mt-4 grid gap-2">
            {category.sourceLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded border border-border p-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getSourceBadgeClass(link.source)}`}>
                  {link.source}
                </span>
                <span className="flex-1">{link.label}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Subcategory View ──
function SubcategoryView({
  subcategory,
  category,
  onBack,
}: {
  subcategory: Subcategory;
  category: Category;
  onBack: () => void;
}) {
  return (
    <div className="fade-in max-w-3xl">
      <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Tilbage til {category.name}
      </button>

      {/* Header */}
      <div className={`mb-8 rounded-xl border p-6 ${getSeverityBg(subcategory.severity)}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{category.icon}</span>
          <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${getSeverityColor(subcategory.severity)}`}>
            {subcategory.severity === "critical" ? "kritisk" : subcategory.severity === "high" ? "høj" : subcategory.severity === "medium" ? "middel" : "lav"} prioritet
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">{subcategory.name}</h2>
        <p className="mt-3 text-sm text-secondary-foreground leading-relaxed">{subcategory.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {subcategory.tags.map((tag) => (
            <span key={tag} className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Handlingspunkter */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-foreground">✅ Praktiske handlinger</h3>
        <div className="grid gap-3">
          {subcategory.actions.map((action, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-bold text-success">
                {i + 1}
              </div>
              <p className="text-sm text-secondary-foreground">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detaljerede referencer */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
          🔗 Detaljerede referencer
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Klik igennem for original lovgivning, vejledning og standarder.
        </p>
        <div className="grid gap-2">
          {subcategory.sourceLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover flex items-center gap-3 rounded-lg border border-border p-4"
            >
              <span className={`rounded px-2 py-1 text-[10px] font-bold ${getSourceBadgeClass(link.source)}`}>
                {link.source}
              </span>
              <span className="flex-1 text-sm text-secondary-foreground">{link.label}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </div>

      {/* Sparring CTA */}
      <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <h3 className="font-display text-lg font-semibold text-foreground">Brug for sparring på dette?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Book et 30-min sparringsmøde med AI Rådgivning — vi hjælper danske organisationer i mål med AI-compliance før august 2026.
        </p>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Book 30-min sparring
        </a>
      </div>
    </div>
  );
}

// ── Newsletter + main CTA strip ──
const MAILERLITE_ACTION = "https://assets.mailerlite.com/jsonp/1571946/forms/189012812467536974/subscribe";

function NewsletterCTA() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("fields[email]", email);
      formData.append("ml-submit", "1");
      formData.append("anticsrf", "true");
      await fetch(MAILERLITE_ACTION, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="border-t border-border bg-card/30 py-12">
      <div className="container mx-auto grid gap-8 px-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold text-foreground">📬 Nyhedsbrev: AI Compliance i praksis</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Månedlig opdatering om AI Act-implementering, vejledninger fra Digst og Datatilsynet, og praktiske compliance-greb for danske virksomheder.
          </p>
          {status === "success" ? (
            <div className="mt-4 rounded-md border border-success/30 bg-success/10 p-4 text-sm text-success">
              ✓ Tak! Du er nu tilmeldt — tjek din indbakke for bekræftelse.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="din@email.dk"
                disabled={status === "loading"}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {status === "loading" ? "Tilmelder…" : "Tilmeld"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-2 text-xs text-danger">Noget gik galt. Prøv igen om lidt.</p>
          )}
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="font-display text-lg font-semibold text-foreground">🗓️ Book 30-min sparring</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Konkret sparring om jeres situation — risikoklassificering, gap mod 2026-deadline, DPIA/FRIA, leverandørstyring eller noget helt andet.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Book et møde
          </a>
        </div>
      </div>
    </section>
  );
}

export default Index;
