# Stash — Marketing Website

Pre-launch landing page for [Stash](https://github.com/Rengusky/stash), the calm personal library app for iPhone, iPad and Mac. Static HTML/CSS/JS, no build step.

## Structure

```
index.html    single-page landing
styles.css    all styles (light/dark via prefers-color-scheme)
script.js     hero animation + waitlist form submit
assets/       favicon, future screenshots
```

## Waitlist setup (one-time, ~2 minutes)

The waitlist form posts to [Formspree](https://formspree.io):

1. Create a free Formspree account and a new form (name it "Stash waitlist").
2. Copy the form ID from the endpoint it gives you (`https://formspree.io/f/<FORM_ID>`).
3. In `script.js`, replace `YOUR_FORM_ID` in `FORMSPREE_ENDPOINT` with the real ID.

Submissions appear in the Formspree dashboard and can be exported as CSV.

## Run locally

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Hosted on GitHub Pages, served from the `main` branch root. Pushing to `main` deploys automatically.
