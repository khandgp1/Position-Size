# KICKSTART IMPLEMENTATION PLAN — Position Calc

> **For AI Sessions:** Read this file before making any changes. It is the single source of truth for project scope, architecture, design decisions, and progress tracking.

---

## 1. Project Overview

**Position Calc** is a personal trading position-size calculator. It computes the required **Leverage** and **Position Size** for a BTC long trade based on three user inputs: **Entry Price**, **Stop Loss**, and **Risk ($)**.

The app is a single-page, static-served interface that:
- Renders two tabs: **BTC 1H Long** (active calculator) and **Info** (placeholder)
- Presents a single calculator card with 3 editable inputs and 2 computed outputs
- Recalculates outputs in real-time as inputs change
- Is fully mobile-responsive down to iPhone widths (≤430px)

There is no backend. All logic lives in the browser. Data files (if any) are flat JSON served via `npx serve .`.

---

## 2. Tech Stack & Architecture

| Layer | Technology |
|---|---|
| Markup | Plain HTML5 (`index.html`) |
| Styling | Vanilla CSS (`style.css`) |
| Logic | Vanilla JavaScript (`script.js`) |
| Data | JSON flat file (`config.json`) — tab definitions |
| Local Server | `npx serve .` (static file server) |

**No frameworks, no build tools, no npm dependencies in the project itself.**

### Data Flow

```
window.onload → init()
  └── fetch('config.json') → appConfig
        ↓
   Build tab buttons from appConfig.tabs
        ↓
   renderContent() → routes by tab.id
     ├── 'btc-1h-long' → renderCalculator()
     │     └── Builds calculator card with inputs + outputs
     │     └── Binds oninput → recalculate()
     └── 'info'         → renderPlaceholder()
```

---

## 3. File Structure (Fresh Start)

All existing MACROS files (`program.json`, `ingredients.json`, and their content) will be **replaced entirely**. The project reuses only the design language.

```
Position-Size/
├── index.html                          # Shell HTML — header, nav, main area, footer
├── style.css                           # Full design system + component styles + mobile
├── script.js                           # All app logic — data loading, tab routing, calculator
├── config.json                         # Tab definitions (replaces program.json)
├── CONTEXT.md                          # Project onboarding doc (to be rewritten post-build)
├── KICKSTART_IMPLEMENTATION_PLAN.md    # This file
└── .git/                               # Existing git history
```

---

## 4. Design System

Borrowed from the MACROS aesthetic — sage/off-white, clean typography, subtle animations.

### Color Tokens (`:root`)

| Token | Value | Usage |
|---|---|---|
| `--bg-color` | `#F5F5F3` | Page background (matte off-white) |
| `--card-bg` | `#FFFFFF` | Calculator card background |
| `--text-main` | `#2D2D2D` | Primary text (slate charcoal) |
| `--text-muted` | `#757575` | Labels, captions, secondary text |
| `--accent` | `#8A9A5B` | Sage green — borders, active tab, output highlights |
| `--border` | `#E0E0DE` | Card borders, dividers |
| `--output-bg` | `rgba(138, 154, 91, 0.15)` | Output zone background tint |

### Typography

- **Primary**: `'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Monospace** (for numeric values): `'JetBrains Mono', 'Courier New', monospace`
- **Headings**: `font-weight: 300` (light)

### Animations

| Name | Usage | Spec |
|---|---|---|
| `fadeIn` | Page content on tab switch | `opacity + translateY, 0.5s ease` |
| `slowFadeIn` | Calculator card entrance | `opacity + scale, 0.6s ease-out` |
| Hover | Tab buttons, input focus | `transition: all 0.3s ease` |
| Input focus | Editable fields | `border-color: var(--accent); box-shadow: accent glow` |

---

## 5. UI Layout

### 5.1 Header

```html
<header>
  <h1>Position Calc</h1>
  <p class="subtitle">CALCULATING ORDER SIZE AND REQUIRED LEVERAGE BASED ON RISK</p>
</header>
```

- Centered, generous padding (`60px 20px` desktop, `28px 16px` mobile)
- `h1` at `font-weight: 300`, `letter-spacing: 2px`
- Subtitle in small-caps muted text

### 5.2 Tab Navigation (`#tab-container`)

- Sticky at top (`position: sticky; top: 0; z-index: 100`)
- Two buttons generated from `config.json`:
  - **BTC 1H LONG** — active by default
  - **INFO** — placeholder tab
- Active tab: bottom border in `var(--accent)`, bold text

### 5.3 Main Content Area (`#main-content`)

- `max-width: 600px`, centered with `margin: 40px auto`
- Content swapped by `renderContent()` based on active tab

### 5.4 Calculator Card (BTC 1H Long tab)

The core UI component. Single contained card, two zones.

