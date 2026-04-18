// ══════════════════════════════════════════════
//  CATALOG MODAL
// ══════════════════════════════════════════════

function toggleCatalog() {
  document.getElementById('calc-overlay').classList.remove('open');
  document.getElementById('topics-overlay').classList.remove('open');
  const overlay = document.getElementById('catalog-overlay');
  const isOpen  = overlay.classList.toggle('open');
  if (isOpen) renderCatalogList(drugs);
}

function renderCatalogList(items) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  document.getElementById('catalog-count').textContent = drugs.length;

  if (!sorted.length) {
    document.getElementById('catalog-list').innerHTML = '<div class="catalog-empty">Препараты не найдены</div>';
    return;
  }

  let html = '';
  let lastLetter = '';
  sorted.forEach(d => {
    const letter = d.name.charAt(0).toUpperCase();
    if (letter !== lastLetter) {
      lastLetter = letter;
      html += `<div class="catalog-letter">${letter}</div>`;
    }
    html += `<div class="catalog-item" onclick="openDrugFromCatalog('${d.id}')">
      <div>
        <div class="catalog-item-name">${d.name}</div>
        ${d.subtitle ? `<div class="catalog-item-sub">${d.subtitle}</div>` : ''}
      </div>
      <span class="catalog-arrow">›</span>
    </div>`;
  });
  document.getElementById('catalog-list').innerHTML = html;
}

function openDrugFromCatalog(id) {
  document.getElementById('catalog-overlay').classList.remove('open');
  openDrug(id);
}
