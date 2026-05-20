# Implementation Plan — Add Actual Risk to UI

> **Scope:** Add the calculated "Actual Risk" to the Position Size Calculator UI, displaying it with 2-decimal precision above the Leverage and Position Size outputs, while keeping the Position Unit Size (BTC) hidden.

---

## 1. Requirements & Design Decisions

1. **Formatting**:
   * **Actual Risk** will be displayed in standard currency format with exactly 2 decimal places (e.g., `$9.99`).
2. **Layout Order**:
   * To ensure Leverage and Position Size remain at the bottom/last:
     * **Actual Risk** (Top)
     * **Leverage** (Middle)
     * **Position Size** (Bottom)
3. **Unit Size**:
   * Position Unit Size (BTC) will continue to be completely hidden from the UI.
4. **Error Handling**:
   * When inputs are invalid or no calculation can be performed, Actual Risk will display as `—` (em-dash), consistent with the other fields.

---

## 2. Proposed Changes

### `script.js`

1. **Modify `renderCalculator(container)`**:
   * Update the HTML string for `calc-outputs` to insert a new row for **Actual Risk** before Leverage:
     ```html
     <div class="calc-outputs">
         <div class="calc-output-row">
             <span class="output-label">Actual Risk</span>
             <span class="output-value" id="actual-risk-output">—</span>
         </div>
         <div class="calc-output-row">
             <span class="output-label">Leverage</span>
             <span class="output-value" id="leverage-output">—</span>
         </div>
         <div class="calc-output-row">
             <span class="output-label">Position Size</span>
             <span class="output-value" id="position-output">—</span>
         </div>
     </div>
     ```

2. **Modify `recalculate()`**:
   * Extract `actualRisk` from the return object of `calculatePositionSize(entry, sl, risk)`.
   * Reference the new DOM element `actual-risk-output`.
   * If valid results are returned:
     * Format and display `actualRisk`: `$${actualRisk.toFixed(2)}`.
   * If invalid:
     * Reset the field to `—`.

---

## 3. Implementation Checklist

- [x] **UI Update**: Modify `renderCalculator` inside `script.js` to include the **Actual Risk** output row.
- [x] **Calculation Logic**: Update `recalculate` inside `script.js` to parse `actualRisk` from `calculatePositionSize` and render it to 2 decimal places.
- [x] **Verification**:
  - Verify the calculator works at `http://localhost:3000` (or the local web server port).
  - Test valid calculations to check that Actual Risk is formatted correctly (e.g. entry=76858.1, sl=76723.4, risk=10 -> Actual Risk should show `$9.99`, matching the floored unit size).
  - Test invalid inputs (e.g., negative values, SL >= Entry) and verify all outputs reset to `—`.
