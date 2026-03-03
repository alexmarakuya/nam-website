# NāM Space CTA Section — Version Backup

**Recorded:** February 2026  
**Purpose:** Restore this version if the CTA is changed in the future.

---

## Current Version (Instagram-only)

### Copy

| Element | Text |
|---------|------|
| Headline | Join our journey |
| Subhead | And be the first to know about what's happening as we build, grow and open our doors. |
| Bar text | Follow our Instagram for updates |
| CTA button | Go to Instagram |

### CTA destination

- **Primary:** https://instagram.com/namspaceth (opens in new tab)

### Benefits (removed — membership-focused)

*Kept for restore when membership CTA returns.*

1. **Publish your profile** — Be visible in the member directory. Let others find and connect with you.
2. **Get project updates** — Follow the build as it happens. Plans, timelines, progress.
3. **Shape the space** — Have a voice in what gets built. Input on programming and spaces.

<details>
<summary>Benefits HTML (click to expand — for restore)</summary>

```html
<div class="cta-benefits">
  <div class="cta-benefit">
    <svg class="cta-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="#f5f2e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    <p class="body-lg-semi">Publish your profile</p>
    <p class="body-sm">Be visible in the member directory. Let others find and connect with you.</p>
  </div>
  <div class="cta-benefit">
    <svg class="cta-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="#f5f2e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/></svg>
    <p class="body-lg-semi">Get project updates</p>
    <p class="body-sm">Follow the build as it happens. Plans, timelines, progress.</p>
  </div>
  <div class="cta-benefit">
    <svg class="cta-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="#f5f2e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></svg>
    <p class="body-lg-semi">Shape the space</p>
    <p class="body-sm">Have a voice in what gets built. Input on programming and spaces.</p>
  </div>
</div>
```

</details>

---

## HTML snippet (for restore)

```html
<div class="cta-header">
  <h2 class="h2">Join our journey</h2>
  <p class="body-lg">And be the first to know about what's happening as we build, grow and open our doors.</p>
</div>
<!-- Benefits removed (see above for restore) -->
<div class="cta-bar-inside">
  <p class="body-lg-semi">Follow our Instagram for updates</p>
  <a href="https://instagram.com/namspaceth" target="_blank" rel="noopener noreferrer" class="btn cta-btn-inside">Go to Instagram</a>
</div>
```

---

## Previous version (for reference)

- **Headline:** Become a founding member
- **Subhead:** The community is forming now. Create your profile and join before the doors open.
- **Bar:** Free to join. No commitment.
- **Primary CTA:** Become a member → members.nam.space
- **Secondary CTA:** Follow our Instagram for updates → instagram.com/namspaceth
