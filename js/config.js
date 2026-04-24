// ══════════════════════════════════════════════
//  FIREBASE CONFIG
// ══════════════════════════════════════════════
// Firebase SDK подключается в index.html ПЕРЕД этим файлом (см. комментарий там)

const firebaseConfig = {
  apiKey: "AIzaSyA8wbxxdJLy7scoqnXM-TmV8_8EbMPMngI",
  authDomain: "pharm-4e3f1.firebaseapp.com",
  databaseURL: "https://pharm-4e3f1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pharm-4e3f1",
  storageBucket: "pharm-4e3f1.firebasestorage.app",
  messagingSenderId: "63614966601",
  appId: "1:63614966601:web:1c29dd91a98e97481a9898"
};

firebase.initializeApp(firebaseConfig);
const firebaseDB = firebase.database();

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
