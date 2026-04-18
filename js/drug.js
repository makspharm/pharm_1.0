// ══════════════════════════════════════════════
//  NAVIGATION — DRUG PAGE
// ══════════════════════════════════════════════

function openDrug(id) {
  const drug = drugs.find(d => d.id === id);
  if (!drug) return;
  currentDrug = JSON.parse(JSON.stringify(drug));
  editorOpen  = false;
  renderDrugPage(currentDrug);
  document.getElementById('search-page').style.display  = 'none';
  document.getElementById('drug-page').style.display    = 'block';
  document.getElementById('editor-panel').classList.remove('open');
  document.getElementById('drug-left-nav').classList.remove('editor-open');
  document.getElementById('edit-toggle-btn').classList.remove('active');
  document.getElementById('edit-toggle-btn').innerHTML  = svgEdit() + ' Редактировать';
  document.getElementById('dropdown').classList.remove('open');
  document.getElementById('header-btns-fixed').style.display = 'none';
  window.scrollTo(0, 0);
  updateLockState();
}

function goBack() {
  document.getElementById('drug-page').style.display    = 'none';
  document.getElementById('search-page').style.display  = 'flex';
  document.getElementById('header-btns-fixed').style.display = 'flex';
  updateLockState();
}

// ══════════════════════════════════════════════
//  EDITOR TOGGLE
// ══════════════════════════════════════════════

function toggleEditor() {
  editorOpen = !editorOpen;
  document.getElementById('editor-panel').classList.toggle('open', editorOpen);
  document.getElementById('drug-left-nav').classList.toggle('editor-open', editorOpen);
  const btn = document.getElementById('edit-toggle-btn');
  btn.classList.toggle('active', editorOpen);
  btn.innerHTML = svgEdit() + (editorOpen ? ' Закрыть' : ' Редактировать');
  if (editorOpen) { fillEditorFromDrug(currentDrug); updateLockState(); }
}

