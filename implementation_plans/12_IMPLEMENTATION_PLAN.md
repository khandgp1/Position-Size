# Implementation Plan: Cap Maximum Leverage to 125x

## Objective
Update the position sizing algorithm to ensure that the calculated leverage never exceeds 125x, as this is the maximum allowable limit on the exchange.

## Overview
Currently, the algorithm allows leverage to increase unboundedly based on how tight the stop loss is. By capping the `leverage` variable at `125`, the downstream calculations for `liquidationPrice` and `initialMargin` will automatically adapt, safely displaying the exact exchange parameters rather than theoretical values.

## Progress Checklist

- [x] Open `/Users/khandpv1/Desktop/.AntiGrav/Position-Size/algo.js`.
- [x] Locate the leverage calculation logic (around line 54):
  ```javascript
  const leverage = Math.floor(rawMaxLeverage);
  ```
- [x] Update the calculation to cap the value using `Math.min`:
  ```javascript
  const leverage = Math.min(Math.floor(rawMaxLeverage), 125);
  ```
- [x] Ensure that `liquidationPrice` and `initialMargin` continue functioning correctly based on this capped leverage (no further code modifications required in `algo.js` for these values).
- [x] Test the calculator via the UI (`script.js`) to ensure that setting a very tight stop loss correctly maxes out the leverage at 125x and adjusts the initial margin and liquidation price accordingly.
