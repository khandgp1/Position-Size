# MACROS — Project Context

> **For AI Sessions:** Read this file before making any changes. It contains everything you need to understand the codebase, make consistent edits, and avoid breaking existing patterns.

---

## 1. Project Overview

**MACROS** is a personal macro-tracking web app titled *"Living Flexibly and Aware."* Its purpose is to help the owner track nutritional macros (protein + calories) across three food categories: Breakfast, Meat, and Fruit.

The app is a single-page, data-driven interface that:
- Renders tabs dynamically from `program.json`
- Pulls ingredient nutrition data from `ingredients.json`
- Calculates protein and calories in real-time as the user adjusts gram/oz inputs
- Supports a slide-out side drawer for supplementary content
- Is fully mobile-responsive down to iPhone widths (≤430px)

There is no backend. All data lives in flat JSON files and is fetched via the browser's `fetch()` API from a local static file server.

---

## 2. Tech Stack & Architecture

| Layer | Technology |
|---|---|
| Markup | Plain HTML5 (`index.html`) |
| Styling | Vanilla CSS (`style.css`) |
| Logic | Vanilla JavaScript (`script.js`) |
| Data | JSON flat files (`program.json`, `ingredients.json`) |
| Local Server | `npx serve .` (static file server on port 3000) |

**No frameworks, no build tools, no npm dependencies in the project itself.** `npx serve` is used only to serve the files — it is not part of the app bundle.

### How It Works (Data Flow)

```
window.onload → init()
  ├── fetch('program.json')    → appData
  └── fetch('ingredients.json') → ingredientsData
        ↓
   Build tab buttons from appData.days
        ↓
   renderContent() → routes by day.title
     ├── 'breakfast' / 'meat' / 'fruit' → renderIntro(day)
     │     ├── renderMacroCalc(day)  ← filters ingredients by tab
     │     └── renderBentoGrid(day) ← day.exercises as cards
     └── (other)  → renderWorkout(day)
```

---

## 3. Key Files & Their Roles

| File | Role |
|---|---|
| `index.html` | Shell HTML — defines the `<header>`, `#tab-container` nav, `#workout-content` main area, `#side-drawer`, and `#drawer-overlay`. All content is injected by JS. |
| `style.css` | All visual styles — design tokens, layout, component styles, drawer, macro table, bento grid, and mobile media query |
| `script.js` | All application logic — data fetching, tab switching, content rendering, macro calculation, drawer open/close, clipboard copy |
| `program.json` | Defines tabs/days rendered in the nav. Each day has a `title`, `focus`, `description`, and `exercises` array |
| `ingredients.json` | Nutrition data for all ingredients, keyed by a short ID. Each ingredient has `name`, `protein`, `calories`, and either `baseGrams`/`defaultGrams` or `baseOz`/`defaultOz` |
| `CONTEXT.md` | This file — project onboarding for AI sessions |

> **`implementation_plans/`** — A directory of markdown checklists used to track feature work across sessions. Each file is named `NN_IMPLEMENTATION_.md`.

---

## 4. Data Schema

### `program.json`

```json
{
  "days": [
    {
      "title": "Breakfast",        // String — used for tab label and routing logic
      "focus": "",                 // String — displayed as a sub-heading (h2) on the tab
      "description": "",          // String — italic sub-caption below the focus heading
      "exercises": []             // Array — bento-card items (or workout exercises for non-intro tabs)
    }
  ]
}
```

Currently has 3 days: `Breakfast`, `Meat`, `Fruit`. The JS caps tab rendering at `index <= 2` (line 26 of `script.js`), so a 4th day would be hidden unless that guard is updated.

**Exercise item shape** (when `exercises` is populated):
```json
{
  "name": "Card Title: subtitle",   // Text before ':' is used as the card h3
  "note": "Description text",       // Shown as .step-note
  "sets": 3,                        // Used only in renderWorkout()
  "reps": "10-12"                   // Used only in renderWorkout()
}
```

### `ingredients.json`

