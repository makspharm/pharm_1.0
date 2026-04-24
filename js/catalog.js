// ══════════════════════════════════════════════
//  DRUG GROUPS — defined in HTML via data attributes
//  To add a new group, add a <div> to #drug-groups-definition in index.html:
//  <div data-group-id="qt" data-group-label="Препараты удлиняющие QT" data-group-color="red"></div>
// ══════════════════════════════════════════════

function getDrugGroups() {
  const defs = document.querySelectorAll('#drug-groups-definition [data-group-id]');
  const groups = [];
  defs.forEach(el => {
    groups.push({
      id:    el.dataset.groupId,
      label: el.dataset.groupLabel,
      color: el.dataset.groupColor || 'violet',
    });
  });
  return groups;
}

// ══════════════════════════════════════════════
//  CATALOG STATE
// ══════════════════════════════════════════════

let catalogActiveFilters = new Set(); // set of filter keys like 'jnvlp', 'group:qt'

// ══════════════════════════════════════════════
//  CATALOG MODAL
// ══════════════════════════════════════════════

function toggleCatalog() {
  document.getElementById('calc-overlay').classList.remove('open');
  document.getElementById('topics-overlay').classList.remove('open');
  const overlay = document.getElementById('catalog-overlay');
  const isOpen  = overlay.classList.toggle('open');
  if (isOpen) {
    renderCatalogFilters();
    renderCatalogList(getFilteredDrugs());
  }
}

function getFilteredDrugs() {
  if (catalogActiveFilters.size === 0) return drugs;

  return drugs.filter(d => {
    for (const f of catalogActiveFilters) {
      if (f === 'jnvlp') {
        const yellow = (d.tags && d.tags.yellow) ? d.tags.yellow.toLowerCase() : '';
        if (!yellow.includes('есть')) return false;
      } else if (f.startsWith('group:')) {
        const gid = f.slice(6);
        const groups = d.groups || [];
        if (!groups.includes(gid)) return false;
      }
    }
    return true;
  });
}

function renderCatalogFilters() {
  const container = document.getElementById('catalog-filters');
  if (!container) return;

  const drugGroups = getDrugGroups();

  // Count for ЖНВЛП
  const jnvlpCount = drugs.filter(d => {
    const yellow = (d.tags && d.tags.yellow) ? d.tags.yellow.toLowerCase() : '';
    return yellow.includes('есть');
  }).length;

  // Counts for groups
  const groupCounts = {};
  drugGroups.forEach(g => {
    groupCounts[g.id] = drugs.filter(d => (d.groups || []).includes(g.id)).length;
  });

  let html = '';

  if (jnvlpCount > 0) {
    const active = catalogActiveFilters.has('jnvlp');
    html += `<button class="catalog-filter-chip${active ? ' active' : ''}" onclick="toggleCatalogFilter('jnvlp')" title="Только препараты из перечня ЖНВЛП">
      ЖНВЛП
      <span class="cf-count">${jnvlpCount}</span>
    </button>`;
  }

  drugGroups.forEach(g => {
    const cnt = groupCounts[g.id] || 0;
    if (cnt === 0) return;
    const active = catalogActiveFilters.has('group:' + g.id);
    html += `<button class="catalog-filter-chip${active ? ' active' : ''}" onclick="toggleCatalogFilter('group:${g.id}')" title="${g.label}">
      ${g.label}
      <span class="cf-count">${cnt}</span>
    </button>`;
  });

  container.innerHTML = html || '';
  container.style.display = html ? 'flex' : 'none';
}

function toggleCatalogFilter(key) {
  if (catalogActiveFilters.has(key)) {
    catalogActiveFilters.delete(key);
  } else {
    catalogActiveFilters.add(key);
  }
  renderCatalogFilters();
  renderCatalogList(getFilteredDrugs());
}

function renderCatalogList(items) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  const countEl = document.getElementById('catalog-count');
  if (countEl) {
    countEl.textContent = drugs.length;
    countEl.title = '';
  }

  if (!sorted.length) {
    document.getElementById('catalog-list').innerHTML = '<div class="catalog-empty">Препараты не найдены</div>';
    return;
  }

  const drugGroups = getDrugGroups();
  const groupMap = {};
  drugGroups.forEach(g => { groupMap[g.id] = g; });

  let html = '';
  let lastLetter = '';
  sorted.forEach(d => {
    const letter = d.name.charAt(0).toUpperCase();
    if (letter !== lastLetter) {
      lastLetter = letter;
      html += `<div class="catalog-letter">${letter}</div>`;
    }

    // Group badges for this drug
    const drugGroupIds = d.groups || [];
    const groupBadges = drugGroupIds
      .map(gid => groupMap[gid])
      .filter(Boolean)
      .map(g => `<span class="catalog-group-badge">${g.label}</span>`)
      .join('');

    html += `<div class="catalog-item" onclick="openDrugFromCatalog('${d.id}')">
      <div style="flex:1;min-width:0">
        <div class="catalog-item-name">${d.name}</div>
        ${d.subtitle ? `<div class="catalog-item-sub">${d.subtitle}</div>` : ''}
        ${groupBadges ? `<div class="catalog-item-groups">${groupBadges}</div>` : ''}
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
