# Implementation Plan: Move Liquidation Price to Summary Line

## Objective
Relocate the `Liquidation Price` output from its standalone row within the calculator's output block down to the bottom summary line, displaying it alongside `Actual Risk`.

## Requirements
1. **Remove Old UI**: The current "Liquidation Price" row in the `.calc-outputs` section must be deleted.
2. **Format Summary**: Update the summary line to display both values side-by-side. 
   - Example format: `Actual Risk: $10.00 | Liq. Price: $76,723.40`
3. **Empty State**: When inputs are cleared or invalid, the summary should cleanly default to placeholders (e.g., `Actual Risk: — | Liq. Price: —`).

## Implementation Steps
1. **Update `renderCalculator` in `script.js`**: 
   - Remove the HTML block containing `<span id="liq-price-output">...</span>`.
   - Update the initial text of `calc-summary-line` to `Actual Risk: — | Liq. Price: —`.
2. **Update `recalculate` in `script.js`**: 
   - Remove the `liqOut` DOM query and its corresponding text assignment.
   - Modify the `summaryOut` block to conditionally build the string containing both `actualRisk` and `liquidationPrice` (formatting to 2 decimal places with a `$` prefix).

## Checklist
- [x] Remove Liquidation Price output row from the HTML template in `script.js`.
- [x] Update default placeholder text for the summary line.
- [x] Remove obsolete DOM references for the old `liq-price-output`.
- [x] Update `summaryOut` logic to concatenate `Actual Risk` and `Liq. Price` properly.
