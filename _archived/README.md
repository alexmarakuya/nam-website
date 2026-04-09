# Archived Projects

Files in this directory are **deliberately hidden from the public site** but preserved in the codebase for future revival.

---

## Casa NāM (`_archived/casa-nam/`)

**Why hidden:** Casa NāM is temporarily shelved (archived 2026-04-09). The project may return; preserving all code and assets for revival.

**What was hidden:**
- `_archived/casa-nam/index.html` — Casa NāM landing page (was live at `nam.space/casa-nam/`)
- `_archived/casa-nam-pitch/index.html` — Casa NāM investor pitch deck (was live at `nam.space/casa-nam/pitch/`)
- `_archived/casa-nam-pitch/Casa-NaM-Pitch-Deck.pdf` — exported PDF version
- `_archived/casa-nam-pitch/export-pdf.mjs` — Puppeteer script for PDF export

---

## How to re-enable Casa NāM

**Step 1 — Move files back:**
```bash
git mv _archived/casa-nam casa-nam
git mv _archived/casa-nam-pitch pitch
```

**Step 2 — Restore blog links** in `nam-space/blog/announcing-casa-nam/index.html`:
- Re-add the orange top banner linking to `/casa-nam/`
- Re-add the `Casa NāM` nav link
- Re-add the "Learn more about Casa NāM →" CTA link

**Step 3 — Update `robots.txt`** in `nam-space/robots.txt`:
- Remove the `Disallow: /casa-nam/` line (or comment it out)

**Step 4 — Update the VPS deploy script** at `/var/www/casa-nam/deploy.sh`:
- Restore the `cp casa-nam/index.html "$HTML_DIR/"` line
- Restore the `cp pitch/index.html "$HTML_DIR/pitch/"` line

**Step 5 — Deploy** and submit `nam.space/casa-nam/` to Google Search Console → Removals → Remove from Removals list.

---

## Post-hide checklist (for the person deploying)

- [ ] Update `/var/www/casa-nam/deploy.sh` on VPS to remove the `cp casa-nam/index.html` and `cp pitch/index.html` lines (so deploy doesn't break)
- [ ] Confirm `nam.space/casa-nam/` returns 404 after deploy
- [ ] Confirm `casanam.com` 301-redirect still works (or redirect to `/` instead)
- [ ] Submit `nam.space/casa-nam/` to Google Search Console Removals tool
- [ ] Submit `nam.space/casa-nam/pitch/` to Google Search Console Removals tool
