import type { MetadataRoute } from "next";

/* Search engines and AI assistants are named so each one sees an explicit welcome. A named group replaces the "*" group for that bot, so every group repeats the /api/ rule. */
const aiBots = [
  // OpenAI: ChatGPT search, browsing on a user's request, and training.
  "OAI-SearchBot", "ChatGPT-User", "GPTBot",
  // Anthropic: Claude search, fetches on a user's request, and training.
  "Claude-SearchBot", "Claude-User", "ClaudeBot",
  // Perplexity.
  "PerplexityBot", "Perplexity-User",
  // Google Gemini and Apple Intelligence use these tokens to decide on AI use.
  "Google-Extended", "Applebot-Extended",
  // Others that feed AI answers.
  "Applebot", "Amazonbot", "DuckAssistBot", "meta-externalagent", "MistralAI-User", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: ["Googlebot", "Bingbot"], allow: "/", disallow: "/api/" },
      { userAgent: aiBots, allow: "/", disallow: "/api/" },
    ],
    sitemap: "https://clarityops.io/sitemap.xml",
  };
}
