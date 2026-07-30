const timelineTypes = {
  education: {
    color: '#4fc3f7',
    bg: '#e1f5fe',
    label: 'Education',
    icon: 'FaGraduationCap',
  },
  experience: {
    color: '#81c784',
    bg: '#e8f5e9',
    label: 'Experience',
    icon: 'FaBriefcase',
  },
  project: {
    color: '#ffb74d',
    bg: '#fff3e0',
    label: 'Project',
    icon: 'FaCode',
  },
  certification: {
    color: '#ef5350',
    bg: '#ffebee',
    label: 'Certifications',
    icon: 'FaFileAlt',
  },
};

// Array order drives the VERTICAL timeline top-to-bottom (the horizontal mode
// re-sorts by endYear/endMonth). The two Databricks certifications lead the
// list as the most recent milestones. Note that inserting an EVEN number of
// entries here is what kept every following card on its original side of the
// center line — `.timeline-inner-vertical > .timeline-entry:nth-child(odd|even)`
// picks the side, so an odd-sized insertion flips all of them.
const timeline = [
  {
    id: 8,
    type: 'certification',
    title: 'Databricks Certified Generative AI Engineer Associate',
    subtitle: 'Databricks · Credential ID 187751720',
    period: 'Issued Jul 2026 · Valid through Jul 2028',
    startYear: 2026,
    startMonth: 7,
    endYear: 2026,
    // endMonth set to 5.1 so the card's LEFT EDGE lands at ~81.5% of the
    // horizontal timeline — entirely to the right of the UW Madison card
    // (which ends at ~77.9%) and still fully inside the canvas, with its
    // dot at ~86.8%. Nudged ~6 weeks left of the real Jul 10 2026 issue
    // date (see `period`) because the whole right-hand group moved left to
    // close the gap after Prometheon.
    // Left-edge, not center: `.timeline-entry.visible` overrides the
    // wrapper's translateX(-50%) with translateY(0) once the fade-in runs,
    // so the percent is the card's left edge in the settled state.
    endMonth: 5.1,
    // Top lane: the bottom lane can't hold both certifications this far
    // right without them overlapping, so they straddle the line.
    lane: 'top',
    collapseHighlights: true,
    // Root-relative; TimelineEntry prefixes import.meta.env.BASE_URL.
    certificateUrl: '/Databricks_Gen_AI_Cert_pic.png',
    description:
      'Databricks associate-level certification on building production generative AI systems: retrieval-augmented generation, vector search, AI agents, MLflow tracking and deployment, and model evaluation.',
    highlights: [
      'RAG pipeline design: chunking, embeddings, and vector search retrieval quality',
      'AI agents and multi-stage LLM chains, with prompt and context strategies for production use',
      'MLflow for tracking, packaging, and serving models; evaluation and governance of deployed LLM apps',
    ],
  },
  {
    id: 7,
    type: 'certification',
    title: 'Databricks Certified Data Engineer Associate',
    subtitle: 'Databricks · Credential ID 186071135',
    period: 'Issued Jun 2026 · Valid through Jun 2028',
    startYear: 2026,
    startMonth: 6,
    endYear: 2026,
    // endMonth set to 4.77 so the card's LEFT EDGE lands at 79% — just clear
    // of the UW Madison card's right edge (~77.9%), with its dot at ~84.3%.
    // Nudged ~5 weeks left of the real Jun 23 2026 issue date (see `period`)
    // for the same reason as the Generative AI entry above, which also
    // explains why the percent is a left edge, not a center.
    endMonth: 4.77,
    lane: 'bottom',
    collapseHighlights: true,
    // Root-relative; TimelineEntry prefixes import.meta.env.BASE_URL.
    certificateUrl: '/Databricks_Data_Eng_Associate_Cert.png',
    description:
      'Databricks associate-level certification covering the Lakehouse platform end to end: Delta Lake tables, ELT with Spark SQL and PySpark, incremental ingestion, multi-hop pipelines, workflow orchestration, and Unity Catalog data governance.',
    highlights: [
      'Delta Lake table management, time travel, and optimization on the Lakehouse architecture',
      'Batch and incremental ELT with Spark SQL / PySpark, Auto Loader, and Delta Live Tables',
      'Job orchestration, production pipeline patterns, and Unity Catalog access control',
    ],
  },
  {
    id: 1,
    type: 'education',
    title: 'B.S. Computer Science',
    subtitle: 'University of Wisconsin–Madison',
    subtitleLogo: '/uw-crest-color-web-digital.svg',
    period: 'Aug 2022 – May 2026',
    startYear: 2022,
    startMonth: 8,
    endYear: 2026,
    // endMonth set to 3.25 so the card's LEFT EDGE lands at ~67.3% of the
    // horizontal timeline, ~315px right of Prometheon's card instead of the
    // ~1050px void it used to leave. Nudged ~2 months left of the real May
    // 2026 end date (see `period`) — the cost of closing that gap while
    // still leaving room for the two certifications to its right, which
    // need 3 card-widths between here and the 100% mark.
    endMonth: 3.25,
    lane: 'top',
    description: 'B.S. Computer Science, GPA 3.78.',
    highlights: [
      'GPA: 3.78',
      'Based in Madison, WI',
    ],
    expanded: {
      label: 'Relevant Coursework',
      items: [
        'Systems Programming',
        'Data Structures & Algorithms',
        'Computer Architecture',
        'Artificial Intelligence',
        'Machine Learning',
        'Database Management Systems',
        'Software Security',
        'User Interface Design',
        'Algorithm Optimization',
      ],
    },
  },
  {
    id: 2,
    type: 'experience',
    title: 'Backend Engineer Intern',
    subtitle: 'SmartCert (Aramid Technologies)',
    period: 'Sep 2025 – Dec 2025',
    startYear: 2025,
    startMonth: 9,
    endYear: 2025,
    // endMonth set to 10.66 so SmartCert's left edge lands at 32% of the
    // horizontal timeline. Actual end date is Dec 2025 (see `period`
    // label on the card).
    endMonth: 10.66,
    lane: 'top',
    description:
      'Cut manual aerospace compliance review time by 75%+ (hours → minutes) by engineering an LLM validation pipeline with Google Gemini. Backend served 1,500+ clients across 20+ countries.',
    highlights: [
      'LLM validation pipeline: prompt engineering, schema enforcement, confidence scoring, cascading fallback',
      'Async Python/FastAPI + MongoDB ingestion for AI-driven audit generation',
      'Enabled onboarding of 55+ new enterprise clients post-launch',
    ],
    link: '/#/experience/1',
    liveUrl: 'https://www.smartcert.tech/',
    previewImage: '/SmarCert.png',
    publication:
      'https://obe.wisc.edu/case-studies/smartcert-driving-innovation-and-student-success/',
  },
  {
    id: 3,
    type: 'project',
    title: 'Prometheon',
    subtitle: 'AI Root Cause Analysis & Chaos Engineering Platform',
    period: 'January 2026',
    startYear: 2026,
    startMonth: 1,
    endYear: 2026,
    // endMonth set to 0.74 so Prometheon's card LEFT EDGE lands at 48% of the
    // horizontal timeline — just right of the "2026" year tick (46.15%), close
    // to it without the card clipping its label. Its dot then lands at ~53.3%
    // ≈ late Jan 2026 against the real January 2026 date (see `period`).
    // Left-edge, not center: `.timeline-entry.visible` overrides the wrapper's
    // translateX(-50%) with translateY(0) once the fade-in runs.
    endMonth: 0.74,
    lane: 'bottom',
    description:
      'Multi-tenant chaos engineering platform on Kubernetes with per-tenant sandboxes, Toxiproxy fault injection, and ML-based root cause analysis over an OpenTelemetry + Prometheus + Jaeger observability pipeline.',
    link: '/#/project/1',
    liveUrl: 'https://prometheon.run/',
    previewImage: '/og-image.png',
  },
  {
    id: 4,
    type: 'project',
    title: 'BookShelf',
    subtitle: 'Full-Stack Java Application',
    period: 'October 2025',
    startYear: 2025,
    startMonth: 10,
    endYear: 2025,
    // endMonth set to 9.39 so BookShelf's icon lands at ~22.23% on
    // the horizontal timeline (~19.23% + 3% nudge for breathing room).
    // Actual end date is October 2025 (see `period` label on the card).
    endMonth: 9.39,
    lane: 'bottom',
    description:
      'Library management platform in Spring Boot + React + PostgreSQL. JWT with role-based access control, Google Books API via reactive WebClient, Flyway migrations, Docker.',
    link: '/#/project/3',
  },
  {
    id: 5,
    type: 'project',
    title: 'MadSnowi',
    subtitle: 'Safe Route Optimization Platform',
    period: 'Summer 2025',
    startYear: 2025,
    startMonth: 6,
    endYear: 2025,
    // endMonth set to 7.28 so MadSnowi's left edge lands at 6% of the
    // horizontal timeline for more breathing room from BookShelf. Card's
    // left edge extends past the container's left edge, but the extra
    // space is within the card's border + body padding so the title
    // stays readable. Actual end is Aug 2025 (see `period` label).
    endMonth: 7.28,
    lane: 'top',
    description:
      'Flask + Supabase route optimizer combining traffic, weather, and Wisconsin DOT data for safety-aware routing. AI-powered hazard reporting turns observations into structured incident reports; 40% backend perf improvement from caching + query tuning.',
    link: '/#/project/4',
  },
  {
    id: 6,
    type: 'certification',
    title: 'CodePath (TIP 102)',
    subtitle: 'Advanced Technical Interview Prep',
    period: 'Jun 2025 – Aug 2025',
    startYear: 2025,
    startMonth: 6,
    endYear: 2025,
    // endMonth set to 6.5 so CodePath's icon lands at 0% on the
    // horizontal timeline (the leftmost edge of the container).
    // Actual end is Aug 2025 (see `period`).
    endMonth: 6.5,
    lane: 'bottom',
    // Vertical mode only: pulls CodePath's row up so its icon sits ~15–20px
    // below MadSnowi's icon instead of the full row-height below. Value is
    // tuned against MadSnowi's typical card height; adjust if MadSnowi's
    // content changes meaningfully.
    compactTop: '-180px',
    // Vertical mode only: hides `highlights` bullets behind a red shiny
    // "See more" toggle so the card stays compact in the vertical
    // timeline. Horizontal mode renders bullets inline (the horizontal
    // card has its own max-height + overflow-y).
    collapseHighlights: true,
    // Root-relative path; TimelineEntry prefixes import.meta.env.BASE_URL
    // before assigning to href so it resolves to /CodePath.jpg in
    // both dev and prod (Vite doesn't auto-prefix JS string literals).
    certificateUrl: '/CodePath.jpg',
    description:
      "Selected for CodePath's TIP102, an advanced interview prep program for college students, taught by engineers from top tech companies. Twice-weekly live sessions on data structures, algorithms, and LeetCode style problem solving with mentors and peers from universities across the country.",
    highlights: [
      'Twice-weekly classes and small group mentor sessions led by engineers from companies like Microsoft, Amazon, and more',
      'Collaborative problem solving on arrays, hash maps, trees, graphs, recursion, and dynamic programming',
      'Practiced structured problem solving communication and mock interviews; networked with peers nationwide',
    ],
  },
];

