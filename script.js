let appData = null;
let ingredientsData = null;
let currentTab = 0;


async function init() {
    try {
        const [progRes, ingRes] = await Promise.all([
            fetch('program.json'),
            fetch('ingredients.json')
        ]);

        appData = await progRes.json().catch(err => {
            console.error("Error parsing program.json:", err);
            return { days: [] };
        });
        ingredientsData = await ingRes.json().catch(err => {
            console.error("Error parsing ingredients.json:", err);
            return {};
        });

        const container = document.getElementById('tab-container');

        // Create Tabs (Showing 'Breakfast' and 'Meat')
        appData.days.forEach((day, index) => {
            if (index > 2) return; // Hide Day 4, etc.

            const btn = document.createElement('button');
            btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
            btn.innerText = day.title.toUpperCase();
            btn.onclick = () => switchTab(index);
            container.appendChild(btn);
        });

        // Initial Load
        renderContent();
    } catch (error) {
        console.error("Error loading program or ingredients:", error);
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
    const content = document.getElementById('workout-content');
    const day = appData.days[currentTab];

    // Scope the wider max-width to specific tabs
    content.classList.remove('snippets-wide', 'intro-wide');

    if (day.title.toLowerCase() === 'breakfast') {
        content.classList.add('intro-wide');
        renderIntro(day);
    } else if (day.title.toLowerCase() === 'meat') {
        content.classList.add('intro-wide');
        renderIntro(day);
    } else if (day.title.toLowerCase() === 'fruit') {
        content.classList.add('intro-wide');
        renderIntro(day);
    } else {
        renderWorkout(day);
    }
}



function renderWorkout(day) {
    const content = document.getElementById('workout-content');
    content.innerHTML = `
        <div style="text-align:center; margin-bottom: 30px;">
            <h2 style="font-weight:300;">${day.focus}</h2>
            ${day.description ? `<p class="section-description">${day.description}</p>` : ''}
        </div>
    `;

    day.exercises.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.innerHTML = `
            <div class="meta">${ex.sets} × ${ex.reps}</div>
            <h3>${ex.name}</h3>
            <p class="tips">${ex.note}</p>
        `;
        content.appendChild(card);
    });
}

const drawerContent = {
};

function renderMacroCalc(day) {
    if (!ingredientsData) return '<div class="macro-calc-container">Loading calculator data...</div>';

    const tabTitle = day.title.toLowerCase();
    const isMeatTab = tabTitle === 'meat';
    const isFruitTab = tabTitle === 'fruit';

    let title = 'Breakfast Macro Table';
    if (isMeatTab) title = 'Meats Macro Table';
    if (isFruitTab) title = 'Fruit Macro Table';
    
    // Filter ingredients based on tab
    const filteredKeys = Object.keys(ingredientsData).filter(key => {
        if (isMeatTab) {
            return key === 'chicken';
        } else if (isFruitTab) {
            return ['blueberries', 'kiwis'].includes(key);
        } else {
            return ['fage', 'hemp', 'honey'].includes(key);
        }
    });

    const container = document.createElement('div');
    container.className = 'macro-calc-container';
    container.innerHTML = `
        <div class="calc-header">
            <h3>${title}</h3>
        </div>
        <div class="macro-table">
            <div class="table-row header">
                <div class="col-name">Ingredient</div>
                <div class="col-grams">${isMeatTab ? 'Ounces' : 'Grams'}</div>
                <div class="col-p">Protein</div>
                <div class="col-c">Calories</div>
            </div>
            ${filteredKeys.map(key => `
                <div class="table-row ingredient-row" data-key="${key}">
                    <div class="col-name">${ingredientsData[key].name}</div>
                    <div class="col-grams">
                        <input type="number" inputmode="decimal" id="${key}-grams" placeholder="0" min="0" value="${ingredientsData[key].defaultGrams || ingredientsData[key].defaultOz || 0}">
                    </div>
                    <div class="col-p"><span id="${key}-p">0</span>g</div>
                    <div class="col-c"><span id="${key}-c">0</span></div>
                </div>
            `).join('')}
            <div class="table-row total-row">
                <div class="col-name">TOTAL</div>
                <div class="col-grams"></div>
                <div class="col-p"><span id="total-protein">0</span>g</div>
                <div class="col-c"><span id="total-calories">0</span> Cal</div>
            </div>
        </div>
    `;

    const updateTotals = () => {
        let totalP = 0;
        let totalC = 0;

        filteredKeys.forEach(key => {
            const el = document.getElementById(`${key}-grams`);
            if (!el) return;
            const inputValue = parseFloat(el.value) || 0;
            const data = ingredientsData[key];
            const base = data.baseGrams || data.baseOz || 1;

            // Calculate macros based on input value relative to base unit
            const p = (inputValue * data.protein) / base;
            const c = (inputValue * data.calories) / base;

            document.getElementById(`${key}-p`).innerText = Math.round(p);
            document.getElementById(`${key}-c`).innerText = Math.round(c);

            totalP += p;
            totalC += c;
        });

        document.getElementById('total-protein').innerText = Math.round(totalP);
        document.getElementById('total-calories').innerText = Math.round(totalC);
    };

    setTimeout(() => {
        filteredKeys.forEach(key => {
            const input = document.getElementById(`${key}-grams`);
            if (input) input.oninput = updateTotals;
        });
        updateTotals();
    }, 0);

    return container.outerHTML;
}

