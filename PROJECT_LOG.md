# Stash Landing — Project Log

Chronological record of meaningful decisions for the Stash marketing landing page.
Hand this file to anyone (person or AI) picking up the project. Append entries; never rewrite past ones.

## Project overview
- Vanilla **Vite** landing page for **Stash**, a personal app for saving design inspiration (images, links, videos) — iOS + macOS, currently TestFlight beta.
- Authoritative working folder: `/Users/achu-ranga/Documents/Stash Landing`.
- A read-only mirror exists at `~/.codex/.chatgpt-projects/g-p-6a96dd56d370819197410c2ddc937656`. Never edit the mirror's `sources/`.
- Headlines: **Bricolage Grotesque**. Body/UI: **Outfit**.
- Assets: PNG only. Light device mockups only (dark removed).
- Sections: Hero (Mac + iPhone) → "Why Stash?" (4-card Figma board) → closing CTA/footer with oversized pale "STASH".

## Prior state (pre-2026-09-06, from handoff)
- Hero, Why Stash layout/copy/typography, and closing footer were built and close to the Figma reference.
- Outstanding issue: the "Why Stash" card **background artwork** did not match Figma — specifically (1) per-card background elements, (2) the Search-card dots, (3) the Sync-card dots covered too much of the card.
- Figma reference: file `ZRcbdxA3EPk7AHnt2TV7Zo`, "Why Stash" frame node `730-4270` (927 × 864).

## 2026-09-06 — Why Stash card backgrounds rebuilt from Figma assets
**Decision:** Reproduce the card backgrounds using the *actual exported Figma vector layers* rather than re-approximating them with CSS gradients/patterns (the approach that had repeatedly failed on fidelity).

- **Figma MCP now works** (read tools: `get_screenshot`, `get_metadata`, `download_assets`) — the earlier "no edit access" errors no longer block read/export. This is the key unblock.
- Exported the exact dot/line vector layers as **SVG** (crisp, resolution-independent) into `public/assets/whystash/`:
  - `search-dots.svg` (Search `Dots`, 520×223, coral @ 0.4 opacity, diagonal fade).
  - `sync-grid.svg` (Sync `BG`, 260×228, faint coral line-grid @ 0.1) — top-left corner.
  - `sync-dots.svg` (Sync `Union`, 261×245, coral dot cluster @ 0.2) — bottom-right corner.
  - Discovered the two Sync `Union` vectors are identical; the second (`730-4258`, at x261/y245) sits **entirely behind the Mac mockup**, so it is omitted (occluded).
