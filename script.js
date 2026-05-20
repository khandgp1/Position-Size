let appConfig = null;
let currentTab = 0;

async function init() {
    try {
        const response = await fetch('config.json');
        appConfig = await response.json();
        
        const container = document.getElementById('tab-container');
        container.innerHTML = ''; // Clear fallback contents
        
        appConfig.tabs.forEach((tab, index) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${index === currentTab ? 'active' : ''}`;
            btn.innerText = tab.label.toUpperCase();
            btn.onclick = () => switchTab(index);
            container.appendChild(btn);
        });
        
        renderContent();
    } catch (error) {
        console.error("Error initializing application:", error);
        const content = document.getElementById('main-content');
        if (content) {
            content.innerHTML = `
                <div class="loader" style="color: red;">
                    Failed to load configuration. Please ensure you run this app via a local HTTP server.
                </div>
            `;
        }
    }
}

function switchTab(index) {
    currentTab = index;
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    renderContent();
}

function renderContent() {
    if (!appConfig || !appConfig.tabs[currentTab]) return;
    
    const activeTab = appConfig.tabs[currentTab];
    const content = document.getElementById('main-content');
    if (!content) return;
    
    // Clear and set animation classes if needed
    content.innerHTML = '';
    
    if (activeTab.id === 'btc-1h-long') {
        renderCalculator(content);
    } else if (activeTab.id === 'info') {
        renderPlaceholder(content);
    }
}

function renderCalculator(container) {
    const card = document.createElement('div');
    card.className = 'calc-card slowFadeIn';
    card.innerHTML = `
        <div class="calc-card-header">
            <h3>Position Size Calculator</h3>
        </div>
        <div class="calc-inputs">
            <div class="calc-field">
                <label class="calc-label" for="entry-price">Entry Price</label>
                <input type="number" inputmode="decimal" id="entry-price" class="calc-input" placeholder="0.00" step="any">
            </div>
            <div class="calc-field">
                <label class="calc-label" for="stop-loss">Stop Loss</label>
                <input type="number" inputmode="decimal" id="stop-loss" class="calc-input" placeholder="0.00" step="any">
            </div>
            <div class="calc-field">
                <label class="calc-label" for="risk-amount">Risk ($)</label>
                <input type="number" inputmode="decimal" id="risk-amount" class="calc-input" placeholder="0.00" step="any" value="10">
            </div>
        </div>
        <hr class="calc-divider">
        <div class="calc-outputs">
            <div class="calc-output-row">
                <span class="output-label">Leverage</span>
                <span class="output-value" id="leverage-output">—</span>
            </div>
            <div class="calc-output-row">
                <span class="output-label">Position Size</span>
                <span class="output-value" id="position-output">—</span>
            </div>
        </div>
        <div class="calc-summary" id="calc-summary-line">
            Actual Risk: — | Liq. Price: —
        </div>
    `;
    
    container.appendChild(card);
    
    // Setup real-time calculations
    const inputs = ['entry-price', 'stop-loss', 'risk-amount'];
    inputs.forEach(id => {
        const inputEl = document.getElementById(id);
        if (inputEl) {
            inputEl.oninput = recalculate;
        }
    });
    
    // Perform initial run
    recalculate();
}

function renderPlaceholder(container) {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-state slowFadeIn';
    placeholder.innerHTML = `
        <h3>Info</h3>
        <p>Content coming soon.</p>
    `;
    container.appendChild(placeholder);
}

function recalculate() {
    const entryEl = document.getElementById('entry-price');
    const slEl = document.getElementById('stop-loss');
    const riskEl = document.getElementById('risk-amount');
    
    if (!entryEl || !slEl || !riskEl) return;
    
    const entry = parseFloat(entryEl.value) || 0;
    const sl = parseFloat(slEl.value) || 0;
    const risk = parseFloat(riskEl.value) || 0;
    
    // ─── ALGORITHM INTEGRATION ───
    let leverage = 0; 
    let liquidationPrice = 0;
    let positionSize = 0;
    let actualRisk = 0;
    let distancePct = 0;
    
    if (entry > 0 && sl > 0 && risk > 0) {
        if (entry !== sl) {
            distancePct = Math.abs((entry - sl) / entry) * 100;
        }

        // Use global calculatePositionSize function from algo.js
        if (typeof calculatePositionSize === 'function') {
            const result = calculatePositionSize(entry, sl, risk);
            if (result) {
                positionSize = result.positionSize;
                actualRisk = result.actualRisk;
                leverage = result.leverage;
                liquidationPrice = result.liquidationPrice;
            }
        }
    }
    // ─── END ALGORITHM INTEGRATION ───
    
    const levOut = document.getElementById('leverage-output');
    const posOut = document.getElementById('position-output');
    const summaryOut = document.getElementById('calc-summary-line');
    
    if (levOut) {
        if (leverage === "∞") levOut.textContent = "∞";
        else levOut.textContent = leverage > 0 ? `${leverage}x` : '—';
    }
    if (posOut) posOut.textContent = positionSize > 0 ? `$${positionSize.toFixed(2)}` : '—';
    
    if (summaryOut) {
        const riskStr = actualRisk > 0 ? `$${actualRisk.toFixed(2)}` : '—';
        const liqStr = liquidationPrice > 0 ? `$${liquidationPrice.toFixed(2)}` : '—';
        summaryOut.textContent = `Actual Risk: ${riskStr} | Liq. Price: ${liqStr}`;
    }
}

window.onload = init;
