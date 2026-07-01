# 15 — Short Trade Support (Auto-Detect Direction)

## Overview

Extend the position-size calculator to support **both long and short BTC trades**.  
Trade direction is **auto-detected** by comparing the entry price to the stop-loss price:

- `entry > sl` → **LONG** (existing behaviour, unchanged)
- `entry < sl` → **SHORT** (new)
- `entry == sl` → invalid → show em-dashes (same as any other invalid input)

A small direction badge (`LONG ▲` / `SHORT ▼`) will appear in the calculator card header to confirm the detected direction. The badge uses the existing sage-green accent colour (`--accent`).

---

## Design Decisions (confirmed)

| Decision | Choice |
|---|---|
| Direction indicator | Yes — badge in card header |
| Badge colour | Sage green (`--accent`) |
| Entry == SL edge case | Show em-dashes (treat as invalid) |
| Liquidation price for shorts | Above entry (price rises against you) |
| MMR for shorts | Same 0.5% as longs |
| Exit fee for shorts | Same 0.01% taker fee, applied on SL price |
| CONTEXT.md update | No |

---

## Math Changes

### Long (existing — no change)
```
priceDifference  = entry - sl
exitFeePerUnit   = sl * 0.0001
rawUnitSize      = risk / (priceDifference + exitFeePerUnit)
actualRisk       = unitSize * (priceDifference + exitFeePerUnit)
rawMaxLeverage   = 1 / (1 + MMR - (sl / entry))
leverage         = floor(rawMaxLeverage), capped at 125
liquidationPrice = entry * (1 - 1/leverage + MMR)   <- below entry
```

### Short (new)
```
priceDifference  = sl - entry                        <- inverted
exitFeePerUnit   = sl * 0.0001                       <- same fee, same SL price
rawUnitSize      = risk / (priceDifference + exitFeePerUnit)   <- same formula
actualRisk       = unitSize * (priceDifference + exitFeePerUnit)
rawMaxLeverage   = 1 / (1 + MMR - (entry / sl))     <- ratio inverted
leverage         = floor(rawMaxLeverage), capped at 125
liquidationPrice = entry * (1 + 1/leverage - MMR)   <- above entry
```

---

## Proposed Changes

### `algo.js`

#### Remove the long-only guard (currently lines 27-30)
Replace `entry <= sl` guard with `entry === sl` (exact equality only).

#### Add direction detection
```js
const isShort = sl > entry;
```

#### Update priceDifference to be direction-aware
```js
const priceDifference = isShort ? (sl - entry) : (entry - sl);
```

#### Update leverage formula to be direction-aware
```js
const rawMaxLeverage = isShort
    ? 1 / (1 + MMR - (entry / sl))   // short
    : 1 / (1 + MMR - (sl / entry));  // long (unchanged)
```

#### Update liquidation price formula to be direction-aware
```js
liquidationPrice = isShort
    ? entry * (1 + (1 / leverage) - MMR)   // short: above entry
    : entry * (1 - (1 / leverage) + MMR);  // long: below entry (unchanged)
```

#### Add direction field to return object; update JSDoc
```js
return {
    ...
    direction: isShort ? 'short' : 'long',   // NEW field
};
```

---

### `script.js`

#### Read direction from the result object in recalculate()
```js
let direction = null;
// ...
if (result) {
    direction = result.direction;   // 'long' | 'short'
    // ...rest of existing reads
}
```

#### Add direction-badge span to card header HTML in renderCalculator()
```html
<div class="calc-card-header">
    <h3>Position Size Calculator</h3>
    <span id="direction-badge" class="direction-badge hidden"></span>
</div>
```

#### Update badge text/visibility in recalculate()
```js
const badge = document.getElementById('direction-badge');
if (badge) {
    if (direction === 'long') {
        badge.textContent = 'LONG ▲';
        badge.className = 'direction-badge visible';
    } else if (direction === 'short') {
        badge.textContent = 'SHORT ▼';
        badge.className = 'direction-badge visible';
    } else {
        badge.className = 'direction-badge hidden';
    }
}
```

---

### `style.css`

Add styles for `.direction-badge`:
```css
.direction-badge {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 4px;
    padding: 2px 8px;
    text-transform: uppercase;
    transition: opacity 0.3s ease;
}
.direction-badge.hidden { opacity: 0; pointer-events: none; }
.direction-badge.visible { opacity: 1; }
```

Update `.calc-card-header` to flex for badge alignment:
```css
.calc-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
```

---

## Checklist

- [x] **algo.js** — Remove long-only guard; add `entry === sl` check
- [x] **algo.js** — Add `isShort` direction detection
- [x] **algo.js** — Make `priceDifference` direction-aware
- [x] **algo.js** — Make leverage formula direction-aware
- [x] **algo.js** — Make liquidation price formula direction-aware
- [x] **algo.js** — Add `direction` field to return object; update JSDoc
- [x] **script.js** — Read `direction` from result in `recalculate()`
- [x] **script.js** — Add `#direction-badge` span to card header HTML in `renderCalculator()`
- [x] **script.js** — Update badge text/visibility in `recalculate()`
- [x] **style.css** — Add `.direction-badge` styles
- [x] **style.css** — Update `.calc-card-header` to flex layout for badge alignment
- [x] **Manual test** — Long trade: SL below entry → badge shows LONG ▲, liq price below entry
- [x] **Manual test** — Short trade: SL above entry → badge shows SHORT ▼, liq price above entry
- [x] **Manual test** — Entry == SL → all outputs show em-dash, badge hidden
