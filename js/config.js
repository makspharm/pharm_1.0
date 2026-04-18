// ══════════════════════════════════════════════
//  SUPABASE CONFIG
// ══════════════════════════════════════════════
const SUPABASE_URL = 'https://rczexrioikgtylrmwria.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjemV4cmlvaWtndHlscm13cmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzczMTMsImV4cCI6MjA4OTAxMzMxM30.74I267z6epyhEebzrejQdidn_d0QGN955GHXAVxhcY0';
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY
};

// ══════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════
const LINK_TYPES = [
  'КР', 'Систематический обзор', 'Метаанализ', 'РКИ',
  'Когортное исследование', 'ИКС', 'Серия случаев',
  'Исследование in vitro', 'Другое', 'Заполнить'
];

// Пароль хранится в виде SHA-256 хеша — сам пароль в коде не виден.
// Чтобы сменить пароль, запустите в консоли браузера:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('НовыйПароль'))
//     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
// и замените строку ниже полученным хешем.
const ADMIN_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // admin123

async function checkAdminPassword(pwd) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pwd));
  const hash = [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  return hash === ADMIN_HASH;
}