function svgEdit() {
  return `<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
}

// ══════════════════════════════════════════════
//  RENDER DRUG PAGE (view mode)
// ══════════════════════════════════════════════

function renderDrugPage(drug) {
  document.getElementById('header-title').textContent = drug.name;
  document.getElementById('drug-title').textContent   = drug.name;

  const mnnWrap = document.getElementById('mnn-wrap');
  if (drug.subtitle && drug.subtitle.trim()) {
    document.getElementById('drug-subtitle').textContent = drug.subtitle;
    mnnWrap.style.display = '';
  } else { mnnWrap.style.display = 'none'; }

  const tradeWrap = document.getElementById('trade-wrap');
  if (drug.trade && drug.trade.trim()) {
    document.getElementById('drug-trade').textContent = drug.trade;
    tradeWrap.style.display = '';
  } else { tradeWrap.style.display = 'none'; }

  const tagOrder = [{ key: 'green', cls: 'green' }, { key: 'yellow', cls: 'yellow' }, { key: 'red', cls: 'red' }, { key: 'violet', cls: 'violet' }];
  const tags = drug.tags || {};
  document.getElementById('drug-tags').innerHTML = tagOrder
    .filter(t => tags[t.key] && tags[t.key].trim())
    .map(t => `<span class="tag ${t.cls}">${tags[t.key]}</span>`).join('');

  // Instructions
  const instrSection = document.getElementById('instr-section');
  const REGISTRY_LINK = { name: 'Реестр ОХЛП и ЛВ ЕАЭС', url: 'https://lk.regmed.ru/Register/EAEU_SmPC' };
  const instrLinks = (drug.instrLinks || []).filter(l => l.url && l.url.trim());
  if (!instrLinks.length && drug.instrUrl && drug.instrUrl.trim())
    instrLinks.push({ name: 'Инструкция / ОХЛП', url: drug.instrUrl });
  if (!instrLinks.some(l => l.url === REGISTRY_LINK.url)) instrLinks.unshift(REGISTRY_LINK);
  if (instrLinks.length) {
    document.getElementById('instr-links-list').innerHTML = instrLinks.map((l, i) => `
      ${i > 0 ? `<div id="nav-anchor-instr-${i}" style="position:relative;top:-100px;visibility:hidden;pointer-events:none"></div>` : ''}
      <div class="instr-link-item">
        <span class="instr-link-name">${esc(l.name || 'Инструкция / ОХЛП')}</span>
        <a class="instr-link-btn" href="${esc(l.url)}" target="_blank">
          Открыть
          <svg viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </a>
      </div>`).join('');
    instrSection.style.display = '';
  } else { instrSection.style.display = 'none'; }

  // Notes / facts
  const factsBlock = document.getElementById('facts-block');
  const rawFacts   = (drug.facts || []);
  const facts      = rawFacts.filter(f => (typeof f === 'string' ? f : f.text || f.title || '').trim());
  if (facts.length) {
    document.getElementById('facts-list').innerHTML = facts.map((f, fi) => {
      const title = typeof f === 'string' ? '' : (f.title || '');
      const text  = typeof f === 'string' ? f   : (f.text  || '');
      return `<div class="facts-card" id="nav-anchor-note-${fi}">
        ${title.trim() ? `<div class="facts-card-title">${esc(title)}</div>` : ''}
        <div class="facts-card-body">${nl2br(text)}</div>
      </div>`;
    }).join('');
    factsBlock.style.display = '';
  } else { factsBlock.style.display = 'none'; }

  // Dosages
  const dosageSection = document.getElementById('dosage-section');
  if ((drug.dosages || []).length) {
    document.getElementById('dosage-cards-view').innerHTML = drug.dosages.map((d, di) => {
      const chips    = [d.tag1, d.tag2, d.tag3].filter(t => t && t.trim()).map(t => `<span class="dosage-chip">${t}</span>`).join('');
      const chipR    = d.tagr && d.tagr.trim() ? `<span class="dosage-chip red">${d.tagr}</span>`   : '';
      const chipV    = d.tagv && d.tagv.trim() ? `<span class="dosage-chip violet">${d.tagv}</span>` : '';
      const chipsInner = chips + chipR + chipV;
      const infoBubble = d.info && d.info.trim()
        ? `<span class="info-bubble" title="Пояснительная бригада" onclick="openInfoModal(${di},'dosage')" tabindex="0">i</span>`
        : '';
      return `<div class="dosage-card">
        <div class="dosage-card-head">
          <span>${esc(d.title)}</span>${infoBubble}
        </div>
        ${chipsInner ? `<div class="dosage-card-chips-row">${chipsInner}</div>` : ''}
        <div class="dosage-card-body">${nl2br(d.body)}</div>
      </div>`;
    }).join('');
    dosageSection.style.display = '';
  } else { dosageSection.style.display = 'none'; }

  // Links
  const linksSection = document.getElementById('links-section');
  if ((drug.links || []).length) {
    let linksHtml = '';
    let num = 1;
    drug.links.forEach((l, li) => {
      if (l.heading && l.heading.trim()) {
        linksHtml += `<li style="list-style:none"><div id="nav-anchor-link-group-${li}" style="position:relative;top:-100px;visibility:hidden;pointer-events:none"></div><div class="link-group-heading">${esc(l.heading)}</div></li>`;
      }
      linksHtml += renderLinkCard(l, li, num++);
    });
    document.getElementById('links-list').innerHTML = linksHtml;
    document.getElementById('links-section-label').textContent = `Ссылки (${drug.links.length})`;
    linksSection.style.display = '';
  } else { linksSection.style.display = 'none'; }

  const divider = document.getElementById('section-divider');
  divider.style.display = ((drug.links || []).length && (facts.length || (drug.dosages || []).length)) ? '' : 'none';

  // Quick links
  const qlI = document.getElementById('ql-interaction');
  const qlA = document.getElementById('ql-activity');
  if (drug.qlInteraction && drug.qlInteraction.trim()) {
    document.getElementById('ql-interaction-link').href = drug.qlInteraction;
    qlI.style.display = '';
  } else { qlI.style.display = 'none'; }
  if (drug.qlActivity && drug.qlActivity.trim()) {
    document.getElementById('ql-activity-link').href = drug.qlActivity;
    qlA.style.display = '';
  } else { qlA.style.display = 'none'; }

  buildLeftNav(drug);
}

// ══════════════════════════════════════════════
//  LEFT NAV
// ══════════════════════════════════════════════

function buildLeftNav(drug) {
  const nav = document.getElementById('drug-left-nav-list');
  const instrLinks = (drug.instrLinks || []).filter(l => l.url && l.url.trim());
  if (!instrLinks.length && drug.instrUrl && drug.instrUrl.trim())
    instrLinks.push({ name: 'Инструкция / ОХЛП', url: drug.instrUrl });

  const dedupSections = [];
  instrLinks.forEach((l, i) => {
    dedupSections.push({ label: l.name || 'Инструкция / ОХЛП', anchor: i === 0 ? 'nav-anchor-instr' : 'nav-anchor-instr-' + i });
  });

  const links = drug.links || [];
  if (links.length) {
    dedupSections.push({ label: 'Ссылки', anchor: 'nav-anchor-links' });
    const seenHeadings = new Set();
    links.forEach((l, li) => {
      if (l.heading && l.heading.trim() && !seenHeadings.has(l.heading.trim())) {
        seenHeadings.add(l.heading.trim());
        dedupSections.push({ label: l.heading.trim(), anchor: 'nav-anchor-link-group-' + li, isSubItem: true });
      }
    });
  }

  const facts = (drug.facts || []).filter(f => (typeof f === 'string' ? f : f.text || f.title || '').trim());
  if (facts.length) {
    dedupSections.push({ label: facts.length === 1 ? (typeof facts[0] === 'string' ? 'Заметка' : (facts[0].title || 'Заметка')) : 'Заметки', anchor: 'nav-anchor-notes' });
    if (facts.length > 1) {
      facts.forEach((f, i) => {
        const label = typeof f === 'string' ? 'Заметка' : (f.title || 'Заметка');
        dedupSections.push({ label, anchor: `nav-anchor-note-${i}`, isSubItem: true });
      });
    }
  }

  if ((drug.dosages || []).length)
    dedupSections.push({ label: 'Дозирование', anchor: 'nav-anchor-dosages' });

  if (drug.qlInteraction && drug.qlInteraction.trim())
    dedupSections.push({ label: 'Взаимодействие ЛС', anchor: 'nav-anchor-ql-interaction' });
  if (drug.qlActivity && drug.qlActivity.trim())
    dedupSections.push({ label: 'Природная активность', anchor: 'nav-anchor-ql-activity' });

  if (!dedupSections.length) { nav.innerHTML = ''; return; }

  nav.innerHTML = dedupSections.map((s, idx) => `
    <li>
      <button class="drug-left-nav-item${s.isSubItem ? ' drug-left-nav-sub-item' : ''}" data-anchor="${s.anchor}" data-idx="${idx}"
        onclick="navScrollTo('${s.anchor}')">
        <span class="drug-left-nav-bar"></span>
        <span>${s.label}</span>
      </button>
    </li>`).join('');

  if (_navObserver) _navObserver.disconnect();
  const anchorIds = [...new Set(dedupSections.map(s => s.anchor))];
  _navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.drug-left-nav-item').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.anchor === e.target.id);
        });
      }
    });
  }, { rootMargin: '-10% 0px -75% 0px', threshold: 0 });

  anchorIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) _navObserver.observe(el);
  });
}

function navScrollTo(anchorId) {
  const el = document.getElementById(anchorId);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 90;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

// ══════════════════════════════════════════════
//  LINK CARD RENDER
// ══════════════════════════════════════════════

function renderLinkCard(l, li, displayNum) {
  const chips    = [l.type, l.tag2, l.tag3].filter(t => t && t.trim());
  const starHtml = l.fav ? `<span class="fav-star" title="Избранное"><svg viewBox="0 0 24 24" style="fill:#eab308;stroke:#eab308;width:15px;height:15px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>` : '';
  const redChip  = l.tagr && l.tagr.trim() ? `<span class="chip red">${l.tagr}</span>` : '';
  const chipsHtml = (chips.length || redChip)
    ? `<div class="link-card-chips">${chips.map((c, ci) => `<span class="chip${ci === 0 ? ' violet' : ''}">${c}</span>`).join('')}${redChip}${starHtml}</div>`
    : (l.fav ? `<div class="link-card-chips">${starHtml}</div>` : '');
  const noteHtml = l.note ? `<div class="link-card-note">${nl2br(l.note)}</div>` : '';
  const citeHtml = l.cite ? `<div class="link-card-cite">${nl2br(l.cite)}<button class="cite-copy-btn" onclick="copyCite(${li})">Копировать</button></div>` : '';
  const urlHtml  = l.url  ? `<a class="link-card-url" href="${l.url}" target="_blank">Открыть статью<svg viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></a>` : '';
  const pdfHtml  = l.pdf  ? `<a class="link-card-pdf" href="${l.pdf}" target="_blank">PDF<svg viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></a>` : '';
  const footHtml = (urlHtml || pdfHtml) ? `<div class="link-card-foot">${urlHtml}${pdfHtml}</div>` : '';
  const numHtml  = displayNum != null ? `<span class="link-num">${displayNum}</span>` : '';
  return `<li><div class="link-card${l.fav ? ' fav' : ''}"><div class="link-card-body" style="display:flex;gap:10px;align-items:flex-start">${numHtml}<div style="flex:1;min-width:0">${chipsHtml}${noteHtml}${citeHtml}</div></div>${footHtml}</div></li>`;
}

