export type Severity = "critical" | "high" | "medium" | "low";
export type PillarId = "lovkrav" | "standarder" | "drift";

export type SourceType =
  | "EU AI Act"
  | "ISO"
  | "NIST"
  | "GDPR/EDPB"
  | "Datatilsynet"
  | "Digst"
  | "DORA"
  | "NIS2"
  | "CoE";

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  actions: string[];
  sourceLinks: { label: string; url: string; source: SourceType }[];
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  pillar: PillarId;
  icon: string;
  description: string;
  subcategories: Subcategory[];
  sourceLinks: { label: string; url: string; source: SourceType }[];
}

export interface Pillar {
  id: PillarId;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  itemCount: number;
}

// ── Source URL constants (verified May 2026) ─────────────────────────────
const EU_AI_ACT = "https://eur-lex.europa.eu/eli/reg/2024/1689/oj";
const AI_ACT_COMMISSION = "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai";
const AI_OFFICE = "https://digital-strategy.ec.europa.eu/en/policies/ai-office";
const DIGST_AI = "https://digst.dk/tilsyn/ai-forordningen/";
const DIGST_REGLER = "https://digst.dk/tilsyn/ai-forordningen/reglerne-i-ai-forordningen/";
const DIGST_FORBUDTE = "https://digst.dk/tilsyn/ai-forordningen/reglerne-i-ai-forordningen/forbudte-former-for-ai-praksis/";
const DIGST_HOEJRISIKO = "https://digst.dk/tilsyn/ai-forordningen/reglerne-i-ai-forordningen/hoejrisiko-ai-systemer/";
const DIGST_GPAI = "https://digst.dk/tilsyn/ai-forordningen/reglerne-i-ai-forordningen/ai-modeller-til-almen-brug/";
const DIGST_GENNEMSIGTIGHED = "https://digst.dk/tilsyn/ai-forordningen/reglerne-i-ai-forordningen/gennemsigtighedsforpligtelser-for-visse-ai-systemer/";
const DIGST_SANDKASSE = "https://digst.dk/tilsyn/ai-forordningen/regulatorisk-sandkasse-for-ai/";
const DATATILSYNET_AI = "https://www.datatilsynet.dk/regler-og-vejledning/kunstig-intelligens";
const DATATILSYNET_SANDKASSE = "https://www.datatilsynet.dk/regler-og-vejledning/kunstig-intelligens/regulatorisk-sandkasse";
const EDPB_OP_28 = "https://www.edpb.europa.eu/our-work-tools/our-documents/opinion-board-art-64/opinion-282024-certain-data-protection-aspects_en";
const ISO_42001 = "https://www.iso.org/standard/81230.html";
const ISO_23894 = "https://www.iso.org/standard/77304.html";
const NIST_AIRMF = "https://www.nist.gov/itl/ai-risk-management-framework";
const NIST_GENAI = "https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-600-1-artificial-intelligence-risk-management";
const NIS2 = "https://eur-lex.europa.eu/eli/dir/2022/2555/oj";
const DORA = "https://eur-lex.europa.eu/eli/reg/2022/2554/oj";
const COE_FCAI = "https://www.coe.int/en/web/artificial-intelligence/the-framework-convention-on-artificial-intelligence";
const ISO_42005 = "https://www.iso.org/standard/42005";
const NIS2_LOVEN = "https://www.retsinformation.dk/eli/lta/2025/434";
const EDPB_EDPS_OMNIBUS = "https://www.edpb.europa.eu/news/news/2026/edpb-edps-joint-opinion-digital-omnibus_en";
const DATATILSYNET_PODCAST = "https://www.datatilsynet.dk/regler-og-vejledning/podcast/ai-og-konsekvensanalyser-hvornaar-og-hvordan";
const FINANSTILSYNET_DORA = "https://www.finanstilsynet.dk/finansielle-temaer/tilsyn-med-ikt-og-datasikkerhed/";
const AI_OMNIBUS_AGREEMENT = "https://www.consilium.europa.eu/en/press/press-releases/2026/05/07/artificial-intelligence-council-and-parliament-agree-to-simplify-and-streamline-rules/";
const JTC21 = "https://www.cencenelec.eu/areas-of-work/cen-cenelec-topics/artificial-intelligence/";

// ── Pillars ───────────────────────────────────────────────────────────────
export const pillars: Pillar[] = [
  {
    id: "lovkrav",
    name: "Lovkrav & Sanktioner",
    subtitle: "Bindende forpligtelser med bødeansvar",
    description:
      "De juridiske krav danske virksomheder skal overholde – med bøder ved overtrædelse. Omfatter EU's AI-forordning (forbudte, højrisiko, GPAI, transparens), GDPR-overlap, NIS2, DORA og sektorspecifik regulering. NB: AI Omnibus-aftalen (7. maj 2026) udskyder højrisiko-fristerne til 2. december 2027 (Annex III) og 2. august 2028 (Annex I) — forpligtelserne består, kun timing ændres.",
    icon: "⚖️",
    itemCount: 29,
  },
  {
    id: "standarder",
    name: "Standarder & Bevisførelse",
    subtitle: "Sådan dokumenterer du overholdelse",
    description:
      "De rammeværker auditorer og tilsynsmyndigheder forventer at se. ISO/IEC 42001, NIST AI RMF, harmoniserede standarder under AI-forordningen og test-/dokumentationspraksis.",
    icon: "📐",
    itemCount: 11,
  },
  {
    id: "drift",
    name: "Drift & Governance",
    subtitle: "Daglig kontrol og operationalisering",
    description:
      "De praktiske kontroller, der gør compliance til en løbende baggrundsproces – ikke en periodisk audit. AI-register, deployer-pligter, leverandørstyring, AI-literacy.",
    icon: "🛠️",
    itemCount: 13,
  },
];