```json
{
  "ingredientKey": {
    "name": "Display Name",       // Shown in the macro table
    "protein": 18,                // Grams of protein per baseGrams/baseOz
    "calories": 90,               // Calories per baseGrams/baseOz
    "baseGrams": 170,             // Reference portion size in grams (OR use baseOz)
    "defaultGrams": 170           // Pre-filled value in the input (OR use defaultOz)
  }
}
```

**Two unit systems exist:**
- `baseGrams` / `defaultGrams` — for grams-based ingredients (yogurt, hemp, honey, blueberries, kiwis)
- `baseOz` / `defaultOz` — for ounce-based ingredients (chicken)

The macro calculation formula is:
```
protein = (inputValue * data.protein) / base
calories = (inputValue * data.calories) / base
```
where `base = data.baseGrams || data.baseOz`.

---

## 5. UI Structure

### Header
- `<h1>MACROS</h1>` — always visible at top
- `.subtitle` — "LIVING FLEXIBLY AND AWARE" in small-caps muted text

### Tab Navigation (`#tab-container`)
- Sticky at top (`position: sticky; top: 0; z-index: 100`)
- Buttons generated dynamically from `program.json` days
- Active tab has a bottom border in the accent color (sage green `#8A9A5B`)

### Main Content Area (`#workout-content`)
- Default `max-width: 600px`
- Gets class `intro-wide` (max-width: 900px) for Breakfast, Meat, and Fruit tabs
- Gets class `snippets-wide` (max-width: 1280px) for a potential Snippets tab

#### Intro Tab Layout (Breakfast / Meat / Fruit)
Rendered by `renderIntro(day)`, which injects:
1. **Focus heading + description** — centered `h2` + italic `.section-description`
2. **Macro Calculator Table** (`.macro-calc-container`) — rendered by `renderMacroCalc(day)`
3. **Bento Grid** (`.layout-bento .grid-wrapper`) — 2-column grid of bento cards from `day.exercises`

#### Macro Calculator Table
- Header row: Ingredient | Grams (or Ounces for meat) | Protein | Calories
- One ingredient row per filtered ingredient (editable number input)
- Total row with summed protein + calories
- Ingredient filtering logic:
  - `breakfast` tab → shows `fage`, `hemp`, `honey`
  - `meat` tab → shows `chicken`
  - `fruit` tab → shows `blueberries`, `kiwis`

#### Bento Grid
- 2 columns on desktop, 1 column on mobile (≤430px)
- Cards 0–3 are `.clickable-card` and call `openDrawer(index)` on click
- Cards beyond index 3 render without click behavior

### Side Drawer (`#side-drawer`)
- Slides in from the right (transform: translateX)
- Dark background (`#1A1A1A`), white text
- Header with title (`#drawer-title`) and close button (`#close-drawer`)
- Content injected into `#drawer-dynamic-content`
- Closed by: close button, overlay click, or `Escape` key
- `drawerContent` object in `script.js` maps numeric indexes to `{ title, html }` — **currently empty `{}`**

---

## 6. Design System & CSS Conventions

### Color Tokens (`:root`)

| Token | Value | Usage |
|---|---|---|
| `--bg-color` | `#F5F5F3` | Page background (matte off-white) |
| `--card-bg` | `#FFFFFF` | Card and nav background |
| `--text-main` | `#2D2D2D` | Primary text (slate charcoal) |
| `--text-muted` | `#757575` | Secondary/caption text |
| `--accent` | `#8A9A5B` | Sage green — borders, highlights, active states |
| `--border` | `#E0E0DE` | Subtle dividers and card borders |

