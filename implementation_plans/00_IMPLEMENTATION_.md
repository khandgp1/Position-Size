# Implementation Plan — Phase 1: Foundation (Files + Shell)

This plan details the foundation steps to transition from the MACROS application to the new **Position Calc** application. It implements the fresh start structure using vanilla HTML/CSS/JS and removes unnecessary files.

---

## Proposed Changes

### 1. Tab Configuration (`config.json`)
We will create `config.json` defining the two tabs:
- **BTC 1H Long** (`btc-1h-long`)
- **Info** (`info`)

### 2. Main HTML Shell (`index.html`)
We will replace `index.html` with a clean, semantic shell:
- Header containing the title `Position Calc` and subtitle `CALCULATING ORDER SIZE AND REQUIRED LEVERAGE BASED ON RISK`
- Navigation container `#tab-container`
- Main content area `#main-content` (renamed from `#workout-content`)
- Footer
- All side drawer elements (`#side-drawer`, `#drawer-overlay`) are removed

### 3. Stylesheet (`style.css`)
We will replace `style.css` with a fresh stylesheet:
- CSS custom properties (`:root` tokens) for colors, including sage green accents and off-white backgrounds
- Clean layouts for header, navigation, main content, and footer
- Tab buttons and active states
- Layout skeleton for the calculator card and the placeholder state
- Responsive styles inside a media query for mobile screens (≤430px)

### 4. Application Logic Skeleton (`script.js`)
We will replace `script.js` with a basic setup:
- Loading configuration from `config.json`
- Tab switching logic (rendering different views depending on the active tab)
- Stub functions for `renderCalculator()`, `renderPlaceholder()`, and `recalculate()`

### 5. File Deletions
We will clean up the workspace by removing:
- `ingredients.json`
- `program.json`

---

## Implementation Checklist

### Phase 1 — Foundation (Files + Shell)
- [x] Create `config.json` with the new tab definitions
- [x] Replace `index.html` with the new minimalist shell (removing side drawer, renaming main area to `#main-content`)
- [x] Replace `style.css` with clean layout styles, colors, and responsive foundation
- [x] Replace `script.js` with the tab routing and page lifecycle skeleton
- [ ] Delete `ingredients.json` (Pending command resolution)
- [ ] Delete `program.json` (Pending command resolution)