export const timelineYears = [2025, 2026];

// Horizontal timeline date range — cards are positioned by end date as a
// percentage of this span. Span is Jul 2025 → Aug 2026 (13 months) so the
// "2025" tick lands immediately before MadSnowi (the first card) and the
// timeline is focused on recent-grad activity.
export const TIMELINE_START = { year: 2025, month: 7 };
export const TIMELINE_END = { year: 2026, month: 8 };

// Returns the timeline percentage at the START of the given month.
// Accepts fractional months — callers position cards at endMonth + 0.5
// (midpoint of the end month) so SmartCert / Prometheon land visibly on
// either side of the Jan-2026 tick rather than on top of it.
// Lower bound is unclamped so entries can position to the left of the
// timeline's start (e.g. CodePath sits at a negative percent so its icon
// nestles against the container's left edge). Upper bound stays clamped
// so very-late dates can't overflow the right side.
export function datePercent(year, month) {
  const totalMonths =
    (TIMELINE_END.year - TIMELINE_START.year) * 12 +
    (TIMELINE_END.month - TIMELINE_START.month);
  const fromStart =
    (year - TIMELINE_START.year) * 12 + (month - TIMELINE_START.month);
  return Math.min(100, (fromStart / totalMonths) * 100);
}

export function getTypeStyle(type) {
  const t = timelineTypes[type];
  if (!t) return { color: '#90a4ae', bg: '#eceff1' };
  return { color: t.color, bg: t.bg };
}

export function getTypeLabel(type) {
  return timelineTypes[type]?.label || 'Other';
}

export { timelineTypes };
export default timeline;
