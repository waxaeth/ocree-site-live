# Ocree local website

Static six-page Ocree website prototype. No build step is required.

## Run locally

```powershell
python -m http.server 8000
```

Open http://localhost:8000/index.html (use another port if 8000 is occupied).

Pages: Home, Platform, Solutions, Resources, About and Contact.

## Design

- `styles.css` retains the original visual foundation.
- `refined.css` contains the architectural visual direction and responsive adjustments.
- `site.js` handles navigation, restrained one-time reveals and the local form.
- `i18n.js` retains the English/French copy and language preference.
- `assets/architecture-blueprint.webp` is generated conceptual brand artwork, not a depiction of a specific offering. The PNG is the source asset.

The contact form is a local demonstration and does not send messages. Existing resource and legal links with `href="#"` remain placeholders. Confirm their destinations and complete the form integration before production use.

This refinement has not been committed or published.
