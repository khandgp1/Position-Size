# CONTEXT — Position Calc

> **For AI Sessions:** Read this file first. It gives you everything you need to understand the codebase and make accurate changes without prior context.

---

## 1. Project Overview

**Position Calc** is a personal BTC trading position-size calculator. Given three inputs — **Entry Price**, **Stop Loss**, and **Risk ($)** — it computes:

- **Leverage** — the maximum whole-number leverage for the trade (capped at 125x; displays `∞` above that)
- **Position Size** — total USD order value (`positionUnitSize × entry`)
- **Actual Risk** — the real dollar risk after precision-flooring the unit size
- **Liquidation Price** — estimated liquidation price for the computed leverage

The app is a **single-page, statically served website** with no backend. It is designed for personal use and targets desktop and mobile (iPhone ≤430px).

---

## 2. Tech Stack & Architecture

| Layer | Technology |
|---|---|
| Markup | Plain HTML5 (`index.html`) |
| Styling | Vanilla CSS (`style.css`) |
| UI Logic | Vanilla JS (`script.js`) |
| Algorithm | Vanilla JS (`algo.js`) — pure calculation module |
| Data | JSON flat file (`config.json`) — tab definitions only |
| Local Server | `npx serve .` (static file server, serves on `http://localhost:3000`) |

**No frameworks. No build tools. No npm dependencies in the project itself.**

### Data Flow

```
window.onload → init()
  └── fetch('config.json') → appConfig
        ↓
   Build tab buttons from appConfig.tabs
        ↓
   renderContent() → routes by tab.id
     ├── 'btc-1h-long' → renderCalculator()
     │     └── Builds calculator card HTML with inputs + outputs
     │     └── Binds oninput → recalculate()
     │           └── Reads 3 inputs
     │           └── Calls calculatePositionSize() from algo.js
     │           └── Writes results to output DOM elements
     └── 'info'         → renderPlaceholder()
```

### Script Loading Order

`index.html` loads scripts in this order (both at bottom of `<body>`):
1. `algo.js` — exposes `calculatePositionSize()` as a **global function**
2. `script.js` — calls `calculatePositionSize()` by name (no import/export)

---

## 3. Key Files & Their Roles

| File | Purpose |
|---|---|
| `index.html` | Shell HTML — header, sticky nav, `<main>` area, footer. Loads `algo.js` then `script.js`. |
| `style.css` | Complete design system — CSS custom properties, base typography, tab nav, calculator card, placeholder state, animations, mobile overrides. |
| `script.js` | All UI logic — `init()`, `switchTab()`, `renderContent()`, `renderCalculator()`, `renderPlaceholder()`, `recalculate()`. Dynamically builds the DOM from JS. |
| `algo.js` | Pure calculation module — `calculatePositionSize(entry, sl, risk, precision)`. No DOM access, no side effects. |
| `config.json` | Tab definitions only — `[{ id, label }]`. Currently defines `btc-1h-long` and `info`. |
| `KICKSTART_IMPLEMENTATION_PLAN.md` | Original build plan with design specs, architecture decisions, and phased implementation checklist. |
| `implementation_plans/` | Directory of per-phase implementation plan files (`00_` through `09_`). Historical reference. |

---

## 4. Data Schema

### `config.json`

```json
{
  "tabs": [
    { "id": "btc-1h-long", "label": "BTC 1H Long" },
    { "id": "info",         "label": "Info" }
  ]
}
```

- `id` — used by `renderContent()` to route to the correct renderer
- `label` — displayed as the tab button text (uppercased via JS)

### `calculatePositionSize()` Return Object

```js
{
  positionSize:     number,   // Total order value in USD (unitSize × entry)
  positionUnitSize: number,   // BTC quantity (floored to `precision` decimals)
  actualRisk:       number,   // Real dollar risk (unitSize × |entry - sl|)
  leverage:         number | "∞",  // Max whole-number leverage (capped at 125, "∞" if beyond)
  liquidationPrice: number    // Estimated liquidation price for the computed leverage
}
```

Returns `null` for invalid inputs (non-positive, non-finite, `entry ≤ sl`).

---

## 5. Algorithm Logic (`algo.js`)

The position sizing algorithm works as follows:

1. **Validate inputs** — entry, sl, risk must be positive finite numbers; entry must be > sl (long-only).
2. **Compute raw unit size** — `risk / (entry - sl)`.
3. **Floor to precision** — `Math.floor(rawUnitSize * 10^precision) / 10^precision` (default precision = 4 decimal places). This guarantees `actualRisk ≤ inputRisk`.
4. **Derive outputs**:
   - `positionSize = positionUnitSize × entry`
   - `actualRisk = positionUnitSize × (entry - sl)`
5. **Leverage calculation** — Uses a 0.05% Maintenance Margin Rate (MMR):
   - `rawMaxLeverage = 1 / (1 + MMR - (sl / entry))`
   - If `rawMaxLeverage > 125` → leverage = `"∞"`
   - Otherwise → `Math.floor(rawMaxLeverage)`