// ── Categories with subcategories ─────────────────────────────────────────
export const categories: Category[] = [
  // ╔═══════════════════════════════════════════════════════════════════════╗
  // ║  PILLAR 1: LOVKRAV & SANKTIONER                                       ║
  // ╚═══════════════════════════════════════════════════════════════════════╝

  {
    id: "forbudte-praksisser",
    name: "Forbudte AI-praksisser",
    pillar: "lovkrav",
    icon: "🚫",
    description:
      "Artikel 5 i AI-forordningen forbyder bestemte AI-systemer fuldstændig. Gælder siden 2. februar 2025. Bøder op til 35 mio. EUR eller 7 % af global omsætning.",
    subcategories: [
      {
        id: "skadelig-manipulation",
        name: "Skadelig manipulation",
        description:
          "Forbud mod AI der bruger subliminale eller målrettede manipulerende teknikker, der væsentligt forvrider personers adfærd og forårsager (eller sandsynligvis forårsager) betydelig skade.",
        severity: "critical",
        actions: [
          "Audit AI-drevne markedsføringsplatforme for skjulte manipulationsmekanismer",
          "Vurder personaliseringsalgoritmer mod kriteriet om \"væsentlig adfærdsforvridning\"",
          "Etabler etisk review for adfærdspåvirkende AI inden produktion",
        ],
        sourceLinks: [
          { label: "AI Act Art. 5(1)(a)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
        ],
        tags: ["artikel 5", "manipulation", "forbrugerbeskyttelse"],
      },
      {
        id: "udnyttelse-saarbarheder",
        name: "Udnyttelse af særlige sårbarheder",
        description:
          "Forbud mod AI der udnytter sårbarheder hos bestemte grupper – baseret på alder, handicap eller specifik social/økonomisk situation – til at forvride deres adfærd og forårsage skade.",
        severity: "critical",
        actions: [
          "Identificér målgruppe-segmentering der retter sig mod udsatte grupper",
          "Bedøm om ad-targeting eller anbefalingssystemer udnytter børn, ældre eller folk i social nød",
          "Skærpede etiske krav for AI rettet mod sårbare brugersegmenter",
        ],
        sourceLinks: [
          { label: "AI Act Art. 5(1)(b)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
        ],
        tags: ["artikel 5", "sårbarhed", "børn", "ulighed"],
      },
      {
        id: "social-scoring",
        name: "Social bedømmelse",
        description:
          "AI-systemer der klassificerer fysiske personer baseret på social adfærd eller forudsagte personlige egenskaber, og derved fører til ufordelagtig eller diskriminerende behandling på tværs af kontekster.",
        severity: "critical",
        actions: [
          "Kortlæg alle systemer der scorer/rangerer personer på tværs af kontekster",
          "Evaluer om HR-, kunde- eller borgerprofileringssystemer falder i denne kategori",
          "Stop ibrugtagning af konstaterede social scoring-systemer øjeblikkeligt",
        ],
        sourceLinks: [
          { label: "AI Act Art. 5(1)(c)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
        ],
        tags: ["artikel 5", "social scoring", "diskrimination", "profilering"],
      },
      {
        id: "predictive-policing",
        name: "Risikovurdering for strafbar handling",
        description:
          "Forbud mod AI der udelukkende bygger på profilering eller personlighedstræk til at forudsige eller vurdere risikoen for, at en person begår en strafbar handling. Undtagelse: hvis det suppleres af menneskelig vurdering baseret på objektive, kontrollerbare fakta.",
        severity: "critical",
        actions: [
          "Relevant primært for politi, retsvæsen og forsikring",
          "Bedøm interne svindelmodeller og kriminalitetsforebyggende systemer",
          "Sikr at risikoscores altid suppleres af konkret, objektiv menneskelig vurdering",
        ],
        sourceLinks: [
          { label: "AI Act Art. 5(1)(d)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
        ],
        tags: ["artikel 5", "predictive policing", "retshåndhævelse", "profilering"],
      },
      {
        id: "facial-recog-database",
        name: "Oprettelse af ansigtsgenkendelsesdatabaser",
        description:
          "Forbud mod AI-systemer der opretter eller udvider databaser til ansigtsgenkendelse gennem ikke-målrettet skrabning af ansigtsbilleder fra internettet eller CCTV-optagelser.",
        severity: "critical",
        actions: [
          "Forbyd brug af Clearview-lignende værktøjer fuldstændig",
          "Audit eksisterende leverandører for kilden til deres ansigtsdatabaser",
          "Inkludér i indkøbsklausuler at træningsdata ikke må stamme fra uautoriseret scraping",
        ],
        sourceLinks: [
          { label: "AI Act Art. 5(1)(e)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
        ],
        tags: ["artikel 5", "ansigtsgenkendelse", "scraping", "Clearview"],
      },
      {
        id: "foelelsesgenkendelse",
        name: "Udledning af følelser på arbejde & uddannelse",
        description:
          "Forbud mod AI-systemer der udleder følelser hos personer på arbejdspladsen eller i uddannelsesinstitutioner – med undtagelse af medicinske/sikkerhedsformål.",
        severity: "critical",
        actions: [
          "Audit eksisterende HR-tech og uddannelsesplatforme for følelsesgenkendelse",
          "Kontroller om recruiting-værktøjer analyserer ansigtsudtryk eller stemmetonalitet",
          "Dokumentér undtagelser (medicinske/sikkerhedsformål) hvis relevant",
        ],
        sourceLinks: [
          { label: "AI Act Art. 5(1)(f)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
        ],
        tags: ["artikel 5", "følelsesgenkendelse", "HR", "ansættelse"],
      },
      {
        id: "biometrisk-kategorisering",
        name: "Biometrisk kategorisering efter følsomme attributter",
        description:
          "Forbud mod biometriske systemer der kategoriserer fysiske personer for at udlede deres race, politiske holdninger, fagforeningstilhørsforhold, religiøse overbevisninger, seksuelle orientering eller sundhedsforhold.",
        severity: "critical",
        actions: [
          "Forbyd biometriske analyser der inferer følsomme persondatakategorier",
          "Audit produktanalyse-værktøjer der bruger ansigt/stemme til segmentering",
          "Lovlig undtagelse: lovligt mærkning eller filtrering af lovligt indsamlede biometriske datasæt",
        ],
        sourceLinks: [
          { label: "AI Act Art. 5(1)(g)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
        ],
        tags: ["artikel 5", "biometri", "følsomme data", "diskrimination"],
      },
      {
        id: "biometrisk-fjernidentifikation",
        name: "Real-time biometrisk fjernidentifikation",
        description:
          "Forbud mod brug af real-time biometriske fjernidentifikationssystemer i offentligt tilgængelige rum til retshåndhævelse – med snævre undtagelser (alvorlige forbrydelser, terror, forsvundne personer).",
        severity: "critical",
        actions: [
          "Relevant primært for offentlige myndigheder og leverandører hertil",
          "Privatsektor: undgå CCTV/access-systemer der laver real-time identifikation",
          "Post-hoc identifikation klassificeres som høj-risiko – ikke forbudt",
        ],
        sourceLinks: [
          { label: "AI Act Art. 5(1)(h)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
        ],
        tags: ["artikel 5", "biometri", "real-time", "offentlig sektor"],
      },
      {
        id: "ncii-csam",
        name: "Generering af NCII og CSAM (\"nudifiers\")",
        description:
          "AI Omnibus (7. maj 2026) tilføjede et nyt forbud mod AI-systemer der genererer billedmateriale uden samtykke (NCII) eller børneseksuelt overgrebsmateriale (CSAM). Gælder fra Omnibus' formelle vedtagelse (primo juni 2026).",
        severity: "critical",
        actions: [
          "Audit billed-/video-genereringstjenester for evnen til at producere NCII eller CSAM",
          "Blokér jailbreak-mønstre der omgår indholdsfiltre på generative billedmodeller",
          "Etabler proaktiv rapporteringskanal til myndigheder ved opdagelse",
          "Inkluder dette forbud i Acceptable Use Policy for medarbejder-brug af generativ AI",
        ],
        sourceLinks: [
          { label: "AI Omnibus-aftale (7. maj 2026)", url: AI_OMNIBUS_AGREEMENT, source: "EU AI Act" },
          { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
        ],
        tags: ["artikel 5", "NCII", "CSAM", "omnibus", "børn"],
      },
    ],
    sourceLinks: [
      { label: "EU AI Act – Regulation 2024/1689", url: EU_AI_ACT, source: "EU AI Act" },
      { label: "Digst: Forbudte former for AI-praksis", url: DIGST_FORBUDTE, source: "Digst" },
    ],
  },

  {
    id: "hoejrisiko-systemer",
    name: "Højrisiko-systemer",
    pillar: "lovkrav",
    icon: "⚠️",
    description:
      "AI-systemer der bruges i kritiske områder (Annex III) eller som sikkerhedskomponenter (Annex I). Efter AI Omnibus (7. maj 2026) gælder forpligtelserne fra 2. december 2027 (Annex III) og 2. august 2028 (Annex I).",
    subcategories: [
      {
        id: "klassificering",
        name: "Klassificering (Annex I + III)",
        description:
          "Identificér om jeres AI-systemer er højrisiko under Annex III (8 områder: biometri, kritisk infrastruktur, uddannelse, ansættelse, kreditscoring, offentlige ydelser, retshåndhævelse, migration/justits) eller Annex I (sikkerhedskomponenter).",
        severity: "critical",
        actions: [
          "Gennemfør Annex III-mapping for alle AI use cases i organisationen",
          "Dokumenter klassificeringsbeslutninger – også negative (\"ikke højrisiko fordi…\")",
          "Genvurder ved hver væsentlig ændring eller ny use case",
        ],
        sourceLinks: [
          { label: "AI Act Art. 6 + Annex III", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Højrisiko AI-systemer", url: DIGST_HOEJRISIKO, source: "Digst" },
        ],
        tags: ["annex III", "klassificering", "højrisiko"],
      },
      {
        id: "risikostyringssystem",
        name: "Risikostyringssystem (Art. 9)",
        description:
          "Højrisiko-systemer skal have et risikostyringssystem etableret, implementeret, dokumenteret og vedligeholdt gennem hele livscyklussen. Identifikation, evaluering og mitigering af rimeligt forudsigelige risici for sundhed, sikkerhed og grundrettigheder.",
        severity: "high",
        actions: [
          "Etabler livscyklus-risikostyring fra design til afvikling",
          "Dokumentér identificerede risici og mitigeringer pr. system",
          "Test mod relevante populationer inkl. sårbare grupper",
          "Tilpas løbende baseret på post-market monitoring-data",
        ],
        sourceLinks: [
          { label: "AI Act Art. 9", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Højrisiko AI-systemer", url: DIGST_HOEJRISIKO, source: "Digst" },
        ],
        tags: ["risikostyring", "artikel 9", "livscyklus"],
      },
      {
        id: "data-datastyring",
        name: "Data & datastyring (Art. 10)",
        description:
          "Krav til kvaliteten af trænings-, validerings- og testdata: relevans, repræsentativitet, fri for fejl, statistisk dækning af den tilsigtede population. Skal forebygge bias og diskrimination.",
        severity: "high",
        actions: [
          "Dokumentér datakilder, indsamlingsmetoder og -formål",
          "Bias-test træningsdata for under-/overrepræsentation af relevante grupper",
          "Etabler retningslinjer for håndtering af følsomme datakategorier",
          "Audit dataset-pipelines løbende for kvalitetsdrift",
        ],
        sourceLinks: [
          { label: "AI Act Art. 10", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Højrisiko AI-systemer", url: DIGST_HOEJRISIKO, source: "Digst" },
        ],
        tags: ["data governance", "bias", "artikel 10", "kvalitet"],
      },
      {
        id: "teknisk-dokumentation",
        name: "Teknisk dokumentation (Art. 11 + Annex IV)",
        description:
          "Detaljeret teknisk dokumentation af højrisiko-systemets formål, design, komponenter, trænings-/testdata, risikoanalyse, ydeevnemålinger og overvågningsplan. Skal være klar til myndigheder ved efterspørgsel.",
        severity: "high",
        actions: [
          "Brug Annex IV som tjekliste for dokumentationsindhold",
          "Hold dokumentationen ajour ved hver væsentlig systemændring",
          "Opbevar i mindst 10 år efter sidste markedsføring (Art. 18)",
          "Etabler proces for hurtig fremlæggelse ved tilsynsforespørgsel",
        ],
        sourceLinks: [
          { label: "AI Act Art. 11 + Annex IV", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Højrisiko AI-systemer", url: DIGST_HOEJRISIKO, source: "Digst" },
        ],
        tags: ["dokumentation", "artikel 11", "annex IV"],
      },
      {
        id: "conformity-assessment",
        name: "Conformity assessment & CE-mærkning",
        description:
          "Højrisiko-systemer skal gennemgå overensstemmelsesvurdering før de markedsføres. Inkluderer teknisk dokumentation, kvalitetsstyringssystem, risikostyring og post-market monitoring.",
        severity: "critical",
        actions: [
          "Etabler kvalitetsstyringssystem efter AI Act Art. 17",
          "Forbered teknisk dokumentation (Annex IV)",
          "Identificer om intern eller tredjepartsvurdering er påkrævet",
          "Plan for CE-mærkning og EU-overensstemmelseserklæring",
        ],
        sourceLinks: [
          { label: "AI Act Art. 43 + Annex VI–VII", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Højrisiko AI-systemer", url: DIGST_HOEJRISIKO, source: "Digst" },
        ],
        tags: ["CE-mærkning", "overensstemmelse", "QMS"],
      },
      {
        id: "eu-database",
        name: "EU-database registrering",
        description:
          "Højrisiko-systemer skal registreres i den centrale EU-database før ibrugtagning. Offentlige myndigheder har særlige registreringspligter også for ikke-højrisiko-systemer.",
        severity: "high",
        actions: [
          "Identificer hvem der har registreringspligten (udbyder vs. deployer)",
          "Saml påkrævet metadata om systemet inden registrering",
          "Hold registreringer ajour ved væsentlige ændringer",
        ],
        sourceLinks: [
          { label: "AI Act Art. 49 + Art. 71", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["registrering", "transparens", "EU-database"],
      },
      {
        id: "fria",
        name: "Fundamental Rights Impact Assessment (FRIA)",
        description:
          "Visse deployer-organisationer (offentlige myndigheder, banker, forsikringsselskaber der bruger højrisiko-AI) skal gennemføre konsekvensanalyse for grundlæggende rettigheder før idriftsættelse.",
        severity: "high",
        actions: [
          "Identificér om jeres organisation falder under FRIA-kravet (Art. 27)",
          "Definér FRIA-process – ofte i samspil med DPIA",
          "Notificér markedsovervågningsmyndigheden efter gennemførsel",
          "Genvurder ved væsentlige ændringer i brug",
        ],
        sourceLinks: [
          { label: "AI Act Art. 27", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Datatilsynet: Konsekvensanalyser", url: DATATILSYNET_AI, source: "Datatilsynet" },
        ],
        tags: ["FRIA", "konsekvensanalyse", "grundrettigheder", "deployer"],
      },
    ],
    sourceLinks: [
      { label: "EU AI Act – Kapitel III om højrisiko-systemer", url: EU_AI_ACT, source: "EU AI Act" },
      { label: "Digst: Højrisiko AI-systemer", url: DIGST_HOEJRISIKO, source: "Digst" },
    ],
  },

  {
    id: "gpai",
    name: "GPAI-forpligtelser",
    pillar: "lovkrav",
    icon: "🧠",
    description:
      "General-purpose AI-modeller (GPAI) som GPT-, Claude-, Gemini-modeller har egne forpligtelser siden 2. august 2025. Påvirker både udbydere og virksomheder der downstream-finetuner.",
    subcategories: [
      {
        id: "gpai-dokumentation",
        name: "Teknisk dokumentation + træningsdata-resumé",
        description:
          "GPAI-udbydere skal levere teknisk dokumentation, modelbrugsanvisning og et offentligt sammendrag af træningsdata. Downstream-deployere skal kunne videreformidle relevant information.",
        severity: "high",
        actions: [
          "Indhent og opbevar leverandørens GPAI-dokumentation",
          "Verificer at træningsdata-resumé er offentligt tilgængeligt",
          "Etabler kontraktkrav om opdateret dokumentation",
        ],
        sourceLinks: [
          { label: "AI Act Art. 53 + Annex XI–XII", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: AI-modeller til almen brug", url: DIGST_GPAI, source: "Digst" },
        ],
        tags: ["GPAI", "dokumentation", "transparens"],
      },
      {
        id: "gpai-copyright",
        name: "Copyright-compliance policy",
        description:
          "GPAI-udbydere skal have politik for overholdelse af EU's ophavsretsdirektiv – herunder respekt for rettighedshavere der har gjort opt-out gældende (TDM-undtagelsen).",
        severity: "high",
        actions: [
          "Tjek udbydernes copyright-politik som del af leverandørudvælgelse",
          "Forstå indvirkning på finetuning med eget content",
          "Hold styr på opt-out-signaler hvis I selv lader content scrape",
        ],
        sourceLinks: [
          { label: "AI Act Art. 53(1)(c)", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["copyright", "ophavsret", "TDM"],
      },
      {
        id: "gpai-systemic-risk",
        name: "Systemic risk-modeller (> 10²⁵ FLOPs)",
        description:
          "Modeller over en computetærskel klassificeres som systemic risk og udløser yderligere krav om model-evaluering, adversarial testing, incident reporting og cybersikkerhed.",
        severity: "medium",
        actions: [
          "Mest relevant for udbydere af frontier-modeller – ikke deployere",
          "Som deployer: forstå om jeres LLM-leverandør er klassificeret som systemic risk",
          "Følg AI Office's klassifikationer og Code of Practice-signaler",
        ],
        sourceLinks: [
          { label: "AI Act Art. 55", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "EU AI Office", url: AI_OFFICE, source: "EU AI Act" },
        ],
        tags: ["systemic risk", "frontier", "compute"],
      },
      {
        id: "gpai-code-of-practice",
        name: "GPAI Code of Practice",
        description:
          "Den frivillige adfærdskodeks fra AI Office blev finaliseret 10. juli 2025 og endosseret af Kommissionen + AI Board 1. august 2025. De facto compliance-baseline for GPAI-forpligtelser indtil harmoniserede standarder publiceres.",
        severity: "medium",
        actions: [
          "Læs Code of Practice for jeres GPAI-leverandørs forpligtelser",
          "Brug den som benchmark for kontraktkrav",
          "Forvent at standarder følger – planlæg fleksibilitet i compliance-arkitekturen",
        ],
        sourceLinks: [
          { label: "EU AI Office", url: AI_OFFICE, source: "EU AI Act" },
        ],
        tags: ["GPAI", "Code of Practice", "soft law"],
      },
    ],
    sourceLinks: [
      { label: "Digst: AI-modeller til almen brug", url: DIGST_GPAI, source: "Digst" },
      { label: "EU AI Office", url: AI_OFFICE, source: "EU AI Act" },
    ],
  },

  {
    id: "gennemsigtighedsforpligtelser",
    name: "Gennemsigtighedsforpligtelser (Art. 50)",
    pillar: "lovkrav",
    icon: "💬",
    description:
      "Krav om at brugere ved hvornår de interagerer med AI, og hvornår indhold er kunstigt genereret. Gælder fra 2. august 2026 for både udbydere og idriftsættere – uafhængigt af om systemet er højrisiko.",
    subcategories: [
      {
        id: "chatbot-oplysning",
        name: "Chatbot-oplysningspligt",
        description:
          "Udbydere skal sikre at AI-systemer beregnet til menneskelig interaktion designes så personer informeres ved første interaktion om, at de taler med en AI – medmindre det er åbenlyst.",
        severity: "high",
        actions: [
          "Tilføj synlig AI-disclaimer ved chatbot-start (\"Du taler med en AI-assistent\")",
          "Audit eksisterende kunde-/medarbejder-chatbots for disclosure",
          "Tilpas tone-of-voice så det matcher kundens forventninger",
        ],
        sourceLinks: [
          { label: "AI Act Art. 50(1)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Gennemsigtighedsforpligtelser", url: DIGST_GENNEMSIGTIGHED, source: "Digst" },
        ],
        tags: ["chatbot", "transparens", "artikel 50"],
      },
      {
        id: "mark-ai-genereret-indhold",
        name: "Mærkning af AI-genereret indhold (maskinlæsbart)",
        description:
          "Udbydere af generativ AI skal sikre at output (syntetisk lyd, billede, video, tekst) mærkes i maskinlæsbart format og kan identificeres som kunstigt genereret – fx via watermarks eller metadata.",
        severity: "high",
        actions: [
          "Aktiver model-leverandørens watermarking-funktioner (C2PA, SynthID, etc.)",
          "Krav i leverandørkontrakter om maskinlæsbar markering",
          "Tjek output-pipelines for at metadata bevares gennem hele kæden",
        ],
        sourceLinks: [
          { label: "AI Act Art. 50(2)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Gennemsigtighedsforpligtelser", url: DIGST_GENNEMSIGTIGHED, source: "Digst" },
        ],
        tags: ["watermark", "syntetisk indhold", "metadata", "artikel 50"],
      },
      {
        id: "foelelser-underretning",
        name: "Underretning ved følelsesgenkendelse",
        description:
          "Idriftsættere af AI-systemer til følelsesgenkendelse skal informere de personer der eksponeres for systemet. Persondatabehandling skal yderligere overholde GDPR.",
        severity: "high",
        actions: [
          "Hvor følelsesgenkendelse er tilladt (uden for arbejde/uddannelse): informér tydeligt",
          "Inkluder i privatlivserklæring og servicebetingelser",
          "Etabler opt-out-mekanisme hvor muligt",
        ],
        sourceLinks: [
          { label: "AI Act Art. 50(3)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Gennemsigtighedsforpligtelser", url: DIGST_GENNEMSIGTIGHED, source: "Digst" },
        ],
        tags: ["følelsesgenkendelse", "underretning", "artikel 50"],
      },
      {
        id: "biometri-underretning",
        name: "Underretning ved biometrisk kategorisering",
        description:
          "Idriftsættere af biometriske kategoriseringssystemer (de tilladte, ikke-følsomme typer) skal informere de eksponerede personer.",
        severity: "high",
        actions: [
          "Identificér hvor biometrisk kategorisering bruges (typisk i marketing eller security)",
          "Sikr klar information til berørte personer ved indgang/login",
          "Dokumentér samtykke hvor det er retsgrundlag",
        ],
        sourceLinks: [
          { label: "AI Act Art. 50(3)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Gennemsigtighedsforpligtelser", url: DIGST_GENNEMSIGTIGHED, source: "Digst" },
        ],
        tags: ["biometri", "underretning", "artikel 50"],
      },
      {
        id: "deepfake-maerkning",
        name: "Deepfake-mærkning",
        description:
          "Idriftsættere skal oplyse at indhold er AI-genereret eller -manipuleret når deepfake-billeder, lyd eller video distribueres – undtagen ved åbenlyst kunstnerisk eller satirisk brug.",
        severity: "high",
        actions: [
          "Mærk al AI-genereret marketing-content med tydelig deklaration",
          "Etabler intern review-proces for AI-genererede billeder/video",
          "Træn marketing- og kommunikationsteams i kravene",
        ],
        sourceLinks: [
          { label: "AI Act Art. 50(4)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Gennemsigtighedsforpligtelser", url: DIGST_GENNEMSIGTIGHED, source: "Digst" },
        ],
        tags: ["deepfake", "marketing", "mærkning", "artikel 50"],
      },
      {
        id: "ai-tekst-offentlig",
        name: "AI-genereret offentlig tekst",
        description:
          "AI-genereret tekst der offentliggøres med det formål at informere offentligheden om emner af offentlig interesse, skal mærkes som kunstigt genereret – medmindre den er redaktionelt gennemgået med menneskelig redaktionel ansvarlighed.",
        severity: "high",
        actions: [
          "Identificér AI-pipelines der producerer offentligt indhold (PR, nyhedsbreve)",
          "Etabler enten mærkning eller redaktionel ansvarlighedsproces",
          "Dokumentér valg af tilgang pr. publikationskanal",
        ],
        sourceLinks: [
          { label: "AI Act Art. 50(4)", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Gennemsigtighedsforpligtelser", url: DIGST_GENNEMSIGTIGHED, source: "Digst" },
        ],
        tags: ["AI-tekst", "offentlig interesse", "redaktion", "artikel 50"],
      },
    ],
    sourceLinks: [
      { label: "AI Act Art. 50", url: EU_AI_ACT, source: "EU AI Act" },
      { label: "Digst: Gennemsigtighedsforpligtelser", url: DIGST_GENNEMSIGTIGHED, source: "Digst" },
    ],
  },

  {
    id: "tilstoedende-lovgivning",
    name: "Tilstødende lovgivning",
    pillar: "lovkrav",
    icon: "📋",
    description:
      "AI-forordningen står ikke alene. GDPR, NIS2, DORA og sektorspecifikke regler overlapper og udfylder hinanden – og udløser ofte de største bøder i 2026.",
    subcategories: [
      {
        id: "gdpr-ai",
        name: "GDPR – retsgrundlag, DPIA & EDPB Op. 28/2024",
        description:
          "GDPR gælder fuldt for AI der behandler persondata. EDPB's udtalelse 28/2024 har sat ramme for lovligt retsgrundlag, anonymitet af trænede modeller og konsekvenser af ulovligt indsamlede træningsdata.",
        severity: "critical",
        actions: [
          "Identificer retsgrundlag (typisk legitim interesse + balancetest) for AI-træning og -brug",
          "Gennemfør DPIA før højrisiko-databehandling – Datatilsynet har skabeloner",
          "Vurder om trænede modeller anses som personoplysninger pr. EDPB Op. 28/2024",
        ],
        sourceLinks: [
          { label: "EDPB Opinion 28/2024", url: EDPB_OP_28, source: "GDPR/EDPB" },
          { label: "Datatilsynet: Kunstig intelligens", url: DATATILSYNET_AI, source: "Datatilsynet" },
        ],
        tags: ["GDPR", "DPIA", "EDPB", "persondata"],
      },
      {
        id: "nis2",
        name: "NIS2 – cybersikkerhed for væsentlige enheder",
        description:
          "NIS2-direktivet er transponeret i Danmark via NIS2-loven (LOV nr 434 af 06/05/2025, i kraft 1. juli 2025). Registreringsfristen for væsentlige/vigtige enheder var 1. oktober 2025. AI-systemer i scope arver NIS2-cybersikkerhedsforpligtelser, herunder hændelsesrapportering inden for 24/72 timer.",
        severity: "high",
        actions: [
          "Vurder om jeres organisation er væsentlig eller vigtig enhed under NIS2",
          "Bekræft registrering hos relevant sektor-tilsynsmyndighed (gerne via Styrelsen for Samfundssikkerhed)",
          "Inkluder AI-systemer i risikostyrings- og hændelsesresponsplaner",
          "Etabler 24-timers early warning til CSIRT ved AI-relaterede hændelser",
        ],
        sourceLinks: [
          { label: "NIS2-direktivet (EU)", url: NIS2, source: "NIS2" },
          { label: "NIS2-loven LOV nr 434/2025 (DK)", url: NIS2_LOVEN, source: "Digst" },
        ],
        tags: ["NIS2", "cybersikkerhed", "hændelsesrapportering"],
      },
      {
        id: "dora",
        name: "DORA – ICT/AI-leverandørrisiko (finans)",
        description:
          "DORA gælder for finans-/forsikringssektoren siden 17. januar 2025. ICT-third-party-register skal eksplicit dække AI-leverandører. Første indleveringsfrist til Finanstilsynet var 31. marts 2026; temaundersøgelse af forsikring/pension publiceres forår 2026. Ofte vigtigere end AI Act for danske banker på kort sigt.",
        severity: "high",
        actions: [
          "Tilføj AI-leverandører til DORA-third-party-register",
          "Klassificér kritisk/væsentlig AI-tjeneste-afhængighed",
          "Inkluder AI-specifikke krav i ICT-kontrakter (testing, exit-planer, audit-rettigheder)",
          "Følg Finanstilsynets temaundersøgelser om DORA i 2026",
        ],
        sourceLinks: [
          { label: "DORA – Regulation 2022/2554", url: DORA, source: "DORA" },
          { label: "Finanstilsynet: DORA-tilsyn", url: FINANSTILSYNET_DORA, source: "Finanstilsynet" },
        ],
        tags: ["DORA", "finans", "leverandørrisiko"],
      },
      {
        id: "coe-convention",
        name: "Council of Europe Framework Convention on AI",
        description:
          "Verdens første bindende internationale AI-traktat (CETS 225). DK underskrev sep 2024; EU ratificerede 15. maj 2026. Lægger menneskerettigheds-/retsstats-lag ovenpå AI Act — mest relevant for offentlig sektor.",
        severity: "medium",
        actions: [
          "Mest relevant for offentlige myndigheder og statslige selskaber",
          "Vurder use cases der berører ytringsfrihed, demokrati eller rule of law",
          "Følg national ratifikationsproces (sker normalt via Folketinget efter EU-ratifikation)",
        ],
        sourceLinks: [
          { label: "CoE Framework Convention on AI (CETS 225)", url: COE_FCAI, source: "CoE" },
        ],
        tags: ["CoE", "menneskerettigheder", "international", "offentlig sektor"],
      },
      {
        id: "sektorregler",
        name: "Sektorregler – MDR, finans, ansættelse, undervisning",
        description:
          "Sektorlovgivning udfylder AI Act. Medicinsk udstyr (MDR), kreditscoring (EBA-retningslinjer), ansættelse (ligebehandlingsloven), uddannelse – hver med egne dokumentations- og diskriminationskrav.",
        severity: "high",
        actions: [
          "Map AI use cases mod relevant sektorlovgivning – ikke kun AI Act",
          "Konsulter sektor-tilsynsmyndighed (Lægemiddelstyrelsen, Finanstilsynet osv.)",
          "Forstå at AI Act er minimumsstandard – sektorregler kan være strengere",
        ],
        sourceLinks: [
          { label: "Digst: Reglerne i AI-forordningen", url: DIGST_REGLER, source: "Digst" },
        ],
        tags: ["sektorregler", "MDR", "finans", "ansættelse"],
      },
    ],
    sourceLinks: [
      { label: "Datatilsynet: Kunstig intelligens", url: DATATILSYNET_AI, source: "Datatilsynet" },
      { label: "EDPB Opinion 28/2024", url: EDPB_OP_28, source: "GDPR/EDPB" },
    ],
  },

  // ╔═══════════════════════════════════════════════════════════════════════╗
  // ║  PILLAR 2: STANDARDER & BEVISFØRELSE                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════╝

  {
    id: "aims",
    name: "AI Management System (ISO 42001)",
    pillar: "standarder",
    icon: "🏛️",
    description:
      "ISO/IEC 42001 er den certificerbare standard for AI Management Systems. Forventes at blive de facto compliance-bevis over for tilsyn og kunder – på linje med ISO 27001 for informationssikkerhed.",
    subcategories: [
      {
        id: "iso-42001-certificering",
        name: "ISO/IEC 42001 certificering",
        description:
          "Etablering af et certificerbart AI Management System (AIMS). Dækker AI-politik, risikovurdering, livscyklus-management, leverandørstyring og kontinuerlig forbedring.",
        severity: "high",
        actions: [
          "Vurder om certificering eller blot alignment (uden certifikat) er rette ambitionsniveau",
          "Gennemfør gap-analyse mod ISO 42001-kontroller (Annex A)",
          "Plan for intern audit + ekstern certificeringsaudit",
        ],
        sourceLinks: [
          { label: "ISO/IEC 42001:2023", url: ISO_42001, source: "ISO" },
        ],
        tags: ["ISO 42001", "AIMS", "certificering"],
      },
      {
        id: "iso-42005-impact",
        name: "ISO/IEC 42005:2025 — AI Impact Assessment",
        description:
          "Companion-standard til ISO 42001, publiceret maj 2025. Definerer struktureret AI Impact Assessment (AIIA) — relevant for FRIA, DPIA-integration og generelt AI-risikoarbejde.",
        severity: "medium",
        actions: [
          "Brug ISO 42005 som skabelon for AIIA-skabeloner internt",
          "Map mod AI Act Art. 27 (FRIA) og GDPR Art. 35 (DPIA) for at undgå dobbeltarbejde",
          "Integrér med ISO 42001-ledelsessystem hvis det er på plads",
        ],
        sourceLinks: [
          { label: "ISO/IEC 42005:2025", url: ISO_42005, source: "ISO" },
        ],
        tags: ["ISO 42005", "AIIA", "impact assessment"],
      },
      {
        id: "ai-policy-roller",
        name: "AI-policy og roller",
        description:
          "Formel AI-politik der definerer principper, ansvar (AI Lead, AI Risk Owner, Data Steward), processer for vurdering af nye use cases og governance-forum.",
        severity: "high",
        actions: [
          "Skriv AI-politik som bestyrelsen/direktionen godkender",
          "Etabler tværfagligt AI-governance-forum",
          "Tildel klare roller for AI-livscyklus-faser",
        ],
        sourceLinks: [
          { label: "ISO 42001 §5", url: ISO_42001, source: "ISO" },
          { label: "AI Act Art. 26 (deployer-pligter)", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["governance", "AI-politik", "roller"],
      },
      {
        id: "intern-audit",
        name: "Intern audit-program",
        description:
          "Periodisk intern revision af AIMS-effektivitet og kontroldækning. Forventes som forberedelse til både ekstern audit og myndighedstilsyn.",
        severity: "medium",
        actions: [
          "Definer audit-rytme (typisk årlig)",
          "Træn interne auditorer i AI-specifikke kontroller",
          "Spor afvigelser og corrective actions i management review",
        ],
        sourceLinks: [
          { label: "ISO 42001 §9", url: ISO_42001, source: "ISO" },
        ],
        tags: ["audit", "ledelsessystem", "kontrol"],
      },
    ],
    sourceLinks: [
      { label: "ISO/IEC 42001:2023", url: ISO_42001, source: "ISO" },
    ],
  },

  {
    id: "risikostyring",
    name: "Risikostyring (NIST AI RMF)",
    pillar: "standarder",
    icon: "🎯",
    description:
      "NIST AI Risk Management Framework er det førende operationelle rammeværk under ISO 42001. Govern–Map–Measure–Manage. GenAI-profilen (NIST AI 600-1) tilføjer 200+ kontroller for generative systemer.",
    subcategories: [
      {
        id: "nist-rmf-core",
        name: "NIST AI RMF: Govern–Map–Measure–Manage",
        description:
          "Det centrale NIST-rammeværk for AI-risikostyring – frivilligt men de facto-baseline. Etablerer roller og processer for hele AI-livscyklussen.",
        severity: "high",
        actions: [
          "Map jeres AI use cases til de fire kernefunktioner",
          "Identificér eksisterende kontroller der allerede dækker NIST RMF-områder",
          "Brug NIST som det operationelle lag under jeres ISO 42001-AIMS",
        ],
        sourceLinks: [
          { label: "NIST AI RMF 1.0", url: NIST_AIRMF, source: "NIST" },
        ],
        tags: ["NIST", "RMF", "risikostyring"],
      },
      {
        id: "nist-genai-profile",
        name: "GenAI-specifikke kontroller (NIST AI 600-1)",
        description:
          "NIST's Generative AI Profile tilføjer 200+ specifikke risici og kontroller for LLM-baserede systemer – herunder hallucination, prompt injection, data leakage, IP-risici.",
        severity: "high",
        actions: [
          "Brug GenAI-profilen som tjekliste for LLM-implementeringer",
          "Implementer red-team-testing før produktion",
          "Etabler hallucination-monitoring og brugerfeedback-loop",
        ],
        sourceLinks: [
          { label: "NIST AI 600-1 GenAI Profile", url: NIST_GENAI, source: "NIST" },
        ],
        tags: ["GenAI", "LLM", "hallucination", "prompt injection"],
      },
      {
        id: "iso-23894",
        name: "ISO/IEC 23894 risikoguide (supplerende)",
        description:
          "ISO 23894 er den AI-specifikke supplerende risikostandard. Dækker samme område som NIST RMF men i ISO-format – nyttig hvis I i forvejen er ISO-tunge.",
        severity: "low",
        actions: [
          "Vælg ét primært risikorammeværk (typisk NIST AI RMF)",
          "Brug ISO 23894 som supplement hvis I har ISO-ledelsessystemer i forvejen",
          "Undgå overlap-arbejde med dobbelt-dokumentation",
        ],
        sourceLinks: [
          { label: "ISO/IEC 23894:2023", url: ISO_23894, source: "ISO" },
        ],
        tags: ["ISO 23894", "risiko"],
      },
    ],
    sourceLinks: [
      { label: "NIST AI Risk Management Framework", url: NIST_AIRMF, source: "NIST" },
    ],
  },

  {
    id: "harmoniserede-standarder",
    name: "Harmoniserede standarder under AI Act",
    pillar: "standarder",
    icon: "📊",
    description:
      "CEN-CENELEC JTC 21 udvikler de harmoniserede standarder, der giver præsumption om overensstemmelse med AI Act. Accelereret leverance besluttet okt 2025; første publikationer i OJ ventes Q4 2026. AI Omnibus har reduceret hastværket via deadline-udskydelse.",
    subcategories: [
      {
        id: "jtc21-standarder",
        name: "CEN-CENELEC JTC 21-standarder",
        description:
          "Den europæiske standardiseringsindsats for AI Act-compliance. Dækker risikostyring, kvalitetsstyring, data-governance, transparens, robusthed og bias-styring.",
        severity: "high",
        actions: [
          "Følg JTC 21's publikationskalender",
          "Plan for adoption når harmoniserede standarder er publiceret i OJ",
          "Brug udkast-versioner som forberedelse",
        ],
        sourceLinks: [
          { label: "CEN-CENELEC AI work", url: JTC21, source: "EU AI Act" },
        ],
        tags: ["harmoniserede standarder", "JTC 21", "CEN-CENELEC"],
      },
      {
        id: "praesumption",
        name: "Præsumption om overensstemmelse",
        description:
          "Overholdelse af harmoniserede standarder giver formodning om AI Act-overensstemmelse – den letteste compliance-vej for højrisiko-systemer.",
        severity: "medium",
        actions: [
          "Inkorporer harmoniserede standarder i jeres conformity assessment",
          "Dokumentér hvilke standarder I baserer compliance på",
          "Hold styr på erstatninger og opdateringer i OJ",
        ],
        sourceLinks: [
          { label: "AI Act Art. 40", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["præsumption", "compliance", "standarder"],
      },
    ],
    sourceLinks: [
      { label: "CEN-CENELEC AI work", url: JTC21, source: "EU AI Act" },
    ],
  },

  {
    id: "test-dokumentation",
    name: "Test, evaluering & dokumentation",
    pillar: "standarder",
    icon: "🔍",
    description:
      "Det auditorer faktisk beder om: testresultater, model cards, logs, konsekvensanalyser. Pragmatiske kontroller der både dækker AI Act, ISO 42001 og NIST.",
    subcategories: [
      {
        id: "model-cards",
        name: "Model cards / system cards",
        description:
          "Standardiseret dokumentation af modelens formål, træningsdata, evalueringsresultater, kendte begrænsninger og brugsbetingelser.",
        severity: "medium",
        actions: [
          "Etabler skabelon for model/system cards (NIST anbefaler)",
          "Krav model cards fra alle leverandører af AI-komponenter",
          "Hold model cards opdaterede ved retraining",
        ],
        sourceLinks: [
          { label: "NIST GenAI Profile", url: NIST_GENAI, source: "NIST" },
        ],
        tags: ["model card", "dokumentation", "transparens"],
      },
      {
        id: "red-teaming",
        name: "Red-teaming & adversarial testing",
        description:
          "Systematisk pre-deployment-testning af AI-systemer for sikkerheds-, bias- og misbrugsrisici. Krav for GPAI-modeller med systemic risk og forventet best practice for højrisiko-systemer.",
        severity: "high",
        actions: [
          "Etabler red-team-protokol før produktion af LLM-baserede systemer",
          "Test for prompt injection, jailbreaks, data leakage og bias",
          "Dokumentér testresultater og remedieringsbeslutninger",
        ],
        sourceLinks: [
          { label: "NIST AI 600-1", url: NIST_GENAI, source: "NIST" },
        ],
        tags: ["red team", "adversarial", "testing"],
      },
      {
        id: "logging-traceability",
        name: "Logging & traceability",
        description:
          "Højrisiko-systemer skal automatisk logge hændelser i tilstrækkelig grad til at sikre sporbarhed gennem hele livscyklussen. Også kritisk for incident response og audit.",
        severity: "high",
        actions: [
          "Definer logging-arkitektur: input, output, beslutninger, ændringer",
          "Etabler opbevaringspolitik (typisk 6 mdr+ for højrisiko)",
          "Sikr at logs er manipulationssikrede og søgbare",
        ],
        sourceLinks: [
          { label: "AI Act Art. 12", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["logging", "audit trail", "sporbarhed"],
      },
      {
        id: "konsekvensanalyser",
        name: "Konsekvensanalyser (Datatilsynet skabeloner)",
        description:
          "Datatilsynet har publiceret AI-specifikke skabeloner til konsekvensanalyser (DPIA). Den naturlige startpakke for danske organisationer.",
        severity: "medium",
        actions: [
          "Brug Datatilsynets AI-DPIA-skabelon som udgangspunkt",
          "Integrer DPIA og FRIA i én proces",
          "Følg Datatilsynets podcast og opdateringer (feb 2026)",
        ],
        sourceLinks: [
          { label: "Datatilsynet: Kunstig intelligens", url: DATATILSYNET_AI, source: "Datatilsynet" },
          { label: "Datatilsynet podcast: AI og konsekvensanalyser (feb 2026)", url: DATATILSYNET_PODCAST, source: "Datatilsynet" },
        ],
        tags: ["DPIA", "konsekvensanalyse", "Datatilsynet"],
      },
    ],
    sourceLinks: [
      { label: "NIST GenAI Profile", url: NIST_GENAI, source: "NIST" },
      { label: "Datatilsynet skabeloner", url: DATATILSYNET_AI, source: "Datatilsynet" },
    ],
  },

  // ╔═══════════════════════════════════════════════════════════════════════╗
  // ║  PILLAR 3: DRIFT & GOVERNANCE                                         ║
  // ╚═══════════════════════════════════════════════════════════════════════╝

  {
    id: "ai-register",
    name: "AI-register & klassificering",
    pillar: "drift",
    icon: "📚",
    description:
      "Et opdateret use case-register er fundamentet for alt AI-compliance-arbejde. Uden register, ingen risikoklassificering, ingen DPIA, ingen audit-trail.",
    subcategories: [
      {
        id: "use-case-register",
        name: "Use case-register",
        description:
          "Central registrering af alle AI use cases i organisationen – med ejer, formål, datakilder, leverandører, status og risikoklassificering.",
        severity: "critical",
        actions: [
          "Etabler obligatorisk registreringsproces for nye AI use cases",
          "Definer dataset-minimum: ejer, formål, persondata, klassificering, status",
          "Integrér med IT-asset-management hvor muligt",
        ],
        sourceLinks: [
          { label: "AI Act Art. 26", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Datatilsynet: Kunstig intelligens", url: DATATILSYNET_AI, source: "Datatilsynet" },
        ],
        tags: ["register", "use case"],
      },
      {
        id: "risikoklassificering",
        name: "Risikoklassificering pr. use case",
        description:
          "Hver use case skal klassificeres efter AI Act-risikoniveau (forbudt/højrisiko/begrænset/minimal) + intern risikomatrix for sandsynlighed × konsekvens.",
        severity: "critical",
        actions: [
          "Definér intern risikomatrix der mapper mod AI Act-kategorier",
          "Lav beslutningstræ for Annex III-mapping",
          "Genvurder ved hver væsentlig brugsændring",
        ],
        sourceLinks: [
          { label: "AI Act Art. 6", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "NIST Map function", url: NIST_AIRMF, source: "NIST" },
        ],
        tags: ["risikoklassificering", "Annex III", "matrix"],
      },
      {
        id: "shadow-ai",
        name: "Shadow-AI opdagelse",
        description:
          "Skygge-AI er den største blinde vinkel: medarbejdere der bruger ChatGPT/Copilot/Claude uden om officielle processer, eller SaaS-værktøjer der lige har fået \"AI-features\".",
        severity: "high",
        actions: [
          "Network-/proxy-monitoring for trafik til store AI-providers",
          "SaaS-license-audit for nyligt aktiverede AI-funktioner",
          "Klare amnesty-perioder hvor medarbejdere kan registrere ikke-godkendt brug",
        ],
        sourceLinks: [
          { label: "Datatilsynet: Kunstig intelligens", url: DATATILSYNET_AI, source: "Datatilsynet" },
        ],
        tags: ["shadow IT", "ChatGPT", "skyggeIT", "opdagelse"],
      },
    ],
    sourceLinks: [
      { label: "Datatilsynet: Kunstig intelligens", url: DATATILSYNET_AI, source: "Datatilsynet" },
    ],
  },

  {
    id: "deployer-pligter",
    name: "Deployer-pligter",
    pillar: "drift",
    icon: "👁️",
    description:
      "Som deployer (den der bruger AI-systemet, ikke nødvendigvis udvikler) har I selvstændige forpligtelser under AI Act Art. 26 – ofte overset i danske implementeringer.",
    subcategories: [
      {
        id: "human-oversight",
        name: "Human oversight (meningsfuld menneskelig kontrol)",
        description:
          "Højrisiko-AI skal kunne overvåges af kompetente mennesker der både forstår systemet og kan gribe ind. \"Rubber stamp\"-godkendelser tæller ikke.",
        severity: "critical",
        actions: [
          "Identificer menneskelige overvågere for hvert højrisiko-system",
          "Sikr at overvågerne har faglig viden og myndighed til at standse systemet",
          "Dokumentér oversight-procedurer og træning",
        ],
        sourceLinks: [
          { label: "AI Act Art. 14 + Art. 26", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["human oversight", "kontrol", "deployer"],
      },
      {
        id: "information-til-berorte",
        name: "Information til berørte personer",
        description:
          "Personer der bliver underlagt højrisiko-AI eller AI-genereret kommunikation skal informeres. Inkluderer chatbots, automatiseret beslutningstagning og deepfakes (mærkningskrav fra 2. aug. 2026).",
        severity: "high",
        actions: [
          "Indfør chatbot-disclaimers (\"du taler med en AI\")",
          "Mærk AI-genereret indhold i markedsføring og kommunikation",
          "Forbered automatiseret beslutnings-information til GDPR Art. 22-tilfælde",
        ],
        sourceLinks: [
          { label: "AI Act Art. 26(11) + Art. 50", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "Digst: Gennemsigtighedsforpligtelser", url: DIGST_GENNEMSIGTIGHED, source: "Digst" },
        ],
        tags: ["transparens", "deepfake", "information", "mærkning"],
      },
      {
        id: "dpia-fria-integration",
        name: "DPIA + FRIA-integration",
        description:
          "GDPR-DPIA og AI Act-FRIA dækker overlappende men ikke identiske områder. Mest effektivt at køre dem som én integreret proces – men dokumentere udfald separat.",
        severity: "high",
        actions: [
          "Etabler integreret DPIA+FRIA-skabelon",
          "Definér hvornår begge er obligatoriske vs. én eller ingen",
          "Inddrag både DPO og AI Risk Owner",
        ],
        sourceLinks: [
          { label: "GDPR Art. 35", url: EDPB_OP_28, source: "GDPR/EDPB" },
          { label: "AI Act Art. 27", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["DPIA", "FRIA", "konsekvensanalyse", "integration"],
      },
    ],
    sourceLinks: [
      { label: "AI Act Art. 26 (deployer-pligter)", url: EU_AI_ACT, source: "EU AI Act" },
    ],
  },

  {
    id: "leverandoerstyring",
    name: "Leverandørstyring",
    pillar: "drift",
    icon: "🤝",
    description:
      "I køber sjældent AI fra en EU-baseret udbyder. Leverandørstyringen – kontrakter, due diligence, EU-repræsentation – er der hvor compliance enten bliver virkelig eller falder fra hinanden.",
    subcategories: [
      {
        id: "ai-kontraktklausuler",
        name: "AI-klausuler i kontrakter",
        description:
          "Standard-kontraktklausuler om AI-leverandørens forpligtelser: dokumentation, hændelsesrapportering, samarbejde ved audit, retraining-notifikation, exit-betingelser.",
        severity: "high",
        actions: [
          "Udvikl standardklausul-bibliotek (separat for GPAI vs. højrisiko)",
          "Indarbejd DORA-krav for finanssektor",
          "Sikr ret til at trække samtykke tilbage til træningsdata",
        ],
        sourceLinks: [
          { label: "AI Act Art. 25", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "DORA", url: DORA, source: "DORA" },
        ],
        tags: ["kontrakter", "leverandør", "klausuler"],
      },
      {
        id: "gpai-due-diligence",
        name: "GPAI-leverandør due diligence",
        description:
          "Før I integrerer en GPAI-model i jeres produkt: hent dokumentation, copyright-politik, træningsdata-resumé, modelevalueringer. Hold styr på leverandørens AI Office-status.",
        severity: "high",
        actions: [
          "Standardisér GPAI due diligence-checkliste",
          "Verificer leverandør-status hos EU AI Office før kritiske integrationer",
          "Genvurder ved hver væsentlig modelversion",
        ],
        sourceLinks: [
          { label: "AI Act Art. 53", url: EU_AI_ACT, source: "EU AI Act" },
          { label: "EU AI Office", url: AI_OFFICE, source: "EU AI Act" },
        ],
        tags: ["GPAI", "due diligence", "leverandør"],
      },
      {
        id: "eu-repraesentant",
        name: "EU-repræsentant for ikke-EU-udbydere",
        description:
          "Hvis I downloader/finetuner GPAI-modeller fra ikke-EU-udbydere, kan I i nogle tilfælde selv blive ansvarlig for at sikre EU-repræsentation.",
        severity: "medium",
        actions: [
          "Identificer alle ikke-EU AI-leverandører i jeres stack",
          "Bekræft at leverandøren har udpeget EU-repræsentant",
          "Forstå downstream-ansvar når I finetuner videre",
        ],
        sourceLinks: [
          { label: "AI Act Art. 22", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["EU-repræsentant", "ikke-EU", "leverandør"],
      },
    ],
    sourceLinks: [
      { label: "AI Act Art. 25 + Art. 53", url: EU_AI_ACT, source: "EU AI Act" },
    ],
  },

  {
    id: "literacy-incident",
    name: "AI-literacy & incident response",
    pillar: "drift",
    icon: "🎓",
    description:
      "AI-literacy-kravet (Art. 4) er allerede håndhævet siden 2. februar 2025 – og det billigste tilsynsmål for myndighederne. Plus serious incident reporting hvis noget går galt.",
    subcategories: [
      {
        id: "ai-literacy",
        name: "AI-literacy program (Art. 4)",
        description:
          "Alle udbydere og deployere skal sikre tilstrækkelig AI-literacy hos medarbejdere der arbejder med AI-systemer. I kraft 2. februar 2025 – ofte overset.",
        severity: "high",
        actions: [
          "Definér AI-literacy-baseline pr. rolle (bruger, ejer, udvikler, ledelse)",
          "Indfør obligatorisk introduktion til AI for nye medarbejdere",
          "Dokumentér deltagelse – tilsyn vil bede om det",
        ],
        sourceLinks: [
          { label: "AI Act Art. 4 (i kraft 2. feb 2025)", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["AI-literacy", "uddannelse", "artikel 4"],
      },
      {
        id: "serious-incident",
        name: "Serious incident reporting",
        description:
          "Udbydere af højrisiko-systemer skal rapportere alvorlige hændelser til markedsovervågningsmyndigheden uden unødigt ophold – og senest 15 dage. Defineret i AI Act Art. 73.",
        severity: "high",
        actions: [
          "Etabler intern hændelseskategorisering der inkluderer AI-specifikke typer",
          "Definér eskalationsvej til Digitaliseringsstyrelsen / sektor-tilsyn",
          "Inkluder AI-hændelser i eksisterende NIS2-hændelsesproces hvor relevant",
        ],
        sourceLinks: [
          { label: "AI Act Art. 73", url: EU_AI_ACT, source: "EU AI Act" },
        ],
        tags: ["incident", "rapportering", "artikel 73"],
      },
      {
        id: "datatilsynet-anmeldelse",
        name: "Datatilsynet-anmeldelse ved AI-brud",
        description:
          "Persondata-brud i AI-kontekst skal anmeldes Datatilsynet inden 72 timer (GDPR Art. 33). Det inkluderer LLM-data-leakage, prompt injection der eksponerer brugerdata, mv.",
        severity: "high",
        actions: [
          "Inkluder AI-leakage-scenarier i jeres brud-detection",
          "Træn DPO-funktion i AI-specifikke brud-typer",
          "Hav skabelon klar for Datatilsynet-anmeldelse",
        ],
        sourceLinks: [
          { label: "Datatilsynet: Kunstig intelligens", url: DATATILSYNET_AI, source: "Datatilsynet" },
        ],
        tags: ["GDPR Art. 33", "brud", "Datatilsynet"],
      },
      {
        id: "generativ-daglig-brug",
        name: "Generativ AI i daglig brug (Copilot/ChatGPT)",
        description:
          "Den største praktiske compliance-overflade i 2026 er Copilot/ChatGPT i Microsoft 365 og lignende. Datatilsynets stillingtagen til dataflows og persondata er en åben best-practice-diskussion.",
        severity: "high",
        actions: [
          "Definér godkendt brug og forbudt brug af generativ AI",
          "Etabler retningslinjer for hvad medarbejdere må indtaste",
          "Aktivér data residency / commercial data protection-tilstande hos leverandøren",
          "Følg Datatilsynets podcast og kommende vejledninger",
        ],
        sourceLinks: [
          { label: "Datatilsynet: Kunstig intelligens", url: DATATILSYNET_AI, source: "Datatilsynet" },
          { label: "Digst: Regulatorisk sandkasse", url: DIGST_SANDKASSE, source: "Digst" },
        ],
        tags: ["Copilot", "ChatGPT", "Microsoft 365", "daglig brug"],
      },
    ],
    sourceLinks: [
      { label: "AI Act Art. 4 (AI literacy)", url: EU_AI_ACT, source: "EU AI Act" },
      { label: "AI Act Art. 73 (incident reporting)", url: EU_AI_ACT, source: "EU AI Act" },
    ],
  },
];

export const getSeverityColor = (severity: Severity): string => {
  switch (severity) {
    case "critical": return "text-danger";
    case "high": return "text-warning";
    case "medium": return "text-info";
    case "low": return "text-success";
  }
};

export const getSeverityBg = (severity: Severity): string => {
  switch (severity) {
    case "critical": return "bg-danger/15 border-danger/30";
    case "high": return "bg-warning/15 border-warning/30";
    case "medium": return "bg-info/15 border-info/30";
    case "low": return "bg-success/15 border-success/30";
  }
};

export const getCategoriesByPillar = (pillar: PillarId): Category[] => {
  return categories.filter((c) => c.pillar === pillar);
};
