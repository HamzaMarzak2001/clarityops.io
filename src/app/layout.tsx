import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono, Sora } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Tune } from "@/components/Tune";
import { faqs } from "@/components/Faq";
import { buildSchema, toJsonLd } from "@/content/schema";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sora", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], weight: "500", style: "italic", variable: "--font-fraunces", display: "swap" });

const title = "ClarityOps · Operations & AI Systems Studio";
const description = "ClarityOps designs how growing companies run, then builds the systems, automation and AI agents that run them. Founder-led, working worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL("https://clarityops.io"),
  title,
  description,
  alternates: { canonical: "/" },
  icons: { icon: "/logos/favicon.svg" },
  openGraph: { title, description, url: "/", siteName: "ClarityOps", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

/* The motion layer turns on before first paint. Without JS, or with reduced motion, the page is its finished static self. */
const motionGate = `if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('mo')`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${jetbrains.variable} ${fraunces.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(buildSchema({ description, faqs })) }} />
      </head>
      <body id="top">
        {children}
        <SmoothScroll />
        {process.env.NODE_ENV === "development" && <Tune />}
      </body>
    </html>
  );
}
