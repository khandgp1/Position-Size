/**
 * Calculates position size for a BTC long trade.
 *
 * @param {number} entry - BTC entry price ($)
 * @param {number} sl    - BTC stop-loss price ($)
 * @param {number} risk  - Dollar amount willing to lose ($)
 * @param {number} [precision=4] - Decimal precision to floor position unit size to
 * @returns {{ positionSize: number, positionUnitSize: number, actualRisk: number } | null}
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

    return {
        positionSize: positionSize,
        positionUnitSize: positionUnitSize,
        actualRisk: actualRisk
    };
}

function runTests() {
    const tests = [
        { name: "1. Standard calculation", entry: 100000, sl: 99000, risk: 100, precision: 4, expSize: 10000, expUnit: 0.1, expActualRisk: 100 },
        { name: "2. Tight stop (small distance)", entry: 100000, sl: 99900, risk: 50, precision: 4, expSize: 500000, expUnit: 5.0, expActualRisk: 50 },
        { name: "3. Wide stop (large distance)", entry: 100000, sl: 90000, risk: 500, precision: 4, expSize: 5000, expUnit: 0.05, expActualRisk: 500 },
        { name: "4. Small risk", entry: 100000, sl: 99000, risk: 10, precision: 4, expSize: 1000, expUnit: 0.01, expActualRisk: 10 },
        { name: "5. Entry <= 0 -> null", entry: -1, sl: 99000, risk: 100, precision: 4, expSize: null, expUnit: null, expActualRisk: null },
        { name: "6. SL <= 0 -> null", entry: 100000, sl: -500, risk: 100, precision: 4, expSize: null, expUnit: null, expActualRisk: null },
        { name: "7. Risk <= 0 -> null", entry: 100000, sl: 99000, risk: 0, precision: 4, expSize: null, expUnit: null, expActualRisk: null },
        { name: "8. SL >= Entry (equal) -> null", entry: 100000, sl: 100000, risk: 100, precision: 4, expSize: null, expUnit: null, expActualRisk: null },
        { name: "9. SL > Entry -> null", entry: 100000, sl: 101000, risk: 100, precision: 4, expSize: null, expUnit: null, expActualRisk: null },
        { name: "10. Truncation flooring verification (raw unit 0.074239)", entry: 76858.10, sl: 76723.40, risk: 10, precision: 4, expUnit: 0.0742, expSize: 0.0742 * 76858.10, expActualRisk: 0.0742 * (76858.10 - 76723.40) },
        { name: "11. Custom lower precision (2 decimals)", entry: 76858.10, sl: 76723.40, risk: 10, precision: 2, expUnit: 0.07, expSize: 0.07 * 76858.10, expActualRisk: 0.07 * (76858.10 - 76723.40) },
        { name: "12. Zero-floor risk too small", entry: 100000, sl: 90000, risk: 0.5, precision: 4, expSize: null, expUnit: null, expActualRisk: null }
    ];

    let passed = 0;

    console.log("Running Position Size Calculation Tests...\n");

    tests.forEach((t, i) => {
        const result = calculatePositionSize(t.entry, t.sl, t.risk, t.precision);
        let isPass = false;

        if (t.expSize === null) {
            isPass = (result === null);
        } else {
            if (result !== null) {
                // Check floating point equality
                const sizeMatch = Math.abs(result.positionSize - t.expSize) < 0.0001;
                const unitMatch = Math.abs(result.positionUnitSize - t.expUnit) < 0.0001;
                const riskMatch = Math.abs(result.actualRisk - t.expActualRisk) < 0.0001;
                isPass = sizeMatch && unitMatch && riskMatch;
            }
        }

        if (isPass) {
            console.log(`✅ PASS: ${t.name}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${t.name}`);
            console.error(`   Expected: Size=${t.expSize}, Unit=${t.expUnit}, ActualRisk=${t.expActualRisk}`);
            console.error(`   Got:      ${JSON.stringify(result)}`);
        }
    });

    console.log(`\nResults: ${passed}/${tests.length} tests passed.`);
}

// Auto-run if executed directly via node
if (typeof require !== 'undefined' && require.main === module) {
    runTests();
}

module.exports = {
    calculatePositionSize
};