function copyCite(li) {
  const cite = currentDrug.links[li]?.cite || '';
  if (!cite) return;
  navigator.clipboard.writeText(cite).then(() => {
    const btns = document.querySelectorAll('.cite-copy-btn');
    if (btns[li]) { btns[li].textContent = '✓ Скопировано'; setTimeout(() => { btns[li].textContent = 'Копировать'; }, 2000); }
  });
}

// ══════════════════════════════════════════════
//  FILL EDITOR FROM DRUG
// ══════════════════════════════════════════════

function fillEditorFromDrug(drug) {
  const tags = drug.tags || {};
  document.getElementById('ep-name').value           = drug.name          || '';
  document.getElementById('ep-subtitle').value       = drug.subtitle      || '';
  document.getElementById('ep-trade').value          = drug.trade         || '';
  document.getElementById('ep-ql-interaction').value = drug.qlInteraction || '';
  document.getElementById('ep-ql-activity').value    = drug.qlActivity    || '';
  document.getElementById('ep-tag-green').value      = tags.green         || '';
  document.getElementById('ep-tag-yellow').value     = tags.yellow        || '';
  document.getElementById('ep-tag-red').value        = tags.red           || '';
  document.getElementById('ep-tag-violet').value     = tags.violet        || '';

  // Миграция legacy instrUrl
  if (!drug.instrLinks && drug.instrUrl && drug.instrUrl.trim()) {
    drug.instrLinks = [{ name: 'Инструкция / ОХЛП', url: drug.instrUrl }];
  }
  renderEpInstrLinks(drug.instrLinks || []);
  renderEpNotes(drug.facts    || []);
  renderEpDosages(drug.dosages || []);
  renderEpLinks(drug.links    || []);
}

