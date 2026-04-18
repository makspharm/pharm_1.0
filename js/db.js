// ══════════════════════════════════════════════
//  DATABASE — DRUGS
// ══════════════════════════════════════════════

async function dbGetAll() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/drugs?select=*`, { headers: HEADERS });
  return await r.json();
}

async function dbInsert(drug) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/drugs`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify({ id: drug.id, data: drug })
  });
  return await r.json();
}

async function dbUpdate(drug) {
  await fetch(`${SUPABASE_URL}/rest/v1/drugs?id=eq.${drug.id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ data: drug })
  });
}

async function dbDelete(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/drugs?id=eq.${id}`, {
    method: 'DELETE',
    headers: HEADERS
  });
}

// ══════════════════════════════════════════════
//  DATABASE — TOPICS
// ══════════════════════════════════════════════

async function dbGetTopics() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/topics?select=*`, { headers: HEADERS });
  return await r.json();
}

async function dbInsertTopic(t) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/topics`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify({ id: t.id, data: t })
  });
  return await r.json();
}

async function dbUpdateTopic(t) {
  await fetch(`${SUPABASE_URL}/rest/v1/topics?id=eq.${t.id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ data: t })
  });
}

async function dbDeleteTopic(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/topics?id=eq.${id}`, {
    method: 'DELETE',
    headers: HEADERS
  });
}
