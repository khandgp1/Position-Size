# Implementation Plan: Taker Fee Sizing Adjustment

## Objective
Update the position sizing algorithm in `algo.js` to mathematically account for the 0.01% taker fee incurred when the Stop Loss (SL) is hit. The calculated unit size must be automatically adjusted so that the total realized risk (loss from price difference + taker fee at SL exit) precisely equals the user's target dollar risk.

## Math/Logic Explanation
Instead of sequentially calculating order size based strictly on the entry/exit price difference and calculating fees later, we will factor the exit fee directly into the initial sizing equation:

```text
Total Risk = (Loss from price drop) + (Exit Fee)
Total Risk = (Quantity * |Entry Price - SL Price|) + (Quantity * SL Price * Taker Fee Rate)
Total Risk = Quantity * ( |Entry Price - SL Price| + (SL Price * Taker Fee Rate) )
```

Solving for Quantity:
```text
Quantity = Target Risk / ( |Entry Price - SL Price| + (SL Price * Taker Fee Rate) )
```

## Proposed Changes to `algo.js`

1.  **Define Fee Rates:** Introduce `const takerFeeRate = 0.0001;` locally within `calculatePositionSize`.
2.  **Define Price Components:**
    *   `const priceDifference = entry - sl;`
    *   `const exitFeePerUnit = sl * takerFeeRate;`
3.  **Update `rawUnitSize`:**
    *   Modify from `risk / (entry - sl)` to `risk / (priceDifference + exitFeePerUnit)`.
4.  **Update `actualRisk`:**
    *   Modify from `positionUnitSize * (entry - sl)` to compute the total realized risk utilizing the floored unit size: `(positionUnitSize * priceDifference) + (positionUnitSize * exitFeePerUnit)`.

## Progress Checklist
- [x] Edit `algo.js` to insert `const takerFeeRate = 0.0001;`.
- [x] Update `rawUnitSize` assignment to incorporate `exitFeePerUnit`.
- [x] Update `actualRisk` variable to sum the price difference risk and fee risk.
