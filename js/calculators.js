// ══════════════════════════════════════════════
//  CALCULATORS
// ══════════════════════════════════════════════

const CALC_IDS = ['bsa', 'schwartz', 'crconv', 'cg', 'calvert', 'smeets'];

function toggleCalc() {
  document.getElementById('topics-overlay').classList.remove('open');
  document.getElementById('catalog-overlay').classList.remove('open');
  document.getElementById('calc-overlay').classList.toggle('open');
}

function closeCalc() {
  document.getElementById('calc-overlay').classList.remove('open');
}

function openCalcModal(id) {
  closeCalc();
  CALC_IDS.forEach(c => {
    const el = document.getElementById(c + '-overlay');
    if (el) el.classList.remove('open');
  });

  // Сброс полей ввода
  if (id === 'bsa') {
    document.getElementById('bsa-h').value = '';
    document.getElementById('bsa-w').value = '';
    document.getElementById('bsa-result').classList.remove('show');
  } else if (id === 'schwartz') {
    document.getElementById('sch-h').value    = '';
    document.getElementById('sch-cr').value   = '';
    document.getElementById('sch-unit').value = 'umol';
    document.getElementById('sch-result').classList.remove('show');
  } else if (id === 'crconv') {
    ['cr-umol', 'cr-mgdl', 'cr-mmol'].forEach(x => document.getElementById(x).value = '');
  } else if (id === 'cg') {
    ['cg-age', 'cg-wt', 'cg-cr'].forEach(x => document.getElementById(x).value = '');
    document.getElementById('cg-unit').value = 'umol';
    document.getElementById('cg-sex').value  = 'm';
    document.getElementById('cg-result').classList.remove('show');
  } else if (id === 'calvert') {
    ['cv-auc', 'cv-gfr'].forEach(x => document.getElementById(x).value = '');
    document.getElementById('cv-result').classList.remove('show');
  } else if (id === 'smeets') {
    ['sm-h', 'sm-cr'].forEach(x => document.getElementById(x).value = '');
    document.getElementById('sm-unit').value = 'umol';
    document.getElementById('sm-result').classList.remove('show');
  }

  document.getElementById(id + '-overlay').classList.add('open');
}

function closeCalcModal(id) {
  document.getElementById(id + '-overlay').classList.remove('open');
}

// ──────────────────────────────────────────────
//  BSA — Mosteller 1987
// ──────────────────────────────────────────────
function calcBSALive() {
  const h   = parseFloat(document.getElementById('bsa-h').value);
  const w   = parseFloat(document.getElementById('bsa-w').value);
  const res = document.getElementById('bsa-result');
  if (!h || !w || h <= 0 || w <= 0) { res.classList.remove('show'); return; }
  document.getElementById('bsa-val').textContent = Math.sqrt((h * w) / 3600).toFixed(2);
  res.classList.add('show');
}

// ──────────────────────────────────────────────
//  рСКФ — Bedside Schwartz 2009
// ──────────────────────────────────────────────
function calcSchwartzLive() {
  const h      = parseFloat(document.getElementById('sch-h').value);
  const crRaw  = parseFloat(document.getElementById('sch-cr').value);
  const unit   = document.getElementById('sch-unit').value;
  const res    = document.getElementById('sch-result');
  if (!h || !crRaw || h <= 0 || crRaw <= 0) { res.classList.remove('show'); return; }

  // Приводим к мг/дл
  let crMgdl;
  if      (unit === 'umol') crMgdl = crRaw / 88.4;
  else if (unit === 'mmol') crMgdl = crRaw * 1000 / 88.4;
  else                      crMgdl = crRaw;

  document.getElementById('sch-val').textContent = (0.413 * h / crMgdl).toFixed(1);
  res.classList.add('show');
}

// ──────────────────────────────────────────────
//  Конвертер креатинина: мкмоль/л ↔ мг/дл ↔ ммоль/л
// ──────────────────────────────────────────────
function convertCr(from) {
  const val    = parseFloat(document.getElementById('cr-' + from).value);
  const fields = ['umol', 'mgdl', 'mmol'];
  if (isNaN(val) || val < 0) {
    fields.filter(f => f !== from).forEach(f => document.getElementById('cr-' + f).value = '');
    return;
  }
  let umol;
  if      (from === 'umol') umol = val;
  else if (from === 'mgdl') umol = val * 88.4;
  else if (from === 'mmol') umol = val * 1000;

  const mgdl = umol / 88.4;
  const mmol = umol / 1000;
  if (from !== 'umol') document.getElementById('cr-umol').value = +umol.toFixed(2);
  if (from !== 'mgdl') document.getElementById('cr-mgdl').value = +mgdl.toFixed(4);
  if (from !== 'mmol') document.getElementById('cr-mmol').value = +mmol.toFixed(4);
}

// ──────────────────────────────────────────────
//  КК — Cockcroft–Gault 1976
// ──────────────────────────────────────────────
function calcCGLive() {
  const age   = parseFloat(document.getElementById('cg-age').value);
  const wt    = parseFloat(document.getElementById('cg-wt').value);
  const crRaw = parseFloat(document.getElementById('cg-cr').value);
  const unit  = document.getElementById('cg-unit').value;
  const sex   = document.getElementById('cg-sex').value;
  const res   = document.getElementById('cg-result');
  if (!age || !wt || !crRaw || age <= 0 || wt <= 0 || crRaw <= 0) { res.classList.remove('show'); return; }

  let crMgdl;
  if      (unit === 'umol') crMgdl = crRaw / 88.4;
  else if (unit === 'mmol') crMgdl = crRaw * 1000 / 88.4;
  else                      crMgdl = crRaw;

  let ck = (140 - age) * wt / (72 * crMgdl);
  if (sex === 'f') ck *= 0.85;
  document.getElementById('cg-val').textContent = ck.toFixed(1);
  res.classList.add('show');
}

// ──────────────────────────────────────────────
//  Доза карбоплатина — Calvert 1989
//  Dose (mg) = AUC × (GFR + 25)
// ──────────────────────────────────────────────
function calcCalvertLive() {
  const auc = parseFloat(document.getElementById('cv-auc').value);
  const gfr = parseFloat(document.getElementById('cv-gfr').value);
  const res = document.getElementById('cv-result');
  if (!auc || !gfr || auc <= 0 || gfr <= 0) { res.classList.remove('show'); return; }
  document.getElementById('cv-val').textContent = Math.round(auc * (gfr + 25));
  res.classList.add('show');
}

// ──────────────────────────────────────────────
//  рСКФ — Smeets 2022 (новорождённые 0–28 сут)
//  рСКФ = 0,31 × рост(см) / Cr(мг/дл)
// ──────────────────────────────────────────────
function calcSmeetsLive() {
  const h     = parseFloat(document.getElementById('sm-h').value);
  const crRaw = parseFloat(document.getElementById('sm-cr').value);
  const unit  = document.getElementById('sm-unit').value;
  const res   = document.getElementById('sm-result');
  if (!h || !crRaw || h <= 0 || crRaw <= 0) { res.classList.remove('show'); return; }

  let crMgdl;
  if      (unit === 'umol') crMgdl = crRaw / 88.4;
  else if (unit === 'mmol') crMgdl = (crRaw * 1000) / 88.4;
  else                      crMgdl = crRaw;

  document.getElementById('sm-val').textContent = (0.31 * h / crMgdl).toFixed(1);
  res.classList.add('show');
}