```
┌─────────────────────────────────────────────┐
│       POSITION SIZE CALCULATOR              │
│─────────────────────────────────────────────│
│                                             │
│   ENTRY PRICE                               │
│   ┌─────────────────────────────────┐       │
│   │  68,450.00                      │       │  ← editable input
│   └─────────────────────────────────┘       │
│                                             │
│   STOP LOSS                                 │
│   ┌─────────────────────────────────┐       │
│   │  67,200.00                      │       │  ← editable input
│   └─────────────────────────────────┘       │
│                                             │
│   RISK ($)                                  │
│   ┌─────────────────────────────────┐       │
│   │  250.00                         │       │  ← editable input
│   └─────────────────────────────────┘       │
│                                             │
│═════════════════════════════════════════════│
│                                             │
│   LEVERAGE            ──────         5.47x  │  ← computed
│   POSITION SIZE       ──────     $1,368.00  │  ← computed
│                                             │
│─────────────────────────────────────────────│
│   Entry → SL Distance: 1.83%               │  ← derived stat
└─────────────────────────────────────────────┘
```

#### Card Structure

| Zone | CSS Class | Content |
|---|---|---|
| **Card wrapper** | `.calc-card` | White bg, rounded corners, subtle shadow, `slowFadeIn` |
| **Card header** | `.calc-card-header` | Title "POSITION SIZE CALCULATOR" — uppercase, centered, `letter-spacing: 2px` |
| **Input zone** | `.calc-inputs` | 3 labeled input fields stacked vertically |
| **Divider** | `.calc-divider` | `2px solid var(--accent)` horizontal rule between inputs and outputs |
| **Output zone** | `.calc-outputs` | Background tinted with `var(--output-bg)`, computed values in monospace |
| **Summary line** | `.calc-summary` | Small muted text with derived stats (e.g., % distance). Optional — can be added when algorithm is defined |

#### Input Field Design

Each input field follows a **label-above-input** pattern:

```html
<div class="calc-field">
  <label class="calc-label" for="entry-price">ENTRY PRICE</label>
  <input type="number" inputmode="decimal" id="entry-price"
         class="calc-input" placeholder="0.00" step="any">
</div>
```

- Labels: uppercase, `0.75rem`, `letter-spacing: 1.5px`, `color: var(--text-muted)`
- Inputs: full-width within the card, `font-size: 1.1rem`, monospace font, right-aligned text
- Focus state: `border-color: var(--accent)`, `box-shadow: 0 0 0 3px rgba(138, 154, 91, 0.1)`
- Spinners hidden (`-moz-appearance: textfield`, `-webkit-appearance: none`)

#### Output Display Design

Each output is a **label + value** row:

```html
<div class="calc-output-row">
  <span class="output-label">LEVERAGE</span>
  <span class="output-value" id="leverage-output">—</span>
</div>
```

- Labels: same style as input labels but left-aligned
- Values: `font-size: 1.25rem`, monospace, `font-weight: 700`, `color: var(--text-main)`
- Default (no calculation): em-dash `—` placeholder
- The output zone has a sage-tinted background to visually separate it from inputs

### 5.5 Info Tab (Placeholder)

A centered, minimal placeholder state:

```html
<div class="placeholder-state">
  <h3>INFO</h3>
  <p>Content coming soon.</p>
</div>
```

- Vertically centered within the content area
- Uses `slowFadeIn` entrance animation
- `h3` in accent color, `p` in muted text

### 5.6 Footer

```html
<footer>
  <p>© 2026 High-Value Lifestyle Design</p>
</footer>
```

---

## 6. Data Schema

### `config.json`

```json
{
  "tabs": [
    {
      "id": "btc-1h-long",
      "label": "BTC 1H Long"
    },
    {
      "id": "info",
      "label": "Info"
    }
  ]
}
```

Minimal — only defines tab routing. No ingredient-style data needed; the calculator fields are hardcoded in the render function.

---

## 7. JavaScript Architecture

### Global State

```js
let appConfig = null;   // Loaded from config.json
let currentTab = 0;     // Active tab index
```

### Functions

| Function | Role |
|---|---|
| `init()` | Entry point. Fetches `config.json`, builds tab buttons, calls `renderContent()` |
| `switchTab(index)` | Updates `currentTab`, toggles `.active` class on tab buttons, calls `renderContent()` |
| `renderContent()` | Routes by `appConfig.tabs[currentTab].id` — calls `renderCalculator()` or `renderPlaceholder()` |
| `renderCalculator()` | Builds the calculator card HTML, injects into `#main-content`, binds input listeners |
| `renderPlaceholder()` | Renders the Info tab placeholder state |
| `recalculate()` | Reads all 3 inputs, runs the algorithm (placeholder), updates output DOM elements |

### Algorithm Placeholder

The `recalculate()` function will contain a **clearly marked placeholder** that outputs static values or simple pass-through math. The actual trading formula will be implemented in a future session.

