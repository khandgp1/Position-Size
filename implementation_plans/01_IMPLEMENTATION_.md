# Implementation Plan — Algorithm Module: Position Sizing

> **Scope:** Design and build a standalone position sizing algorithm module in `algo_dev/`. This is a **design-only** phase — no integration into the main calculator UI (`script.js`) yet.

---

## 1. Context

The main Position Calc app (Phases 1–6 complete) has a working UI with a placeholder `recalculate()` function that outputs `—` for all computed values. This plan creates the algorithm logic as an isolated, testable module before wiring it into the app.

### Source Formulas

```
Position Unit Size = Risk / (Entry - SL)
Position Size      = Position Unit Size × Entry
```

### Variable Definitions

| Variable | Unit | Description |
|---|---|---|
| **Risk** | $ | User-defined dollar amount willing to lose |
| **Entry** | $ | BTC entry price in dollars |
| **SL** | $ | BTC stop-loss price in dollars |
| **Position Unit Size** | BTC | Intermediate — how many BTC to buy (not surfaced in UI) |
| **Position Size** | $ | Final output — total dollar value of the position |

### Constraints

- **Long only** — `Entry > SL` is always assumed
- **Leverage** — skipped for now, not part of this module
- **Position Unit Size** — intermediate calculation, not a visible output

---

## 2. Deliverable

A single file: **`algo_dev/position_size.js`**

This file will contain:
1. A pure function `calculatePositionSize(entry, sl, risk)` that returns the computed position size in dollars (or `null` on invalid input)
2. Input validation with clear guard clauses
3. An inline test suite that runs when the file is executed directly (`node algo_dev/position_size.js`)

### Function Signature

```js
/**
 * Calculates position size for a BTC long trade.
 *
 * @param {number} entry - BTC entry price ($)
 * @param {number} sl    - BTC stop-loss price ($)
 * @param {number} risk  - Dollar amount willing to lose ($)
 * @returns {{ positionSize: number, positionUnitSize: number } | null}
 *          Returns null if inputs are invalid.
 */
function calculatePositionSize(entry, sl, risk)
```

### Return Shape

```js
{
  positionSize: 10000.00,     // $ value of the position
  positionUnitSize: 0.1       // BTC units (intermediate, for internal use)
}
```

Returning the intermediate `positionUnitSize` in the result object (even though it's not surfaced in the UI) keeps the module transparent and debuggable.

---

## 3. Input Validation Rules

All guards must pass before calculation proceeds. If any fail, return `null`.

| # | Rule | Rationale |
|---|---|---|
| 1 | `entry` must be a finite number > 0 | Price can't be zero or negative |
| 2 | `sl` must be a finite number > 0 | Stop-loss can't be zero or negative |
| 3 | `risk` must be a finite number > 0 | Must risk something |
| 4 | `entry > sl` | Long-only — SL must be below entry |

---

## 4. Inline Test Suite

The file will include a `runTests()` function that validates:

| # | Test Case | Entry | SL | Risk | Expected Position Size | Expected Unit Size |
|---|---|---|---|---|---|---|
| 1 | Standard calculation | 100,000 | 99,000 | 100 | $10,000.00 | 0.1 BTC |
| 2 | Tight stop (small distance) | 100,000 | 99,900 | 50 | $500,000.00 | 5.0 BTC |
| 3 | Wide stop (large distance) | 100,000 | 90,000 | 500 | $5,000.00 | 0.05 BTC |
| 4 | Small risk | 100,000 | 99,000 | 10 | $1,000.00 | 0.01 BTC |
| 5 | Entry ≤ 0 → null | -1 | 99,000 | 100 | null | — |
| 6 | SL ≤ 0 → null | 100,000 | -500 | 100 | null | — |
| 7 | Risk ≤ 0 → null | 100,000 | 99,000 | 0 | null | — |
| 8 | SL ≥ Entry → null | 100,000 | 100,000 | 100 | null | — |
| 9 | SL > Entry → null | 100,000 | 101,000 | 100 | null | — |

### Running Tests

```bash
node algo_dev/position_size.js
```

Expected output: each test case with PASS/FAIL and a summary line.

---

## 5. File Structure After Completion

```
Position-Size/
├── algo_dev/
│   └── position_size.js    ← NEW: standalone algorithm module + tests
├── index.html
├── style.css
├── script.js                ← UNCHANGED (placeholder stays)
├── config.json
└── ...
```

---

## 6. Future Integration (Out of Scope)

Once the algorithm module is validated, a **separate** plan will cover:
- Importing/inlining the function into `script.js` → `recalculate()`
- Wiring the output to the UI (Position Size display)
- Deciding on Leverage calculation (requires account balance input)
- Updating `KICKSTART_IMPLEMENTATION_PLAN.md` Phase 7 checklist

---

## 7. Implementation Checklist

### Phase A — Algorithm Module (`algo_dev/position_size.js`)
- [x] Create `algo_dev/position_size.js` with `calculatePositionSize(entry, sl, risk)` function
- [x] Implement input validation (4 guard clauses)
- [x] Implement core math: `positionUnitSize = risk / (entry - sl)`, `positionSize = positionUnitSize * entry`
- [x] Return result object `{ positionSize, positionUnitSize }` or `null`

### Phase B — Test Suite
- [x] Add `runTests()` function with all 9 test cases
- [x] Add auto-run detection (execute tests when run via `node`)
- [x] Run `node algo_dev/position_size.js` — all 9 tests pass
- [x] Verify edge case outputs match expected values in the table above
