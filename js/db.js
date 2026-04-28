// ══════════════════════════════════════════════
//  DATABASE — Firebase Realtime Database
// ══════════════════════════════════════════════

const FIREBASE_TIMEOUT_MS = 5000;
const FALLBACK_URL = '/pharm_1.0/data/drugs.json';

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Firebase timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

async function loadFallback() {
  const res = await fetch(FALLBACK_URL);
  if (!res.ok) throw new Error('Fallback недоступен');
  return await res.json();
}

// ══════════════════════════════════════════════
//  DRUGS
// ══════════════════════════════════════════════

async function dbGetAll() {
  try {
    const snap = await withTimeout(
      firebaseDB.ref('drugs').once('value'),
      FIREBASE_TIMEOUT_MS
    );
    if (!snap.exists()) return [];
    return Object.values(snap.val()).map(item => ({ data: item.data }));
  } catch (e) {
    console.warn('Firebase недоступен (drugs), загружаю fallback:', e.message);
    window._usingFallback = true;
    const json = await loadFallback();
    if (!json.drugs) return [];
    return Object.values(json.drugs).map(item => ({ data: item.data }));
  }
}

async function dbInsert(drug) {
  await firebaseDB.ref('drugs/' + drug.id).set({ id: drug.id, data: drug });
  return [{ data: drug }];
}

async function dbUpdate(drug) {
  await firebaseDB.ref('drugs/' + drug.id).update({ data: drug });
}

async function dbDelete(id) {
  await firebaseDB.ref('drugs/' + id).remove();
}

// ══════════════════════════════════════════════
//  TOPICS
// ══════════════════════════════════════════════

async function dbGetTopics() {
  try {
    const snap = await withTimeout(
      firebaseDB.ref('topics').once('value'),
      FIREBASE_TIMEOUT_MS
    );
    if (!snap.exists()) return [];
    return Object.values(snap.val()).map(item => ({ data: item.data }));
  } catch (e) {
    console.warn('Firebase недоступен (topics), загружаю fallback:', e.message);
    window._usingFallback = true;
    const json = await loadFallback();
    if (!json.topics) return [];
    return Object.values(json.topics).map(item => ({ data: item.data }));
  }
}

async function dbInsertTopic(t) {
  await firebaseDB.ref('topics/' + t.id).set({ id: t.id, data: t });
  return [{ data: t }];
}

async function dbUpdateTopic(t) {
  await firebaseDB.ref('topics/' + t.id).update({ data: t });
}

async function dbDeleteTopic(id) {
  await firebaseDB.ref('topics/' + id).remove();
}
