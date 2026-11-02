import { NextResponse } from "next/server";

/* Saves a lead to Notion. While the env vars are unset, or if Notion fails, it answers ok so booking still works. */
const text = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const rich = (s: string) => ({ rich_text: s ? [{ text: { content: s } }] : [] });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  if (text(body.hp)) return NextResponse.json({ ok: true, saved: false });
  const name = text(body.name, 200);
  const email = text(body.email, 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Name and a valid email are required." }, { status: 422 });
  }

  const token = process.env.NOTION_TOKEN;
  const db = process.env.NOTION_LEADS_DB_ID;
  if (!token || !db) return NextResponse.json({ ok: true, saved: false });

  const website = text(body.website, 500);
  const size = text(body.size, 50);
  const slow = Array.isArray(body.slow) ? body.slow.map((s) => text(s, 90)).filter(Boolean).slice(0, 6) : [];
  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: name } }] },
    Email: { email },
    Company: rich(text(body.company, 200)),
    Industry: rich(text(body.industry, 200)),
    Note: rich(text(body.note)),
    Slowing: { multi_select: slow.map((s) => ({ name: s.replace(/,/g, "") })) },
  };
  if (website) properties.Website = { url: /^https?:\/\//.test(website) ? website : `https://${website}` };
  if (size) properties["Team size"] = { select: { name: size } };

  try {
    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "notion-version": "2022-06-28" },
      body: JSON.stringify({ parent: { database_id: db }, properties }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Notion rejected a lead", res.status);
    return NextResponse.json({ ok: true, saved: res.ok });
  } catch {
    console.error("Notion request failed");
    return NextResponse.json({ ok: true, saved: false });
  }
}
