/* Tools and resources ClarityOps makes and puts out under its own name. Each keeps its own site;
   this list feeds clarityops.io/tools (a gallery of tiles that open a pop-up), the sitemap and llms.txt.
   Copy is a draft until Hamza approves it. */

export type Slide = {
  src: string;
  w: number;
  h: number;
  /* What the slide shows, in a few words: shown on the tile and under the picture in the pop-up. */
  label: string;
  alt: string;
  /* On the gallery tile as well as in the pop-up. */
  tile?: boolean;
};

export type Product = {
  slug: string;
  name: string;
  line: string;
  text: string;
  tags: string[];
  href: string;
  cta: string;
  more?: { label: string; href: string };
  points: string[];
  icon: string;
  /* Tight close-ups of the tool's real screens, one feature each. The tile cycles through the tile ones on hover. */
  slides: Slide[];
};

const ap = (name: string) => `/tools/agentpin/${name}.webp`;

export const products: Product[] = [
  {
    slug: "agentpin",
    name: "AgentPin",
    line: "Your Claude agents, pinned to the corner of your Mac.",
    text: "A floating panel that shows what every agent and chat is working on. Approve, answer and message them in one click, hear a chime when one finishes, and keep an eye on your plan limits.",
    tags: ["Free", "macOS 14+"],
    href: "https://agentpin.vercel.app",
    cta: "Get AgentPin",
    more: { label: "Visit the site", href: "https://agentpin.vercel.app" },
    points: ["One-click permissions", "Live token use per agent", "Runs only on your Mac"],
    icon: "/tools/agentpin-icon.png",
    slides: [
      { src: ap("permission"), w: 1140, h: 669, tile: true, label: "Approve in one click", alt: "A permission card: marketing-site wants to run vercel deploy, with Deny, Always allow and Allow." },
      { src: ap("usage"), w: 1092, h: 564, tile: true, label: "Your plan limits, live", alt: "Plan usage: 77% of the 5-hour window left, 41% of the week used, tokens in the last hour." },
      { src: ap("question"), w: 1092, h: 567, tile: true, label: "Answer questions", alt: "A question card: switch the checkout to Stripe and open a PR, with Yes, do it and Not yet." },
      { src: ap("agents"), w: 1092, h: 2121, tile: true, label: "Every agent, step by step", alt: "The agent list grouped into Needs you, Working and Idle, with one agent's checklist open." },
      { src: ap("done"), w: 1140, h: 495, tile: true, label: "A chime when one finishes", alt: "A done card: ios-app finished all 6 steps, with an Open button." },
      { src: ap("new-task"), w: 1092, h: 627, label: "Start new work from the pin", alt: "Starting a new Claude task from the pin, in any folder." },
      { src: ap("icons"), w: 1092, h: 810, label: "An icon for every agent", alt: "Choosing an animated icon for each agent." },
    ],
  },
];
