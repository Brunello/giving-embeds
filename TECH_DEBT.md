# Tech Debt & Cleanup Notes

Items identified during May 2025 audit. Bugs from the same audit have already been fixed.

---

## High Priority

### 1. Massive duplication across banner pages
**Files:** `banner.astro`, `alumnibanner.astro`, `magbanner.astro`

All three are nearly identical — same HTML structure, same countdown JS copied verbatim, same CSS with only color values changed. Should be a single Astro component with props for `bgColor`, `accentColor`, `ctaUrl`, `ctaText`, `utmSource`, etc.

---

### 2. Hardcoded iframe heights in tag code
**Files:** All `tagcode/` snippets

The tag snippets hardcode exact pixel heights at every breakpoint (e.g. `68.05px`, `113.55px`). Any change to banner content or font size silently breaks the layout on the host site. Better approach: have the iframe `postMessage` its own `scrollHeight` to the parent, which sets the height dynamically — eliminating the need for breakpoint-syncing between the embed and the tag code.

---

## Medium Priority

### 3. `tagcode/` files don't belong as Astro pages
**Files:** `src/pages/tagcode/*.astro`

These are raw HTML/JS snippets for copy-pasting into GTM. They have no layout, no frontmatter, and use no Astro features. They'd be clearer as plain files outside `src/pages/` (e.g. a `gtm-snippets/` folder at the root) so it's obvious they're payloads and not rendered routes.

### 4. Inconsistent font loading strategy
**Files:** `magsubscribe.astro`, `Layout.astro`, other banner files

- `magsubscribe.astro` loads Typekit fonts with full `@font-face` declarations and a 30-line Adobe license comment block inline in its `<style>`.
- Other banners use `proxima-nova, sans-serif` as a bare font-family name, relying on whatever the host site has loaded.
- `Layout.astro` attempts to load Proxima Nova from `/fonts/ProximaNova-Regular.otf` with `format('otf')` — the correct format string is `'opentype'`.

Should settle on one approach: either self-host consistently or rely on host-site fonts explicitly.

### 5. Duplicate CSS rule
**File:** `tagcode/alumni.astro` (lines 32–37)

The `.header-wrapper` top rule is written twice identically. One copy can be removed.

### 6. Countdown deadlines rely on the visitor's browser timezone
**Files:** `banner.astro`, `alumnibanner.astro`, `magbanner.astro`

These parse the deadline with a bare local-time string, e.g. `new Date("12/31/2025 06:00 PM")`. That's interpreted in *each visitor's* timezone, so the countdown hits zero at a different real-world instant depending on where the user is.

Fix: anchor the deadline to a fixed UTC offset using an ISO 8601 string, e.g. `new Date("2025-12-31T18:00:00-05:00")`. `FYE2026.astro` already does this. Note the offset is DST-dependent: Eastern is **-05:00 (EST)** in winter and **-04:00 (EDT)** roughly mid-March through early November — pick the offset that matches the deadline's date. Apply this to any new banner with a timer.

---

## Low Priority / Cleanup

### 7. Stale Astro template boilerplate in `Layout.astro`
**File:** `src/layouts/Layout.astro`

Lines 25–37 still contain the purple `--accent` CSS variables and dark `background: #13151a` from the Astro starter template. These don't affect embeds in practice (each page scopes its own styles), but they're dead code and make the Layout confusing.

### 8. `postMessage` uses `"*"` as target origin
**Files:** All banner and popup pages

`window.parent.postMessage("banner closed", "*")` broadcasts to any origin. Since these are always embedded on Columbia domains, the target origin can be locked down to `https://magazine.columbia.edu`, `https://www.columbia.edu`, etc. Minor security improvement.

### 9. `* { margin: 0 !important }` in `popup.astro`
**File:** `src/pages/popup.astro` (line 44)

Nuclear selector that overrides all child margins globally. Works fine in isolation today but will be a debugging headache if the popup gains more complex content. Replace with targeted resets on the specific elements that need it.

### 10. `innerHTML` used for countdown text
**Files:** `banner.astro`, `alumnibanner.astro`, `magbanner.astro`

The countdown uses `.innerHTML` to set values like `days + "D"`. Since this is not user input there's no XSS risk, but `.textContent` is more semantically correct for text nodes.
