/* Selected work. Each case is told as a map of its system on a laptop, then the manual steps it removed.
   Bourbon's and MAE's headlines are from COPY-DECK.md. Everything else is a draft for Hamza, built from his project notes and his own case-study content.
   Outcomes only use numbers Hamza has published or that can be counted from the build. No client records appear anywhere. */

export type Tool = { name: string; job: string; icon?: string; mark?: string };
export type Zone = { label: string; title: string; text: string; tools: Tool[]; island: { title: string; text: string; icon?: string; mark?: string } };
export type Row = { name: string; icon?: string; mark?: string; /* the one step a person still does */ person?: boolean };
export type Outcome = { from: string; to: string; label: string };

export type Case = {
  slug: string;
  name: string;
  kicker: string;
  headline: string;
  /* the middle of the map, before and after */
  hub: [string, string];
  before: { title: string; text: string; island: string };
  zones: [Zone, Zone, Zone, Zone];
  system: { title: string; text: string; island: [string, string] };
  /* what one run used to take by hand */
  unit: string;
  rows: Row[];
  outcomes: Outcome[];
};

export const cases: Case[] = [
  {
    slug: "bourbon-holdings",
    name: "Bourbon Holdings",
    kicker: "Real estate investment · Los Angeles",
    headline: "A deal desk that opens, files and follows up on itself.",
    hub: ["Deal desk", "one place for every deal"],
    before: {
      title: "Five apps for every deal.",
      text: "A lead landed in one app. Someone made the Drive folder by hand, copied the summary doc, typed in the MLS comps, then tracked the call somewhere else. Every deal, every time.",
      island: "Five apps, every step by hand.",
    },
    zones: [
      { label: "Comes in", title: "A lead comes in.", text: "A new lead from InvestorFuse opens a deal on its own, and Make matches the contact so nobody is entered twice.", tools: [{ name: "InvestorFuse", job: "New leads", mark: "IF" }, { name: "Make", job: "Matches the contact", icon: "make" }], island: { title: "New deal opened", text: "Contact matched, no duplicates.", mark: "IF" } },
      { label: "Set up", title: "The deal sets itself up.", text: "Each deal gets its own Drive folder and a property summary doc, made from the template.", tools: [{ name: "Drive", job: "Deal folder", icon: "drive" }, { name: "Docs", job: "Property summary", icon: "docs" }], island: { title: "Folder and summary made", text: "Filed under the deal.", icon: "drive" } },
      { label: "Reads itself", title: "AI reads the MLS report.", text: "The MLS report arrives by email, and Gemini writes the comps straight into the summary.", tools: [{ name: "Gemini", job: "Reads the MLS report", icon: "gemini" }], island: { title: "Comps written in", text: "Read from the MLS report.", icon: "gemini" } },
      { label: "On track", title: "Nothing slips.", text: "Every call is logged on the right deal with its recording, and refund windows send a reminder before they close.", tools: [{ name: "Smrtphone", job: "Logs every call", mark: "SP" }, { name: "Gmail", job: "Refund reminders", icon: "gmail" }], island: { title: "Call logged", text: "Recording on the right deal.", mark: "SP" } },
    ],
    system: { title: "One deal desk that runs itself.", text: "Six automations run every day. The team steps in only to make the calls.", island: ["Six automations, every day", "One place for every deal."] },
    unit: "Steps by hand per deal",
    rows: [
      { name: "Enter the new lead", mark: "IF" },
      { name: "Check for a duplicate contact", icon: "make" },
      { name: "Make the deal folder", icon: "drive" },
      { name: "Write the property summary", icon: "docs" },
      { name: "Type in the MLS comps", icon: "gemini" },
      { name: "Log the call and recording", mark: "SP" },
      { name: "Track the refund window", icon: "gmail" },
      { name: "Call the seller", mark: "SP", person: true },
    ],
    outcomes: [
      { from: "5", to: "1", label: "Apps to run a deal" },
      { from: "7", to: "0", label: "Steps by hand per deal" },
    ],
  },
  {
    slug: "lighting-sales",
    name: "Lighting supplier",
    kicker: "Sales · Netherlands",
    headline: "Leads that file themselves, and quotes that go out in seconds.",
    hub: ["Sales desk", "every lead and quote in one place"],
    before: {
      title: "Every lead copied, every quote built by hand.",
      text: "Leads from Meta ads were copied into the CRM one by one, every quote was put together by hand, and each new customer was typed into the books again.",
      island: "Leads and quotes, all by hand.",
    },
    zones: [
      { label: "Leads come in", title: "Leads file themselves.", text: "Every Meta lead form lands in the CRM on its own, through Make. Nobody copies it over.", tools: [{ name: "Meta ads", job: "Lead forms", icon: "meta" }, { name: "Make", job: "Files the lead", icon: "make" }], island: { title: "New lead filed", text: "Straight from the Meta form.", icon: "meta" } },
      { label: "Quote", title: "A quote in seconds.", text: "The customer gets a branded quote PDF from the website in seconds, by email.", tools: [{ name: "Website", job: "Builds the quote", mark: "WEB" }, { name: "Email", job: "Sends the PDF", icon: "gmail" }], island: { title: "Quote sent", text: "Branded PDF, in seconds.", mark: "PDF" } },
      { label: "Signed", title: "Signed and booked online.", text: "The customer signs the quote online and books the appointment in the same flow.", tools: [{ name: "E-sign", job: "Signed online", mark: "SIG" }, { name: "Cal.com", job: "Books the visit", icon: "calendar" }], island: { title: "Signed and booked", text: "No back and forth.", icon: "calendar" } },
      { label: "Books", title: "The books stay in sync.", text: "One button creates the customer in Moneybird, so nothing is typed twice.", tools: [{ name: "Moneybird", job: "Customer created", mark: "MB" }], island: { title: "Customer in the books", text: "One button, no retyping.", mark: "MB" } },
    ],
    system: { title: "From ad to signed quote, without copying.", text: "The team only talks to customers. The client has since referred another business to ClarityOps.", island: ["Three manual jobs gone", "Leads, quotes and the books."] },
    unit: "Steps by hand per lead",
    rows: [
      { name: "Copy the lead out of Meta", icon: "meta" },
      { name: "Enter it in the CRM", icon: "make" },
      { name: "Build the quote", mark: "WEB" },
      { name: "Send it and chase the signature", mark: "SIG" },
      { name: "Retype the customer in the books", mark: "MB" },
      { name: "Talk to the customer", icon: "calendar", person: true },
    ],
    outcomes: [
      { from: "20+", to: "0", label: "Leads a week copied by hand" },
      { from: "3", to: "0", label: "Manual jobs" },
    ],
  },
  {
    slug: "mae-media",
    name: "MAE Media",
    kicker: "Media agency · Operations and finance",
    headline: "Delivery, pipeline and cash, finally reading from the same numbers.",
    hub: ["Agency HQ", "work and money in one place"],
    before: {
      title: "Every number copied by hand.",
      text: "Ad spend, cash, leads and client folders all lived in different tools, and everything was copied over by hand. It was too messy to show a client.",
      island: "Every number, copied by hand.",
    },
    zones: [
      { label: "Ads", title: "Ad spend syncs every day.", text: "Meta ad spend comes into the HQ daily, per client, without anyone exporting it.", tools: [{ name: "Meta ads", job: "Daily spend", icon: "meta" }], island: { title: "Ad spend synced", text: "Every morning, per client.", icon: "meta" } },
      { label: "Money", title: "Cash reads from the books.", text: "Cash and money owed come in from QuickBooks every day, so the Monday meeting starts with facts.", tools: [{ name: "QuickBooks", job: "Cash and receivables", icon: "quickbooks" }], island: { title: "Cash updated", text: "Pulled from QuickBooks.", icon: "quickbooks" } },
      { label: "Leads", title: "Leads land on their own.", text: "Facebook lead ads go straight into the pipeline, with an email to whoever follows up.", tools: [{ name: "Facebook", job: "Lead ads", icon: "facebook" }, { name: "Gmail", job: "Alerts the team", icon: "gmail" }], island: { title: "New lead in the pipeline", text: "And the right person is told.", icon: "facebook" } },
      { label: "Delivery", title: "Projects run themselves.", text: "A new client gets its Drive folder automatically, and status changes or overdue work email the right person.", tools: [{ name: "Drive", job: "Client folders", icon: "drive" }, { name: "Gmail", job: "Status and overdue", icon: "gmail" }], island: { title: "Folder created", text: "Overdue work flagged by email.", icon: "drive" } },
    ],
    system: { title: "One HQ for the work and the money.", text: "Automations across eight platforms keep delivery, pipeline and cash in one system.", island: ["One HQ, eight platforms", "Work and money together."] },
    unit: "Steps by hand each week",
    rows: [
      { name: "Export ad spend from Meta", icon: "meta" },
      { name: "Pull cash from QuickBooks", icon: "quickbooks" },
      { name: "Copy new leads into the pipeline", icon: "facebook" },
      { name: "Make each client folder", icon: "drive" },
      { name: "Email status changes", icon: "gmail" },
      { name: "Chase overdue work", icon: "gmail" },
      { name: "Run the Monday meeting", icon: "calendar", person: true },
    ],
    outcomes: [
      { from: "8", to: "1", label: "Platforms read in one place" },
      { from: "6", to: "0", label: "Copying jobs by hand" },
    ],
  },
  {
    slug: "inspection-reports",
    name: "Inspection reports",
    kicker: "Building inspection · Saudi Arabia",
    headline: "Inspection reports that write themselves, in Arabic, in one click.",
    hub: ["Inspection system", "one page per inspection"],
    before: {
      title: "Hours of formatting for every report.",
      text: "After every site visit the inspector rebuilt the report by hand: writing up each item, placing 8 to 15 photos per item, then branding and formatting it in Arabic.",
      island: "Every report was formatted by hand.",
    },
    zones: [
      { label: "On site", title: "The inspector logs it on site.", text: "Each item and its photos go straight into the inspection page on an iPad, while walking the building.", tools: [{ name: "iPad", job: "Items and photos", mark: "iP" }, { name: "Notion", job: "Inspection page", icon: "notion" }], island: { title: "Logged on site", text: "Items and photos go in on the iPad.", mark: "iP" } },
      { label: "One button", title: "One button starts the report.", text: "When the walk-through is done, the inspector presses one button. Nothing else to fill in.", tools: [{ name: "Generate", job: "One button", mark: "▶" }], island: { title: "One click", text: "The report starts building itself.", mark: "▶" } },
      { label: "AI writes it", title: "AI writes the report.", text: "Claude turns the notes into a finished report in Arabic, with every photo placed under its item.", tools: [{ name: "Claude", job: "Writes it in Arabic", mark: "AI" }, { name: "Photos", job: "Placed per item", mark: "IMG" }], island: { title: "Written by AI", text: "In Arabic, photos in place.", mark: "AI" } },
      { label: "Delivered", title: "The branded PDF is ready.", text: "The finished report comes back as a branded PDF, attached to the same inspection page and ready to send.", tools: [{ name: "PDF", job: "Branded report", mark: "PDF" }], island: { title: "PDF attached", text: "Branded and ready to send.", mark: "PDF" } },
    ],
    system: { title: "Walk the site, press one button.", text: "The inspector's job is the inspection. The report builds itself, and a referred colleague now runs a copy of the same system.", island: ["One click per report", "The rest is automatic."] },
    unit: "Steps by hand per report",
    rows: [
      { name: "Write up each inspected item", mark: "iP" },
      { name: "Place 8 to 15 photos per item", mark: "IMG" },
      { name: "Format the report in Arabic", mark: "AI" },
      { name: "Apply the branding", mark: "PDF" },
      { name: "Export and file the PDF", icon: "notion" },
      { name: "Inspect the site", mark: "iP", person: true },
    ],
    outcomes: [
      { from: "5 h", to: "1 click", label: "Per report, at most" },
      { from: "5", to: "0", label: "Formatting steps by hand" },
    ],
  },
];
