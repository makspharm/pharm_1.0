// ══════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════

const searchInput = document.getElementById('search-input');
const dropdown    = document.getElementById('dropdown');

function matchesDrug(d, q) {
  return d.name.toLowerCase().includes(q) ||
    (d.subtitle || '').toLowerCase().includes(q) ||
    (d.trade    || '').toLowerCase().includes(q);
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { dropdown.classList.remove('open'); return; }
  renderDropdown(drugs.filter(d => matchesDrug(d, q)), q);
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') dropdown.classList.remove('open');
  if (e.key === 'Enter')  doSearch();
});

document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) dropdown.classList.remove('open');
});

function renderDropdown(items, q) {
  if (!items.length) {
    dropdown.innerHTML = '<div class="dropdown-item"><span class="di-sub">Ничего не найдено</span></div>';
    dropdown.classList.add('open');
    return;
  }
  dropdown.innerHTML = items.map(d => {
    const tradeMatch = q && d.trade && d.trade.toLowerCase().includes(q) && !d.name.toLowerCase().includes(q);
    const subHtml = tradeMatch
      ? `<div class="di-sub"><span style="font-size:.66rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;opacity:.6">торговое</span> ${esc(d.trade)}</div>`
      : (d.subtitle ? `<div class="di-sub">${esc(d.subtitle)}</div>` : '');
    return `
    <div class="dropdown-item" onclick="openDrug('${d.id}')">
      <div style="min-width:0"><div class="di-name">${esc(d.name)}</div>${subHtml}</div>
      <button class="di-del" onclick="event.stopPropagation();deleteDrug('${d.id}')" title="Удалить" style="display:${isAdmin ? '' : 'none'}">✕</button>
    </div>`;
  }).join('');
  dropdown.classList.add('open');
}

function doSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return;
  const match = drugs.find(d => matchesDrug(d, q));
  if (match) openDrug(match.id);
}

// ══════════════════════════════════════════════
//  ADD / DELETE DRUG
// ══════════════════════════════════════════════

async function addDrug() {
  // Поддержка двух полей — на главной и в редакторе
  const inp      = document.getElementById('add-drug-input') || document.getElementById('ep-add-drug-input');
  const epInp    = document.getElementById('ep-add-drug-input');
  const activeInp = (epInp && epInp.value.trim()) ? epInp : inp;
  const name = activeInp ? activeInp.value.trim() : '';
  if (!name) return;

  const btn = document.getElementById('add-btn') || document.getElementById('ep-add-btn');
  btn.disabled = true;

  const drug = {
    id: 'drug_' + Date.now(),
    name,
    subtitle: '',
    instrLinks: [{ name: 'Реестр ОХЛП и ЛВ ЕАЭС', url: 'https://lk.regmed.ru/Register/EAEU_SmPC' }],
    tags: { green: '', yellow: '', red: '', violet: '' },
    facts: [],
    dosages: [],
    links: []
  };

  try {
    await dbInsert(drug);
    drugs.push(drug);
    activeInp.value = '';
    showToast('ЛС добавлено');
    updateCatalogCount();
    openDrug(drug.id);
    // Автооткрытие редактора для нового препарата
    if (!editorOpen) toggleEditor();
  } catch (e) {
    showToast('Ошибка при добавлении');
  }
  btn.disabled = false;
}

async function deleteDrug(id) {
  if (!confirm('Удалить этот препарат?')) return;
  try {
    await dbDelete(id);
    drugs = drugs.filter(d => d.id !== id);
    showToast('Удалено');
    updateCatalogCount();
    const q = searchInput.value.trim().toLowerCase();
    if (q) renderDropdown(drugs.filter(d => matchesDrug(d, q)), q);
    else   dropdown.classList.remove('open');
  } catch (e) {
    showToast('Ошибка при удалении');
  }
}
