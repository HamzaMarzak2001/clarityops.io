/* ────────────────────────────────────────────────────────────────
   CASE STUDIES — single source of truth
   ────────────────────────────────────────────────────────────────
   To add a 5th / 6th case study:
     1. Drop its images in  assets/images/case-studies/<slug>/
     2. Append one object to the CASE_STUDIES array below.
   Nothing else needs editing — the grid cards and the detail modal
   both render from this file.

   Image files live in:   assets/images/case-studies/<slug>/<name>.<ext>
   e.g.                    assets/images/case-studies/labinno/hero.jpg

   If your image files are PNGs (or anything else), change CS_IMG_EXT
   below — that's the only place the extension is defined.
─────────────────────────────────────────────────────────────────── */

const CS_IMG_BASE = 'assets/images/case-studies';
const CS_IMG_EXT  = 'jpg'; // ← change to 'png' if your files are .png

const CASE_STUDIES = [
  {
    slug: 'labinno',
    title: 'Labinno HQ',
    kicker: 'Construction Operations OS',
    industry: 'Construction · Geneva',
    accent: '#e3b23c', // gold — matches the Labinno deck
    summary: 'One French-language workspace running every project from tender to handover.',
    detail:
      'Seven connected databases (projects, tasks, meeting minutes, clients, partners, ' +
      'team roles, documents) with projects at the centre and role-filtered views for ' +
      'team, clients and partners. Built and delivered entirely in French, following the ' +
      'construction lifecycle from submission through handover. Meeting minutes feed action ' +
      'items straight into tasks.',
    images: [
      { name: 'hero',         label: 'Overview' },
      { name: 'architecture', label: 'System architecture' },
      { name: 'workflow',     label: 'Project lifecycle' },
      { name: 'results',      label: 'The results' },
    ],
  },
  {
    slug: 'bourbon-holdings',
    title: 'Bourbon Holdings HQ',
    kicker: 'Deal Flow & Automation OS',
    industry: 'Real estate investment · Los Angeles',
    accent: '#4caf6e', // green — matches the Bourbon deck
    summary: 'A deal desk that runs itself — six automations across five platforms.',
    detail:
      'Six connected databases with Deals at the centre. Six live Make.com automations: ' +
      'leads flow in and create deals with contacts matched automatically, each deal gets ' +
      'a Drive folder and property summary doc generated on the spot, MLS reports parsed by ' +
      'AI into the doc, calls logged automatically with recordings, refund windows monitored ' +
      'daily with reminders and tasks, dead deals auto-archived. 629 heir records migrated.',
    images: [
      { name: 'hero',         label: 'Overview' },
      { name: 'architecture', label: 'System architecture' },
      { name: 'integration',  label: 'Integration stack' },
      { name: 'workflow',     label: 'Automation flow' },
      { name: 'results',      label: 'The results' },
    ],
  },
  {
    slug: 'fryaway',
    title: 'FryAway HQ',
    kicker: 'Marketing Performance OS',
    industry: 'DTC consumer brand',
    accent: '#e88a2e', // orange — matches the FryAway deck
    summary: 'One page every morning — revenue, spend and ROAS in a single view.',
    detail:
      'Six connected databases on a shared date axis so paid, owned and organic performance ' +
      'line up together. Daily snapshot dashboard: revenue by channel, ad spend by platform, ' +
      'ROAS computed automatically, tasks, and a rolling 30-day trend. Built for automated ' +
      'syncing, with an AI assistant writing data directly into the databases through ' +
      'structured integration access.',
    images: [
      { name: 'hero',         label: 'Overview' },
      { name: 'architecture', label: 'System architecture' },
      { name: 'workflow',     label: 'Daily reporting loop' },
      { name: 'results',      label: 'The results' },
    ],
  },
  {
    slug: 'mae-media',
    title: 'MAE Media HQ',
    kicker: 'Agency Operations & Automation OS',
    industry: 'Media & marketing agency',
    accent: '#e85a4f', // red — matches the MAE Media deck
    summary: 'A full agency OS — projects, ads, finances and team in one automated workspace.',
    detail:
      'Seven connected databases spanning clients, projects, campaigns, invoices, tasks and ' +
      'team, with a weekly scorecard aggregation layer. Ten-plus live automations across ' +
      'eight platforms: Drive folders on project creation, role-specific status emails, daily ' +
      'Meta Ads sync across two ad accounts, QuickBooks cash and receivables into a live ' +
      'scorecard, Facebook lead capture, and twice-daily due-and-overdue team digests.',
    images: [
      { name: 'hero',         label: 'Overview' },
      { name: 'architecture', label: 'System architecture' },
      { name: 'integration',  label: 'Integration stack' },
      { name: 'workflow',     label: 'Automation flow' },
      { name: 'results',      label: 'The results' },
    ],
  },
];