// ══════════════════════════════════════════════
//  EDITOR — INSTR LINKS
// ══════════════════════════════════════════════

function renderEpInstrLinks(links) {
  document.getElementById('ep-instr-links').innerHTML = links.map((l, i) => `
    <div class="ep-dos-item" style="padding:10px 12px;margin-bottom:6px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:.7rem;font-weight:700;color:var(--ep-section-lbl-color);letter-spacing:.06em">ССЫЛКА ${i + 1}</span>
        <div class="ep-move-btns">
          <button class="ep-move-btn" onclick="epMoveInstrLink(${i},-1)" ${i === 0 ? 'disabled' : ''} title="Вверх">
            <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="ep-move-btn" onclick="epMoveInstrLink(${i},1)" ${i === links.length - 1 ? 'disabled' : ''} title="Вниз">
            <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>
      <input class="ep-input" id="ep-il-name-${i}" value="${esc(l.name || '')}" placeholder="Инструкция / ОХЛП" style="margin-bottom:6px"/>
      <input class="ep-input" id="ep-il-url-${i}"  value="${esc(l.url  || '')}" placeholder="https://…" type="url"/>
      <button class="ep-remove-btn" onclick="epRemoveInstrLink(${i})" style="margin-top:4px">Удалить</button>
    </div>`).join('');
}

