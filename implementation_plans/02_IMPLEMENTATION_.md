# Implementation Plan — Algorithm Module: Test Harness Data Pipeline

> **Scope:** Extend the algorithm development environment by introducing external data inputs. We will create a structured input file (JSON) and a test runner script in `algo_dev/` to simulate real-world usage and batch-process test cases against the `position_size.js` module.

---

## 1. Context

Currently, the position sizing algorithm is verified via hardcoded, inline tests within `algo_dev/position_size.js`. To make testing more robust and easier to manage—especially when tweaking edge cases or adding new calculation scenarios—we need an externalized approach. This plan introduces a JSON-based inputs file and a dedicated runner script to parse and calculate those inputs.

### Benefits
- Separates test data from business logic.
- Easier to maintain and share test cases.
- Validates the module's export behavior.

---

## 2. Deliverables

### A. Input Data File: `algo_dev/test_inputs.json`
A JSON array containing objects that represent different trade setups. Each object will define the scenario name and the required inputs (entry, sl, and risk).

**Schema structure:**
```json
[
  {
    "scenario": "Standard calculation",
    "inputs": {
      "entry": 100000,
      "sl": 99000,
      "risk": 100
    }
  },
  {
    "scenario": "Invalid: Entry <= 0",
    "inputs": {
      "entry": -1,
      "sl": 99000,
      "risk": 100
    }
  }
]
```

### B. Test Runner Script: `algo_dev/run_calculations.js`
A Node.js script that will:
1. Load `algo_dev/test_inputs.json`.
2. Import the `calculatePositionSize` function from `algo_dev/position_size.js`.
3. Loop through the test cases and execute the function for each.
4. Output the calculated results cleanly to the terminal (e.g., showing scenario, entry, SL, risk, computed position size, and unit size).

---

## 3. Implementation Checklist

### Phase 1: Setup Input File
- [x] Create `algo_dev/test_inputs.json`
- [x] Populate the JSON file with the 9 core test cases currently defined in `position_size.js`
- [x] Add at least 1-2 new, varied test cases to ensure flexibility

### Phase 2: Create Test Runner Script
- [x] Create `algo_dev/run_calculations.js`
- [x] Set up file reading to parse `test_inputs.json`
- [x] Import `calculatePositionSize` from `position_size.js`
- [x] Implement the execution loop to process each scenario and calculate results
- [x] Format the console output to be easily readable (e.g., using `console.table` or formatted strings)

### Phase 3: Validation and Cleanup
- [x] Run `node algo_dev/run_calculations.js` and verify it correctly processes all scenarios
- [x] Optional: Remove the inline `runTests()` from `position_size.js` to strictly separate logic from testing (or keep it if it serves as a simple standalone fallback)
