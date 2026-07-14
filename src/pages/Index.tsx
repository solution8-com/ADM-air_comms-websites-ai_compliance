import { useState, useMemo, useRef, useEffect, type FormEvent } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ExternalLink, ChevronRight, ChevronDown, Search, Wrench, ArrowLeft, Download, Copy } from "lucide-react";
import { SiteWordmark } from "@/components/SiteWordmark";
import { SiteFooter } from "@/components/SiteFooter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  pillars,
  categories,
  getCategoriesByPillar,
  getSeverityColor,
  getSeverityBg,
  toolsMeta,
  type Severity,
  type PillarId,
  type Category,
  type Subcategory,
  type SourceType,
  type ToolMeta,
} from "@/data/complianceData";

type View = "dashboard" | "pillar" | "category" | "subcategory";

const CALENDLY_URL = "https://calendly.com/ai-raadgivning_jacob/30min?month=2026-06";

// Clickable example searches shown in the empty/no-results state.
const SEARCH_SUGGESTIONS = ["højrisiko", "bøder", "FRIA", "GPAI", "transparens", "ISO 42001"];

// ── Værktøjer: canonical /vaerktoejer/<slug> URLs ──
// Metadata lives in complianceData.ts (toolsMeta) so the prerender script can
// reuse it; here we attach each tool's React component. Inline rendering on
// content pages becomes a teaser card linking to the canonical URL.
// AiActClassifier stays inline on hoejrisiko-systemer (it answers that
// category's question) so it is deliberately absent from this list.
type ToolConfig = ToolMeta & { Component: () => JSX.Element };

const TOOL_COMPONENTS: Record<string, () => JSX.Element> = {
  "ai-act-tidslinje": AiActTimeline,
  "sektor-matrix": SectorRegulationMatrix,
  "boedestruktur": PenaltyTiers,
  "dokumentations-kort": DocumentationMap,
};

const tools: ToolConfig[] = toolsMeta.map((meta) => ({
  ...meta,
  Component: TOOL_COMPONENTS[meta.slug],
}));

const getTool = (slug: string): ToolConfig =>
  tools.find((t) => t.slug === slug) ?? tools[0];

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

function Breadcrumbs({
  pillar,
  category,
  subcategory,
  tool,
  toolsRoot,
  onHome,
  onPillar,
  onCategory,
  onTools,
}: {
  pillar?: { id: PillarId; name: string };
  category?: { id: string; name: string };
  subcategory?: { id: string; name: string };
  tool?: { name: string };
  toolsRoot?: boolean;
  onHome: () => void;
  onPillar?: () => void;
  onCategory?: () => void;
  onTools?: () => void;
}) {
  const sep = (
    <span aria-hidden="true" className="text-muted-foreground/40">›</span>
  );

  // Tools path: Overblik › Værktøjer [› Tool name]
  if (toolsRoot || tool) {
    return (
      <nav aria-label="Brødkrummer" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <button onClick={onHome} className="hover:text-primary transition-colors">Overblik</button>
        {sep}
        {tool ? (
          <button onClick={onTools} className="hover:text-primary transition-colors">Værktøjer</button>
        ) : (
          <span className="text-foreground font-medium" aria-current="page">Værktøjer</span>
        )}
        {tool && (
          <>
            {sep}
            <span className="text-foreground font-medium" aria-current="page">{tool.name}</span>
          </>
        )}
      </nav>
    );
  }

  return (
    <nav aria-label="Brødkrummer" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      <button onClick={onHome} className="hover:text-primary transition-colors">Overblik</button>
      {pillar && (
        <>
          {sep}
          {category ? (
            <button onClick={onPillar} className="hover:text-primary transition-colors">{pillar.name}</button>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">{pillar.name}</span>
          )}
        </>
      )}
      {category && (
        <>
          {sep}
          {subcategory ? (
            <button onClick={onCategory} className="hover:text-primary transition-colors">{category.name}</button>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">{category.name}</span>
          )}
        </>
      )}
      {subcategory && (
        <>
          {sep}
          <span className="text-foreground font-medium" aria-current="page">{subcategory.name}</span>
        </>
      )}
    </nav>
  );
}

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
  const params = useParams<{ pillarId?: string; categoryId?: string; subcategoryId?: string; toolId?: string }>();
  const routerNavigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Tools route detection (literal /vaerktoejer segment)
  const isToolsRoute =
    location.pathname === "/vaerktoejer" || location.pathname.startsWith("/vaerktoejer/");
  const selectedTool: ToolConfig | null = useMemo(
    () => (params.toolId ? tools.find((t) => t.slug === params.toolId) ?? null : null),
    [params.toolId]
  );

  // Derive selected entities from URL params
  const selectedPillar: PillarId | null = useMemo(() => {
    if (!params.pillarId) return null;
    const pillar = pillars.find((p) => p.id === params.pillarId);
    return pillar ? (pillar.id as PillarId) : null;
  }, [params.pillarId]);

  const selectedCategory: Category | null = useMemo(() => {
    if (!params.categoryId || !selectedPillar) return null;
    return categories.find((c) => c.id === params.categoryId && c.pillar === selectedPillar) ?? null;
  }, [params.categoryId, selectedPillar]);

  const selectedSubcategory: Subcategory | null = useMemo(() => {
    if (!params.subcategoryId || !selectedCategory) return null;
    return selectedCategory.subcategories.find((s) => s.id === params.subcategoryId) ?? null;
  }, [params.subcategoryId, selectedCategory]);

  const view: View = selectedSubcategory
    ? "subcategory"
    : selectedCategory
    ? "category"
    : selectedPillar
    ? "pillar"
    : "dashboard";

  // Redirect to nearest valid parent if a URL segment is invalid
  useEffect(() => {
    if (params.toolId && !selectedTool) {
      routerNavigate("/vaerktoejer", { replace: true });
    } else if (params.pillarId && !selectedPillar) {
      routerNavigate("/", { replace: true });
    } else if (params.categoryId && selectedPillar && !selectedCategory) {
      routerNavigate(`/${selectedPillar}`, { replace: true });
    } else if (params.subcategoryId && selectedCategory && !selectedSubcategory) {
      routerNavigate(`/${selectedPillar}/${selectedCategory.id}`, { replace: true });
    }
  }, [params.pillarId, params.categoryId, params.subcategoryId, params.toolId, selectedPillar, selectedCategory, selectedSubcategory, selectedTool, routerNavigate]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [params.pillarId, params.categoryId, params.subcategoryId, params.toolId]);

  // Keep the browser tab title in sync with the current route after client-side nav.
  // Mirrors the per-route titles emitted by scripts/prerender.ts so the title is
  // never stale after navigating without a full page load.
  useEffect(() => {
    const SITE = "AI Compliance";
    let title: string;
    if (isToolsRoute && selectedTool) {
      title = `${selectedTool.title} - Værktøj | ${SITE}`;
    } else if (isToolsRoute) {
      title = `Værktøjer - interaktive AI Act-værktøjer | ${SITE}`;
    } else if (selectedSubcategory && selectedCategory) {
      title = `${selectedSubcategory.name} - ${selectedCategory.name} | ${SITE}`;
    } else if (selectedCategory) {
      title = `${selectedCategory.name} - ${SITE}`;
    } else if (selectedPillar) {
      const p = pillars.find((x) => x.id === selectedPillar);
      title = p ? `${p.name} - ${SITE}` : SITE;
    } else {
      title = "AI Compliance - Praktisk overblik til danske virksomheder | EU AI Act, ISO 42001, NIST";
    }
    document.title = title;
  }, [selectedPillar, selectedCategory, selectedSubcategory, isToolsRoute, selectedTool]);

  // Compatibility navigate function - matches the existing signature so child components
  // don't need refactoring. Translates view+entity tuples into URL paths.
  const navigate = (
    newView: View,
    pillar?: PillarId,
    category?: Category,
    subcategory?: Subcategory
  ) => {
    if (newView === "dashboard") {
      routerNavigate("/");
    } else if (newView === "pillar" && pillar) {
      routerNavigate(`/${pillar}`);
    } else if (newView === "category" && pillar && category) {
      routerNavigate(`/${pillar}/${category.id}`);
    } else if (newView === "subcategory" && pillar && category && subcategory) {
      routerNavigate(`/${pillar}/${category.id}/${subcategory.id}`);
    }
  };

  const goBack = () => {
    if (view === "subcategory" && selectedPillar && selectedCategory) {
      routerNavigate(`/${selectedPillar}/${selectedCategory.id}`);
    } else if (view === "category" && selectedPillar) {
      routerNavigate(`/${selectedPillar}`);
    } else if (view === "pillar") {
      routerNavigate("/");
    }
  };

  const openTool = (slug: string) => routerNavigate(`/vaerktoejer/${slug}`);
  const openToolsIndex = () => routerNavigate("/vaerktoejer");

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
      <a href="#hovedindhold" className="skip-link">Spring til indhold</a>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("dashboard")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <SiteWordmark />
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
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchQuery("");
                    e.currentTarget.blur();
                  }
                }}
                aria-label="Søg i compliance-krav"
                className="h-9 w-64 rounded-md border border-border bg-secondary pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground sm:flex">⌘K</kbd>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openToolsIndex}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                  isToolsRoute
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                <Wrench className="h-3 w-3" /> Værktøjer
              </button>
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
                className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Book et møde
              </a>
            </div>
          </div>
        </div>
      </header>

      <main id="hovedindhold" className="container mx-auto px-6 py-8">
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
              <div className="text-sm text-muted-foreground">
                <p>Ingen compliance-krav matcher "{searchQuery}". Tjek stavning, eller prøv et af disse:</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SEARCH_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSearchQuery(s)}
                      className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground/70">Tip: tryk Esc for at rydde søgningen.</p>
              </div>
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

        {/* Værktøjer */}
        {!searchQuery && isToolsRoute && selectedTool && (
          <ToolPage tool={selectedTool} onHome={() => navigate("dashboard")} onTools={openToolsIndex} />
        )}
        {!searchQuery && isToolsRoute && !selectedTool && (
          <ToolsIndex onHome={() => navigate("dashboard")} onOpenTool={openTool} />
        )}

        {/* Dashboard */}
        {!searchQuery && !isToolsRoute && view === "dashboard" && (
          <DashboardView onNavigate={navigate} onOpenTool={openTool} />
        )}
        {!searchQuery && !isToolsRoute && view === "pillar" && selectedPillar && (
          <PillarView pillar={selectedPillar} onNavigate={navigate} onBack={goBack} onOpenTool={openTool} />
        )}
        {!searchQuery && !isToolsRoute && view === "category" && selectedCategory && (
          <CategoryView category={selectedCategory} onNavigate={navigate} onBack={goBack} onOpenTool={openTool} />
        )}
        {!searchQuery && view === "subcategory" && selectedSubcategory && selectedCategory && (
          <SubcategoryView
            subcategory={selectedSubcategory}
            category={selectedCategory}
            onNavigate={navigate}
          />
        )}
      </main>

      {/* Newsletter + CTA strip - hide the booking column on subcategory pages,
          which already have their own contextual "Book sparring" card (avoids
          two stacked Book CTAs). Newsletter stays everywhere. */}
      <NewsletterCTA showBooking={view !== "subcategory"} />

      {/* Footer */}
      <SiteFooter />
    </div>
  );
};

