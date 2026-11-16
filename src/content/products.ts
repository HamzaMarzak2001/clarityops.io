/* Tools and resources ClarityOps makes and puts out under its own name. Each keeps its own site;
   this list feeds clarityops.io/tools, the sitemap and llms.txt. Copy is a draft until Hamza approves it. */

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
  icon?: string;
  shot?: { src: string; w: number; h: number; alt: string };
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
    more: { label: "How it works", href: "https://agentpin.vercel.app/#how" },
    points: ["One-click permissions", "Live token use per agent", "Runs only on your Mac"],
    icon: "/tools/agentpin-icon.png",
    shot: { src: "/tools/agentpin-panel.webp", w: 752, h: 1380, alt: "The AgentPin panel: plan usage, a permission card with Allow and Deny, a question card and a finished agent." },
  },
];
