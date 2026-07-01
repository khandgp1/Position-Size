# Implementation Plan: Clear Prices Button

Add a clear button in the Position Size Calculator that clears only the Entry price and Stop loss fields, leaving the Risk field untouched, and recalculates the outputs.

## User Review Required

> [!NOTE]
> The clear button will be positioned at the bottom of the input container. Clicking it will set the Entry Price and Stop Loss inputs to empty and trigger a recalculation, which resets the outputs back to their default "—" placeholders. It will also shift focus back to the Entry Price field to make it easy for users to start entering new numbers.

## Open Questions

No open questions identified.

## Proposed Changes

### Frontend / UI Component

#### [MODIFY] [script.js](file:///Users/khandpv1/Desktop/.AntiGrav/Position-Size/script.js)
- Add a new `<button>` element with the ID `clear-prices-btn` inside the `.calc-inputs` container in `renderCalculator`.
- Bind a click handler to `#clear-prices-btn` that:
  1. Clears `#entry-price` value.
  2. Clears `#stop-loss` value.
  3. Calls `recalculate()` to clear the output values.
  4. Focuses the `#entry-price` input.

#### [MODIFY] [style.css](file:///Users/khandpv1/Desktop/.AntiGrav/Position-Size/style.css)
- Add styling for the clear button class `.calc-btn-secondary` using CSS variables to ensure consistency with the matte, sage-green, high-value styling.
- Ensure the button has transition effects, hover state, focus ring, and is fully responsive (fits nicely on mobile viewports).

---

## Progress Checklist

- [x] Add style rules for `.calc-btn-secondary` in [style.css](file:///Users/khandpv1/Desktop/.AntiGrav/Position-Size/style.css).
- [x] Add the "Clear Prices" button to the HTML markup in `renderCalculator` inside [script.js](file:///Users/khandpv1/Desktop/.AntiGrav/Position-Size/script.js).
- [x] Implement click event handler for `#clear-prices-btn` to clear the entry price and stop loss fields, call `recalculate()`, and focus the entry price field in [script.js](file:///Users/khandpv1/Desktop/.AntiGrav/Position-Size/script.js).

---

## Verification Plan

### Automated Tests
*No automated test suite currently exists in the project; visual validation and console inspection will be performed.*

### Manual Verification
- Open the application using a local server or browser tool.
- Populate Entry price, Stop loss, and Risk.
- Verify calculations occur dynamically.
- Click the "Clear Prices" button.
- Verify that Entry price and Stop loss fields are cleared, Risk remains untouched, the output values return to placeholders, and the Entry price field is focused.
