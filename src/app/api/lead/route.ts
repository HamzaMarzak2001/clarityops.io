import { NextResponse } from "next/server";

/* Sends a lead to the Make scenario that files it in Notion. While the webhook is unset, or if Make fails, it answers ok so booking still works. */
const text = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  if (text(body.hp)) return NextResponse.json({ ok: true, saved: false });
  const name = text(body.name, 200);
  const email = text(body.email, 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Name and a valid email are required." }, { status: 422 });
  }

  const hook = process.env.MAKE_CONTACT_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ ok: true, saved: false });

  const website = text(body.website, 500);
  const lead = {
    name,
    email,
    company: text(body.company, 200),
    website: website && !/^https?:\/\//.test(website) ? `https://${website}` : website,
    size: text(body.size, 50),
    industry: text(body.industry, 200),
    slowing: Array.isArray(body.slow) ? body.slow.map((s) => text(s, 90).replace(/,/g, "")).filter(Boolean).slice(0, 6) : [],
    note: text(body.note),
    source: "Website",
    submittedAt: new Date().toISOString(),
  };
  /* The scenario emails these two as they are, before filing the lead in Notion. */
  const rows: [string, string][] = [["Name", lead.name], ["Email", lead.email], ["Company", lead.company], ["Website", lead.website], ["Team size", lead.size], ["Industry", lead.industry], ["Slowing them down", lead.slowing.join(", ")], ["Note", lead.note]];
  const subject = `New website lead: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`;
  const html = `<table cellpadding="6" style="font:14px/1.5 sans-serif;border-collapse:collapse">${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="color:#666;vertical-align:top">${k}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`;

  try {
    const res = await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...lead, subject, html }), signal: AbortSignal.timeout(8000) });
    if (!res.ok) console.error("Make rejected a lead", res.status);
    return NextResponse.json({ ok: true, saved: res.ok });
  } catch {
    console.error("Make request failed");
    return NextResponse.json({ ok: true, saved: false });
  }
}
