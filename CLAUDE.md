# clarityops.io v2

Read these before changing anything:

- `../clarityops-web-brief/COPY-DECK.md`: every word on the page.
- `../clarityops-web-brief/BRAND-WEB-ADDENDUM.md`: layout, type, motion, imagery.
- `../clarityops-web-brief/CLAUDE-CODE-PROMPT.md`, section 4: the hard rules.
- `DECISIONS.md`: what was decided, why, and what was rejected.

Copy changes come from Hamza, not from the agent. Never add claims, stats, sections or clients.

Client data: look at every image before using it. No record rows, names, addresses or amounts from client systems unless Hamza confirms they are safe or anonymized.

Do not deploy to the production domain without Hamza's approval. `.env.local` sets `NEXT_PUBLIC_SHOW_TODOS=1` for review builds. Production must not set it.

## Working here

- `npm run dev`, `npm run build`, `npm run typecheck`.
- `node scripts/fps.mjs <url>` for frame timing, `node scripts/shots.mjs <url> captures` then `python3 scripts/stitch.py captures` for full pages, `python3 scripts/jssize.py` for the JS budget.
- `node scripts/dragon-still.mjs <url>` re-renders the hero's fallback still (dev server). `scripts/dragon-review.mjs` captures the route for critique. `scripts/lag.mjs` measures frames with real wheel input in a visible window. Check every image crop by eye first.
- Ask Hamza before building any new visual concept.
- Grep `src/` for `TODO` and `NEXT_PUBLIC_SHOW_TODOS` before launch.
