/* Tools and resources ClarityOps makes and puts out under its own name. Each keeps its own site;
   this list feeds clarityops.io/tools (a gallery of tiles that open a pop-up), the sitemap and llms.txt.
   Copy is a draft until Hamza approves it. */

export type Shot = { src: string; w: number; h: number; alt: string };

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
  /* The picture on the gallery tile: the top of the tool's real screen. */
  tile: Shot;
  /* Screenshots to flip through in the pop-up. */
  shots: Shot[];
};

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
    tile: { src: "/tools/agentpin-tile.webp", w: 752, h: 760, alt: "The top of the AgentPin panel: plan usage and a permission card." },
    shots: [
      { src: "/tools/agentpin-panel.webp", w: 752, h: 1380, alt: "The AgentPin panel: plan usage, a permission card with Allow and Deny, a question card and a finished agent." },
      { src: "/tools/agentpin-new.webp", w: 752, h: 760, alt: "Starting a new Claude task from the pin, in any folder." },
      { src: "/tools/agentpin-icons.webp", w: 752, h: 880, alt: "Choosing an animated icon for each agent." },
    ],
  },
];
