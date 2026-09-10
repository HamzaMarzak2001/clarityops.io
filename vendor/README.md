# vendor/

Self-hosted, version-pinned third-party code. **No build step, no npm.**

## three-0.186.0.esm.min.js

| | |
|---|---|
| Version | three.js r186 (0.186.0) |
| Source | `https://esm.sh/three@0.186.0/es2022/three.mjs` |
| Fetched | 2026-09-10 |
| Raw | 742,354 bytes |
| gzip | ~188 KB (Vercel serves brotli from our origin, ~150 KB) |
| sha256 | `211ac5fcda39066276478eeca3ac06ae1060b7a8a659e482f7a837aa40e2e3bb` |

### Regenerate
```bash
curl -sL 'https://esm.sh/three@0.186.0/es2022/three.mjs' -o vendor/three-0.186.0.esm.min.js
shasum -a 256 vendor/three-0.186.0.esm.min.js
```
Then re-add the provenance header at the top of the file.

### Why self-hosted, and why esm.sh
- **Self-hosted** removes a third-party DNS + TLS handshake from the critical
  path and means the site cannot break because a CDN did.
- **esm.sh** is the only source serving three as a single, correctly bundled,
  minified ESM file with **no relative imports**.
- **Not jsDelivr:** it minifies on the fly and does not rewrite relative
  specifiers, so `three.module.min.js` still pulls `./three.core.js`
  unminified — ~356 KB shipped while believing it was ~194 KB.
- **Not npm:** ships no minified build (a 631 B CJS stub and a 1.46 MB
  unminified core).

### Addons
**None at launch.** No OrbitControls, no GLTFLoader, no EffectComposer, no
postprocessing. The drive-line scene needs zero custom GLSL and zero addons.
The import map declares `three/addons/` so example code pastes in verbatim
if that ever changes — but adding one means vendoring it here at 0.186.0.