function epSyncInstrLinks() {
  (currentDrug.instrLinks || []).forEach((_, i) => {
    const n = document.getElementById(`ep-il-name-${i}`);
    const u = document.getElementById(`ep-il-url-${i}`);
    if (n) currentDrug.instrLinks[i].name = n.value.trim();
    if (u) currentDrug.instrLinks[i].url  = u.value.trim();
  });
}

function epAddInstrLink() {
  epSyncInstrLinks();
  if (!currentDrug.instrLinks) currentDrug.instrLinks = [];
  currentDrug.instrLinks.push({ name: '', url: '' });
  renderEpInstrLinks(currentDrug.instrLinks);
}

function epRemoveInstrLink(i) {
  epSyncInstrLinks();
  currentDrug.instrLinks.splice(i, 1);
  renderEpInstrLinks(currentDrug.instrLinks);
}

function epMoveInstrLink(i, dir) {
  epSyncInstrLinks();
  const arr = currentDrug.instrLinks;
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  renderEpInstrLinks(arr);
}

// ══════════════════════════════════════════════
//  EDITOR — NOTES
// ══════════════════════════════════════════════

function renderEpNotes(notes) {
  const n = notes.length;
  document.getElementById('ep-notes').innerHTML = notes.map((v, i) => {
    const title = typeof v === 'string' ? '' : (v.title || '');
    const text  = typeof v === 'string' ? v  : (v.text  || '');
    return `
    <div class="ep-dos-item">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:.7rem;font-weight:700;color:var(--ep-section-lbl-color);letter-spacing:.06em">ЗАМЕТКА ${i + 1}</span>
        <div class="ep-move-btns">
          <button class="ep-move-btn" onclick="epMoveNote(${i},-1)" ${i === 0 ? 'disabled' : ''} title="Вверх">
            <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="ep-move-btn" onclick="epMoveNote(${i},1)" ${i === n - 1 ? 'disabled' : ''} title="Вниз">
            <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>
      <input class="ep-input" id="ep-note-title-${i}" value="${esc(title)}" placeholder="Заголовок (необязательно)" style="margin-bottom:6px"/>
      <textarea class="ep-textarea" id="ep-note-${i}" style="min-height:68px">${esc(text)}</textarea>
      <button class="ep-remove-btn" onclick="epRemoveNote(${i})" style="margin-top:4px">Удалить</button>
    </div>`;
  }).join('');
}

function epSyncNotes() {
  (currentDrug.facts || []).forEach((_, i) => {
    const t   = document.getElementById(`ep-note-title-${i}`);
    const n   = document.getElementById(`ep-note-${i}`);
    const inf = document.getElementById(`ep-note-info-${i}`);
    if (n) currentDrug.facts[i] = {
      title: t   ? t.value   : '',
      text:  n.value,
      info:  inf ? inf.value.trim() : ''
    };
  });
}

function epAddNote() {
  epSyncNotes();
  currentDrug.facts.push({ title: '', text: '' });
  renderEpNotes(currentDrug.facts);
  setTimeout(() => { const el = document.getElementById(`ep-note-${currentDrug.facts.length - 1}`); if (el) el.focus(); }, 50);
}

function epRemoveNote(i) { epSyncNotes(); currentDrug.facts.splice(i, 1); renderEpNotes(currentDrug.facts); }
function epMoveNote(i, dir) {
  epSyncNotes();
  const arr = currentDrug.facts;
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  renderEpNotes(arr);
}

// ══════════════════════════════════════════════
//  EDITOR — DOSAGES
// ══════════════════════════════════════════════

