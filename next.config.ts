import type { NextConfig } from "next";
import { products } from "./src/content/products";

/* Each tool with a mount is served at clarityops.io/<path> from its own project, e.g. /agentpin from agentpin.vercel.app.
   The tool's own site links its files under the same path (/agentpin/...). */
const mounts = products.flatMap((p) => (p.mount ? [p.mount] : []));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: { formats: ["image/avif", "image/webp"] },
  async rewrites() {
    return mounts.flatMap(({ path, origin }) => [
      { source: path, destination: `${origin}/` },
      { source: `${path}/:file*`, destination: `${origin}/:file*` },
    ]);
  },
};

export default nextConfig;
