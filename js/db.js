// ══════════════════════════════════════════════
//  DATABASE — Firebase Realtime Database
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
//  DRUGS
// ══════════════════════════════════════════════

async function dbGetAll() {
  const snap = await firebaseDB.ref('drugs').once('value');
  if (!snap.exists()) return [];
  return Object.values(snap.val()).map(item => ({ data: item.data }));
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
  const snap = await firebaseDB.ref('topics').once('value');
  if (!snap.exists()) return [];
  return Object.values(snap.val()).map(item => ({ data: item.data }));
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