- **Search card**: replaced the old two-band white linear mask + CSS radial-dot pattern with the real `search-dots.svg` (top-left, 520×223) plus coral radial glows top-left and bottom-right.
- **Sync card**: replaced the full-card CSS dot grid (complaint #3) with the controlled treatment — `sync-grid.svg` top-left + `sync-dots.svg` bottom-right, plus coral glows bottom-left and top-right. Dots no longer cover the whole card.
- **Moodboard & Image cards**: replaced the swapped/mispositioned blurred-ellipse `::before/::after` with layered CSS `radial-gradient` glows placed at the Figma ellipse coordinates.
- **Image card color switch**: corrected the 5 circles to match Figma order/colors — teal `#86c0cb`, orange `#e85b23`, cream `#efe9dd`, navy `#273139`, grey-teal `#8098a0`.
- Asset URLs use root-absolute paths (`/assets/whystash/*.svg`), the correct Vite `public/` convention; verified they copy into `dist/assets/whystash/` on build.

**Verification:** `npm run build` passes. Verified visually with headless Chrome screenshots (desktop 1265px + mobile 390px) against the Figma reference exports; Search and Sync cards now match Figma's treatment and cards stack correctly on mobile.

**Gotcha discovered:** a Vite dev server was already running on **port 5173 serving the *mirror* directory**, not the Documents folder — edits appeared to have no effect until a separate dev server was started against the authoritative folder (used port 5175). Always confirm which directory the dev server on 5173 is serving.

**Still open:** hosting/deploy target not decided (Vercel mentioned but unconfirmed). User wants the page live.

## 2026-09-06 — Hero + Why Stash motion pass
Added entrance/parallax to the hero and scroll-triggered animations to each Why Stash card.

- **Hero devices:** one-time entrance (`heroRise` keyframe — a small rise + fade, ~32px). Implemented via the CSS `translate`/`opacity` properties so it composes cleanly with the existing scroll **parallax** (which drives `transform` via CSS vars — both Mac and iPhone already move at different rates). Kept parallax as-is.
- **Hero spacing:** gap between the "Join Sneak Peek!" CTA and the device mockups set to **48px** (`.demo-wrap` margin-top in main.css).
- **Image analysis:** tags then colour circles fade/pop in **one by one** (staggered `transition-delay`).
- **Moodboards:** tags **slide into place** from the sides (top row from left, bottom row from right), staggered. Prominence states (`soft`/`medium`) converted from hard `opacity` to a `--o` custom property so the reveal animation to `opacity: var(--o)` preserves the 0.2 / 0.4 / 1 hierarchy instead of flattening it.
- **Powerful search:** the field rises in, then a JS **typewriter** types/deletes a rotating word list (`cars, sneakers, typography, recipes, interiors`) with a blinking caret. The old `<input>` became a presentational `.search-field` (`.search-text` + `.search-caret`).
- **Sync across devices:** Mac and iPhone **slide up from the bottom** on reveal, phone slightly delayed.

**Mechanism:** an `IntersectionObserver` adds `.in-view` per card (threshold 0.3), unobserving after. All hidden initial states are gated behind an `.anim-ready` class that JS adds only when `IntersectionObserver` exists — so with no JS the page shows everything. `prefers-reduced-motion` is honored by the existing global `*{animation:none;transition:none}` rule plus a typewriter guard that shows a static word.

**Verify note:** scroll-reveal motion can't be captured by a single headless screenshot (IntersectionObserver doesn't fire under `--virtual-time-budget`, and normal headless grabs the frame before the ~1s transition finishes — both yield a blank/pre-reveal frame, which is a capture-timing artifact, not a bug). Verified instead by: build passes; script runs (`anim-ready` set, no live console errors); forced-reveal + `getComputedStyle` confirms every end-state (incl. moodboard `--o` prominence); hero entrance/gap confirmed visually. Motion is best confirmed in the live preview. Tip for capturing a settled Why-Stash frame headlessly: use JS enabled with a tall window (e.g. `--window-size=1265,3400`) so all cards intersect the initial viewport and the observer fires + transitions finish before capture.

## 2026-09-06 — Search bar frosted-glass material
The Figma search field carries a **Background blur** effect (frosted glass) that does not export to code via `get_design_context` (its Tailwind output only surfaced the `rgba(0,0,0,.25)` fill + `0 0 10px` shadow), so the glass had been missed.

- Added `backdrop-filter: blur(16px) saturate(135%)` (+ `-webkit-` prefix) to `.search-field`, so the dotted background + coral glow behind the pill are frosted. Kept the Figma fill/shadow and added a hairline `rgba(255,255,255,.16)` border + `inset 0 1px 0 rgba(255,255,255,.22)` top highlight to define the glass edge. z-order already correct (dots `::before` z0 paints behind the `.search-query` z1 that holds the field, so the blur picks them up).
- Verified with a headless capture (JS on, tall window): dots under the pill read blurred while surrounding dots stay crisp.