function renderIntro(day) {
    const content = document.getElementById('workout-content');

    const innerContent = `
        <div class="intro-container layout-bento">
            <div class="grid-wrapper">
                ${day.exercises.map((ex, idx) => `
                    <div class="bento-card ${[0, 1, 2, 3].includes(idx) ? 'clickable-card' : ''}" 
                         ${[0, 1, 2, 3].includes(idx) ? `onclick="openDrawer(${idx})"` : ''}>
                        <h3>${ex.name.split(':')[0]}</h3>
                        <p class="step-note">${ex.note}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;



    content.innerHTML = `
        <div style="text-align:center; margin-bottom: 30px;">
            <h2 style="font-weight:300;">${day.focus}</h2>
            <p class="section-description">${day.description}</p>
        </div>
        ${renderMacroCalc(day)}
        ${innerContent}
    `;
}


function openDrawer(index) {
    const content = drawerContent[index];
    if (!content) return;

    document.getElementById('drawer-title').innerText = content.title;
    document.getElementById('drawer-dynamic-content').innerHTML = content.html;

    document.getElementById('side-drawer').classList.add('active');
    document.getElementById('drawer-overlay').classList.add('active');
    document.body.classList.add('drawer-open');

    // Re-bind copy buttons for the new content
    bindCopyButtons();
}

function closeDrawer() {
    document.getElementById('side-drawer').classList.remove('active');
    document.getElementById('drawer-overlay').classList.remove('active');
    document.body.classList.remove('drawer-open');
}

// Global Event Listeners for Closing
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-drawer');
    const overlay = document.getElementById('drawer-overlay');

    if (closeBtn) closeBtn.onclick = closeDrawer;
    if (overlay) overlay.onclick = closeDrawer;

    // Setup Copy Buttons
    bindCopyButtons();

    window.onkeydown = (e) => {
        if (e.key === 'Escape') closeDrawer();
    };

});

function bindCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(copyBtn => {
        copyBtn.onclick = async () => {
            const codeElement = copyBtn.closest('.prompt-box').querySelector('code');
            if (!codeElement) return;

            const text = codeElement.innerText;

            // 1. Try Modern Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(text);
                    handleCopySuccess(copyBtn);
                    return;
                } catch (err) {
                    console.warn('Modern clipboard failed, trying fallback...', err);
                }
            }

            // 2. Legacy Fallback (execCommand)
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    handleCopySuccess(copyBtn);
                }
            } catch (err) {
                console.error('Fallback copy failed: ', err);
            }
        };
    });
}

function handleCopySuccess(btn) {
    const originalText = btn.innerText;
    btn.innerText = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.remove('copied');
    }, 2000);
}

window.onload = init;
