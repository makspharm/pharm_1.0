// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function nl2br(str) {
  return esc(str).replace(/\n/g, '<br>');
}

// ══════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ══════════════════════════════════════════════
//  PASSWORD MODAL
// ══════════════════════════════════════════════

function openPwdModal() {
  document.getElementById('pwd-overlay').classList.add('open');
  document.getElementById('pwd-input').value = '';
  document.getElementById('pwd-error').style.display = 'none';
  document.getElementById('pwd-input').classList.remove('error');
  setTimeout(() => document.getElementById('pwd-input').focus(), 50);
}

function closePwdModal() {
  document.getElementById('pwd-overlay').classList.remove('open');
}

async function checkPassword() {
  const val = document.getElementById('pwd-input').value;
  const ok  = await checkAdminPassword(val);
  if (ok) {
    isAdmin = true;
    closePwdModal();
    updateLockState();
    updateTopicLockState();
    if (window._pendingAfterAuth) {
      const fn = window._pendingAfterAuth;
      window._pendingAfterAuth = null;
      fn();
    }
  } else {
    const inp = document.getElementById('pwd-input');
    const err = document.getElementById('pwd-error');
    inp.value = '';
    inp.classList.add('error');
    err.style.display = 'block';
    setTimeout(() => inp.classList.remove('error'), 400);
  }
}

// ══════════════════════════════════════════════
//  LOCK STATE (admin/non-admin UI)
// ══════════════════════════════════════════════

function updateLockState() {
  const locks = ['ep-lock-main', 'ep-lock-tags', 'ep-lock-groups', 'ep-lock-notes', 'ep-lock-dosages', 'ep-lock-ql', 'ep-lock-delete', 'tep-lock-delete'];
  locks.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isAdmin ? 'none' : 'flex';
  });

  // Показать/скрыть элементы только для редактора
  const adminEls = ['ep-section-add', 'add-drug-wrap', 'edit-toggle-btn', 'topic-edit-btn'];
  adminEls.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isAdmin ? '' : 'none';
  });

  // Кнопки «Шаблоны» — фиксированная + встроенные в хедерах
  document.querySelectorAll('#btn-templates, .btn-tpl-inline').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  // Кнопки «Редактор» — фиксированная + встроенные в хедерах
  const svgLock   = `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  const svgUnlock = `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 8.46-3.54" stroke-linecap="round"/></svg>`;

  // Фиксированная кнопка (folder-btn) — только SVG
  const fixedBtn = document.getElementById('btn-admin-login');
  if (fixedBtn) {
    fixedBtn.title     = isAdmin ? 'Режим редактора активен' : 'Режим редактора';
    fixedBtn.innerHTML = isAdmin ? svgUnlock : svgLock;
    fixedBtn.style.borderColor = isAdmin ? 'var(--muted)' : '';
    fixedBtn.onclick   = isAdmin ? null : () => openPwdModal();
  }

  // Встроенные кнопки в хедерах (header-icon-btn) — SVG + label
  document.querySelectorAll('.btn-admin-inline').forEach(el => {
    el.title     = isAdmin ? 'Режим редактора активен' : 'Режим редактора';
    el.innerHTML = (isAdmin ? svgUnlock : svgLock) + `<span class="icon-label">Редактор</span>`;
    el.style.borderColor = isAdmin ? 'var(--muted)' : '';
    el.onclick   = isAdmin ? null : () => openPwdModal();
  });
}

function updateCatalogCount() {
  document.getElementById('catalog-count').textContent = drugs.length;
}

// ══════════════════════════════════════════════
//  INFO BUBBLE MODAL
// ══════════════════════════════════════════════

function openInfoModal(idx, type) {
  let text = '';
  if (type === 'dosage') text = currentDrug.dosages[idx]?.info || '';
  if (!text.trim()) return;
  document.getElementById('info-modal-body').textContent = text;
  document.getElementById('info-overlay').classList.add('open');
}

function closeInfoModal() {
  document.getElementById('info-overlay').classList.remove('open');
}