### Typography
- Font stack: `'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- Monospace (for macro numbers): `'JetBrains Mono', 'Courier New', monospace`
- Headings use `font-weight: 300` (light) by default

### Animation Conventions
- Page-level content: `fadeIn` (opacity + translateY, 0.5s ease)
- Drawer/modals: `slowFadeIn` (opacity + scale, 0.6s–1s ease-out)
- Shimmer effect: `shimmer` (for loading placeholders)
- Heartbeat: `heartbeat` (a glowing line pulse for placeholder state in the drawer)
- Hover: `transform: translateY(-3px)` on bento cards; scale on exercise cards

### CSS Organization (top-to-bottom in `style.css`)
1. `:root` tokens
2. Base elements (`body`, `h1`, `header`, `footer`)
3. Tab nav (`#tab-container`, `.tab-btn`)
4. Main content area (`#workout-content`, `.exercise-card`)
5. Intro/Bento layout (`.layout-bento`, `.bento-card`)
6. Side drawer (`#side-drawer`, `#drawer-overlay`, `.drawer-header`, `.drawer-content`)
7. Placeholder/empty states (`.implementation-placeholder`, `.shimmer-line`, `.heartbeat-pulse`)
8. Blueprint layout (`.blueprint-layout`) — used inside drawer
9. Snippets layout (`.snippets-container`, `.snippet-item`)
10. Macro calculator (`.macro-calc-container`, `.macro-table`, `.table-row`, `.col-*`)
11. `@media (max-width: 430px)` — iPhone overrides for all the above

---

## 7. JavaScript Conventions

- **Global state:** `appData`, `ingredientsData`, `currentTab` at top of file
- **Entry point:** `window.onload = init`
- **DOM manipulation:** All content injection uses `element.innerHTML = \`...\`` template literals. No virtual DOM.
- **Async:** `Promise.all([fetch(...), fetch(...)])` for parallel data loading
- **Tab routing:** `renderContent()` reads `appData.days[currentTab].title.toLowerCase()` to decide which render function to call
- **Ingredient filtering:** Done inside `renderMacroCalc()` by comparing keys against hardcoded arrays per tab
- **Input IDs:** Ingredient inputs are given `id="${key}-grams"` and display spans `id="${key}-p"` / `id="${key}-c"` — these must remain unique
- **Drawer content:** Injected HTML can contain `.copy-btn` elements; `bindCopyButtons()` must be called after injection

---

## 8. Current State

### What's Built ✅
- [x] Tab navigation (Breakfast, Meat, Fruit)
- [x] Macro calculator table with live calculation per tab
- [x] Ingredient data for all 6 ingredients (fage, hemp, honey, chicken, blueberries, kiwis)
- [x] Bento grid layout for intro-style tabs
- [x] Side drawer infrastructure (open/close, overlay, keyboard ESC)
- [x] Full mobile layout for ≤430px (iPhone)
- [x] Romantic lock screen (glassmorphism overlay — was added then removed in a prior session)

### What's Empty / In Progress ⚠️
- `day.exercises` for all three days is currently `[]` — the bento grid renders nothing
- `day.focus` and `day.description` are empty strings — the focus heading and sub-caption render blank
- `drawerContent` object is `{}` — clicking bento cards does nothing (drawer won't open)
- The drawer HTML templates (`.blueprint-layout`, `.prompt-box`, `.strategy-steps`) are fully styled but no content is wired up

### Known Patterns / Gotchas
- **Tab index cap:** `if (index > 2) return;` in `init()` — adding a 4th tab to `program.json` requires removing or updating this guard
- **Ingredient key matching:** The ingredient filter uses hardcoded key arrays (`['fage', 'hemp', 'honey']`, etc.). Adding a new ingredient requires updating **both** `ingredients.json` AND the filter array in `renderMacroCalc()`
- **Grams vs. Ounces:** The column header says "Grams" for all tabs except Meat, which shows "Ounces." This is hardcoded via `isMeatTab` check
- **No `implementation_plans/` directory exists at this time** — the folder referenced in conversation history was on a prior workspace; check before assuming it exists

---

## 9. How to Run

```bash
# From the project root:
npx serve .
```

Opens at `http://localhost:3000` (or the port `serve` chooses). No install step needed — `npx` handles it.

> The app **cannot** be opened as a plain `file://` URL because `fetch()` requires HTTP. Always use `npx serve .`.