## 2026-09-06 — Primary colour, title font, CTA alignment
- **Primary colour is now `#F8492F`** across the whole page (previously `#e05454`). Changed the `--red` token in main.css; updated the derived shades to match — pill hover `#d93c22`, focus ring `#f9a595`, and every hardcoded `rgba(224,84,84,…)` → `rgba(248,73,47,…)` (join-button shadow, STASH-word gradient, legacy masonry/keyframe shadows). This unifies the brand red with the coral already used in the Why Stash cards. (The unused `.color-options .coral` swatch was left as-is — it is decorative, not the brand colour.)
- **Title font is Bricolage Grotesque across the page.** Headings already used it; extended the rule to `h1–h6` and added the brand wordmarks (`.brand`, `footer .shell > span`) and the oversized `.join-word` "STASH", which had been falling back to Outfit. Body/interface copy and the closing lead line stay Outfit by design.
- **"Join Test Flight" CTA text centred.** `.pill` was `inline-flex` with no `justify-content`, so the button's `min-width: 166px` left-aligned the label. Added `justify-content: center; align-items: center` to `.pill` (fixes every pill).
- Verified via computed styles (`--red` = #f8492f, pill `justify-content: center`, wordmark/STASH fonts = Bricolage) and a headless screenshot of the nav + closing/footer.

## 2026-09-06 — Unified button into one component
There were effectively two button looks: a flat `.pill` (nav + hero) and the glowing closing button (`.join-rule .pill`). Consolidated to a single component — the **glowing** one — used everywhere.
- Moved the glow into base `.pill`: `box-shadow: 0 10px 21px rgba(248,73,47,.3)`, padding unified to `13px 22px`, and a hover that lifts the glow (`0 14px 26px rgba(248,73,47,.4)` + `translateY(-1px)`).
- Dropped the hero CTA's padding override so it uses the base component.
- Reduced `.join-rule .pill` to layout-only specifics (`min-width: 166px`, `white-space: nowrap`); it now inherits the shared glow/padding instead of redefining them.
- Result: nav "Join Sneak Peek!", hero "Join Sneak Peek!", and closing "Join Test Flight" are one identical glowing coral pill. Verified with a headless screenshot.

## 2026-09-06 — Fix: Bricolage Grotesque was never actually loading
Symptom: the "Bricolage Grotesque" title font wasn't showing even though the CSS `font-family` was set correctly (computed style showed the right stack).
**Root cause:** the Google Fonts `css2` URL requested `Bricolage+Grotesque:opsz,wdth,wght@10..48,75..100,200..800`. Bricolage Grotesque has **no `wdth` axis** (and that `opsz` range is wrong), so Google Fonts **silently dropped the entire family** and returned HTTP 200 serving only the valid families (Outfit, IBM Plex Mono). All headings were falling back to Outfit.
**Diagnosis:** `document.fonts` listed only Outfit + IBM Plex Mono; a canvas/DOM width test showed text in "Bricolage Grotesque" measured identical to generic serif (i.e. not applied). `curl`-ing the URL confirmed only two `font-family` declarations came back.
**Fix:** changed the request to a valid weight-only spec — `family=Bricolage+Grotesque:wght@400;500;600;700;800` — in index.html. After the fix, `document.fonts` includes Bricolage Grotesque and its rendered width is distinct from both Outfit and serif; hero/heading visibly render in Bricolage.
**Lesson:** a Google Fonts `css2` request with a bad axis for one family doesn't error — it 200s and omits that family. When a webfont "won't apply," verify it's actually in `document.fonts` / returned by the CSS endpoint, not just that the `font-family` rule is present.

## 2026-09-06 — Design-token system (Vega-aligned)
**Ask:** stop hardcoding values; establish a proper design system. User asked whether we could reuse their own **Vega** (`~/Documents/vega`, `vega-ui`) — a motion-first, token-driven React component library (Radix + Tailwind v3 + Motion springs + CVA).

**Options weighed:**
1. **Vega-aligned token layer, page stays vanilla** — port Vega's token *architecture & values* into a `tokens.css` CSS-var layer, themed for Stash. **← chosen.**
2. **Rebuild the landing on Vega (React + Tailwind + Motion)** — page literally becomes Vega. Rejected for now: full rewrite of the hand-tuned Figma-matched hero/Why-Stash layout + scroll motion; larger scope; wouldn't ship today; the marketing page has almost no interactive components that would use Radix.
3. **Only color+shadow tokens** — rejected as a partial system.

**Why option 1:** one source of truth, consistent with Vega, zero risk to existing layout/animations, ships today. Key mismatches noted: Vega's `--primary` is near-black shadcn neutral and its shadows are neutral, whereas Stash is warm paper `#F7F4EF` + coral `#F8492F` + Bricolage display — so "using Vega" means *theming* it. Stash brand therefore drives `--primary`. Vega has no typography tokens, so the Bricolage/Outfit/Plex system is additive.

**Built `src/styles/tokens.css`** (loaded first in index.html) mirroring Vega conventions:
- **Colors as HSL triplets** consumed via `hsl(var(--x) / a)` — same pattern as Vega's `--background`/`--foreground`/`--primary`. Stash hexes converted to HSL with a script (round-trip drift ≤2/255, imperceptible). The channel form collapses all ~15 scattered coral alphas (`.025`–`.5`) to `hsl(var(--brand) / a)`, so re-tinting the page = editing `--brand` once. Semantic names: `--background`, `--surface`, `--surface-warm`, `--foreground`, `--primary`(→brand), plus legacy aliases (`--paper/--ink/--white/--red/--muted/--line`) so nothing broke.
- **Radius:** single `--radius` scalar (25px — happens to equal Vega's "xl/Round" step) + a Stash scale (`--radius-xs..2xl`, `--radius-pill`).
- **Shadows:** Vega's 6-step ambient+key neutral scale (`--shadow-sm..2xl`) copied verbatim as reference, plus Stash's brand/ink-tinted component signatures (`--shadow-pill`, `--shadow-device`, `--shadow-phone`, `--shadow-glass`).
- **Spacing:** Vega's 7-step scale (4/8/12/16/24/32/64) + landing rhythm (`--space-gap/section/block`).
- **Type:** families, weight scale, fluid display sizes, text sizes.
- **Motion:** Vega spring feel translated to CSS easings (`--ease-out`, `--ease-pop` ≈ SPRING_SNAPPY) + durations.
- **Layout:** shell width/pad, z-index scale.

**Refactor:** `main.css` and `interactions.css` rewritten to consume tokens (values kept pixel-identical — a safe refactor). `interactions.css` fully tokenized; `main.css` live components tokenized and the dead legacy blocks (Mac-window chrome, masonry, kinds/steps/link-card, old `.join`/`.join-action` — none present in current markup) also tokenized for consistency and flagged in comments as legacy. Image-analysis swatch palette (`robot-*` etc.) deliberately kept as literals — those are *content* colors (an image's extracted palette), not brand tokens.

**Verify:** `npm run build` passes (CSS 25.32 kB). Headless Chrome full-page capture (JS on, tall window) confirms pixel-faithful render — coral pills+glow, Bricolage headings, card glows/dots, glass search, moodboard opacity hierarchy, STASH gradient all intact; no broken/transparent fills (proves every `hsl(var(--x)/a)` resolves). Dev server on 5175 rooted at Documents (5173 still serves the mirror).

**Open / follow-ups:** (a) legacy dead CSS could be deleted outright in a future pass; (b) if the landing later grows interactive UI or should showcase Vega, revisit option 2 (React + real Vega components).

## 2026-09-06 — Source control: GitHub repo `rengusky/stash-website`
**Decision:** keep the code in **https://github.com/rengusky/stash-website** (gh auth: account `rengusky`).

**Surprise found:** the repo was **not empty** — `main` holds a *different, older, currently-live* Stash site: a **Three.js + GSAP WebGL** single-section waitlist page (Formspree), plus `privacy.html`, deployed via **GitHub Pages** from `main` root with **no build step** (`.github/workflows/pages.yml`, `.nojekyll`). Our local project is a different generation (Vite app, needs a build). Flagged to user before touching anything.

**Decisions (user):**
- Push path: **new branch + PR**, leave `main` and the live site untouched → branch `vite-redesign`, **PR #1** (https://github.com/rengusky/stash-website/pull/1). Not merged.
- **Preserve `privacy.html`** → moved to `public/privacy.html` (Vite serves it at `/privacy.html`); its `assets/favicon.svg` also preserved → `public/assets/favicon.svg`. Both came across as git renames (byte-identical).
- Preserved deployment scaffolding (`.github/workflows/pages.yml`, `.nojekyll`) untouched in the PR.
- Removed old flat site (`index.html` replaced, `styles.css`, `main.js` deleted).

**Repo hygiene:** created `.gitignore` excluding `node_modules/`, `dist/`, `.DS_Store`, `*.log`, and the ChatGPT-mirror scaffolding (`AGENTS.md`, empty `sources/`, `tmp/`) + local `.claude/`. Added an accurate `README.md` for the Vite project (old README described the Three.js site). First commit `aa7bdf1`.

**⚠️ Deployment caveat (must resolve before any `main` cutover):** old site = Pages from `main` root, no build. This version needs `npm run build`. Merging as-is breaks Pages (it would serve the unbuilt `index.html` referencing `/src/...`). Options: (1) update `pages.yml` to build Vite and publish `dist/`, or (2) host on Vercel/Netlify and repoint the domain. Until cutover, `main`/live site are safe.

**Note:** the repo's `.github` and old site reference `Rengusky/stash` (the app repo) — the marketing site repo is `rengusky/stash-website`.

## 2026-09-06 — SEO pass
Added technical SEO to the site (on branch `vite-redesign`, part of PR #1). Commit `bca9fe4`.

- **`<head>` meta:** keyword-rich `description`, `keywords`, `author`, `robots` (`index,follow,max-image-preview:large`), `theme-color` `#f8492f`, `application-name`/`apple-mobile-web-app-title`. Title → "Stash — Save your inspiration in one place · iPhone, iPad & Mac".
- **Canonical + favicons:** `<link rel=canonical>` + `icon`/`mask-icon`/`apple-touch-icon` → `assets/favicon.svg` (relative, so it works both at the Pages subpath and a future custom-domain root).
- **Open Graph + Twitter** `summary_large_image` cards (title/description/url/image + dimensions + alt).
- **OG image:** built a branded **1200×630** card (coral + warm paper + Bricolage, giant "S" watermark) via headless Chrome from a scratch HTML → `public/assets/og-cover.png` (so social shares render a real preview, not a broken one).
- **JSON-LD** `@graph`: `Organization` + `WebSite` + `SoftwareApplication` (free offer, `iOS, iPadOS, macOS`, featureList). Validated as parseable JSON.
- **`public/robots.txt`** (allow all + sitemap) and **`public/sitemap.xml`** (`/` + `/privacy.html`).
- **`privacy.html`:** added `robots` + `canonical` (it already had a good description + favicon).

**Verify:** `npm run build` passes; JSON-LD parses (`Organization, WebSite, SoftwareApplication`); dev server serves og-cover.png / robots.txt / sitemap.xml / favicon.svg / privacy.html all 200; canonical + og:image render with correct absolute URLs.

**⚠️ Domain caveat:** absolute URLs (canonical, og:image, sitemap) currently use the Pages URL `https://rengusky.github.io/stash-website/`. **Update these when a custom domain is set at launch.** Also: because Pages serves at the `/stash-website/` subpath, the app's root-absolute asset refs (`/assets/whystash/*.svg` in CSS) will 404 there — needs a Vite `base` config OR a custom-domain-root / different host. Rolled into the deployment cutover work. → RESOLVED by deploying to Vercel (root domain); see below.

## 2026-09-06 — Published on Vercel
Deployed the Vite site to **Vercel** (CLI, authed as `ranga190495-7028`). Live: **https://stash-website-three.vercel.app** (`stash-website` project name was taken globally, so the alias is `-three`). Vercel scope/team: `rangas-projects-aea69e32` (personal). Committed on branch `vite-redesign` (still part of PR #1).

- **Deploy method:** `vercel link --yes --project stash-website` then `vercel --prod --yes`. Vercel auto-detected Vite (build `vite build`, output `dist`). First `--yes` failed because the folder name "Stash Landing" is an invalid project name (space/uppercase) → fixed by explicit `--project stash-website`.
- **Root-domain deploy fixes the subpath problem:** all `/assets/...` (incl. `/assets/whystash/*.svg`) resolve at the domain root — no Vite `base` needed. Verified 200 for home, whystash SVGs, og-cover, robots, sitemap, privacy, favicon. Live render confirmed (Bricolage + coral + layout intact).
- **SEO URLs repointed** from the Pages URL to the Vercel URL across index.html (canonical/OG/Twitter/JSON-LD), sitemap.xml, robots.txt, privacy.html; redeployed.
- **Secret hygiene:** `vercel link` created `.env.local` (VERCEL_OIDC_TOKEN) and auto-added it to `.gitignore`; confirmed it is NOT committed.
- **Git↔Vercel auto-connect FAILED** during link ("Make sure … you have access to the repository") — the Vercel GitHub App isn't installed/authorized for `rengusky/stash-website` under this Vercel scope. So deploys are currently **manual CLI** (`vercel --prod`), not push-triggered.

**Open — connecting Git to Vercel (recommended, needs user action):** two prerequisites before wiring auto-deploy: (1) install/authorize the **Vercel GitHub App** on `rengusky/stash-website` (dashboard OAuth — user must do this); (2) decide the **Production Branch** — `main` still holds the OLD Three.js site, so connecting as-is would deploy the old site to prod. Either merge `vite-redesign` → `main` first, or set Vercel's Production Branch to `vite-redesign`. Custom domain + updating the absolute SEO URLs again also pending.

## 2026-09-06 — Cutover: merged to main, retired GitHub Pages
Resolved the "Production Branch = main = old site" trap so Git↔Vercel is safe.

- **Retired the GitHub Pages workflow** (`.github/workflows/pages.yml`, commit `0a10a16`): it published the repo root with no build step, so a push to `main` would have served unbuilt Vite source. Hosting is Vercel now. (`.github` is now empty/gone on main; `.nojekyll` left, harmless. The last Pages deployment stays frozen until Pages is disabled in repo settings.)
- **Merged PR #1** (`vite-redesign` → `main`, merge commit `9431a5e`). `main` is now the Vite site (old `index.html`/`styles.css`/`main.js` gone, `src/` present). Local synced to `main`. Remote `vite-redesign` branch left (not deleted).
- **Production stayed healthy** throughout (Vercel is CLI-deployed, independent of the merge): live site still the Vite site.
- **Git auto-deploy still NOT firing:** after the merge (a push to `main`) no git-sourced Vercel deployment appeared — only the two manual CLI deploys. So although the user reports connecting the page to GitHub, Vercel is not auto-deploying `rengusky/stash-website` yet. Likely the Vercel GitHub App still lacks repo access (the CLI auto-connect had errored). **To finish:** in the Vercel dashboard → project `stash-website` → Settings → Git, connect `rengusky/stash-website` with Production Branch = `main`; then pushes auto-deploy. Until then, deploy manually with `vercel --prod` from the project dir.

**Still open:** custom domain (+ re-point absolute SEO URLs), optionally disable GitHub Pages, optionally delete the merged `vite-redesign` branch.

## 2026-09-06 — Git↔Vercel auto-deploy connected & confirmed
After the user authorized the Vercel GitHub App on the repo, `vercel git connect --yes` (run from the linked project dir) succeeded → project `stash-website` now connected to `rengusky/stash-website`, Production Branch `main`. Confirmed end-to-end: pushed an empty commit to `main` → a **git-sourced production deployment** built and went Ready (`stash-website-fqudbmt3s…`), production alias `stash-website-three.vercel.app` serving it (home/assets/privacy all 200). **Pushing to `main` now auto-deploys to production; PRs get preview deployments.** Manual `vercel --prod` no longer needed for routine deploys.

**Remaining (optional, user's call):** custom domain (then re-point the hardcoded absolute SEO URLs to it), disable the old GitHub Pages site, delete the merged `vite-redesign` branch.

## 2026-09-06 — Mobile optimization + TestFlight CTA
Fixed 5 mobile issues (appended a "Mobile optimizations" block at the end of interactions.css so it wins by source order without fighting main.css). Verified in a real browser at 390px via the in-app DevTools (JS measurement, not just headless screenshots — headless fell back to a wider system font and produced misleading "clipping").

1. **iPhone-only hero on mobile.** `.desktop-app { display:none }` at ≤760px; the old `.demo-wrap` used a fixed `720px` width + `translateX(-50%) scale()` that overflowed. Replaced with static, `width:100%`, centered flex; `.phone` made `position:static`, centered, `width:min(250px,62vw)` (240/66vw at ≤500).
2. **No horizontal panning.** Root cause found via JS (`document.querySelectorAll('*')` → elements past viewport): the closing **`.join`** section still had `margin-inline:12px` (leftover from the old card design) while being `width:100%` full-bleed → 12px overflow. Fixed with `.join { margin-inline:0 }` at ≤760px. Also added `html,body { overflow-x:hidden }` as a guard. After: `bodyScrollWidth == viewport`, 0 offenders.
3. **Moodboard chips too small.** Bumped chip `font-size` 14→15px; rows now `flex-wrap:wrap` + centered with row-gap so the 5-/4-chip rows wrap instead of clipping at the edges; moodboards grid row 220→250px so wrapped tags fit inside the card (verified 18px clearance).
4. **Footer spacing.** On mobile it was `justify-content:center` with an 8px gap (wordmark + credit bunched in the middle). Changed to `space-between` (Stash left, credit right), padding-inline 22px.
5. **TestFlight CTA.** All three `.pill` buttons (nav + hero "Join Sneak Peek!", closing "Join Test Flight") now link to `https://testflight.apple.com/join/StmCpgpn` (`target=_blank rel=noopener noreferrer`).

**Verify:** build passes (CSS 26.25 kB); desktop unchanged (both devices in hero); mobile hero/moodboards/footer confirmed via in-app browser screenshots at 390px; 0 horizontal-overflow offenders. Pushed to `main` → Vercel auto-deploy.

## 2026-09-06 — Align mobile hero to Figma reference
User shared the mobile design (Figma `ZRcbdxA3EPk7AHnt2TV7Zo`, node `738-994`) and said "build same as the design". Compared it against the live mobile build — cards/closing/footer already matched (our wrapping moodboard chips are actually cleaner than the Figma, where "Tec"/"Colors" clip). Applied the four hero deltas, mobile-scoped (≤760px) so desktop is unchanged:
1. **No top nav on mobile** (`.nav { display:none }`); hero padding-top tightened to 26px.
2. **No hero CTA button on mobile** (`.hero-cta { display:none }`) — mobile's only CTA is now the bottom "Join Test Flight" (per the design).
3. **Bolder headline** (`.hero h1 { font-weight:700 }`) + controlled 2-line break re-enabled.
4. **Short hero intro on mobile:** wrapped the extra sentence in `<span class="intro-more">` and hid it ≤760px; mobile shows only "Screenshots, links, images, reels."
Also added "!" to the headline ("…in one place!") — shared copy, so it shows on desktop too (flagged and approved). Verified at 390px: 0 overflow, nav/CTA/intro-more hidden, h1 weight 700; desktop still has nav + hero button + full intro. Pushed to `main` → Vercel auto-deploy.

## 2026-09-06 — Figma mobile review round 2
Compared the live mobile against the Figma reference (sliced sections from the full-res export via a headless-Chrome offset-crop, since the Figma MCP hit the Starter-plan tool-call limit). Applied:
1. **Removed the hero kicker** ("TestFlight beta · iOS + macOS") entirely — not in the design.
2. **Moodboard now matches design:** (a) active chips (`:not(.soft):not(.medium)` → Recipes/Instagram/Books) are **coral-filled with white text** (global, desktop + mobile); (b) reverted the mobile chips from wrap-and-center back to **two non-wrapping rows that bleed off both edges** (`flex-wrap:nowrap; justify-content:center`), matching the design's scattered-tag look. Verified desktop + mobile.
4. **Last section / footer:** the giant STASH watermark sat too high leaving empty space above the footer; lowered it on mobile (`.join-word` top 43→54% @760, 48→60% @500, font 31→33vw / 35→36vw) so the footer text overlaps its lower half like the design.

Item 3 ("update content for sync") left pending — the design's sync card shows only the "Sync across devices" heading + device mockup (same as ours), so the intended content change is unclear; asked the user to clarify. Build passes; desktop unaffected.
