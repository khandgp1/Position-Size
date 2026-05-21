# Implementation Plan: Add Initial Margin to Summary Line

## Objective
Calculate Initial Margin (Position Size divided by Leverage) and display it in the bottom summary line of the Position Size Calculator.

## Requirements
1. **Initial Margin Calculation**:
   - Calculate Initial Margin: `initialMargin = positionSize / leverage`.
   - If leverage is 0 (or undefined/null), initial margin should fallback to 0.
2. **Update Calculation Output**:
   - Expose `initialMargin` in the object returned by `calculatePositionSize` in `algo.js`.
3. **Display in UI**:
   - Format Initial Margin as a currency string (e.g. `$10.00`).
   - Append `Init. Margin: <value>` to the bottom summary line (`#calc-summary-line`) alongside `Actual Risk` and `Liq. Price`.
   - Display `—` if inputs are incomplete/invalid or if initial margin cannot be calculated.
4. **Update Documentation**:
   - Document `initialMargin` in `CONTEXT.md`.

## Implementation Steps

1. **Update `algo.js`**:
   - Inside `calculatePositionSize()`, compute `const initialMargin = leverage > 0 ? positionSize / leverage : 0;`.
   - Return `initialMargin` as part of the returned object.

2. **Update `script.js`**:
   - In `recalculate()`, extract `initialMargin` from the calculation result.
   - Format `initialMargin` to 2 decimal places or `—` if not available.
   - Update the text content of `#calc-summary-line` to:
     `Actual Risk: ${riskStr} | Liq. Price: ${liqStr} | Init. Margin: ${initMarginStr}`

3. **Update `CONTEXT.md`**:
   - Add `initialMargin` to the `calculatePositionSize()` return object documentation schema.

4. **Verification**:
   - Verify calculation correctness with different entry prices, stop losses, and risks.
   - Ensure mobile viewport still renders the summary line correctly without overlapping or breaking layout.

## Checklist
- [ ] Add Initial Margin calculation and return field in `algo.js`
- [ ] Update `recalculate()` in `script.js` to retrieve and format Initial Margin
- [ ] Append Init. Margin display to `#calc-summary-line` DOM text
- [ ] Document `initialMargin` in `CONTEXT.md`
- [ ] Verify functionality and responsiveness on web preview
