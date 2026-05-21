# Implementation Plan: Remove Max Leverage Limit and Infinity Symbol

## Objective
Remove the `125x` leverage cap and stop displaying or processing the infinity symbol (`∞`) in the Position Size Calculator, letting calculations directly show the raw calculated leverage and utilizing standard math for the liquidation price.

## Requirements
1. **Uncapped Leverage Calculation**: Calculate and return the raw floored leverage without enforcing a maximum limit of 125x.
2. **Remove Infinity Representation**: Do not return or display `"∞"` for leverage.
3. **Standard Liquidation Price Logic**: Remove the special case where Liquidation Price equals Stop Loss under maximum leverage, letting the standard formula calculate liquidation price for all positive leverage values.
4. **Clean UI Rendering**: Simplify UI logic in `script.js` to display calculated leverage values directly.
5. **Update Reference Documentation**: Reflect the changes in `CONTEXT.md`.

## Implementation Steps

1. **Update `algo.js`**:
   - Change `leverage` calculation to simply use `Math.floor(rawMaxLeverage)`.
   - Remove the `leverage === "∞"` condition in the liquidation price logic.
2. **Update `script.js`**:
   - Simplify the `levOut` UI text content assignment to output the numerical leverage without checking for `"∞"`.
3. **Update `CONTEXT.md`**:
   - Update descriptions of leverage and liquidation price calculations to reflect that leverage is uncapped and the infinity symbol is no longer used.
4. **Verification**:
   - Run calculations on the local web server to verify that leverage values exceeding 125x are displayed as integers and liquidation price behaves correctly.

## Checklist
- [x] Modify leverage assignment in `algo.js` to remove the `125` cap and `"∞"` mapping
- [x] Remove `leverage === "∞"` condition for liquidation price calculation in `algo.js`
- [x] Remove `leverage === "∞"` check from `script.js` UI logic
- [x] Update leverage and liquidation price documentation in `CONTEXT.md`
- [ ] Verify functionality with high leverage configurations (e.g. stop loss very close to entry)