```js
function recalculate() {
  const entry = parseFloat(document.getElementById('entry-price').value) || 0;
  const sl    = parseFloat(document.getElementById('stop-loss').value) || 0;
  const risk  = parseFloat(document.getElementById('risk-amount').value) || 0;

  // ─── ALGORITHM PLACEHOLDER ───
  // TODO: Replace with actual position sizing formula
  let leverage = 0;
  let positionSize = 0;

  if (entry > 0 && sl > 0 && risk > 0) {
    // Placeholder: simple stub values
    leverage = 0;
    positionSize = 0;
  }
  // ─── END PLACEHOLDER ───

  document.getElementById('leverage-output').textContent =
    leverage > 0 ? `${leverage.toFixed(2)}x` : '—';
  document.getElementById('position-output').textContent =
    positionSize > 0 ? `$${positionSize.toFixed(2)}` : '—';
}
```

---

## 8. Mobile Responsiveness (≤430px)

All mobile overrides live in a single `@media (max-width: 430px)` block at the bottom of `style.css`.

| Element | Desktop | Mobile |
|---|---|---|
| Header padding | `60px 20px` | `28px 16px` |
| `h1` font-size | `2.5rem` | `1.6rem` |
| Card padding | `30px` | `16px` |
| Card border-radius | `12px` | `8px` |
| Input font-size | `1.1rem` | `0.95rem` |
| Output font-size | `1.25rem` | `1rem` |
| Content padding | `0 20px` | `0 12px` |

---

## 9. What This Plan Explicitly Excludes

- **Algorithm logic** — The trading formula for computing Leverage and Position Size from Entry/SL/Risk. Will be defined and implemented in a future session.
- **Side drawer** — Not part of this project.
- **Bento grid** — Not used for the calculator. May be introduced later below the card for supplementary content.
- **Data persistence** — No localStorage, no backend. Inputs reset on page reload.
- **Multiple assets** — Only BTC 1H Long. Additional tabs/assets are a future enhancement.

---

## 10. How to Run

```bash
# From the project root:
npx serve .
```

Opens at `http://localhost:3000`. No install step needed.

> The app **cannot** be opened as a plain `file://` URL because `fetch()` requires HTTP. Always use `npx serve .`.

---

## 11. Implementation Checklist

Track progress by checking off items. Each phase is a logical unit of work that can be completed in a single session.

### Phase 1 — Foundation (Files + Shell) ✅
- [x] Replace `index.html` with new shell (header, nav, main, footer)
- [x] Replace `style.css` with new design system (`:root` tokens, base elements, tab nav)
- [x] Replace `script.js` with new skeleton (`init()`, `switchTab()`, `renderContent()`)
- [x] Replace `program.json` → create `config.json` with tab definitions
- [x] Delete `ingredients.json` (no longer needed)

### Phase 2 — Tab Navigation ✅
- [x] Tab buttons render from `config.json`
- [x] Tab switching works (active state toggles, content area updates)
- [x] Sticky tab bar with accent bottom-border on active tab
- [x] Info tab shows placeholder state

### Phase 3 — Calculator Card ✅
- [x] Card container with header, input zone, divider, output zone
- [x] 3 input fields: Entry Price, Stop Loss, Risk ($)
- [x] Input styling: monospace, right-aligned, focus glow, hidden spinners
- [x] 2 output displays: Leverage, Position Size (showing em-dash `—` by default)
- [x] Output zone with sage-tinted background
- [x] `slowFadeIn` entrance animation on card

### Phase 4 — Real-Time Calculation ✅
- [x] `oninput` listeners bound to all 3 inputs
- [x] `recalculate()` function with algorithm placeholder
- [x] Outputs update in real-time as inputs change
- [x] Graceful handling of empty/zero/invalid inputs (show `—`)

### Phase 5 — Mobile Responsiveness ✅
- [x] `@media (max-width: 430px)` overrides for header, card, inputs, outputs
- [x] Calculator card fills viewport width cleanly on iPhone
- [x] Inputs are comfortably tappable (min 44px touch target)
- [x] No horizontal scroll at any viewport width

### Phase 6 — Polish & QA ✅
- [x] Animations feel smooth (fadeIn on tab switch, slowFadeIn on card)
- [x] All inputs have proper `inputmode="decimal"` for mobile keyboards
- [x] Tab key order is logical (Entry → SL → Risk)
- [x] Empty state (page load) shows calculator with placeholder outputs
- [x] Footer renders correctly
- [x] Test on `npx serve .` — confirm fetch works, no console errors

### Phase 7 — Algorithm Integration (Future Session)
- [ ] Define the position sizing formula
- [ ] Implement in `recalculate()`
- [x] Add summary line (e.g., Entry→SL distance %)
- [ ] Validate edge cases (SL > Entry for longs, zero values, extreme leverage)

### Phase 8 — Context Doc Update (Post-Build)
- [ ] Rewrite `CONTEXT.md` to reflect the new Position Calc project
- [ ] Remove all MACROS references
- [ ] Document new data schema, JS conventions, and CSS organization
