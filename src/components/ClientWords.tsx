/* Real quotes only, with name, role and company. Hidden in production below two quotes. */
const quotes: { quote: string; name: string; role: string; company: string }[] = [];

export function ClientWords() {
  const showSlots = process.env.NEXT_PUBLIC_SHOW_TODOS === "1";
  if (quotes.length < 2 && !showSlots) return null;
  return (
    <section aria-labelledby="words-h" className="sec pt-0">
      <div className="wrap">
        <h2 id="words-h" className="label mb-8">In their words</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <p className="todo text-muted">TODO, Hamza: first real quote, with name, role and company. Hidden until two exist.</p>
          <p className="todo text-muted">TODO, Hamza: second real quote, with name, role and company.</p>
        </div>
      </div>
    </section>
  );
}
