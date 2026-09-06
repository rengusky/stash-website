# Stash — Marketing Website

Pre-launch landing page for **Stash**, the calm personal library app for iPhone, iPad and Mac (iOS + macOS, currently TestFlight beta).

Built with **Vite** (vanilla HTML/CSS/JS). Sections: Hero (Mac + iPhone) → "Why Stash?" (image analysis, moodboards, powerful search, device sync) → closing CTA/footer.

## Structure

```
index.html              markup
src/styles/tokens.css   design tokens — single source of truth (Vega-aligned)
src/styles/main.css      base layout + components (consume tokens)
src/styles/interactions.css  Why-Stash cards, scroll-reveal, closing/footer
src/scripts/main.js      typewriter, IntersectionObserver reveals, parallax
public/assets/           device mockups, demo imagery, Why-Stash SVGs
public/privacy.html      privacy policy (served at /privacy.html)
PROJECT_LOG.md           chronological record of decisions
```

## Design system

All brand/type/space/radius/shadow/motion values live in `src/styles/tokens.css`
as CSS custom properties; `main.css` and `interactions.css` consume them. The token
layer mirrors the conventions of the in-house component library **Vega**
(`vega-ui`) — HSL-triplet colors, a `--radius` scalar, a 6-step shadow scale — themed
for Stash (coral `#F8492F` + warm paper). Change `--brand` once to re-tint the page.

## Develop

```sh
npm install
npm run dev      # dev server
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Deploy

Deployment target TBD (the previous static generation was served from GitHub Pages;
this Vite version needs a build step — either publish `dist/` via Pages or host on
Vercel/Netlify).
