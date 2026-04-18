// ══════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  document.querySelectorAll('.theme-icon-sun').forEach(el  => el.style.display = dark ? 'none' : '');
  document.querySelectorAll('.theme-icon-moon').forEach(el => el.style.display = dark ? '' : 'none');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

function toggleTheme() {
  applyTheme(!document.documentElement.classList.contains('dark'));
}

// Применяем сразу при загрузке скрипта — до рендера body,
// чтобы не было мигания (FOUC)
applyTheme(localStorage.getItem('theme') === 'dark');
