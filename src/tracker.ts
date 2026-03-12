import { getAllRecipes } from './status';
import { Recipe } from './types';

/**
 * Analyzes the recipe database to find missing combinations and ingredient usage stats.
 */
export const getTrackerData = () => {
  const recipes = getAllRecipes();
  const allElements = new Set<string>();
  const ingredientCount: Record<string, number> = {};
  const existingCombos = new Set<string>();

  // Collect all known elements and existing combinations
  recipes.forEach(r => {
    allElements.add(r.result.name);
    r.ingredients.forEach(ing => {
      allElements.add(ing);
      ingredientCount[ing] = (ingredientCount[ing] || 0) + 1;
    });
    
    // Store sorted ingredients to check for existence regardless of order
    const comboKey = [...r.ingredients].sort().join(' + ');
    existingCombos.add(comboKey);
  });

  const elementList = Array.from(allElements).sort();
  const missingCombos: string[] = [];

  // Check for missing combinations among all elements
  for (let i = 0; i < elementList.length; i++) {
    for (let j = i; j < elementList.length; j++) {
      const e1 = elementList[i];
      const e2 = elementList[j];
      const comboKey = [e1, e2].sort().join(' + ');
      
      if (!existingCombos.has(comboKey)) {
        missingCombos.push(`${e1} + ${e2}`);
      }
    }
  }

  return {
    ingredientCount: Object.entries(ingredientCount).sort((a, b) => b[1] - a[1]),
    missingCombos,
    totalElements: elementList.length
  };
};

/**
 * Opens the Recipe Tracker page in a new tab
 */
export const openRecipeTracker = () => {
  const { ingredientCount, missingCombos, totalElements } = getTrackerData();
  const win = window.open("", "_blank");
  
  if (win) {
    const ingredientHtml = ingredientCount.map(([name, count]) => `
      <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #222;">
        <span>${name}</span>
        <span style="color: #3b82f6; font-weight: bold;">${count} times</span>
      </div>
    `).join("");

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Alchemy Recipe Tracker</title>
          <style>
            body { 
              background: #050505; 
              color: #a1a1aa; 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              max-width: 1000px; 
              margin: 0 auto; 
            }
            h1 { color: #fff; letter-spacing: -0.02em; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
            .card { background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 24px; }
            .card-title { color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .scroll-area { max-height: 600px; overflow-y: auto; border: 1px solid #1a1a1a; padding: 10px; border-radius: 8px; }
            .copy-btn, .filter-input { 
              background: #3b82f6; 
              color: white; 
              border: none; 
              padding: 6px 12px; 
              border-radius: 6px; 
              cursor: pointer; 
              font-size: 12px;
            }
            .filter-input { background: #222; color: white; width: 60px; }
            .copy-btn:hover { opacity: 0.8; }
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: #050505; }
            ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>Recipe Tracker & Audit</h1>
          <p>Analyzing ${totalElements} elements. Total missing: <span id="total-missing">${missingCombos.length}</span></p>
          
          <div class="grid">
            <div class="card">
              <div class="card-title">Ingredient Usage</div>
              <div class="scroll-area">${ingredientHtml}</div>
            </div>
            
            <div class="card">
              <div class="card-title">
                Missing Combinations 
                <div>
                  <input type="number" id="limit-input" class="filter-input" value="20" min="1" />
                  <button class="copy-btn" onclick="copyMissing()">Copy Top</button>
                </div>
              </div>
              <div class="scroll-area" id="missing-list">
                ${missingCombos.slice(0, 20).map(combo => `<div style="padding: 6px; font-family: monospace; font-size: 13px; color: #fbbf24;">${combo}</div>`).join("")}
              </div>
            </div>
          </div>

          <script>
            const allMissing = ${JSON.stringify(missingCombos)};
            
            function updateList() {
              const limit = parseInt(document.getElementById('limit-input').value);
              const list = allMissing.slice(0, limit);
              document.getElementById('missing-list').innerHTML = list.map(combo => \`<div style="padding: 6px; font-family: monospace; font-size: 13px; color: #fbbf24;">\${combo}</div>\`).join("");
            }

            document.getElementById('limit-input').addEventListener('change', updateList);

            function copyMissing() {
              const limit = parseInt(document.getElementById('limit-input').value);
              const text = allMissing.slice(0, limit).join('\\n');
              navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.innerText = 'Copied!';
                setTimeout(() => btn.innerText = 'Copy Top', 2000);
              });
            }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  }
};