function renderEpDosages(dosages) {
  const n = dosages.length;
  document.getElementById('ep-dosages').innerHTML = dosages.map((d, i) => `
    <div class="ep-dos-item">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div class="ep-move-btns">
          <button class="ep-move-btn" onclick="epMoveDosage(${i},-1)" ${i === 0 ? 'disabled' : ''} title="Вверх">
            <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="ep-move-btn" onclick="epMoveDosage(${i},1)" ${i === n - 1 ? 'disabled' : ''} title="Вниз">
            <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
        <input class="ep-input" id="ep-dos-tag1-${i}" value="${esc(d.tag1 || '')}" placeholder="Тег 1"/>
        <input class="ep-input" id="ep-dos-tag2-${i}" value="${esc(d.tag2 || '')}" placeholder="Тег 2"/>
        <input class="ep-input" id="ep-dos-tag3-${i}" value="${esc(d.tag3 || '')}" placeholder="Тег 3"/>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
        <input class="ep-input" id="ep-dos-tagr-${i}" value="${esc(d.tagr || '')}" placeholder="Красный тег"/>
        <input class="ep-input" id="ep-dos-tagv-${i}" value="${esc(d.tagv || '')}" placeholder="Фиолетовый тег"/>
      </div>
      <input class="ep-input" id="ep-dos-title-${i}" value="${esc(d.title || '')}" placeholder="Название группы…" style="margin-bottom:8px"/>
      <textarea class="ep-textarea" id="ep-dos-body-${i}" style="min-height:80px">${esc(d.body || '')}</textarea>
      <div class="ep-field" style="margin-top:8px;margin-bottom:0">
        <label style="display:flex;align-items:center;gap:4px">
          <span style="width:14px;height:14px;border-radius:50%;border:1.5px solid var(--muted);display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:var(--muted);flex-shrink:0">i</span>
          Пояснительная бригада (необязательно)
        </label>
        <textarea class="ep-textarea" id="ep-dos-info-${i}" style="min-height:56px">${esc(d.info || '')}</textarea>
      </div>
      <button class="ep-remove-btn" onclick="epRemoveDosage(${i})" style="margin-top:6px">Удалить блок</button>
    </div>`).join('');
}

function epSyncDosages() {
  (currentDrug.dosages || []).forEach((_, i) => {
    const t   = document.getElementById(`ep-dos-title-${i}`);
    const b   = document.getElementById(`ep-dos-body-${i}`);
    const t1  = document.getElementById(`ep-dos-tag1-${i}`);
    const t2  = document.getElementById(`ep-dos-tag2-${i}`);
    const t3  = document.getElementById(`ep-dos-tag3-${i}`);
    const tr  = document.getElementById(`ep-dos-tagr-${i}`);
    const tv  = document.getElementById(`ep-dos-tagv-${i}`);
    const inf = document.getElementById(`ep-dos-info-${i}`);
    if (t)   currentDrug.dosages[i].title = t.value;
    if (b)   currentDrug.dosages[i].body  = b.value;
    if (t1)  currentDrug.dosages[i].tag1  = t1.value.trim();
    if (t2)  currentDrug.dosages[i].tag2  = t2.value.trim();
    if (t3)  currentDrug.dosages[i].tag3  = t3.value.trim();
    if (tr)  currentDrug.dosages[i].tagr  = tr.value.trim();
    if (tv)  currentDrug.dosages[i].tagv  = tv.value.trim();
    if (inf) currentDrug.dosages[i].info  = inf.value.trim();
  });
}

function epAddDosage() {
  epSyncDosages();
  currentDrug.dosages.push({ title: '', tag1: '', tag2: '', tag3: '', tagr: '', tagv: '', body: '', info: '' });
  renderEpDosages(currentDrug.dosages);
}

function epRemoveDosage(i) { epSyncDosages(); currentDrug.dosages.splice(i, 1); renderEpDosages(currentDrug.dosages); }
function epMoveDosage(i, dir) {
  epSyncDosages();
  const arr = currentDrug.dosages;
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  renderEpDosages(arr);
}

// ══════════════════════════════════════════════
//  EDITOR — LINKS
// ══════════════════════════════════════════════

