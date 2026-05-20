# Implementation Plan: Leverage and Liquidation Price Calculation

## Objective
Update the position sizing algorithm in `algo.js` to calculate the appropriate leverage and liquidation price based on the user's Entry and Stop Loss, ensuring the position is not liquidated before hitting the Stop Loss. 

## Requirements
1. **Maintenance Margin**: Fixed at `0.05%` (or `0.0005`).
2. **Maximum Leverage Formula**: Calculate the maximum allowable leverage where the Liquidation Price equals the Stop Loss.
   - `Max Leverage = 1 / (1 + MMR - (Stop Loss / Entry))`
3. **Leverage Constraints**:
   - The exchange supports `0-125x` leverage.
   - If the calculated `Max Leverage` is greater than `125`, the returned leverage value should trigger an infinite symbol (`"∞"`) for the UI.
   - Otherwise, it should return the rounded down integer of the calculated `Max Leverage`.
4. **Liquidation Price Calculation**: 
   - Based on the determined leverage, calculate the exact Liquidation Price: 
     `Liquidation Price = Entry * (1 - (1 / Leverage) + MMR)`
   - If leverage is `"∞"`, we assume the theoretical maximum, making Liquidation Price equal to the Stop Loss.
5. **Output**: Include `leverage` and `liquidationPrice` in the returned object.

## Implementation Steps
1. **Update `algo.js`**: 
   - Modify the `calculatePositionSize` function.
   - Add a constant for `MMR = 0.0005`.
   - Compute `rawMaxLeverage`.
   - Determine `finalLeverage` (either the floored integer or `"∞"`).
   - Calculate `liquidationPrice` based on the `finalLeverage` (if `"∞"`, `liquidationPrice = sl`).
   - Append `leverage` and `liquidationPrice` to the returned object.
2. **Review Tests/Scenarios**: 
   - Run the updated logic against the existing scenarios in `algo_dev/test_inputs.json` to ensure no errors are thrown and values correctly populate.

## Checklist
- [x] Define `MMR = 0.0005` inside `algo.js`.
- [x] Implement `rawMaxLeverage = 1 / (1 + MMR - (sl / entry))`.
- [x] Add logic to floor the leverage or return `"∞"` if it exceeds `125`.
- [x] Implement `liquidationPrice` calculation using the determined leverage.
- [x] Update the return object in `calculatePositionSize` to include the new fields.
- [x] Verify the calculations locally to ensure accuracy.
