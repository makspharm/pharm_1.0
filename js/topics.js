// ══════════════════════════════════════════════
//  TOPICS (Шаблоны)
// ══════════════════════════════════════════════

function tryOpenTemplates() {
  if (!isAdmin) {
    openPwdModal();
    window._pendingAfterAuth = () => toggleTopics();
    return;
  }
  toggleTopics();
}

function toggleTopics() {
  document.getElementById('calc-overlay').classList.remove('open');
  document.getElementById('catalog-overlay').classList.remove('open');
  const o       = document.getElementById('topics-overlay');
  const opening = !o.classList.contains('open');
  o.classList.toggle('open');
  if (opening) renderTopicsList();
}

function closeTopics() {
  document.getElementById('topics-overlay').classList.remove('open');
}

function renderTopicsList() {
  const sorted = [...topics].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  document.getElementById('topics-count').textContent = topics.length;
  const list = document.getElementById('topics-list');
  if (!sorted.length) {
    list.innerHTML = '<div class="panel-empty">Шаблоны не добавлены</div>';
    return;
  }
  list.innerHTML = sorted.map(t => `
    <div class="panel-item" onclick="openTopicPage('${t.id}')">
      <div>
        <div class="panel-item-name">${t.title}</div>
        ${(t.notes || []).length
          ? `<div class="panel-item-desc">${((t.notes[0] && t.notes[0].text) || '').split('\n')[0].substring(0, 60)}</div>`
          : (t.note && t.note.trim() ? `<div class="panel-item-desc">${t.note.split('\n')[0].substring(0, 60)}</div>` : '')}
      </div>
      <span class="catalog-arrow">›</span>
    </div>`).join('');
}

async function addTopic() {
  const inp   = document.getElementById('add-topic-input');
  const title = inp.value.trim();
  if (!title) return;
  const btn = document.getElementById('add-topic-btn');
  btn.disabled = true;
  const topic = { id: 'topic_' + Date.now(), title, notes: [] };
  try {
    await dbInsertTopic(topic);
    topics.push(topic);
    inp.value = '';
    renderTopicsList();
    showToast('Шаблон добавлен');
    openTopicPage(topic.id);
  } catch (e) { showToast('Ошибка при добавлении'); }
  btn.disabled = false;
}

// ══════════════════════════════════════════════
//  TOPIC PAGE
// ══════════════════════════════════════════════

function openTopicPage(id) {
  const topic = topics.find(t => t.id === id);
  if (!topic) return;
  currentTopic    = JSON.parse(JSON.stringify(topic));
  topicEditorOpen = false;
  document.getElementById('topics-overlay').classList.remove('open');
  document.getElementById('search-page').style.display  = 'none';
  document.getElementById('drug-page').style.display    = 'none';
  document.getElementById('topic-page').style.display   = 'block';
  document.getElementById('header-btns-fixed').style.display = 'none';
  document.getElementById('topic-editor-panel').classList.remove('open');
  document.getElementById('topic-edit-btn').classList.remove('active');
  document.getElementById('topic-edit-btn').innerHTML   = svgEdit() + ' <span>Редактировать</span>';
  renderTopicPage(currentTopic);
  updateTopicLockState();
  window.scrollTo(0, 0);
}

function renderTopicPage(topic) {
  document.getElementById('topic-header-title').textContent = topic.title;
  document.getElementById('topic-title').textContent        = topic.title;

  // Поддержка legacy single note
  const notes = topic.notes && topic.notes.length
    ? topic.notes
    : (topic.note && topic.note.trim() ? [{ title: '', text: topic.note }] : []);

  const block   = document.getElementById('topic-notes-block');
  const list    = document.getElementById('topic-notes-list');
  const visible = notes.filter(n => (n.text || n.title || '').trim());

  if (visible.length) {
    list.innerHTML = visible.map(n => `
      <div class="facts-card">
        ${n.title && n.title.trim() ? `<div class="facts-card-title">${esc(n.title)}</div>` : ''}
        <div class="facts-card-body">${nl2br(n.text || '')}</div>
      </div>`).join('');
    block.style.display = '';
  } else { block.style.display = 'none'; }
}

function goBackFromTopic() {
  document.getElementById('topic-page').style.display   = 'none';
  document.getElementById('search-page').style.display  = 'flex';
  document.getElementById('header-btns-fixed').style.display = 'flex';
  updateLockState();
}