function renderEpLinks(links) {
  const n = links.length;
  const typeOptions = LINK_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
  document.getElementById('ep-links').innerHTML = links.map((l, i) => `
    <div class="ep-lnk-item">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:.72rem;font-weight:700;color:var(--drug-label-color);letter-spacing:.06em">ССЫЛКА ${i + 1}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="ep-fav-btn${l.fav ? ' active' : ''}" id="ep-lnk-fav-${i}" onclick="epToggleFav(${i})" title="Избранное">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Избранное
          </button>
          <div class="ep-move-btns">
            <button class="ep-move-btn" onclick="epMoveLink(${i},-1)" ${i === 0 ? 'disabled' : ''} title="Вверх">
              <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button class="ep-move-btn" onclick="epMoveLink(${i},1)" ${i === n - 1 ? 'disabled' : ''} title="Вниз">
              <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>
      </div>
      <input class="ep-input" id="ep-lnk-heading-${i}" value="${esc(l.heading || '')}" placeholder="Заголовок группы (необязательно)" style="margin-bottom:8px"/>
      <div class="ep-field" style="margin-bottom:8px"><label>Тип источника</label>
        <select class="ep-select" id="ep-lnk-type-${i}" onchange="epToggleLnkCustom(${i})">
          <option value="">— выбрать —</option>${typeOptions}
        </select>
      </div>
      <div id="ep-lnk-custom-wrap-${i}" style="display:none;margin-bottom:8px">
        <input class="ep-input" id="ep-lnk-custom-${i}" value="${esc(l.typeCustom || '')}" placeholder="Введите тип источника…"/>
      </div>
      <div class="ep-lnk-tags-row">
        <input class="ep-input" id="ep-lnk-tag2-${i}" value="${esc(l.tag2 || '')}" placeholder="Тег 2 (необязательно)"/>
        <input class="ep-input" id="ep-lnk-tag3-${i}" value="${esc(l.tag3 || '')}" placeholder="Тег 3 (необязательно)"/>
      </div>
      <input class="ep-input" id="ep-lnk-tagr-${i}" value="${esc(l.tagr || '')}" placeholder="Красный тег (необязательно)"/>
      <textarea class="ep-textarea" id="ep-lnk-note-${i}" style="min-height:60px" placeholder="Заметка по ссылке…">${esc(l.note || '')}</textarea>
      <textarea class="ep-textarea" id="ep-lnk-cite-${i}" style="min-height:56px;margin-top:8px" placeholder="Текст для цитирования…">${esc(l.cite || '')}</textarea>
      <input class="ep-input" id="ep-lnk-url-${i}" value="${esc(l.url || '')}" placeholder="https://… (ссылка на статью)" style="margin-top:8px"/>
      <input class="ep-input" id="ep-lnk-pdf-${i}" value="${esc(l.pdf || '')}" placeholder="Ссылка на PDF файл (необязательно)" style="margin-top:8px"/>
      <button class="ep-remove-btn" onclick="epRemoveLink(${i})">Удалить ссылку</button>
    </div>`).join('');

  links.forEach((l, i) => {
    const sel = document.getElementById(`ep-lnk-type-${i}`);
    if (sel) {
      sel.value = LINK_TYPES.includes(l.type) ? l.type : (l.typeCustom ? 'Заполнить' : '');
      epToggleLnkCustom(i);
    }
  });
}

function epToggleLnkCustom(i) {
  const sel  = document.getElementById(`ep-lnk-type-${i}`);
  const wrap = document.getElementById(`ep-lnk-custom-wrap-${i}`);
  if (sel && wrap) wrap.style.display = sel.value === 'Заполнить' ? 'block' : 'none';
}

function epToggleFav(i) {
  epSyncLinks();
  currentDrug.links[i].fav = !currentDrug.links[i].fav;
  renderEpLinks(currentDrug.links);
}

function epAddLink() {
  epSyncLinks();
  currentDrug.links.push({ heading: '', type: '', tag2: '', tag3: '', tagr: '', note: '', cite: '', url: '', pdf: '', fav: false });
  renderEpLinks(currentDrug.links);
}

function epRemoveLink(i) { epSyncLinks(); currentDrug.links.splice(i, 1); renderEpLinks(currentDrug.links); }
function epMoveLink(i, dir) {
  epSyncLinks();
  const arr = currentDrug.links;
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  renderEpLinks(arr);
}

