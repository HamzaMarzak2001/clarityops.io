"use client";
import dynamic from "next/dynamic";
import { type FormEvent, useEffect, useRef, useState } from "react";

/* The booking embed loads only after the form is sent. */
const Cal = dynamic(() => import("@calcom/embed-react"), { ssr: false });

const sizes = ["1 to 10", "11 to 30", "31 to 100", "100+"];
const slows = ["Work lives in too many places", "Reporting takes too long", "The founder is in every decision", "Hiring adds confusion", "We want AI to do real work", "Something else"];

const empty = { name: "", email: "", company: "", website: "", size: "", industry: "", note: "", hp: "" };

export function Contact() {
  const [step, setStep] = useState(1);
  const [v, setV] = useState(empty);
  const [slow, setSlow] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<"name" | "email", string>>>({});
  const panel = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setV((o) => ({ ...o, [k]: e.target.value }));

  useEffect(() => {
    if (!moved.current) return;
    panel.current?.querySelector<HTMLElement>("input, textarea, [data-focus]")?.focus({ preventScroll: true });
  }, [step]);

  const next = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const err: typeof errors = {};
      if (!v.name.trim()) err.name = "Add your name to continue.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) err.email = "Add a work email, like you@company.com.";
      setErrors(err);
      if (Object.keys(err).length) {
        panel.current?.querySelector<HTMLElement>(`[name="${Object.keys(err)[0]}"]`)?.focus();
        return;
      }
    }
    moved.current = true;
    if (step === 3) {
      /* A failed save must never stop someone booking. */
      fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...v, slow }), keepalive: true }).catch(() => {});
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  return (
    <section id="contact" aria-labelledby="contact-h" className="sec">
      <div className="wrap grid12 gap-y-12">
        <div className="col-span-12 lg:col-span-6">
          <h2 id="contact-h" className="d">Let&apos;s look at how your company runs.</h2>
          <p className="body mt-6 text-muted">Tell us a little about the business. If it looks like a fit, you&apos;ll pick a time for a 30-minute introduction with Hamza.</p>
        </div>
        <form noValidate className="col-span-12 lg:col-span-5 lg:col-start-8" onSubmit={next}>
          <div role="img" aria-label={`Step ${Math.min(step, 3)} of 3`} className="steps">
            {[1, 2, 3].map((n) => <i key={n} className={n <= step ? "on" : ""} />)}
          </div>

          <div ref={panel} key={step} className="step-panel" aria-live="polite">
            {step === 1 && (
              <div>
                <label className="fld"><span>Your name</span>
                  <input className="input" name="name" autoComplete="name" required value={v.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "err-name" : undefined} />
                  {errors.name && <em id="err-name" className="fld-err">{errors.name}</em>}
                </label>
                <label className="fld"><span>Work email</span>
                  <input className="input" name="email" type="email" autoComplete="email" required value={v.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined} />
                  {errors.email && <em id="err-email" className="fld-err">{errors.email}</em>}
                </label>
                <label className="fld"><span>Company</span><input className="input" name="company" autoComplete="organization" value={v.company} onChange={set("company")} /></label>
                <label className="fld"><span>Website</span><input className="input" name="website" type="url" inputMode="url" autoComplete="url" value={v.website} onChange={set("website")} /></label>
                <label className="sr-only" aria-hidden>Leave this empty<input tabIndex={-1} autoComplete="off" name="hp" value={v.hp} onChange={set("hp")} /></label>
              </div>
            )}
            {step === 2 && (
              <div>
                <fieldset className="mb-6">
                  <legend className="mb-2 text-sm font-normal">Team size</legend>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => <label key={s}><input type="radio" name="size" value={s} checked={v.size === s} onChange={set("size")} className="sr-only" /><span className="chip">{s}</span></label>)}
                  </div>
                </fieldset>
                <label className="fld"><span>Industry</span><input className="input" name="industry" value={v.industry} onChange={set("industry")} /></label>
              </div>
            )}
            {step === 3 && (
              <div>
                <fieldset className="mb-6">
                  <legend className="mb-2 text-sm font-normal">What&apos;s slowing the company down?</legend>
                  <div className="flex flex-wrap gap-2">
                    {slows.map((s) => (
                      <label key={s}>
                        <input type="checkbox" name="slow" value={s} className="sr-only" checked={slow.includes(s)} onChange={(e) => setSlow((o) => (e.target.checked ? [...o, s] : o.filter((x) => x !== s)))} />
                        <span className="chip">{s}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="fld"><span>Note (optional)</span><textarea className="input min-h-24" name="note" value={v.note} onChange={set("note")} /></label>
              </div>
            )}
            {step === 4 && (
              <div>
                <p data-focus tabIndex={-1} className="h3">Thank you. Pick a time that works for you.</p>
                <div className="cal-box" data-lenis-prevent>
                  <Cal calLink="clarityops.io/discovery" config={{ name: v.name, email: v.email, theme: "light" }} style={{ width: "100%", height: "100%", overflow: "auto" }} />
                </div>
              </div>
            )}
          </div>

          {step < 4 && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <button type="submit" className="btn btn-p"><span>Continue</span></button>
              {step > 1 && <button type="button" onClick={() => { moved.current = true; setStep(step - 1); }} className="min-h-11 cursor-pointer text-sm text-muted hover:text-text">Back</button>}
            </div>
          )}
          <p className="fine mt-6">Usually answered within one business day.</p>
        </form>
      </div>
    </section>
  );
}
