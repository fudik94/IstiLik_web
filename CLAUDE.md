# IstiLik Web

Heating power calculator — pure HTML/CSS/JS, no framework, no build tool.

## Run locally

Open `index.html` directly in any browser.
For PWA and service worker testing (requires localhost):

    python -m http.server 8080

Then open http://localhost:8080

## Run tests

    node js/calculator.test.js

## File responsibilities

- `js/calculator.js` — pure calculation functions, no DOM, testable in Node
- `js/translations.js` — all UI strings for AZ / RU / EN (browser global TRANSLATIONS)
- `js/app.js` — DOM wiring only, uses textContent throughout (no innerHTML)
- `css/style.css` — all styles including @media print for PDF export

## Adding a language

1. Add a new key to TRANSLATIONS in `js/translations.js`
2. Add a lang button in `index.html`: `<button class="lang-btn" data-lang="xx">XX</button>`

## Design references

- Spec: `docs/superpowers/specs/2026-03-27-istilik-web-design.md`
- Plan: `docs/superpowers/plans/2026-03-27-istilik-web.md`

## Git rules

**Commit author is only the user.** Never add `Co-Authored-By`, `Co-authored-by`, or any AI/Claude attribution to commit messages.

**Never commit or push these files/folders — local only:**
- `CLAUDE.md`
- `docs/`
- `.claude/`

Make sure all of the above are listed in `.gitignore`.