// ── Dashboard View ──
function DashboardView({
  onNavigate,
  onOpenTool,
}: {
  onNavigate: (v: View, p?: PillarId) => void;
  onOpenTool: (slug: string) => void;
}) {
  const totalItems = categories.reduce((sum, c) => sum + c.subcategories.length, 0);
  const criticalCount = categories.reduce(
    (sum, c) => sum + c.subcategories.filter((s) => s.severity === "critical").length,
    0
  );

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-foreground">
          AI Compliance <span className="text-primary text-glow">Overblik</span>
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Praktisk overblik over AI-compliance for danske organisationer - opdelt i Lovkrav, Standarder og Drift. Baseret på EU AI Act (Regulation 2024/1689), Digitaliseringsstyrelsens vejledninger, Datatilsynet, ISO/IEC 42001, NIST AI RMF og tilstødende EU-lovgivning. <span className="text-primary font-medium">AI Omnibus (7. maj 2026)</span> udskød højrisiko-fristerne til 2. december 2027 (Annex III) og 2. august 2028 (Annex I) - forpligtelserne består, kun timing ændres.
        </p>
      </div>

      {/* Værktøjer-sektion - alle sitets værktøjer, synlige fra dashboardet */}
      <section aria-labelledby="vaerktoejer-heading" className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="vaerktoejer-heading" className="font-display text-lg font-semibold text-foreground">Interaktive værktøjer</h2>
          <span className="text-xs text-muted-foreground">Klik for at åbne · kan deles</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((t) => (
            <ToolTeaserCard key={t.slug} tool={t} onOpen={onOpenTool} />
          ))}
        </div>
      </section>

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
                  <span className="rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-medium text-danger">
                    {criticals} kritiske
                  </span>
                )}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {pillar.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-primary">{pillar.subtitle}</p>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{pillar.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{pillarCats.length} områder</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      <InlineNewsletterPrompt
        hook="Få et månedligt overblik på 5 minutter"
        topic="EU AI Act-implementering, vejledninger fra Digst og Datatilsynet, og praktiske compliance-greb"
      />

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
              <p className="mt-1 text-xs text-muted-foreground">Govern - Map - Measure - Manage. GenAI-profil (NIST AI 600-1) tilføjer 200+ kontroller for LLM-systemer.</p>
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

      <NewsFeed />
    </div>
  );
}

// ── Nyheds-feed (læser public/news.json, genereret ugentligt af scripts/fetch-news.ts) ──
type NewsData = { generatedAt: string; items: { title: string; link: string; source: string; date: string }[] };