function epSyncLinks() {
  (currentDrug.links || []).forEach((_, i) => {
    const sel     = document.getElementById(`ep-lnk-type-${i}`);
    const cust    = document.getElementById(`ep-lnk-custom-${i}`);
    const t2      = document.getElementById(`ep-lnk-tag2-${i}`);
    const t3      = document.getElementById(`ep-lnk-tag3-${i}`);
    const tagr    = document.getElementById(`ep-lnk-tagr-${i}`);
    const note    = document.getElementById(`ep-lnk-note-${i}`);
    const cite    = document.getElementById(`ep-lnk-cite-${i}`);
    const url     = document.getElementById(`ep-lnk-url-${i}`);
    const pdf     = document.getElementById(`ep-lnk-pdf-${i}`);
    const heading = document.getElementById(`ep-lnk-heading-${i}`);
    if (heading) currentDrug.links[i].heading   = heading.value.trim();
    if (sel)   { currentDrug.links[i].type       = sel.value === 'Заполнить' ? (cust ? cust.value.trim() : '') : sel.value;
                 currentDrug.links[i].typeCustom = cust ? cust.value.trim() : ''; }
    if (t2)    currentDrug.links[i].tag2 = t2.value.trim();
    if (t3)    currentDrug.links[i].tag3 = t3.value.trim();
    if (tagr)  currentDrug.links[i].tagr = tagr.value.trim();
    if (note)  currentDrug.links[i].note = note.value.trim();
    if (cite)  currentDrug.links[i].cite = cite.value.trim();
    if (url)   currentDrug.links[i].url  = url.value.trim();
    if (pdf)   currentDrug.links[i].pdf  = pdf.value.trim();
  });
}

// ══════════════════════════════════════════════
//  APPLY EDITS / DELETE
// ══════════════════════════════════════════════

async function applyEdits() {
  const btn = document.getElementById('ep-save-btn-fixed');
  btn.disabled = true;
  btn.textContent = 'Сохранение…';

  currentDrug.name          = document.getElementById('ep-name').value.trim();
  currentDrug.subtitle      = document.getElementById('ep-subtitle').value.trim();
  currentDrug.trade         = document.getElementById('ep-trade').value.trim();
  currentDrug.qlInteraction = document.getElementById('ep-ql-interaction').value.trim();
  currentDrug.qlActivity    = document.getElementById('ep-ql-activity').value.trim();

  epSyncInstrLinks();
  currentDrug.instrLinks = (currentDrug.instrLinks || []).filter(l => l.url && l.url.trim());
  currentDrug.tags = {
    green:  document.getElementById('ep-tag-green').value.trim(),
    yellow: document.getElementById('ep-tag-yellow').value.trim(),
    red:    document.getElementById('ep-tag-red').value.trim(),
    violet: document.getElementById('ep-tag-violet').value.trim(),
  };
  epSyncNotes();    currentDrug.facts   = (currentDrug.facts   || []).filter(f => typeof f === 'string' ? f.trim() : (f.text || f.title || '').trim());
  epSyncDosages();  currentDrug.dosages = (currentDrug.dosages || []).filter(d => d.title || d.body);
  epSyncLinks();    currentDrug.links   = (currentDrug.links   || []).filter(l => l.type || l.note || l.url);

  try {
    await dbUpdate(currentDrug);
    const idx = drugs.findIndex(d => d.id === currentDrug.id);
    if (idx > -1) drugs[idx] = JSON.parse(JSON.stringify(currentDrug));
    renderDrugPage(currentDrug);
    showToast('✓ Сохранено');
  } catch (e) {
    showToast('Ошибка при сохранении');
  }
  btn.disabled = false;
  btn.textContent = 'Применить изменения';
}

async function deleteDrugFromEditor() {
  if (!confirm(`Удалить «${currentDrug.name}» из справочника? Это действие нельзя отменить.`)) return;
  try {
    await dbDelete(currentDrug.id);
    drugs = drugs.filter(d => d.id !== currentDrug.id);
    showToast('Препарат удалён');
    updateCatalogCount();
    goBack();
  } catch (e) {
    showToast('Ошибка при удалении');
  }
}
