/**
 * Calculates position size for a BTC long trade.
 *
 * @param {number} entry - BTC entry price ($)
 * @param {number} sl    - BTC stop-loss price ($)
 * @param {number} risk  - Dollar amount willing to lose ($)
 * @param {number} [precision=4] - Decimal precision to floor position unit size to
 * @returns {{ positionSize: number, positionUnitSize: number, actualRisk: number, leverage: number | string, liquidationPrice: number } | null}
 *          Returns null if inputs are invalid or unit size floors to zero.
 */
function calculatePositionSize(entry, sl, risk, precision = 4) {
    // 1. entry must be a finite number > 0
    if (typeof entry !== 'number' || !Number.isFinite(entry) || entry <= 0) {
        return null;
    }

    // 2. sl must be a finite number > 0
    if (typeof sl !== 'number' || !Number.isFinite(sl) || sl <= 0) {
        return null;
    }

    // 3. risk must be a finite number > 0
    if (typeof risk !== 'number' || !Number.isFinite(risk) || risk <= 0) {
        return null;
    }

    // 4. entry > sl (Long-only)
    if (entry <= sl) {
        return null;
    }

    // 5. precision must be a finite integer >= 0
    if (typeof precision !== 'number' || !Number.isInteger(precision) || precision < 0) {
        return null;
    }

    // Core math
    const rawUnitSize = risk / (entry - sl);
    const multiplier = Math.pow(10, precision);
    const positionUnitSize = Math.floor(rawUnitSize * multiplier) / multiplier;

    // Check for zero-floor
    if (positionUnitSize === 0) {
        return null;
    }

    const positionSize = positionUnitSize * entry;
    const actualRisk = positionUnitSize * (entry - sl);

    // Leverage & Liquidation Price Calculation
    const MMR = 0.0005; // 0.05% Maintenance Margin
    const rawMaxLeverage = 1 / (1 + MMR - (sl / entry));
    
    const leverage = rawMaxLeverage > 125 ? "∞" : Math.floor(rawMaxLeverage);
    
    let liquidationPrice;
    if (leverage === "∞") {
        liquidationPrice = sl; // At maximum theoretical leverage, Liq Price equals Stop Loss
    } else if (leverage === 0) {
        liquidationPrice = 0; // Edge case: leverage rounds to 0 for extremely wide stops
    } else {
        liquidationPrice = entry * (1 - (1 / leverage) + MMR);
    }

    return {
        positionSize: positionSize,
        positionUnitSize: positionUnitSize,
        actualRisk: actualRisk,
        leverage: leverage,
        liquidationPrice: liquidationPrice
    };
}
