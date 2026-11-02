/* Headlines, kickers, facts and bodies are from COPY-DECK.md. Step wording is new, drawn from Hamza's automation notes, and needs his approval. */
export type Step = { caption: string; field: string; value: string; who: string; icon?: string; mark?: string };
export type Scene = { title: string; closing: string; shot: { src: string; w: number; h: number }; steps: Step[]; summary: string };

export type Case = {
  slug: string;
  name: string;
  kicker: string;
  headline: string;
  body: string;
  facts: string[];
  scene: Scene;
  sequence: { src: string; width: number; height: number; alt: string }[];
};

const bourbon: Scene = {
  title: "Deal",
  closing: "Six automations, running daily",
  summary: "A lead arrives from InvestorFuse, the contact is matched, the Drive folder and summary doc are created, Gemini reads the MLS report in, Smrtphone calls log themselves, and refund windows trigger reminders by Gmail.",
  shot: { src: "/work/bourbon-overview.jpg", w: 2900, h: 1355 },
  steps: [
    { caption: "A lead comes in.", field: "Lead", value: "Captured", who: "InvestorFuse", mark: "IF" },
    { caption: "The contact is matched.", field: "Contact", value: "Matched, no duplicates", who: "Make", icon: "make" },
    { caption: "The folder builds itself.", field: "Deal folder", value: "Created", who: "Google Drive", icon: "drive" },
    { caption: "So does the summary.", field: "Property summary", value: "Generated", who: "Google Docs", icon: "docs" },
    { caption: "AI reads the MLS report.", field: "MLS comps", value: "Written in", who: "Gemini", icon: "gemini" },
    { caption: "Every call logs itself.", field: "Call log", value: "Recording attached", who: "Smrtphone", mark: "SP" },
    { caption: "Deadlines watch themselves.", field: "Refund window", value: "Reminder sent", who: "Gmail", icon: "gmail" },
  ],
};

const mae: Scene = {
  title: "Weekly scorecard",
  closing: "Monday starts with facts",
  summary: "Meta spend syncs daily, Facebook leads are captured, QuickBooks feeds cash and receivables, Google Calendar counts demos, new projects get Drive folders, and status changes email the right person.",
  shot: { src: "/work/mae-overview.jpg", w: 1850, h: 1150 },
  steps: [
    { caption: "Ad spend syncs daily.", field: "Ad spend", value: "Synced", who: "Meta Ads", icon: "meta" },
    { caption: "Leads capture themselves.", field: "New leads", value: "Captured", who: "Facebook Lead Ads", icon: "facebook" },
    { caption: "Cash reads from the books.", field: "Cash and receivables", value: "Pulled in", who: "QuickBooks", icon: "quickbooks" },
    { caption: "Demos count themselves.", field: "Demo meetings", value: "Counted Friday", who: "Google Calendar", icon: "calendar" },
    { caption: "New project, new folder.", field: "Project folder", value: "Created", who: "Google Drive", icon: "drive" },
    { caption: "The right person hears.", field: "Status change", value: "Emailed", who: "Gmail", icon: "gmail" },
  ],
};

const fryaway: Scene = {
  title: "One daily page",
  closing: "Nobody rebuilds a report",
  summary: "Ad spend, sales and performance flow into one daily page, return on ad spend calculates itself, and an AI assistant writes performance data into Notion.",
  shot: { src: "/work/fryaway-overview.jpg", w: 1881, h: 1170 },
  steps: [
    { caption: "Ad spend flows in.", field: "Ad spend", value: "Today", who: "One daily page", icon: "notion" },
    { caption: "Sales flow in.", field: "Sales", value: "Today", who: "One daily page", icon: "notion" },
    { caption: "Performance flows in.", field: "Performance", value: "Today", who: "One daily page", icon: "notion" },
    { caption: "Return on ad spend does the math.", field: "Return on ad spend", value: "Calculated", who: "Formula", mark: "fx" },
    { caption: "AI writes the data.", field: "Performance data", value: "Written by AI", who: "AI assistant", mark: "AI" },
  ],
};

