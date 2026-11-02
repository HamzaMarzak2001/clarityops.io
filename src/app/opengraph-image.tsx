import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "ClarityOps. We design how companies run.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const portrait = await readFile(join(process.cwd(), "public/studio/hamza-marzak.jpg"));
  const mark = await readFile(join(process.cwd(), "public/logos/favicon.svg"));
  const sora = await readFile(join(process.cwd(), "src/assets/Sora-600.ttf"));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#000", color: "#E8EDE1", fontFamily: "Sora", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: 800, height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;base64,${mark.toString("base64")}`} width={72} height={72} alt="" />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 600, lineHeight: 1.02, letterSpacing: "-0.04em" }}>
          <span>We design how</span>
          <span>companies run.</span>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/jpeg;base64,${portrait.toString("base64")}`} width={520} height={520} alt="" style={{ position: "absolute", right: -40, bottom: 0 }} />
    </div>,
    { ...size, fonts: [{ name: "Sora", data: sora, weight: 600, style: "normal" }] },
  );
}
