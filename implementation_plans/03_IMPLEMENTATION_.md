# Implementation Plan — 4-Decimal Position Unit Precision & Risk Adjustment

> **Scope:** Implement 4-decimal precision flooring logic for `Position Unit Size` calculation, allowing for a parameterized precision. The stop loss and entry remain static, and the actual risk is adjusted incrementally downwards towards the input risk without exceeding it. Update return objects to include `actualRisk`, handle zero-floor cases, and expand test configurations.

---

## 1. Context

Currently, the position size calculator calculates exact values for unit sizes using `risk / (entry - sl)`. Since the trade unit size is bounded by decimal precision (typically `4` decimal places on the trade execution platform), simply rounding the size could result in an actual risk that exceeds the user's defined risk limit. 

To resolve this, we will truncate (floor) the unit size to the configured precision (defaulting to 4 decimal places) and recalculate the downstream position size and the actual risk.

---

## 2. Math & Logic Specification

Given:
- `entry`: Entry Price
- `sl`: Stop Loss Price
- `risk`: Intended Risk Limit
- `precision`: Number of decimal places to floor the unit size to (default `4`)

1. **Calculate Raw Unit Size:**
   $$\text{rawUnitSize} = \frac{\text{risk}}{\text{entry} - \text{sl}}$$

2. **Truncate (Floor) Unit Size:**
   $$\text{positionUnitSize} = \frac{\lfloor \text{rawUnitSize} \times 10^{\text{precision}} \rfloor}{10^{\text{precision}}}$$

3. **Check for Zero-Floor:**
   If $\text{positionUnitSize} == 0$, return `null`. This prevents placing a zero-size order.

4. **Calculate Recalculated (Actual) Position Size and Risk:**
   $$\text{positionSize} = \text{positionUnitSize} \times \text{entry}$$
   $$\text{actualRisk} = \text{positionUnitSize} \times (\text{entry} - \text{sl})$$

Since the unit size is floored:
$$\text{actualRisk} \le \text{risk}$$

---

## 3. Deliverables

### A. Core Module: `algo_dev/position_size.js`
- Update `calculatePositionSize(entry, sl, risk, precision = 4)`.
- Implement decimal flooring logic.
- Add `actualRisk` to the returned object.
- Update internal `runTests()` with floored expectations, custom precision checks, and zero-floor checks.

### B. Test Runner: `algo_dev/run_calculations.js`
- Update console table logging to display `Actual Risk ($)`.

---

## 4. Implementation Checklist

### Phase 1: Core Algorithm Update
- [x] Add `precision = 4` parameter to `calculatePositionSize` function signature.
- [x] Implement unit size flooring logic.
- [x] Recalculate and include `actualRisk` in the return object.
- [x] Return `null` when `positionUnitSize === 0`.

### Phase 2: Test Updates
- [x] Update inline test suite in `algo_dev/position_size.js`:
  - Update expected unit sizes to be floored to 4 decimal places.
  - Verify `actualRisk` values in tests.
  - Add test case with high precision parameter (e.g., `precision = 6`).
  - Add test case where the risk is too small for the stop distance, leading to a floor of 0 (expects `null`).
- [x] Update `algo_dev/run_calculations.js` to log `Actual Risk ($)` and `Actual vs Intended Risk` ratio or comparison.

### Phase 3: Verification & Execution
- [ ] Run inline tests using `node algo_dev/position_size.js` and verify passing.
- [ ] Run batch calculations runner `node algo_dev/run_calculations.js` and review visual tabular output.