function NewsFeed() {
  const [data, setData] = useState<NewsData | null>(null);
  useEffect(() => {
    fetch("/news.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null));
  }, []);
  if (!data || !data.items?.length) return null;
  const fmt = (iso: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  };
  return (
    <section aria-labelledby="news-heading" className="mt-10 rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 id="news-heading" className="font-display text-lg font-semibold text-foreground">📰 Nyheder &amp; opdateringer</h2>
        <span className="text-[11px] text-muted-foreground">Opdateret {fmt(data.generatedAt)}</span>
      </div>
      <div className="grid gap-2">
        {data.items.map((it) => (
          <a
            key={it.link}
            href={it.link}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover flex items-start gap-3 rounded-lg border border-border bg-card/60 p-3 text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{it.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {it.source}{it.date ? ` · ${fmt(it.date)}` : ""}
              </p>
            </div>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Kuraterede nyheder fra autoritative kilder - opdateres ugentligt.</p>
    </section>
  );
}

// ── EU AI Act + tilstødende lovgivning - horizontal timeline ──
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
    detail: "Artikel 5 (forbudte AI-praksisser - social scoring, manipulation, biometrisk fjernidentifikation til retshåndhævelse m.fl.) og Artikel 4 (AI-literacy-krav til alle udbydere og idriftsættere) trådte i kraft som de første dele af AI-forordningen. Overtrædelse af Art. 5 udløser den højeste bødeklasse: op til 35 mio. EUR eller 7 % af global omsætning. AI-literacy-kravet er allerede håndhævet - Datatilsynet og Digst kan bede om dokumentation for at medarbejdere har modtaget træning.",
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
    detail: "Første indleveringsfrist for finansielle virksomheders DORA Register of Information til Finanstilsynet. Registret skal eksplicit dække alle ICT-third-party-leverandører - herunder AI-leverandører. Forsikrings- og pensionssektor får temainspektion publiceret forår 2026. For danske banker er DORA ofte mere kortsigtet kritisk end AI Act.",
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
    detail: "EU Council og Parlament nåede politisk aftale om AI Omnibus 7. maj 2026. Højrisiko-fristerne blev udskudt: Annex III standalone-systemer til 2. december 2027 (var aug 2026); Annex I indlejrede systemer til 2. august 2028 (var aug 2027). NCII/CSAM (\"nudifiers\") blev tilføjet som ny forbudt praksis. Formel vedtagelse forventes primo juni 2026. Forpligtelserne består - kun timing ændres.",
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
        <h3 className="font-display text-base font-semibold text-foreground">EU AI Act & tilstødende - tidslinje</h3>
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

// ── Værktøj: Sektor × regulering matrix ──
type Applicability = "required" | "conditional" | "voluntary" | "n/a";

function SectorRegulationMatrix() {
  const sectors = [
    { id: "finans", icon: "🏦", label: "Finans, forsikring, pension", sub: "Banker, realkredit, forsikring, pension" },
    { id: "sundhed", icon: "🏥", label: "Sundhed", sub: "Hospitaler, klinikker, medicinsk udstyr" },
    { id: "offentlig", icon: "🏛️", label: "Offentlig sektor", sub: "Stat, regioner, kommuner, myndigheder" },
    { id: "hr", icon: "👔", label: "HR & rekruttering", sub: "Ansættelse, performance, opsigelse" },
    { id: "uddannelse", icon: "🎓", label: "Uddannelse", sub: "Skoler, universiteter, edtech" },
    { id: "detail", icon: "🛒", label: "Detail / e-commerce", sub: "Marketing, kundeservice, prising" },
    { id: "industri", icon: "🏭", label: "Industri / produktion", sub: "Maskinstyring, kvalitetskontrol, robotter" },
    { id: "advokat", icon: "⚖️", label: "Advokatbranchen", sub: "Juridiske platforme, AI-assistance" },
  ];

  const regs = [
    { id: "ai-act", label: "EU AI Act" },
    { id: "gdpr", label: "GDPR" },
    { id: "nis2", label: "NIS2" },
    { id: "dora", label: "DORA" },
    { id: "iso42001", label: "ISO 42001" },
    { id: "sektor", label: "Sektorlov" },
    { id: "fria", label: "FRIA (Art. 27)" },
  ];

  // cells[sectorId][regId] = applicability
  const cells: Record<string, Record<string, Applicability>> = {
    finans: { "ai-act": "required", gdpr: "required", nis2: "required", dora: "required", iso42001: "voluntary", sektor: "required", fria: "conditional" },
    sundhed: { "ai-act": "conditional", gdpr: "required", nis2: "conditional", dora: "n/a", iso42001: "voluntary", sektor: "required", fria: "conditional" },
    offentlig: { "ai-act": "required", gdpr: "required", nis2: "conditional", dora: "n/a", iso42001: "voluntary", sektor: "required", fria: "required" },
    hr: { "ai-act": "required", gdpr: "required", nis2: "n/a", dora: "n/a", iso42001: "voluntary", sektor: "required", fria: "conditional" },
    uddannelse: { "ai-act": "required", gdpr: "required", nis2: "n/a", dora: "n/a", iso42001: "voluntary", sektor: "required", fria: "conditional" },
    detail: { "ai-act": "conditional", gdpr: "required", nis2: "n/a", dora: "n/a", iso42001: "voluntary", sektor: "conditional", fria: "n/a" },
    industri: { "ai-act": "conditional", gdpr: "conditional", nis2: "conditional", dora: "n/a", iso42001: "voluntary", sektor: "conditional", fria: "n/a" },
    advokat: { "ai-act": "conditional", gdpr: "required", nis2: "n/a", dora: "n/a", iso42001: "voluntary", sektor: "required", fria: "n/a" },
  };

  // Brief context notes per cell (shown on hover via title)
  const notes: Record<string, Record<string, string>> = {
    finans: {
      "ai-act": "Annex III §5 (kreditscoring, forsikringsrisiko, social) er højrisiko. Plus Art. 5 forbud.",
      gdpr: "Standard GDPR + GDPR Art. 22 for automatiserede beslutninger om kunder.",
      nis2: "Banker og forsikring er typisk væsentlige enheder under NIS2-loven.",
      dora: "DORA gælder for alle finansielle enheder siden 17. jan 2025. ICT-third-party-register obligatorisk.",
      iso42001: "Frivillig - men forventet markedsstandard. Finanstilsynet kan reference den i tilsyn.",
      sektor: "Finansiel Virksomhedslov, Solvency II, EBA Guidelines on outsourcing, ECB SREP.",
      fria: "Krav for banker/forsikring der bruger højrisiko-AI under Art. 27.",
    },
    sundhed: {
      "ai-act": "AI som medicinsk udstyr går via MDR + AI Act overlap. Klassisk MDR-vejledning gælder først.",
      gdpr: "Særlige kategorier (sundhedsdata) - DPIA næsten altid krævet.",
      nis2: "Hospitaler under NIS2 hvis væsentlige enheder; mindre klinikker som regel ikke.",
      dora: "Ikke direkte - men leverandører til finansielle clients kan blive ramt indirekte.",
      iso42001: "Frivillig - vinder traction i medtech.",
      sektor: "MDR (Regulation 2017/745), sundhedsloven, lægemiddelloven, autorisationsloven.",
      fria: "Ved højrisiko-AI brugt af offentlige hospitaler/regioner.",
    },
    offentlig: {
      "ai-act": "Alle højrisiko-anvendelser. Offentlige myndigheder har skærpede pligter (EU-database registrering selv ved ikke-højrisiko).",
      gdpr: "Standard + særskilt offentlig myndigheds-grundlag.",
      nis2: "Kritisk infrastruktur og kommuner - varierer.",
      dora: "Ikke gældende.",
      iso42001: "Frivillig - Digst opfordrer.",
      sektor: "Forvaltningsloven, offentlighedsloven, persondatabeskyttelsesloven (DK supplement).",
      fria: "OBLIGATORISK for alle offentlige myndigheder ved højrisiko-AI (Art. 27(1)(a)).",
    },
    hr: {
      "ai-act": "Annex III §4 - beskæftigelse, performance, opsigelse er højrisiko.",
      gdpr: "Standard + medarbejdersamtykke-problematik. GDPR Art. 88 medarbejdersamtykke.",
      nis2: "Ikke gældende.",
      dora: "Ikke gældende.",
      iso42001: "Frivillig.",
      sektor: "Ligebehandlingsloven (køn, alder, race), funktionærloven, persondatatilsynets vejledning.",
      fria: "Visse offentlige arbejdsgivere - ellers normalt ikke krav under Art. 27.",
    },
    uddannelse: {
      "ai-act": "Annex III §3 - adgang, vurdering, snyddetektion er højrisiko.",
      gdpr: "Standard. Mindreårige under 13 = forældresamtykke.",
      nis2: "Ikke direkte.",
      dora: "Ikke gældende.",
      iso42001: "Frivillig.",
      sektor: "Folkeskoleloven, eksamensbekendtgørelser, universitetsloven, STIL/UVM AI-vejledning (maj 2025).",
      fria: "Offentlige uddannelsesinstitutioner - ja. Privatskoler - som regel ikke.",
    },
    detail: {
      "ai-act": "Art. 5 manipulation-forbud + Art. 50 transparens (chatbots, deepfakes i marketing).",
      gdpr: "Standard. Cookie-samtykke, profilering, customer scoring.",
      nis2: "Ikke gældende.",
      dora: "Ikke gældende.",
      iso42001: "Frivillig.",
      sektor: "Markedsføringsloven, forbrugerloven, forbrugerombudsmandens vejledning om AI i markedsføring.",
      fria: "Ikke direkte gældende.",
    },
    industri: {
      "ai-act": "Annex I hvis AI er sikkerhedskomponent i reguleret produkt (maskiner, biler). Ellers minimal.",
      gdpr: "Begrænset - primært HR-applikationer på arbejdspladsen.",
      nis2: "Visse industrier (energi, vand) er væsentlige enheder.",
      dora: "Ikke gældende.",
      iso42001: "Frivillig.",
      sektor: "Maskindirektivet 2006/42/EC + ny 2023/1230, produktansvarsloven.",
      fria: "Ikke direkte.",
    },
    advokat: {
      "ai-act": "AI-assistance i juridisk arbejde: hvis det kvalificerer som højrisiko (sjældent), Art. 50 hvis chatbot.",
      gdpr: "Standard + tavshedspligt. Stor opmærksomhed på AI-genereret juridisk rådgivning.",
      nis2: "Ikke gældende.",
      dora: "Ikke gældende.",
      iso42001: "Frivillig.",
      sektor: "Retsplejeloven, Advokatsamfundets etiske regler (særligt vedr. AI-genereret materiale i retten).",
      fria: "Ikke direkte.",
    },
  };

  const renderCell = (val: Applicability) => {
    switch (val) {
      case "required":
        return { symbol: "✓", className: "bg-danger/15 text-danger border-danger/30", label: "Krav" };
      case "conditional":
        return { symbol: "⚠", className: "bg-warning/15 text-warning border-warning/30", label: "Betinget" };
      case "voluntary":
        return { symbol: "○", className: "bg-info/15 text-info border-info/30", label: "Frivillig" };
      case "n/a":
        return { symbol: " - ", className: "bg-muted/20 text-muted-foreground/60 border-border/40", label: "N/A" };
    }
  };

  return (
    <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Værktøj</span>
        <h3 className="font-display text-lg font-semibold text-foreground">Sektor × regulering - hvad gælder for mig?</h3>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Vælg jeres sektor - værktøjet viser hvilke lovgivninger der gælder, og hvilke der er betingede. Hold musen over en celle for præcise grunde og kilder. <strong className="text-foreground">Bemærk:</strong> dette er en pejling, ikke juridisk rådgivning - sektorspecifik analyse vil næsten altid være nødvendig.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-[28%] bg-card p-2 text-left align-bottom font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sektor</th>
              {regs.map((r) => (
                <th key={r.id} className="p-2 text-center align-bottom">
                  <p className="font-display text-[11px] font-semibold text-foreground">{r.label}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sectors.map((s) => (
              <tr key={s.id} className="border-t border-border/40">
                <th className="sticky left-0 z-10 bg-card/80 p-3 text-left align-top">
                  <p className="font-display text-[12px] font-semibold text-foreground">{s.icon} {s.label}</p>
                  <p className="mt-0.5 text-[10px] font-normal text-muted-foreground">{s.sub}</p>
                </th>
                {regs.map((r) => {
                  const val = cells[s.id][r.id];
                  const cell = renderCell(val);
                  return (
                    <td key={r.id} className="p-1.5 align-middle">
                      <div
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded border font-display text-sm font-bold ${cell.className}`}
                        title={`${cell.label}: ${notes[s.id]?.[r.id] ?? ""}`}
                      >
                        {cell.symbol}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-1.5 text-[10px] md:grid-cols-4">
        {[
          { val: "required" as Applicability, label: "Krav - direkte gældende" },
          { val: "conditional" as Applicability, label: "Betinget - afhænger af use case" },
          { val: "voluntary" as Applicability, label: "Frivillig - best practice" },
          { val: "n/a" as Applicability, label: "Ikke gældende" },
        ].map((legend) => {
          const cell = renderCell(legend.val);
          return (
            <span key={legend.val} className="inline-flex items-center gap-1.5">
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded border font-display text-[9px] font-bold ${cell.className}`}>{cell.symbol}</span>
              <span className="text-muted-foreground">{legend.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Værktøj: Bødestruktur (3-tier penalty card for Lovkrav pillar) ──
function PenaltyTiers() {
  const tiers = [
    {
      amount: "€35 mio. / 7 %",
      label: "Tier 1 - Forbudte praksisser",
      articles: ["Art. 5 (alle 8 forbud + NCII)"],
      examples: ["Social bedømmelse", "Real-time biometrisk fjernidentifikation", "Følelsesgenkendelse på arbejdspladsen", "Skadelig manipulation"],
      severity: "danger",
    },
    {
      amount: "€15 mio. / 3 %",
      label: "Tier 2 - De fleste øvrige forpligtelser",
      articles: ["Art. 16 udbyder-pligter", "Art. 22 EU-repræsentant", "Art. 23 - 24 importør/distributør", "Art. 26 deployer-pligter", "Art. 50 transparens", "Art. 53 - 55 GPAI"],
      examples: ["Manglende teknisk dokumentation", "Manglende menneskelig oversight", "Ingen FRIA før idriftsættelse af højrisiko-AI", "GPAI uden træningsdata-resumé"],
      severity: "warning",
    },
    {
      amount: "€7,5 mio. / 1,5 %",
      label: "Tier 3 - Forkerte oplysninger til myndigheder",
      articles: ["Art. 99(5)"],
      examples: ["Forkerte oplysninger i konformitetserklæring", "Vildledende data i registrering eller audit", "Manglende samarbejde med markedsovervågning"],
      severity: "info",
    },
  ];

  const tierStyle = (sev: string) => {
    switch (sev) {
      case "danger":
        return "border-danger/40 bg-danger/10";
      case "warning":
        return "border-warning/40 bg-warning/10";
      case "info":
        return "border-info/40 bg-info/10";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Værktøj</span>
        <h3 className="font-display text-lg font-semibold text-foreground">Bødestruktur under AI Act</h3>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Tre niveauer baseret på hvilken bestemmelse der overtrædes. <strong className="text-foreground">Det højeste af</strong> det faste beløb og % af global årlig omsætning gælder. For SMV'er og startups gælder dog det <em>laveste</em> af de to.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {tiers.map((tier) => (
          <div key={tier.label} className={`rounded-lg border p-4 ${tierStyle(tier.severity)}`}>
            <p className="font-display text-2xl font-bold text-foreground">{tier.amount}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">af global omsætning eller fast beløb</p>
            <p className="mt-3 font-display text-sm font-semibold text-foreground">{tier.label}</p>
            <p className="mt-3 text-[10px] uppercase tracking-wide text-muted-foreground">Hvilke artikler</p>
            <ul className="mt-1 flex flex-col gap-0.5">
              {tier.articles.map((a, i) => (
                <li key={i} className="text-[11px] text-foreground/90">{a}</li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] uppercase tracking-wide text-muted-foreground">Typiske overtrædelser</p>
            <ul className="mt-1 flex flex-col gap-0.5">
              {tier.examples.map((ex, i) => (
                <li key={i} className="flex items-start gap-1 text-[11px] text-foreground/80">
                  <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="leading-snug">{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Reference: <a href="https://artificialintelligenceact.eu/article/99/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">EU AI Act Art. 99</a> + recital 168. Sanktionsregimet trådte i kraft 2. august 2025.
      </p>
    </div>
  );
}

// ── Pillar View ──
function PillarView({
  pillar,
  onNavigate,
  onBack,
  onOpenTool,
}: {
  pillar: PillarId;
  onNavigate: (v: View, p?: PillarId, c?: Category) => void;
  onBack: () => void;
  onOpenTool: (slug: string) => void;
}) {
  const pillarData = pillars.find((p) => p.id === pillar)!;
  const pillarCats = getCategoriesByPillar(pillar);

  return (
    <div className="fade-in">
      <Breadcrumbs
        pillar={{ id: pillarData.id, name: pillarData.name }}
        onHome={onBack}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{pillarData.icon}</span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{pillarData.name}</h1>
            <p className="text-sm text-primary">{pillarData.subtitle}</p>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{pillarData.description}</p>
      </div>

      {/* Værktøj: Bødestruktur (kun for Lovkrav pillar) */}
      {pillar === "lovkrav" && (
        <div className="mb-6">
          <ToolTeaserCard tool={getTool("boedestruktur")} onOpen={onOpenTool} />
        </div>
      )}

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
  onOpenTool,
}: {
  category: Category;
  onNavigate: (v: View, p?: PillarId, c?: Category, s?: Subcategory) => void;
  onBack: () => void;
  onOpenTool: (slug: string) => void;
}) {
  const [expandedSource, setExpandedSource] = useState(false);
  const [sevFilter, setSevFilter] = useState<"all" | Severity>("all");
  const sevOrder: Severity[] = ["critical", "high", "medium", "low"];
  const sevText: Record<string, string> = { all: "Alle", critical: "Kritisk", high: "Høj", medium: "Middel", low: "Lav" };
  const sevCount = (s: Severity) => category.subcategories.filter((x) => x.severity === s).length;
  const shownSubs = sevFilter === "all" ? category.subcategories : category.subcategories.filter((s) => s.severity === sevFilter);

  return (
    <div className="fade-in">
      <Breadcrumbs
        pillar={{ id: category.pillar, name: pillarName(category.pillar) }}
        category={{ id: category.id, name: category.name }}
        onHome={() => onNavigate("dashboard")}
        onPillar={() => onNavigate("pillar", category.pillar)}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{category.name}</h1>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{category.description}</p>
      </div>

      {/* Værktøj: AI Act klassificeringsværktøj (kun for hoejrisiko-systemer) - 
          bevidst inline: det ER svaret på kategoriens spørgsmål. */}
      {category.id === "hoejrisiko-systemer" && <AiActClassifier onNavigate={onNavigate} />}
      {category.id === "hoejrisiko-systemer" && (
        <div className="mb-6">
          <ToolTeaserCard tool={getTool("dokumentations-kort")} onOpen={onOpenTool} />
        </div>
      )}

      {/* Severity-filter-chips */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["all", ...sevOrder] as ("all" | Severity)[]).map((key) => {
          const count = key === "all" ? category.subcategories.length : sevCount(key as Severity);
          if (count === 0) return null;
          const active = sevFilter === key;
          return (
            <button
              key={key}
              onClick={() => setSevFilter(key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {sevText[key]} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Underkategorier */}
      <div className="mb-8 grid gap-4">
        {shownSubs.map((sub) => (
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

// ── Værktøj: AI Act klassificeringsværktøj ──
function AiActClassifier({
  onNavigate,
}: {
  onNavigate: (v: View, p?: PillarId, c?: Category, s?: Subcategory) => void;
}) {
  const [forbudte, setForbudte] = useState<string[]>([]);
  const [annex3, setAnnex3] = useState<string[]>([]);
  const [annex1, setAnnex1] = useState(false);
  const [gpai, setGpai] = useState(false);
  const [art50, setArt50] = useState<string[]>([]);

  const forbudtList = [
    { id: "manipulation", label: "Skadelig manipulation (Art. 5(1)(a))" },
    { id: "vulnerability", label: "Udnyttelse af sårbarheder (Art. 5(1)(b))" },
    { id: "social-scoring", label: "Social bedømmelse (Art. 5(1)(c))" },
    { id: "predictive-policing", label: "Risikovurdering for strafbar handling (Art. 5(1)(d))" },
    { id: "facial-db", label: "Ansigtsgenkendelses-databaser via scraping (Art. 5(1)(e))" },
    { id: "emotion", label: "Følelsesgenkendelse på arbejde/uddannelse (Art. 5(1)(f))" },
    { id: "biometric-cat", label: "Biometrisk kategorisering efter følsomme attributter (Art. 5(1)(g))" },
    { id: "remote-biometric", label: "Real-time biometrisk fjernidentifikation (Art. 5(1)(h))" },
    { id: "ncii", label: "Generering af NCII / CSAM (\"nudifiers\")" },
  ];

  const annex3List = [
    { id: "1", label: "§1 Biometri og følelsesgenkendelse (post-hoc identifikation, kategorisering)" },
    { id: "2", label: "§2 Sikkerhedskomponenter i kritisk infrastruktur (el/vand/gas/transport)" },
    { id: "3", label: "§3 Uddannelse og erhvervsuddannelse (adgang, vurdering, snyd-detektion)" },
    { id: "4", label: "§4 Beskæftigelse og HR (rekruttering, performance, opsigelse)" },
    { id: "5", label: "§5 Væsentlige tjenester (kreditscoring, forsikringsrisiko, social, akut)" },
    { id: "6", label: "§6 Retshåndhævelse (politi, anklagemyndighed, bevisvurdering)" },
    { id: "7", label: "§7 Migration, asyl, grænsekontrol" },
    { id: "8", label: "§8 Justits og demokratiske processer (domsforhandling, valg)" },
  ];

  const art50List = [
    { id: "chatbot", label: "AI-system til menneskelig interaktion (chatbot, voice agent)" },
    { id: "synth-content", label: "Generativ AI der producerer audio/billede/video/tekst" },
    { id: "emotion-rec", label: "Følelsesgenkendelse" },
    { id: "biometric-cat", label: "Biometrisk kategorisering (ikke-følsomme attributter)" },
    { id: "deepfake", label: "Deepfakes / manipulerede billeder eller video" },
    { id: "ai-public-text", label: "AI-genereret tekst til offentlig informationsbrug" },
  ];

  const toggle = (list: string[], setList: (v: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const reset = () => {
    setForbudte([]);
    setAnnex3([]);
    setAnnex1(false);
    setGpai(false);
    setArt50([]);
  };

  // Compute results - highest applicable classification dominates. Each result
  // carries clickable legal sources so the verdict is citable (Mette/DPO use case).
  const AIA = "https://artificialintelligenceact.eu";
  const shortName = (label?: string) => label?.split(" (")[0] ?? "";
  const results: {
    level: "forbudt" | "hoejrisiko" | "gpai" | "transparens" | "minimal";
    lines: string[];
    sources: { label: string; url: string }[];
  }[] = [];
  if (forbudte.length > 0) {
    results.push({
      level: "forbudt",
      lines: [
        "Forbudt under EU AI Act Art. 5 - må ikke markedsføres eller tages i brug",
        `Udløst af: ${forbudte.map((id) => shortName(forbudtList.find((f) => f.id === id)?.label)).join(" · ")}`,
        "Bøde op til 35 mio. EUR eller 7 % af global omsætning. Ikke afhjælpeligt.",
      ],
      sources: [{ label: "AI Act Art. 5", url: `${AIA}/article/5/` }],
    });
  }
  if (annex3.length > 0) {
    results.push({
      level: "hoejrisiko",
      lines: [
        `Højrisiko under Annex III - pkt. ${annex3.join(", ")}`,
        `Område(r): ${annex3.map((id) => shortName(annex3List.find((a) => a.id === id)?.label)).join(" · ")}`,
        "Udbyderpligter Art. 8-17 (risikostyring, datastyring, teknisk dokumentation, logging, menneskeligt tilsyn, CE-mærkning). Idriftsætterpligter Art. 26. FRIA kan være krævet (Art. 27).",
        "Gælder fra 2. december 2027 (efter AI Omnibus-udskydelsen).",
      ],
      sources: [
        { label: "Annex III", url: `${AIA}/annex/3/` },
        { label: "Art. 6", url: `${AIA}/article/6/` },
        { label: "Art. 26", url: `${AIA}/article/26/` },
      ],
    });
  }
  if (annex1) {
    results.push({
      level: "hoejrisiko",
      lines: [
        "Højrisiko under Annex I (sikkerhedskomponent i reguleret produkt)",
        "Skal CE-mærkes både efter sektorlov OG AI Act.",
        "Gælder fra 2. august 2028.",
      ],
      sources: [
        { label: "Annex I", url: `${AIA}/annex/1/` },
        { label: "Art. 113", url: `${AIA}/article/113/` },
      ],
    });
  }
  if (gpai) {
    results.push({
      level: "gpai",
      lines: [
        "GPAI-udbyder under Art. 53",
        "Teknisk dokumentation, træningsdata-resumé, copyright-policy.",
        "I kraft siden 2. august 2025.",
      ],
      sources: [{ label: "Art. 53", url: `${AIA}/article/53/` }],
    });
  }
  if (art50.length > 0) {
    results.push({
      level: "transparens",
      lines: [
        `Transparenskrav under Art. 50 (${art50.length} ${art50.length === 1 ? "udløser" : "udløsere"})`,
        "Chatbot-disclosure, maskinlæsbar AI-mærkning, brugerinformation. Gælder fra 2. august 2026.",
      ],
      sources: [{ label: "Art. 50", url: `${AIA}/article/50/` }],
    });
  }
  if (results.length === 0) {
    const anyChecked = forbudte.length + annex3.length + (annex1 ? 1 : 0) + (gpai ? 1 : 0) + art50.length > 0;
    if (!anyChecked) {
      // no answers yet
    } else {
      results.push({
        level: "minimal",
        lines: [
          "Minimal risiko",
          "Ingen specifikke AI Act-forpligtelser, men Art. 4 (AI-literacy) og generelle krav om god praksis gælder fortsat.",
        ],
        sources: [{ label: "Art. 4", url: `${AIA}/article/4/` }],
      });
    }
  }

  const levelColor = (level: string) => {
    switch (level) {
      case "forbudt":
        return "border-danger/40 bg-danger/10 text-danger";
      case "hoejrisiko":
        return "border-warning/40 bg-warning/10 text-warning";
      case "gpai":
        return "border-primary/40 bg-primary/10 text-primary";
      case "transparens":
        return "border-info/40 bg-info/10 text-info";
      case "minimal":
        return "border-success/40 bg-success/10 text-success";
      default:
        return "border-border bg-card text-foreground";
    }
  };

  const Section = ({
    title,
    article,
    items,
    selected,
    setSelected,
  }: {
    title: string;
    article: string;
    items: { id: string; label: string }[];
    selected: string[];
    setSelected: (v: string[]) => void;
  }) => (
    <div className="mb-4 rounded-lg border border-border bg-card/60 p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h4 className="font-display text-sm font-semibold text-foreground">{title}</h4>
        <span className="text-[10px] text-muted-foreground">{article}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-2 rounded p-1.5 text-xs leading-tight hover:bg-secondary/50"
          >
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggle(selected, setSelected, item.id)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary"
            />
            <span className="text-foreground/90">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Værktøj</span>
        <h3 className="font-display text-lg font-semibold text-foreground">Klassificeringsværktøj - AI Act</h3>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Det enkeltspørgsmål compliance-officers stiller mest: <em>"Er vores system højrisiko?"</em> Sæt flueben ved alt det jeres system gør - værktøjet beregner klassificeringen live. Resultatet vises nederst.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Section
          title="Forbudte praksisser"
          article="Art. 5"
          items={forbudtList}
          selected={forbudte}
          setSelected={setForbudte}
        />
        <Section
          title="Annex III højrisiko-områder"
          article="Art. 6 + Annex III"
          items={annex3List}
          selected={annex3}
          setSelected={setAnnex3}
        />
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card/60 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h4 className="font-display text-sm font-semibold text-foreground">Annex I / GPAI</h4>
            <span className="text-[10px] text-muted-foreground">Art. 53</span>
          </div>
          <label className="flex cursor-pointer items-start gap-2 rounded p-1.5 text-xs leading-tight hover:bg-secondary/50">
            <input type="checkbox" checked={annex1} onChange={() => setAnnex1(!annex1)} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary" />
            <span className="text-foreground/90">AI som sikkerhedskomponent i reguleret produkt (medicinsk udstyr, maskiner, biler, legetøj - Annex I)</span>
          </label>
          <label className="mt-2 flex cursor-pointer items-start gap-2 rounded p-1.5 text-xs leading-tight hover:bg-secondary/50">
            <input type="checkbox" checked={gpai} onChange={() => setGpai(!gpai)} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary" />
            <span className="text-foreground/90">I udvikler eller markedsfører en general-purpose AI-model (GPAI)</span>
          </label>
        </div>
        <Section
          title="Gennemsigtighedskrav"
          article="Art. 50"
          items={art50List}
          selected={art50}
          setSelected={setArt50}
        />
      </div>

      {/* Resultat */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">🎯 Resultat</h4>
          <button onClick={reset} className="text-[11px] text-muted-foreground hover:text-primary">Nulstil</button>
        </div>
        {results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/30 p-4 text-sm text-muted-foreground">
            Sæt flueben ovenfor for at se klassificeringen.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {results.map((r, i) => (
              <div key={i} className={`rounded-lg border p-4 ${levelColor(r.level)}`}>
                {r.lines.map((line, j) => (
                  <p key={j} className={j === 0 ? "font-display text-sm font-semibold" : "mt-1 text-xs opacity-90"}>{line}</p>
                ))}
                {r.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wide opacity-70">Retsgrundlag:</span>
                    {r.sources.map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-current/40 px-1.5 py-0.5 text-[10px] font-medium hover:underline"
                      >
                        {s.label} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Et system kan ramme flere klassificeringer samtidigt (fx både højrisiko og Art. 50-transparens). Den mest restriktive er styrende, men <em>alle</em> krav skal opfyldes. Klassificeringen med retsgrundlag-links er en kvalificeret pejling til intern brug - ikke juridisk rådgivning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Værktøj: Dokumentations-kort (rolle × dokument) ──
function DocumentationMap() {
  const roles = [
    { id: "provider", label: "Provider (Udbyder)", note: "Udvikler/markedsfører systemet" },
    { id: "deployer", label: "Deployer (Idriftsætter)", note: "Bruger systemet professionelt" },
    { id: "importer", label: "Importør", note: "Bringer ikke-EU-system ind på EU-marked" },
    { id: "distributor", label: "Distributør", note: "Videresalg i forsyningskæden" },
    { id: "eu-rep", label: "EU-repræsentant", note: "Repræsenterer ikke-EU-provider" },
  ];

  const docs = [
    { id: "tech-doc", label: "Teknisk dok.", article: "Art. 11 + Annex IV" },
    { id: "risk-mgmt", label: "Risikostyring", article: "Art. 9" },
    { id: "qms", label: "QMS", article: "Art. 17" },
    { id: "model-card", label: "Model card", article: "del af Annex IV" },
    { id: "conformity", label: "CE-erklæring", article: "Art. 47" },
    { id: "instructions", label: "Brugsanvisning", article: "Art. 13" },
    { id: "fria", label: "FRIA", article: "Art. 27" },
    { id: "dpia", label: "DPIA", article: "GDPR Art. 35" },
    { id: "logs", label: "Auto-logs", article: "Art. 12" },
    { id: "incident", label: "Hændelses-rapport", article: "Art. 73" },
    { id: "pmm", label: "Post-market monitoring", article: "Art. 72" },
    { id: "registry", label: "EU-database registrering", article: "Art. 49 + 71" },
  ];

  // r/c/v/n: required, conditional, voluntary, n/a
  type Cell = "r" | "c" | "v" | "n";
  const cells: Record<string, Record<string, Cell>> = {
    provider: { "tech-doc": "r", "risk-mgmt": "r", qms: "r", "model-card": "r", conformity: "r", instructions: "r", fria: "n", dpia: "c", logs: "r", incident: "r", pmm: "r", registry: "r" },
    deployer: { "tech-doc": "n", "risk-mgmt": "c", qms: "n", "model-card": "n", conformity: "n", instructions: "c", fria: "r", dpia: "r", logs: "r", incident: "r", pmm: "c", registry: "c" },
    importer: { "tech-doc": "r", "risk-mgmt": "n", qms: "n", "model-card": "n", conformity: "r", instructions: "r", fria: "n", dpia: "n", logs: "n", incident: "c", pmm: "n", registry: "c" },
    distributor: { "tech-doc": "c", "risk-mgmt": "n", qms: "n", "model-card": "n", conformity: "c", instructions: "c", fria: "n", dpia: "n", logs: "n", incident: "c", pmm: "n", registry: "n" },
    "eu-rep": { "tech-doc": "c", "risk-mgmt": "n", qms: "n", "model-card": "c", conformity: "c", instructions: "n", fria: "n", dpia: "n", logs: "c", incident: "r", pmm: "c", registry: "c" },
  };

  const notes: Record<string, Record<string, string>> = {
    provider: {
      "tech-doc": "Skal udarbejdes før markedsføring + opbevares 10 år (Art. 18)",
      "risk-mgmt": "Etablér og vedligehold gennem hele livscyklussen",
      qms: "Kvalitetsstyringssystem dækkende design, udvikling, drift",
      "model-card": "Del af teknisk dokumentation; opdatér ved retraining",
      conformity: "EU-overensstemmelseserklæring + CE-mærke før markedsføring",
      instructions: "Skriftlig brugsanvisning leveres til deployer",
      dpia: "Kun ved persondata-træning",
      logs: "Skal designe systemet til at producere logs",
      incident: "Rapportér alvorlige hændelser inden 15 dage til markedsovervågning",
      pmm: "Etablér plan; indsaml drift-data",
      registry: "Provider registrerer system i EU-database før markedsføring",
    },
    deployer: {
      "risk-mgmt": "Integrér i egen risikostyring",
      instructions: "Skal følge provider's instruktioner",
      fria: "Krav for offentlige myndigheder + visse private (banker, forsikring) ved højrisiko",
      dpia: "Hvis persondata behandles (GDPR Art. 35)",
      logs: "Opbevar 6 mdr. minimum (Art. 26(6))",
      incident: "Underret provider + myndighed ved alvorlig hændelse",
      pmm: "Rapportér observerede problemer tilbage til provider",
      registry: "Offentlige myndigheder registrerer egen brug",
    },
    importer: {
      "tech-doc": "Verificér at provider har udarbejdet og at den følger med",
      conformity: "Verificér CE-mærke + erklæring inden import",
      instructions: "Sikr at de følger med produktet ved videresalg",
      incident: "Viderebring til provider og myndighed",
      registry: "Sikr provider har registreret",
    },
    distributor: {
      "tech-doc": "Verificér CE-mærke før videresalg",
      conformity: "Spot-check at CE er gyldigt",
      instructions: "Sikr at de er ved produktet",
      incident: "Viderebring til provider + myndighed",
    },
    "eu-rep": {
      "tech-doc": "Skal kunne fremvise teknisk dokumentation til myndighed",
      "model-card": "Skal kunne fremvise på anmodning",
      conformity: "Holde kopi tilgængelig for myndigheder",
      logs: "Tilgang til logs hvis myndighed beder om det",
      incident: "Kontaktpunkt for hændelsesrapporter til EU-myndigheder",
      pmm: "Adgang til post-market data",
      registry: "Skal være registreret som repræsentant",
    },
  };

  const renderCell = (val: Cell) => {
    switch (val) {
      case "r":
        return { symbol: "✓", className: "bg-danger/15 text-danger border-danger/30", label: "Krav" };
      case "c":
        return { symbol: "⚠", className: "bg-warning/15 text-warning border-warning/30", label: "Betinget" };
      case "v":
        return { symbol: "○", className: "bg-info/15 text-info border-info/30", label: "Anbefalet" };
      case "n":
        return { symbol: " - ", className: "bg-muted/20 text-muted-foreground/60 border-border/40", label: "N/A" };
    }
  };

  return (
    <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Værktøj</span>
        <h3 className="font-display text-lg font-semibold text-foreground">Dokumentations-kort: rolle × krav</h3>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Hvilke dokumenter skal jeg producere? Hold musen over en celle for præcis henvisning. Klassificeringen er for <strong className="text-foreground">højrisiko-systemer under AI Act</strong> - minimal-risiko har færre formelle dokumentkrav.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-[22%] bg-card p-2 text-left align-bottom font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rolle</th>
              {docs.map((d) => (
                <th key={d.id} className="p-1.5 text-center align-bottom">
                  <p className="font-display text-[10px] font-semibold leading-tight text-foreground">{d.label}</p>
                  <p className="mt-0.5 text-[9px] font-normal leading-tight text-muted-foreground">{d.article}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-t border-border/40">
                <th className="sticky left-0 z-10 bg-card/80 p-3 text-left align-top">
                  <p className="font-display text-[12px] font-semibold text-foreground">{r.label}</p>
                  <p className="mt-0.5 text-[10px] font-normal leading-tight text-muted-foreground">{r.note}</p>
                </th>
                {docs.map((d) => {
                  const val = cells[r.id][d.id];
                  const cell = renderCell(val);
                  return (
                    <td key={d.id} className="p-1 align-middle">
                      <div
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded border font-display text-xs font-bold ${cell.className}`}
                        title={`${cell.label}: ${notes[r.id]?.[d.id] ?? ""}`}
                      >
                        {cell.symbol}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-1.5 text-[10px] md:grid-cols-4">
        {[
          { v: "r" as Cell, label: "Krav - direkte forpligtelse" },
          { v: "c" as Cell, label: "Betinget - kun visse use cases" },
          { v: "v" as Cell, label: "Anbefalet - best practice" },
          { v: "n" as Cell, label: "Ikke gældende for rollen" },
        ].map((legend) => {
          const cell = renderCell(legend.v);
          return (
            <span key={legend.v} className="inline-flex items-center gap-1.5">
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded border font-display text-[9px] font-bold ${cell.className}`}>{cell.symbol}</span>
              <span className="text-muted-foreground">{legend.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Subcategory View ──
function SubcategoryView({
  subcategory,
  category,
  onNavigate,
}: {
  subcategory: Subcategory;
  category: Category;
  onNavigate: (v: View, p?: PillarId, c?: Category, s?: Subcategory) => void;
}) {
  return (
    <div className="fade-in max-w-3xl">
      <Breadcrumbs
        pillar={{ id: category.pillar, name: pillarName(category.pillar) }}
        category={{ id: category.id, name: category.name }}
        subcategory={{ id: subcategory.id, name: subcategory.name }}
        onHome={() => onNavigate("dashboard")}
        onPillar={() => onNavigate("pillar", category.pillar)}
        onCategory={() => onNavigate("category", category.pillar, category)}
      />

      {/* Header */}
      <div className={`mb-8 rounded-xl border p-6 ${getSeverityBg(subcategory.severity)}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{category.icon}</span>
          <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${getSeverityColor(subcategory.severity)}`}>
            {subcategory.severity === "critical" ? "kritisk" : subcategory.severity === "high" ? "høj" : subcategory.severity === "medium" ? "middel" : "lav"} prioritet
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">{subcategory.name}</h1>
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
          Book et 30-min sparringsmøde med SOLUTION8 - vi hjælper danske organisationer i mål med AI-compliance før august 2026.
        </p>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Book 30-min sparring
        </a>
      </div>
    </div>
  );
}

// ── Newsletter + main CTA strip ──
const MAILERLITE_ACTION = "https://assets.mailerlite.com/jsonp/1571946/forms/189012812467536974/subscribe";

function InlineNewsletterPrompt({ hook, topic }: { hook: string; topic: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("fields[email]", email);
      formData.append("fields[source_website]", "ai-compliance.dk"); // hidden - segments signups by site in MailerLite
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
    <section className="my-10 rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="md:max-w-md">
          <h3 className="font-display text-base font-semibold text-foreground">📬 {hook}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Månedlig opdatering om {topic}. Ingen spam, afmeld når som helst.</p>
        </div>
        {status === "success" ? (
          <div className="rounded-md border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
            ✓ Tilmeldt - tjek din indbakke
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row md:w-auto md:max-w-sm">
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
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-danger">Noget gik galt. Prøv igen om lidt.</p>
      )}
    </section>
  );
}

function NewsletterCTA({ showBooking = true }: { showBooking?: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("fields[email]", email);
      formData.append("fields[source_website]", "ai-compliance.dk"); // hidden - segments signups by site in MailerLite
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
      <div className={`container mx-auto px-6 ${showBooking ? "grid gap-8 md:grid-cols-2" : "max-w-2xl"}`}>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold text-foreground">📬 Nyhedsbrev: AI Compliance i praksis</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Månedlig opdatering om AI Act-implementering, vejledninger fra Digst og Datatilsynet, og praktiske compliance-greb for danske virksomheder.
          </p>
          {status === "success" ? (
            <div className="mt-4 rounded-md border border-success/30 bg-success/10 p-4 text-sm text-success">
              ✓ Tak! Du er nu tilmeldt - tjek din indbakke for bekræftelse.
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
        {showBooking && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">🗓️ Book 30-min sparring</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Konkret sparring om jeres situation - risikoklassificering, gap mod 2026-deadline, DPIA/FRIA, leverandørstyring eller noget helt andet.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Book et møde
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Værktøjs-teaser-kort (erstatter inline-rendering på indholdssider) ──
function ToolTeaserCard({ tool, onOpen }: { tool: ToolConfig; onOpen: (slug: string) => void }) {
  return (
    <button
      onClick={() => onOpen(tool.slug)}
      className="card-hover group flex h-full w-full items-start gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 text-left"
    >
      <span className="text-2xl leading-none">{tool.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Værktøj</span>
          <p className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{tool.title}</p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{tool.shortPitch}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
          Åbn værktøj <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

// ── Værktøjs-oversigt (/vaerktoejer) ──
function ToolsIndex({ onHome, onOpenTool }: { onHome: () => void; onOpenTool: (slug: string) => void }) {
  return (
    <div className="fade-in">
      <Breadcrumbs toolsRoot onHome={onHome} />

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧰</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Værktøjer</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Interaktive værktøjer til EU AI Act-compliance - tidslinjer, matricer og klassificering. Hvert værktøj har sin egen side, så det kan deles direkte på LinkedIn, i mail eller i en præsentation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <ToolTeaserCard key={tool.slug} tool={tool} onOpen={onOpenTool} />
        ))}
      </div>
    </div>
  );
}

// ── Værktøjs-side (/vaerktoejer/<slug>) ──
function ToolPage({ tool, onHome, onTools }: { tool: ToolConfig; onHome: () => void; onTools: () => void }) {
  const ToolComponent = tool.Component;
  const captureRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const downloadPng = async () => {
    if (!captureRef.current) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image"); // lazy → own chunk, not in main bundle
      const bg = getComputedStyle(document.body).backgroundColor;
      const opts = { backgroundColor: bg, pixelRatio: 2, cacheBust: true };
      let dataUrl: string;
      try {
        dataUrl = await toPng(captureRef.current, opts);
      } catch {
        // Fallback if web-font embedding is blocked (CORS): system font, still a valid image
        dataUrl = await toPng(captureRef.current, { ...opts, skipFonts: true });
      }
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ai-compliance-${tool.slug}.png`;
      a.click();
    } catch { /* capture failed */ }
    setBusy(false);
  };

  const actionBtn =
    "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60";

  return (
    <div className="fade-in">
      <Breadcrumbs tool={{ name: tool.title }} onHome={onHome} onTools={onTools} />

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tool.icon}</span>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {tool.title} <span className="text-primary text-glow">Værktøj</span>
          </h1>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{tool.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={downloadPng} disabled={busy} className={actionBtn}>
            <Download className="h-3.5 w-3.5" /> {busy ? "Genererer…" : "Download PNG"}
          </button>
          <button onClick={copyLink} className={actionBtn}>
            <Copy className="h-3.5 w-3.5" /> {copied ? "Kopieret ✓" : "Kopiér link"}
          </button>
        </div>
      </div>

      <div ref={captureRef} className="rounded-xl">
        <ToolComponent />
      </div>

      <button
        onClick={onTools}
        className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Alle værktøjer
      </button>
    </div>
  );
}

export default Index;
