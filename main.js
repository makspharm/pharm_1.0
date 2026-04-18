// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════

async function init() {
  try {
    const [drugRows, topicRows] = await Promise.all([dbGetAll(), dbGetTopics()]);
    drugs  = (drugRows  || []).map(r => r.data).filter(Boolean);
    topics = (topicRows || []).map(r => r.data).filter(Boolean);
  } catch (e) {
    showToast('Ошибка загрузки данных');
  }
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('search-page').style.display    = 'flex';
  document.getElementById('catalog-count').textContent    = drugs.length;
  updateLockState();
}

init();

// ══════════════════════════════════════════════
//  GLOBAL EVENT LISTENERS
// ══════════════════════════════════════════════

// Закрытие модала пароля кликом по подложке
document.getElementById('pwd-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('pwd-overlay')) closePwdModal();
});

// Ctrl+Shift+E — войти в режим редактора (десктоп)
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.key === 'E') {
    e.preventDefault();
    if (!isAdmin) openPwdModal();
  }
});

// Alt+↑ / Alt+↓ — перемещение блоков в редакторе
document.addEventListener('keydown', e => {
  if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
  const dir     = e.key === 'ArrowUp' ? -1 : 1;
  const focused = document.activeElement;
  if (!focused) return;

  const item = focused.closest('.ep-dos-item, .ep-lnk-item');
  if (!item) return;

  const upBtn = item.querySelector('.ep-move-btn');
  if (!upBtn) return;

  const onclick = upBtn.getAttribute('onclick') || '';
  const match   = onclick.match(/(\w+)\((\d+),/);
  if (!match) return;

  const fn  = match[1];
  const idx = parseInt(match[2]);
  e.preventDefault();
  if (dir === -1 && window[fn]) window[fn](idx, -1);
  else if (dir === 1 && window[fn]) window[fn](idx, 1);
});
