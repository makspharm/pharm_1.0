// ══════════════════════════════════════════════
//  GLOBAL STATE
//  Все мутируемые переменные — в одном месте.
//  Остальные модули читают и пишут их напрямую.
// ══════════════════════════════════════════════

// Drugs
let drugs       = [];
let currentDrug = null;
let editorOpen  = false;

// Auth
let isAdmin = false;

// Topics / templates
let topics          = [];
let currentTopic    = null;
let topicEditorOpen = false;

// Left nav IntersectionObserver (drug page)
let _navObserver = null;
