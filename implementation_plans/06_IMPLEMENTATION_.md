# Implementation Plan - Relocate Actual Risk to Bottom Summary

The goal of this update is to simplify the output section of the calculator and improve visual focus by moving the **Actual Risk** display to the bottom summary container (replacing the current `Entry → SL Distance: X.XX%` summary line).

---

## 📋 Proposed Changes

### 1. Update UI Template in `script.js`
* **File**: `script.js`
* **Target Area**: `renderCalculator(container)` function (lines 59–113)
* **Changes**:
  * Remove the "Actual Risk" row from the `.calc-outputs` container.
  * Keep the "Leverage" and "Position Size" rows inside `.calc-outputs`.
  * Update the default text of `#calc-summary-line` from `"Enter values to calculate position metrics."` to `"Actual Risk: —"`.

### 2. Update Calculation Logic in `script.js`
* **File**: `script.js`
* **Target Area**: `recalculate()` function (lines 125–174)
* **Changes**:
  * Remove the reference and update logic for the old `#actual-risk-output` element.
  * Update the `#calc-summary-line` (`summaryOut`) logic:
    * If a calculation is successfully performed (`entry > 0 && sl > 0 && risk > 0`):
      * Update its text content to: `Actual Risk: $${actualRisk.toFixed(2)}`
    * If inputs are missing/incomplete:
      * Update its text content to: `Actual Risk: —`

---

## 🧪 Verification Plan

### Manual Verification
1. **Initial State Verification**:
   * Open the calculator UI in the browser.
   * Ensure that the bottom summary line reads: `Actual Risk: —`.
   * Ensure that only **Leverage** and **Position Size** are visible in the main outputs container (and read `—`).
2. **Dynamic Update Verification**:
   * Input valid values for Entry Price, Stop Loss, and Risk (e.g., Entry: `100.00`, SL: `95.00`, Risk: `10.00`).
   * Verify that:
     * Leverage and Position Size update correctly in the outputs area.
     * The bottom summary updates to show the calculated actual risk, formatted as: `Actual Risk: $X.XX` (approaching but not exceeding the inputted risk).
3. **Reset Verification**:
   * Clear any of the inputs.
   * Verify that the bottom summary line resets to `Actual Risk: —` and other outputs reset to `—`.

---

## 📌 Checklist

- [x] Modify `script.js` to remove "Actual Risk" from `.calc-outputs` template.
- [x] Modify `script.js` to set the default text of `#calc-summary-line` to `Actual Risk: —`.
- [x] Update `recalculate()` function in `script.js` to dynamically set `#calc-summary-line` to `Actual Risk: $X.XX` on calculation, and `Actual Risk: —` otherwise.
- [x] Verify UI layout, initial states, and dynamic updating behavior in browser.