6. **Liquidation price** — `entry × (1 - 1/leverage + MMR)` for finite leverage; equals `sl` when leverage is `"∞"`.

---

## 6. UI Structure

### Layout Hierarchy

```
<body>
  <header>          — App title "Position Calc" + subtitle
  <nav #tab-container>  — Sticky tab bar (dynamically built from config.json)
  <main #main-content>  — Content area (max-width: 600px, centered)
    └── Calculator card or placeholder (swapped by JS on tab change)
  <footer>          — Copyright line
```

### Calculator Card (BTC 1H Long tab)

The card is a single `.calc-card` element with these zones:

| Zone | Class | Content |
|---|---|---|
| Header | `.calc-card-header` | Title "POSITION SIZE CALCULATOR" |
| Input zone | `.calc-inputs` | 3 stacked input fields (Entry Price, Stop Loss, Risk) |
| Divider | `.calc-divider` | 2px sage-green horizontal rule |
| Output zone | `.calc-outputs` | 2 label-value rows (Leverage, Position Size) with sage-tinted background |
| Summary line | `.calc-summary` | "Actual Risk: $X | Liq. Price: $Y" |

### Input Fields

- IDs: `entry-price`, `stop-loss`, `risk-amount`
- Type: `number` with `inputmode="decimal"` and `step="any"`
- `risk-amount` has a default `value="10"`
- Right-aligned text in monospace font
- Focus state: sage-green border + glow via `box-shadow`
- Spin buttons hidden

### Output Fields

- IDs: `leverage-output`, `position-output`
- Summary line ID: `calc-summary-line`
- Default display: em-dash `—` when no valid calculation

### Info Tab

Minimal placeholder: card with "Info" heading and "Content coming soon." text.

---

## 7. Design System

### Color Tokens (CSS Custom Properties in `:root`)

| Token | Value | Usage |
|---|---|---|
| `--bg-color` | `#F5F5F3` | Page background (matte off-white) |
| `--card-bg` | `#FFFFFF` | Card backgrounds |
| `--text-main` | `#2D2D2D` | Primary text (slate charcoal) |
| `--text-muted` | `#757575` | Labels, secondary text |
| `--accent` | `#8A9A5B` | Sage green — active tab, divider, focus glow |
| `--border` | `#E0E0DE` | Card borders, dividers |
| `--output-bg` | `rgba(138, 154, 91, 0.15)` | Output zone background tint |

### Typography

- **Primary font**: `'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Monospace** (inputs/outputs): `'JetBrains Mono', 'Courier New', monospace`
- **h1**: `font-weight: 300` (light), `letter-spacing: 2px`
- **Labels**: uppercase, `0.75rem`, `letter-spacing: 1.5px`, `font-weight: 700`

### Animations

| Name | Usage | Spec |
|---|---|---|
| `fadeIn` | Content transitions | `opacity + translateY(10px)`, `0.5s ease` |
| `slowFadeIn` | Calculator card & placeholder entrance | `opacity + scale(0.98→1)`, `0.6s ease-out` |
| Hover/focus | Tab buttons, input focus | `transition: all 0.3s ease` |

### Mobile Breakpoint

Single `@media (max-width: 430px)` block at bottom of `style.css`. Reduces padding, font sizes, and border-radius across all components. Touch targets remain ≥44px.

---

## 8. Conventions & Patterns

### Code Style

- **No semicolons**: Not enforced — the codebase uses semicolons consistently.
- **Naming**: camelCase for JS functions/variables, kebab-case for CSS classes and HTML IDs.
- **DOM construction**: All dynamic content is built via `document.createElement()` + template literals for `innerHTML`. No JSX or templating engine.
- **Global scope**: `algo.js` exports via global function declaration. `script.js` uses two globals (`appConfig`, `currentTab`).
- **No modules**: No `import`/`export` — scripts are loaded via `<script>` tags in order.

### Architecture Rules

- `algo.js` is a **pure function module** — no DOM access, no side effects. It can be tested independently.
- `script.js` owns all DOM manipulation and event binding.
- Tab routing is done via `appConfig.tabs[currentTab].id` string matching in `renderContent()`.
- New tabs require: (1) an entry in `config.json`, (2) a renderer function in `script.js`, (3) a routing case in `renderContent()`.

### CSS Organization

`style.css` is organized into clearly labeled sections (using `/* === ... === */` comment blocks):

1. Base Typography & Page Layout
2. Sticky Navigation Tabs
3. Animations
4. Calculator Card Styles
5. Placeholder State (Info tab)
6. Mobile Overrides

---

## 9. Current State & Known Issues

### Known Considerations

- **MMR is hardcoded** at `0.0005` (0.05%) in `algo.js`. It is not configurable.

---

## 10. How to Run

```bash
# From the project root (Position-Size/):
npx serve .
```

Opens at **`http://localhost:3000`**. No install step, no build step.

> The app **cannot** be opened as a plain `file://` URL because `fetch()` requires HTTP. Always use `npx serve .`.