const labinno: Scene = {
  title: "Projet",
  closing: "Delivered entirely in French",
  summary: "One project record, in French, connected to meetings, tasks, documents, clients and partners. Meeting minutes create the actions, and clients and partners each see only their part.",
  shot: { src: "/work/labinno-overview.jpg", w: 2745, h: 1670 },
  steps: [
    { caption: "One record, tender to handover.", field: "Phase", value: "Soumission à réception", who: "Projets", icon: "notion" },
    { caption: "Meeting minutes are filed.", field: "Réunions et PV", value: "Reliés", who: "Réunions et PV", mark: "PV" },
    { caption: "They create the actions.", field: "Tâches", value: "Créées depuis le PV", who: "Tâches", mark: "TÂ" },
    { caption: "Documents stay attached.", field: "Documents", value: "Classés", who: "Documents", mark: "DO" },
    { caption: "Clients see their part.", field: "Vue client", value: "Sa partie", who: "Clients", mark: "CL" },
    { caption: "Partners see theirs.", field: "Vue partenaire", value: "Sa partie", who: "Partenaires", mark: "PA" },
  ],
};

export const cases: Case[] = [
  {
    slug: "bourbon-holdings",
    name: "Bourbon Holdings",
    kicker: "Real estate investment · Los Angeles",
    headline: "A deal desk that opens, files and follows up on itself.",
    body: "A new lead becomes a deal with its contacts matched. Each deal gets its own Drive folder and property summary, with MLS reports read by AI and written into it. Calls are logged with recordings. Refund windows are watched daily. Dead deals archive themselves.",
    facts: ["6 automations", "5 platforms", "629 records migrated"],
    scene: bourbon,
    sequence: [
      { src: "/work/case/bourbon-1.jpg", width: 2900, height: 800, alt: "Bourbon Holdings' deal desk home page, with its banner and title." },
      { src: "/work/case/bourbon-2.jpg", width: 520, height: 420, alt: "Quick actions for a new deal, task, call or contact." },
      { src: "/work/case/bourbon-3.jpg", width: 2180, height: 500, alt: "Navigation to deals, tasks, the call log, contacts and probate order heirs." },
    ],
  },
  {
    slug: "mae-media",
    name: "MAE Media",
    kicker: "Media agency · Operations and finance",
    headline: "Delivery, pipeline and cash, finally reading from the same numbers.",
    body: "Automations across eight platforms keep the agency's work and money in one system. A weekly scorecard pulls cash and receivables from QuickBooks, so the Monday meeting starts with facts instead of questions.",
    facts: ["10+ automations", "8 platforms", "Weekly scorecard"],
    scene: mae,
    sequence: [
      { src: "/work/case/mae-1.jpg", width: 2870, height: 820, alt: "MAE Media's home page, with its banner and title." },
      { src: "/work/case/mae-2.jpg", width: 700, height: 1050, alt: "MAE Media's quick actions and navigation." },
      { src: "/work/case/mae-3.jpg", width: 640, height: 690, alt: "MAE Media's overview of projects by status." },
    ],
  },
  {
    slug: "fryaway",
    name: "FryAway",
    kicker: "Consumer brand · Marketing operations",
    headline: "Four reports a day, replaced by one page that's always current.",
    body: "Ad spend, sales and performance flow into one daily view, with return on ad spend calculated on its own. An AI assistant writes performance data straight into the system, so nobody rebuilds a report again.",
    facts: ["4 reports into 1", "Daily, automatic", "AI writes the data"],
    scene: fryaway,
    sequence: [
      { src: "/work/case/fryaway-1.jpg", width: 2960, height: 830, alt: "FryAway's home page, with its banner and title." },
      { src: "/work/case/fryaway-2.jpg", width: 680, height: 620, alt: "FryAway's navigation to advertising metrics, email campaigns, tasks and assets." },
      { src: "/work/case/fryaway-3.jpg", width: 970, height: 650, alt: "FryAway's open tasks by status." },
    ],
  },
  {
    slug: "labinno",
    name: "Labinno",
    kicker: "Construction · Geneva",
    headline: "A construction firm, run from tender to handover in one place.",
    body: "Projects, meetings, clients, partners and documents, connected around a single project record. Meeting minutes create the actions themselves. Clients and partners each see only their part. Delivered entirely in French.",
    facts: ["7 connected databases", "Team, client and partner views", "Tender to handover"],
    scene: labinno,
    sequence: [
      { src: "/work/case/labinno-1.jpg", width: 2745, height: 830, alt: "Labinno's home page, with its banner and title." },
      { src: "/work/case/labinno-2.jpg", width: 720, height: 1400, alt: "Labinno's quick actions, navigation and resources, in French." },
      { src: "/work/case/labinno-3.jpg", width: 1000, height: 850, alt: "Labinno's overview of projects by phase." },
    ],
  },
];