// ══════════════════════════════════════════════
//  TOPIC EDITOR
// ══════════════════════════════════════════════

function toggleTopicEditor() {
  topicEditorOpen = !topicEditorOpen;
  document.getElementById('topic-editor-panel').classList.toggle('open', topicEditorOpen);
  const btn = document.getElementById('topic-edit-btn');
  btn.classList.toggle('active', topicEditorOpen);
  btn.innerHTML = svgEdit() + (topicEditorOpen ? ' Закрыть' : ' Редактировать');
  if (topicEditorOpen) {
    document.getElementById('tep-title').value = currentTopic.title || '';
    // Миграция legacy single note
    if (!currentTopic.notes) {
      currentTopic.notes = currentTopic.note && currentTopic.note.trim()
        ? [{ title: '', text: currentTopic.note }] : [];
    }
    renderTepNotes(currentTopic.notes);
    updateTopicLockState();
  }
}

function updateTopicLockState() {
  const el = document.getElementById('tep-lock-delete');
  if (el) el.style.display = isAdmin ? 'none' : 'flex';
}

async function applyTopicEdits() {
  const btn = document.getElementById('tep-save-btn');
  btn.disabled = true;
  btn.textContent = 'Сохранение…';

  currentTopic.title = document.getElementById('tep-title').value.trim();
  tepSyncNotes();
  currentTopic.notes = (currentTopic.notes || []).filter(n => (n.text || n.title || '').trim());

  try {
    await dbUpdateTopic(currentTopic);
    const idx = topics.findIndex(t => t.id === currentTopic.id);
    if (idx > -1) topics[idx] = JSON.parse(JSON.stringify(currentTopic));
    renderTopicPage(currentTopic);
    showToast('✓ Сохранено');
  } catch (e) { showToast('Ошибка при сохранении'); }

  btn.disabled = false;
  btn.textContent = 'Применить изменения';
}

function renderTepNotes(notes) {
  const n = notes.length;
  document.getElementById('tep-notes').innerHTML = notes.map((v, i) => `
    <div class="ep-dos-item">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:.7rem;font-weight:700;color:var(--ep-section-lbl-color);letter-spacing:.06em">БЛОК ${i + 1}</span>
        <div class="ep-move-btns">
          <button class="ep-move-btn" onclick="tepMoveNote(${i},-1)" ${i === 0 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="ep-move-btn" onclick="tepMoveNote(${i},1)" ${i === n - 1 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>
      <input class="ep-input" id="tep-note-title-${i}" value="${esc(v.title || '')}" placeholder="Заголовок (необязательно)"/>
      <textarea class="ep-textarea" id="tep-note-text-${i}" style="min-height:80px">${esc(v.text || '')}</textarea>
      <button class="ep-remove-btn" onclick="tepRemoveNote(${i})">Удалить блок</button>
    </div>`).join('');
}

function tepSyncNotes() {
  (currentTopic.notes || []).forEach((_, i) => {
    const t = document.getElementById(`tep-note-title-${i}`);
    const x = document.getElementById(`tep-note-text-${i}`);
    if (x) currentTopic.notes[i] = { title: t ? t.value.trim() : '', text: x.value };
  });
}

function tepAddNote() {
  tepSyncNotes();
  if (!currentTopic.notes) currentTopic.notes = [];
  currentTopic.notes.push({ title: '', text: '' });
  renderTepNotes(currentTopic.notes);
  setTimeout(() => {
    const el = document.getElementById(`tep-note-text-${currentTopic.notes.length - 1}`);
    if (el) el.focus();
  }, 50);
}

function tepRemoveNote(i) { tepSyncNotes(); currentTopic.notes.splice(i, 1); renderTepNotes(currentTopic.notes); }
function tepMoveNote(i, dir) {
  tepSyncNotes();
  const arr = currentTopic.notes;
  const j   = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  renderTepNotes(arr);
}

async function deleteTopicFromEditor() {
  if (!confirm(`Удалить шаблон «${currentTopic.title}»? Это действие нельзя отменить.`)) return;
  try {
    await dbDeleteTopic(currentTopic.id);
    topics = topics.filter(t => t.id !== currentTopic.id);
    showToast('Шаблон удалён');
    goBackFromTopic();
  } catch (e) { showToast('Ошибка при удалении'); }
}
