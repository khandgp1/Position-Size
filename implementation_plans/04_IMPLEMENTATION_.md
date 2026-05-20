# Implementation Plan — Integrate Position Size Algorithm

> **Scope:** Integrate the `calculatePositionSize` logic developed in `algo_dev` into the main calculator interface (`script.js` and `index.html`). The algorithm will remain as a standalone, separate file to ensure clean architecture. 

---

## 1. Context

The math logic for the Position Size Calculator has been successfully verified in `algo_dev/position_size.js`. The goal now is to wire this logic up to the frontend UI without mixing business logic with UI rendering code.

As discussed:
- Leverage will remain in the UI as a placeholder (displaying `—`).
- Unit Size (BTC) will **not** be displayed.
- Actual Risk will **not** be displayed.
- The summary line (showing Entry → SL distance) will remain unchanged.

---

## 2. Technical Approach

1. **Extract Algorithm:** Create a new `algo.js` file at the root of the project.
2. **Populate Algorithm:** Move the `calculatePositionSize` function from `algo_dev/position_size.js` into the new `algo.js` file. We will ensure the file is browser-compatible (e.g., removing or conditionally bypassing `module.exports`).
3. **HTML Import:** Add `<script src="algo.js"></script>` to `index.html` right before `script.js`.
4. **App Logic Update:** Update the `recalculate()` function inside `script.js` to utilize the new `calculatePositionSize()` global function and correctly format the `positionSize` output. 

---

## 3. Implementation Checklist

### Phase 1: Algorithm Separation
- [x] Create a new file `algo.js` in the project root directory.
- [x] Copy the `calculatePositionSize` logic from `algo_dev/position_size.js` to `algo.js`.
- [x] Ensure `algo.js` is fully browser-compatible (e.g., no Node.js specific module exports crashing the browser).

### Phase 2: UI Wiring
- [x] Update `index.html` to include `<script src="algo.js"></script>` before `script.js`.
- [x] Update `script.js` inside the `recalculate()` function:
  - Extract user inputs (`entry`, `sl`, `risk`).
  - Call `calculatePositionSize(entry, sl, risk)`.
  - Update the `positionSize` output variable based on the calculation result.
  - Add logic to gracefully handle invalid/`null` returns (showing `—`).
- [x] Confirm that Leverage output still functions as an empty placeholder.
- [x] Confirm that the Entry → SL summary line remains untouched.

### Phase 3: QA & Verification
- [x] Verify the application functions properly in the browser at `http://localhost:3000`.
- [x] Confirm UI matches the specification (no actual risk, no unit size).
- [x] Test with valid inputs and confirm position size computes correctly based on 4-decimal precision flooring.
