const fs = require('fs');
const path = require('path');
const { calculatePositionSize } = require('./position_size');

function run() {
    const inputFilePath = path.join(__dirname, 'test_inputs.json');
    
    if (!fs.existsSync(inputFilePath)) {
        console.error(`Error: Test input file not found at ${inputFilePath}`);
        process.exit(1);
    }

    let testCases;
    try {
        const rawData = fs.readFileSync(inputFilePath, 'utf8');
        testCases = JSON.parse(rawData);
    } catch (error) {
        console.error(`Error parsing test inputs JSON: ${error.message}`);
        process.exit(1);
    }

    console.log("==================================================================================");
    console.log("                  BTC Position Size Calculation Batch Results                     ");
    console.log("==================================================================================");

    const tableData = testCases.map(tc => {
        const { entry, sl, risk } = tc.inputs;
        const result = calculatePositionSize(entry, sl, risk);
        
        return {
            Scenario: tc.scenario,
            "Entry ($)": entry,
            "SL ($)": sl,
            "Intended Risk ($)": risk,
            "Actual Risk ($)": result ? `$${result.actualRisk.toFixed(4)}` : "INVALID INPUT",
            "Pos Unit Size (BTC)": result ? result.positionUnitSize.toFixed(4) : "INVALID INPUT",
            "Pos Size ($)": result ? `$${result.positionSize.toFixed(2)}` : "INVALID INPUT"
        };
    });

    console.table(tableData);
    console.log("==================================================================================================");
}

run();
